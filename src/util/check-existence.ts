import type { TSESLint } from '@typescript-eslint/utils';

import { exists } from './exists';
import { getAllowModules } from './get-allow-modules';
import { getOnlyRelativePath } from './get-only-relative-path';
import type { ImportTarget } from './import-target';

export const missing = '"{{name}}" is not found.';

/**
 * Checks whether or not each requirement target exists.
 *
 * It looks up the target according to the logic of Node.js.
 * See Also: https://nodejs.org/api/modules.html
 *
 * @param {TSESLint.RuleContext<string, readonly unknown[]>} context - A context to report.
 * @param {readonly unknown[]} options - The rule options.
 * @param {ImportTarget[]} targets - A list of target information to check.
 * @returns {void}
 */
export const checkExistence = (
  context: TSESLint.RuleContext<'missing', readonly unknown[]>,
  options: readonly unknown[],
  targets: ImportTarget[],
): void => {
  const allowed = new Set(getAllowModules(context, options));
  const onlyRelativePath = getOnlyRelativePath(context, options);

  for (const target of targets) {
    const missingModule =
      !onlyRelativePath &&
      (target.moduleName || target.moduleName === '') &&
      !allowed.has(target.moduleName) &&
      target.filePath === null;
    const missingFile = !target.moduleName && target.moduleName !== '' && !exists(target.filePath as string);

    if (missingModule || missingFile) {
      context.report({
        node: target.node,
        loc: target.node.loc,
        messageId: 'missing',
        data: { name: target.name },
      });
    }
  }
};
