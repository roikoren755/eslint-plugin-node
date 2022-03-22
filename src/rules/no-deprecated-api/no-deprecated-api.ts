import type { TSESTree } from '@typescript-eslint/typescript-estree';
import { ASTUtils } from '@typescript-eslint/utils';
import type { TSESLint } from '@typescript-eslint/utils';
import type { Range } from 'semver';

import { createRule } from '../../util/create-rule';
import { enumeratePropertyNames } from '../../util/enumerate-property-names';
import type { IDeprecated } from '../../util/enumerate-property-names';
import { getConfiguredNodeVersion } from '../../util/get-configured-node-version';
import { getSemverRange } from '../../util/get-semver-range';

import { globals } from './globals';
import { modules } from './modules';

/**
 * Makes a replacement message.
 *
 * @param {string|array|null} replacedBy - The text of substitute way.
 * @param {Range} version - The configured version range
 * @returns {string} Replacement message.
 */
const toReplaceMessage = (replacedBy: IDeprecated['replacedBy'], version: Range): string => {
  let message = replacedBy as string;

  if (Array.isArray(replacedBy)) {
    message = replacedBy
      .filter(({ supported }) => !version.intersects(getSemverRange(`<${supported}`) as Range))
      .map(({ name }) => name)
      .join(' or ');
  }

  return message ? `. Use ${message} instead` : '';
};

/**
 * Convert a given path to name.
 * @param {symbol} type The report type.
 * @param {string[]} path The property access path.
 * @returns {string} The name.
 */
const toName = (type: symbol, path: readonly string[]): string => {
  const baseName = path.join('.');

  if (type === ASTUtils.ReferenceTracker.CALL) {
    return `${baseName}()`;
  }

  return type === ASTUtils.ReferenceTracker.CONSTRUCT ? `new ${baseName}()` : baseName;
};

export interface IOptions {
  version?: string;
  ignoreModuleItems?: string[];
  ignoreGlobalItems?: string[];
}

export type Options = readonly [options: IOptions];

/**
 * Parses the options.
 * @param {RuleContext} context The rule context.
 * @param {Options} options The rule options.
 * @returns {{version:Range,ignoredGlobalItems:Set<string>,ignoredModuleItems:Set<string>}} Parsed
 *     value.
 */
const parseOptions = (
  context: TSESLint.RuleContext<'deprecated', Options>,
  options: Options,
): { version: Range; ignoredGlobalItems: Set<string>; ignoredModuleItems: Set<string> } => {
  const [raw] = options;
  const filePath = context.getFilename();
  const version = getConfiguredNodeVersion(raw.version, filePath);
  const ignoredModuleItems = new Set(raw.ignoreModuleItems ?? []);
  const ignoredGlobalItems = new Set(raw.ignoreGlobalItems ?? []);

  return Object.freeze({ version, ignoredGlobalItems, ignoredModuleItems });
};

export const category = 'Best Practices';
export default createRule<Options, 'deprecated'>({
  name: 'no-deprecated-api',
  meta: {
    type: 'problem',
    docs: { description: 'disallow deprecated APIs', recommended: 'error' },
    schema: [
      {
        type: 'object',
        properties: {
          version: { type: 'string' },
          ignoreModuleItems: {
            type: 'array',
            items: { enum: Array.from(enumeratePropertyNames(modules)) },
            additionalItems: false,
            uniqueItems: true,
          },
          ignoreGlobalItems: {
            type: 'array',
            items: { enum: Array.from(enumeratePropertyNames(globals)) },
            additionalItems: false,
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: { deprecated: '{{name}} was deprecated since v{{version}}{{replace}}.' },
  },
  defaultOptions: [{}],
  create(context, options) {
    const { ignoredModuleItems, ignoredGlobalItems, version } = parseOptions(context, options);

    /**
     * Reports a use of a deprecated API.
     *
     * @param {TSESTree.Node} node - A node to report.
     * @param {string} name - The name of a deprecated API.
     * @param {{since: number, replacedBy: string}} info - Information of the API.
     * @returns {void}
     */
    const reportItem = (node: TSESTree.Node, name: string, info: IDeprecated): void => {
      context.report({
        node,
        loc: node.loc,
        messageId: 'deprecated',
        data: { name, version: info.since, replace: toReplaceMessage(info.replacedBy, version) },
      });
    };

    return {
      'Program:exit'() {
        const tracker = new ASTUtils.ReferenceTracker(context.getScope(), { mode: 'legacy' });

        for (const report of tracker.iterateGlobalReferences(globals)) {
          const { node, path, type, info } = report;
          const name = toName(type, path);

          if (!ignoredGlobalItems.has(name)) {
            reportItem(node, `'${name}'`, info);
          }
        }

        for (const report of [...tracker.iterateCjsReferences(modules), ...tracker.iterateEsmReferences(modules)]) {
          const { node, path, type, info } = report;
          const name = toName(type, path);
          const suffix = path.length === 1 ? ' module' : '';

          if (!ignoredModuleItems.has(name)) {
            reportItem(node, `'${name}'${suffix}`, info);
          }
        }
      },
    };
  },
});
