import type { JSONSchema, TSESLint } from '@typescript-eslint/experimental-utils';

export interface IResolvePaths {
  resolvePaths?: readonly string[];
}

const DEFAULT_VALUE = Object.freeze([]);

/**
 * Gets `resolvePaths` property from a given option object.
 *
 * @param {IResolvePaths|undefined} option - An option object to get.
 * @returns {string[]|null} The `allowModules` value, or `null`.
 */
const get = (option?: IResolvePaths): string[] | null => {
  if (option?.resolvePaths && Array.isArray(option.resolvePaths)) {
    return option.resolvePaths.map((path) => String(path));
  }

  return null;
};

/**
 * Gets "resolvePaths" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.node` property, then returns it if exists.
 * 3. This returns `[]`.
 *
 * @param {TSESLint.RuleContext<string, readonly unknown[]>} context - The rule context.
 * @param {readonly unknown[]} options - The rule options.
 * @param {number|undefined} optionIndex - The option index that might contain the resolvePaths setting.
 * @returns {string[]} A list of extensions.
 */
export const getResolvePaths = (
  context: TSESLint.RuleContext<string, readonly unknown[]>,
  options: readonly unknown[],
  optionIndex = 0,
): readonly string[] =>
  get(options[optionIndex] as IResolvePaths) ?? get(context.settings?.node as IResolvePaths) ?? DEFAULT_VALUE;

export const schema: JSONSchema.JSONSchema4 = { type: 'array', items: { type: 'string' }, uniqueItems: true };
