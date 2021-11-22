import { readdirSync } from 'fs';
import path from 'path';

import { createRule } from '../util/create-rule';
import { schema } from '../util/get-try-extensions';
import type { ITryExtensions } from '../util/get-try-extensions';
import { visitImport } from '../util/visit-import';
import type { ImportTarget } from '../util/import-target';
import type { TSESLint } from '@typescript-eslint/experimental-utils';

const packageNamePattern = /^(?:@[^/\\]+[/\\])?[^/\\]+$/u;
const corePackageOverridePattern =
  /^(?:assert|async_hooks|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|http2|https|inspector|module|net|os|path|perf_hooks|process|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|trace_events|tty|url|util|v8|vm|worker_threads|zlib)[/\\]$/u;

/**
 * Get all file extensions of the files which have the same basename.
 * @param {string} filePath The path to the original file to check.
 * @returns {string[]} File extensions.
 */
const getExistingExtensions = (filePath: string): string[] => {
  const basename = path.basename(filePath, path.extname(filePath));

  try {
    return readdirSync(path.dirname(filePath))
      .filter((filename) => path.basename(filename, path.extname(filename)) === basename)
      .map((filename) => path.extname(filename));
  } catch {
    return [];
  }
};

type Style = 'always' | 'never';
type Options = readonly [style: Style, options?: ITryExtensions & Record<string, Style>];
type MessageId = `${'forbid' | 'require'}Ext`;

const verify = (
  options: Options,
  context: TSESLint.RuleContext<MessageId, Options>,
  { filePath, name, node }: ImportTarget,
): void => {
  // Ignore if it's not resolved to a file or it's a bare module.
  if (!filePath || packageNamePattern.test(name) || corePackageOverridePattern.test(name)) {
    return;
  }

  const [defaultStyle, overrideStyle] = options;
  // Get extension.
  const originalExt = path.extname(name);
  const resolvedExt = path.extname(filePath);
  const existingExts = getExistingExtensions(filePath);

  if (!resolvedExt && existingExts.length !== 1) {
    // Ignore if the file extension could not be determined one.
    return;
  }

  const ext = resolvedExt || existingExts[0];
  const style = overrideStyle?.[ext] ?? defaultStyle;

  // Verify.
  if (style === 'always' && ext !== originalExt) {
    context.report({
      node,
      messageId: 'requireExt',
      data: { ext },
      fix: (fixer) => {
        if (existingExts.length !== 1) {
          return null;
        }

        const index = node.range[1] - 1;

        return fixer.insertTextBeforeRange([index, index], ext);
      },
    });
  } else if (style === 'never' && ext === originalExt) {
    context.report({
      node,
      messageId: 'forbidExt',
      data: { ext },
      fix: (fixer) => {
        if (existingExts.length !== 1) {
          return null;
        }

        const index = name.lastIndexOf(ext);
        const start = node.range[0] + 1 + index;
        const end = start + ext.length;

        return fixer.removeRange([start, end]);
      },
    });
  }
};

export const category = 'Stylistic Issues';
export default createRule<[style: Style, options?: ITryExtensions & Record<string, Style>], MessageId>({
  name: 'file-extension-in-imports',
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce the style of file extensions in `import` declarations', recommended: false },
    fixable: 'code',
    schema: [
      { enum: ['always', 'never'] },
      { type: 'object', properties: { tryExtensions: schema }, additionalProperties: { enum: ['always', 'never'] } },
    ],
    messages: { requireExt: "require file extension '{{ext}}'.", forbidExt: "forbid file extension '{{ext}}'." },
  },
  defaultOptions: ['always', {}],
  create(context, options) {
    if (context.getFilename().startsWith('<')) {
      return {};
    }

    return visitImport(context, options, { optionIndex: 1 }, (targets) => {
      targets.forEach((target) => {
        verify(options, context, target);
      });
    });
  },
});
