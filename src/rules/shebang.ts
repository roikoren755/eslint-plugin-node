import path from 'path';
import type { TSESLint } from '@typescript-eslint/experimental-utils';

import { createRule } from '../util/create-rule';
import { schema as convertPathSchema, getConvertPath } from '../util/get-convert-path';
import type { IConvertPath } from '../util/get-convert-path';
import { getPackageJson } from '../util/get-package-json';
import type { IPackageJson } from '../util/get-package-json';

const NODE_SHEBANG = '#!/usr/bin/env node\n';
const SHEBANG_PATTERN = /^(#!.+?)?(\r)?\n/u;
const NODE_SHEBANG_PATTERN = /#!\/usr\/bin\/env node(?: [^\r\n]+?)?\n/u;

const simulateNodeResolutionAlgorithm = (filePath: string, binField: string): boolean => {
  const possibilities = [filePath];
  let newFilePath = filePath.replace(/\.js$/u, '');

  possibilities.push(newFilePath);
  newFilePath = newFilePath.replace(/[/\\]index$/u, '');
  possibilities.push(newFilePath);

  return possibilities.includes(binField);
};

/**
 * Checks whether or not a given path is a `bin` file.
 *
 * @param {string} filePath - A file path to check.
 * @param {string|object|undefined} binField - A value of the `bin` field of `package.json`.
 * @param {string} basedir - A directory path that `package.json` exists.
 * @returns {boolean} `true` if the file is a `bin` file.
 */
const isBinFile = (filePath: string, binField: IPackageJson['bin'], basedir: string): boolean => {
  if (!binField) {
    return false;
  }

  if (typeof binField === 'string') {
    return simulateNodeResolutionAlgorithm(filePath, path.resolve(basedir, binField));
  }

  return Object.keys(binField).some((key) =>
    simulateNodeResolutionAlgorithm(filePath, path.resolve(basedir, binField[key])),
  );
};

/**
 * Gets the shebang line (includes a line ending) from a given code.
 *
 * @param {TSESLint.SourceCode} sourceCode - A source code object to check.
 * @returns {{length: number, bom: boolean, shebang: string, cr: boolean}}
 *      shebang's information.
 *      `retv.shebang` is an empty string if shebang doesn't exist.
 */
const getShebangInfo = (
  sourceCode: TSESLint.SourceCode,
): { bom: boolean; cr: boolean; length: number; shebang: string } => {
  const m = SHEBANG_PATTERN.exec(sourceCode.text);

  return {
    bom: sourceCode.hasBOM,
    cr: Boolean(m?.[2]),
    length: m?.[0]?.length ?? 0,
    shebang: (m?.[1] && `${m[1]}\n`) ?? '',
  };
};

export type MessageIds = 'bom' | 'cr' | 'noShebang' | 'shebang';

export const category = 'Possible Errors';
export default createRule<[options: IConvertPath], MessageIds>({
  name: 'shebang',
  meta: {
    type: 'problem',
    docs: { description: 'enforce correct usage of shebang', recommended: 'error' },
    fixable: 'code',
    schema: [{ type: 'object', properties: { convertPath: convertPathSchema }, additionalProperties: false }],
    messages: {
      bom: 'This file must not have Unicode BOM.',
      cr: 'This file must have Unix linebreaks (LF).',
      noShebang: 'This file needs no shebang.',
      shebang: 'This file needs shebang "#!/usr/bin/env node".',
    },
  },
  defaultOptions: [{}],
  create(context, options) {
    const sourceCode = context.getSourceCode();
    let filePath = context.getFilename();

    if (filePath === '<input>') {
      return {};
    }

    filePath = path.resolve(filePath);

    const p = getPackageJson(filePath);

    if (!p) {
      return {};
    }

    const basedir = path.dirname(p.filePath);

    filePath = path.join(
      basedir,
      getConvertPath(context, options)(path.relative(basedir, filePath).replace(/\\/gu, '/')),
    );

    const needsShebang = isBinFile(filePath, p.bin, basedir);
    const info = getShebangInfo(sourceCode);

    return {
      Program(node) {
        if (needsShebang) {
          if (NODE_SHEBANG_PATTERN.test(info.shebang)) {
            if (info.bom) {
              context.report({ node, messageId: 'bom', fix: (fixer) => fixer.removeRange([-1, 0]) });
            }

            if (info.cr) {
              context.report({
                node,
                messageId: 'cr',
                fix: (fixer) => {
                  const index = sourceCode.text.indexOf('\r');

                  return fixer.removeRange([index, index + 1]);
                },
              });
            }
          } else {
            // Shebang is lacking.
            context.report({
              node,
              messageId: 'shebang',
              fix: (fixer) => fixer.replaceTextRange([-1, info.length], NODE_SHEBANG),
            });
          }
        } else if (info.shebang) {
          // Shebang is extra.
          context.report({ node, messageId: 'noShebang', fix: (fixer) => fixer.removeRange([0, info.length]) });
        }
      },
    };
  },
});
