import path from 'path';
import type { TSESLint } from '@typescript-eslint/experimental-utils';

import { getAllowModules } from './get-allow-modules';
import { getConvertPath } from './get-convert-path';
import { getNpmignore } from './get-npmignore';
import { getPackageJson } from './get-package-json';
import type { ImportTarget } from './import-target';

export const notPublished = '"{{name}}" is not published.';

/**
 * Checks whether or not each requirement target is published via package.json.
 *
 * It reads package.json and checks the target exists in `dependencies`.
 *
 * @param {TSESLint.RuleContext<'notPublished', readonly unknown[]>} context - A context to report.
 * @param {readonly unknown[]} options - The rule options.
 * @param {string} filePath - The current file path.
 * @param {ImportTarget[]} targets - A list of target information to check.
 * @returns {void}
 */
export const checkPublish = (
  context: TSESLint.RuleContext<'notPublished', readonly unknown[]>,
  options: readonly unknown[],
  filePath: string,
  targets: ImportTarget[],
): void => {
  const packageInfo = getPackageJson(filePath);

  if (!packageInfo) {
    return;
  }

  const allowed = new Set<string | null>(getAllowModules(context, options));
  const convertPath = getConvertPath(context, options);
  const basedir = path.dirname(packageInfo.filePath);

  const toRelative = (fullPath: string): string => convertPath(path.relative(basedir, fullPath).replace(/\\/gu, '/'));
  const npmignore = getNpmignore(filePath);
  const devDependencies = new Set<string | null>(Object.keys(packageInfo.devDependencies ?? {}));
  const dependencies = new Set<string | null>([
    ...Object.keys(packageInfo.dependencies ?? {}),
    ...Object.keys(packageInfo.peerDependencies ?? {}),
    ...Object.keys(packageInfo.optionalDependencies ?? {}),
  ]);

  if (!npmignore.test(toRelative(filePath))) {
    // This file is published, so this cannot import private files.
    for (const target of targets) {
      const hasNoModuleName = !target.moduleName && target.moduleName !== '';
      const isPrivateFile = hasNoModuleName && npmignore.test(toRelative(target.filePath as string));
      const isDevPackage =
        !hasNoModuleName &&
        devDependencies.has(target.moduleName) &&
        !dependencies.has(target.moduleName) &&
        !allowed.has(target.moduleName);

      if (isPrivateFile || isDevPackage) {
        context.report({
          node: target.node,
          loc: target.node.loc,
          messageId: 'notPublished',
          data: { name: (target.moduleName ?? '') || target.name },
        });
      }
    }
  }
};
