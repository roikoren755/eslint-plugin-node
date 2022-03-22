import type { JSONSchema, TSESLint } from '@typescript-eslint/utils';

export interface IOnlyRelativePath {
  onlyRelativePath?: boolean;
}

const DEFAULT_VALUE = false;

/**
 * Gets `onlyRelativePath` property from a given option object.
 *
 * @param {IOnlyRelativePath|undefined} option - An option object to get.
 * @returns {boolean|null} The `onlyRelativePath` value, or `null`.
 */
const get = (option?: IOnlyRelativePath): boolean | null => {
  if (option && 'onlyRelativePath' in option) {
    return !!option.onlyRelativePath;
  }

  return null;
};

/**
 * Gets "onlyRelativePath" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.node` property, then returns it if exists.
 * 3. This returns `false`.
 *
 * @param {TSESLint.RuleContext} context - The rule context.
 * @param {readonly unknown[]} options - The rule options.
 * @param {number|undefined} [optionIndex] - The option index that might contain the onlyRelativePath setting.
 * @returns {boolean}
 */
export const getOnlyRelativePath = (
  context: TSESLint.RuleContext<string, readonly unknown[]>,
  options: readonly unknown[],
  optionIndex = 0,
): boolean =>
  get(options[optionIndex] as IOnlyRelativePath) ?? get(context.settings?.node as IOnlyRelativePath) ?? DEFAULT_VALUE;

export const schema: JSONSchema.JSONSchema4 = { type: 'boolean' };
