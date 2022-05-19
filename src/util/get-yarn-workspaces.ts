import type { JSONSchema, TSESLint } from '@typescript-eslint/utils';

export interface IYarnWorkspaces {
  yarnWorkspaces?: boolean;
}

const DEFAULT_VALUE = false;

/**
 * Gets `yarnWorkspaces` property from a given option object.
 *
 * @param {IYarnWorkspaces|undefined} option - An option object to get.
 * @returns {boolean|null} The `yarnWorkspaces` value, or `null`.
 */
const get = (option?: IYarnWorkspaces): boolean | null => {
  if (option && 'yarnWorkspaces' in option) {
    return !!option.yarnWorkspaces;
  }

  return null;
};

/**
 * Gets "yarnWorkspaces" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.node` property, then returns it if exists.
 * 3. This returns `false`.
 *
 * @param {TSESLint.RuleContext} context - The rule context.
 * @param {readonly unknown[]} options - The rule options.
 * @param {number|undefined} [optionIndex] - The option index that might contain the yarnWorkspaces setting.
 * @returns {boolean}
 */
export const getYarnWorkspaces = (
  context: TSESLint.RuleContext<string, readonly unknown[]>,
  options: readonly unknown[],
  optionIndex = 0,
): boolean =>
  get(options[optionIndex] as IYarnWorkspaces) ?? get(context.settings.node as IYarnWorkspaces) ?? DEFAULT_VALUE;

export const schema: JSONSchema.JSONSchema4 = { type: 'boolean' };
