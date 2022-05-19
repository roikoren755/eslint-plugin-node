import type { TSESLint } from '@typescript-eslint/utils';

import type { IRawOptions } from '../../src/util/check-unsupported-builtins';

import { ecmaVersion } from './es2020';

/**
 * Clone given invalid patterns with adding `ignores` option.
 * @param {string} keyword The keyword of `ignores` option.
 * @returns {function(pattern:object):object} The cloned pattern.
 */
const ignores =
  (keyword: string) =>
  <TMessageIds extends string>({
    errors,
    ...original
  }: TSESLint.InvalidTestCase<TMessageIds, [options: IRawOptions]>): TSESLint.ValidTestCase<[options: IRawOptions]> => {
    const pattern = Object.assign({}, original);
    const options = original.options?.slice() ?? [];

    options[0] = Object.assign({}, pattern.options?.[0]);
    options[0].ignores = options[0].ignores ? [...options[0].ignores, keyword] : [keyword];

    return Object.assign({}, original, { options });
  };

interface ITestCases<TMessageIds extends string> {
  valid: TSESLint.ValidTestCase<[options: IRawOptions]>[];
  invalid: TSESLint.InvalidTestCase<TMessageIds, [options: IRawOptions]>[];
}

/**
 * Concatenate patterns.
 * @param {Array<{valid:Array,invalid:Array}>} patterns The patterns to concat.
 * @returns {{valid:Array,invalid:Array}} The concatenated patterns.
 */
export const concat = <TMessageIds extends string>(
  patterns: (ITestCases<TMessageIds> & { keyword?: string; requiredEcmaVersion?: number })[],
): ITestCases<TMessageIds> => {
  const ret: ITestCases<TMessageIds> = { valid: [], invalid: [] };

  patterns.forEach(({ requiredEcmaVersion, keyword, valid, invalid }) => {
    if (requiredEcmaVersion && ecmaVersion < requiredEcmaVersion) {
      return;
    }

    ret.valid.push(...valid);
    ret.invalid.push(...invalid);

    // Add the invalid patterns with `ignores` option into the valid patterns.
    if (keyword) {
      ret.valid.push(...invalid.map(ignores(keyword)));
    }
  });

  return ret;
};
