import path from 'path';

import { createRule } from '../util/create-rule';
import { schema as convertPathSchema, getConvertPath } from '../util/get-convert-path';
import type { IConvertPath } from '../util/get-convert-path';
import { getNpmignore } from '../util/get-npmignore';
import { getPackageJson } from '../util/get-package-json';
import type { IPackageJson } from '../util/get-package-json';

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
    return filePath === path.resolve(basedir, binField);
  }

  return Object.keys(binField).some((key) => filePath === path.resolve(basedir, binField[key]));
};

export const category = 'Possible Errors';
export default createRule<[options: IConvertPath], 'ignored'>({
  name: 'no-unpublished-bin',
  meta: {
    type: 'problem',
    docs: { description: 'disallow `bin` files that npm ignores', recommended: 'error' },
    schema: [{ type: 'object', properties: { convertPath: convertPathSchema } }],
    messages: { ignored: "npm ignores '{{name}}'. Check 'files' field of 'package.json' or '.npmignore'." },
  },
  defaultOptions: [{}],
  create(context, options) {
    return {
      Program(node) {
        // Check file path.
        let rawFilePath = context.getFilename();

        if (rawFilePath === '<input>') {
          return;
        }

        rawFilePath = path.resolve(rawFilePath);

        // Find package.json
        const p = getPackageJson(rawFilePath);

        if (!p) {
          return;
        }

        // Convert by convertPath option
        const basedir = path.dirname(p.filePath);
        const relativePath = getConvertPath(context, options)(path.relative(basedir, rawFilePath).replace(/\\/gu, '/'));
        const filePath = path.join(basedir, relativePath);

        // Check this file is bin.
        if (!isBinFile(filePath, p.bin, basedir)) {
          return;
        }

        // Check ignored or not
        const npmignore = getNpmignore(filePath);

        if (!npmignore.test(relativePath)) {
          return;
        }

        // Report.
        context.report({ node, messageId: 'ignored', data: { name: relativePath } });
      },
    };
  },
});
