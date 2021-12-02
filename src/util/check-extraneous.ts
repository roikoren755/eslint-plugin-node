import path from 'path';

import type { TSESLint } from '@typescript-eslint/experimental-utils';

import { getAllowModules } from './get-allow-modules';
import { getPackageJson } from './get-package-json';
import type { IPackageJson } from './get-package-json';
import { getYarnWorkspaces } from './get-yarn-workspaces';
import type { ImportTarget } from './import-target';

export const extraneous = '"{{moduleName}}" is extraneous.';

const getDependencies = (packageInfo: IPackageJson): string[] => [
  ...Object.keys(packageInfo.dependencies ?? {}),
  ...Object.keys(packageInfo.devDependencies ?? {}),
  ...Object.keys(packageInfo.peerDependencies ?? {}),
  ...Object.keys(packageInfo.optionalDependencies ?? {}),
];

/**
 * Checks whether or not each requirement target is published via package.json.
 *
 * It reads package.json and checks the target exists in `dependencies`.
 *
 * @param {TSESLint.RuleContext<'extraneous', readonly unknown[]>} context - A context to report.
 * @param {readonly unknown[]} options - The rule options.
 * @param {string} filePath - The current file path.
 * @param {ImportTarget[]} targets - A list of target information to check.
 * @returns {void}
 */
export const checkExtraneous = (
  context: TSESLint.RuleContext<'extraneous', readonly unknown[]>,
  options: readonly unknown[],
  filePath: string,
  targets: ImportTarget[],
): void => {
  const yarnWorkspaces = getYarnWorkspaces(context, options);
  let packageInfo = getPackageJson(filePath);
  const dependenciesArray: string[] = [];

  if (yarnWorkspaces && packageInfo && !packageInfo.workspaces) {
    dependenciesArray.push(...getDependencies(packageInfo));
    packageInfo = getPackageJson(path.dirname(packageInfo.filePath));
  }

  if (!packageInfo) {
    return;
  }

  const allowed = new Set(getAllowModules(context, options));
  const dependencies = new Set([...dependenciesArray, ...getDependencies(packageInfo)]);

  for (const target of targets) {
    const isExtraneous =
      (target.moduleName || target.moduleName === '') &&
      (target.filePath || target.filePath === '') &&
      !dependencies.has(target.moduleName) &&
      !allowed.has(target.moduleName);

    if (isExtraneous) {
      context.report({
        node: target.node,
        loc: target.node.loc,
        messageId: 'extraneous',
        data: { moduleName: target.moduleName },
      });
    }
  }
};
