import { Range } from 'semver';

const cache = new Map<string, Range | null>();

interface IGetSemverRange {
  (range: '>=8.0.0'): Range;
  (range?: string | undefined): Range | null;
}

/**
 * Get the `semver.Range` object of a given range text.
 * @param {string|number|undefined} x The text expression for a semver range.
 * @returns {Range|null} The range object of a given range text.
 * It's null if the `x` is not a valid range text.
 */
export const getSemverRange: IGetSemverRange = (x) => {
  const s = String(x);
  let ret = cache.get(s) ?? null;

  if (!ret) {
    try {
      ret = new Range(s);
    } catch {
      // Ignore parsing error.
    }

    cache.set(s, ret);
  }

  return ret as Range;
};
