import { Minimatch } from 'minimatch';
import type { TSESLint } from '@typescript-eslint/experimental-utils';

export interface IConvertPath {
  convertPath?: {
    include: [string, ...string[]];
    exclude?: string[];
    replace: [string, string];
  }[];
}

/**
 * @param {any} x - An any value.
 * @returns {any} Always `x`.
 */
const identity = <T>(x: T): T => x;

/**
 * Ensures the given value is a string array.
 *
 * @param {unknown[]|undefined} x - The value to ensure.
 * @returns {string[]} The string array.
 */
const toStringArray = (x?: unknown[]): string[] => {
  if (Array.isArray(x)) {
    return x.map((value) => String(value));
  }

  return [];
};

type Match = (path: string) => boolean;

/**
 * Creates the function which checks whether a file path is matched with the given pattern or not.
 *
 * @param {string[]} includePatterns - The glob patterns to include files.
 * @param {string[]} excludePatterns - The glob patterns to exclude files.
 * @returns {Match} Created predicate function.
 */
const createMatch = (includePatterns: string[], excludePatterns: string[]): Match => {
  const include = includePatterns.map((pattern) => new Minimatch(pattern));
  const exclude = excludePatterns.map((pattern) => new Minimatch(pattern));

  return (filePath) => include.some((m) => m.match(filePath)) && !exclude.some((m) => m.match(filePath));
};

type Convert = (path: string) => string;

/**
 * Creates a function which replaces a given path.
 *
 * @param {RegExp} fromRegexp - A `RegExp` object to replace.
 * @param {string} toStr - A new string to replace.
 * @returns {Convert} A function which replaces a given path.
 */
const defineConvert =
  (fromRegexp: RegExp, toStr: string): Convert =>
  (filePath) =>
    filePath.replace(fromRegexp, toStr);

type Converters = { test: Match; convert: Convert }[];

/**
 * Combines given converters.
 * The result function converts a given path with the first matched converter.
 *
 * @param {{match: function, convert: function}} converters - A list of converters to combine.
 * @returns {function} A function which replaces a given path.
 */
const combine =
  (converters: Converters): Convert =>
  (filePath) => {
    for (const converter of converters) {
      // TODO - verify?
      if (converter.test(filePath)) {
        return converter.convert(filePath);
      }
    }

    return filePath;
  };

/**
 * Parses `convertPath` property from a given option object.
 *
 * @param {IConvertPath|undefined} option - An option object to get.
 * @returns {function|null} A function which converts a path., or `null`.
 */
const parse = (option?: IConvertPath): Convert | null => {
  if (!option?.convertPath || !Array.isArray(option.convertPath)) {
    return null;
  }

  const converters: Converters = [];

  for (const pattern of option.convertPath) {
    const include = toStringArray(pattern.include);
    const exclude = toStringArray(pattern.exclude);
    const fromRegexp = new RegExp(String(pattern.replace[0]));
    const toStr = String(pattern.replace[1]);

    converters.push({ test: createMatch(include, exclude), convert: defineConvert(fromRegexp, toStr) });
  }

  return combine(converters);
};

/**
 * Gets "convertPath" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.node` property, then returns it if exists.
 * 3. This returns a function of identity.
 *
 * @param {TSESLint.RuleContext} context - The rule context.
 * @param {readonly unknown[]} options - The rule options.
 * @param {number|undefined} optionIndex - The option index that might contain the convertPath setting.
 * @returns {function} A function which converts a path.
 */
export const getConvertPath = (
  context: TSESLint.RuleContext<string, readonly unknown[]>,
  options: readonly unknown[],
  optionIndex = 0,
): Convert => parse(options[optionIndex] as IConvertPath) ?? parse(context.settings?.node as IConvertPath) ?? identity;

/**
 * JSON Schema for `convertPath` option.
 */
export const schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      include: { type: 'array', items: { type: 'string' }, minItems: 1, uniqueItems: true },
      exclude: { type: 'array', items: { type: 'string' }, uniqueItems: true },
      replace: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
    },
    additionalProperties: false,
    required: ['include', 'replace'],
  },
  minItems: 1,
};
