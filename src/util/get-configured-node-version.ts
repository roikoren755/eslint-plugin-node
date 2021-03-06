import type { Range } from 'semver';

import { getPackageJson } from './get-package-json';
import { getSemverRange } from './get-semver-range';

/**
 * Get the `engines.node` field of package.json.
 * @param {string} filename The path to the current linting file.
 * @returns {Range|null} The range object of the `engines.node` field.
 */
const getEnginesNode = (filename: string): Range | null => {
  const info = getPackageJson(filename);

  return getSemverRange(info?.engines?.node);
};

/**
 * Gets version configuration.
 *
 * 1. Parse a given version then return it if it's valid.
 * 2. Look package.json up and parse `engines.node` then return it if it's valid.
 * 3. Return `>=8.0.0`.
 *
 * @param {string|undefined} version The version range text.
 * @param {string} filename The path to the current linting file.
 * This will be used to look package.json up if `version` is not a valid version range.
 * @returns {Range} The configured version range.
 */
export const getConfiguredNodeVersion = (version: string | undefined, filename: string): Range =>
  getSemverRange(version) ?? getEnginesNode(filename) ?? getSemverRange('>=8.0.0');
