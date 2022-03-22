import type { JSONSchema, TSESLint } from '@typescript-eslint/utils';

export interface IAllowModules {
  allowModules?: string[];
}

const DEFAULT_VALUE = Object.freeze<string>([]);

/**
 * Gets `allowModules` property from a given option object.
 *
 * @param {IAllowModules|undefined} option - An option object to get.
 * @returns {string[]|null} The `allowModules` value, or `null`.
 */
const get = (option?: IAllowModules): string[] | null => {
  if (option?.allowModules && Array.isArray(option.allowModules)) {
    return option.allowModules.map((module) => String(module));
  }

  return null;
};

/**
 * Gets "allowModules" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.node` property, then returns it if exists.
 * 3. This returns `[]`.
 *
 * @param {TSESLint.RuleContext<string, readonly unknown[]>} context - The rule context.
 * @param {readonly unknown[]} options - The rule options.
 * @param {number|undefined} optionIndex - The option index that might contain the allowModules setting.
 * @returns {string[]} A list of extensions.
 */
export const getAllowModules = (
  context: TSESLint.RuleContext<string, readonly unknown[]>,
  options: readonly unknown[],
  optionIndex = 0,
): readonly string[] =>
  get(options[optionIndex] as IAllowModules) ?? get(context.settings.node as IAllowModules) ?? DEFAULT_VALUE;

export const schema: JSONSchema.JSONSchema4 = {
  type: 'array',
  items: { type: 'string', pattern: '^(?:@[a-zA-Z0-9_\\-.]+/)?[a-zA-Z0-9_\\-.]+$' },
  uniqueItems: true,
};
