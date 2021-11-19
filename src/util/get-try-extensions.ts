import type { JSONSchema, TSESLint } from '@typescript-eslint/experimental-utils';

export interface ITryExtensions {
  tryExtensions?: string[];
}

const DEFAULT_VALUE = Object.freeze(['.js', '.json', '.node']);

/**
 * Gets `tryExtensions` property from a given option object.
 *
 * @param {object|undefined} option - An option object to get.
 * @returns {string[]|null} The `tryExtensions` value, or `null`.
 */
const get = (option?: ITryExtensions): string[] | null => {
  if (option?.tryExtensions && Array.isArray(option.tryExtensions)) {
    return option.tryExtensions.map((extension) => String(extension));
  }

  return null;
};

/**
 * Gets "tryExtensions" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.node` property, then returns it if exists.
 * 3. This returns `[".js", ".json", ".node"]`.
 *
 * @param {TSESLint.RuleContext<string, readonly unknown[]>} context - The rule context.
 * @param {readonly unknown[]} options - The rule options.
 * @param {number|undefined} optionIndex - The option index that might contain the tryExtensions setting.
 * @returns {string[]} A list of extensions.
 */
export const getTryExtensions = (
  context: TSESLint.RuleContext<string, readonly unknown[]>,
  options: readonly unknown[],
  optionIndex = 0,
): readonly string[] =>
  get(options[optionIndex] as ITryExtensions) ?? get(context.settings.node as ITryExtensions) ?? DEFAULT_VALUE;

export const schema: JSONSchema.JSONSchema4 = {
  type: 'array',
  items: { type: 'string', pattern: '^\\.' },
  uniqueItems: true,
};
