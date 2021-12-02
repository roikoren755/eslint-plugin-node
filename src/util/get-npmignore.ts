import { readFileSync } from 'fs';
import path from 'path';

import ignore from 'ignore';

import { Cache } from './cache';
import { exists } from './exists';
import { getPackageJson } from './get-package-json';
import type { IPackageJson } from './get-package-json';

type TestFunction = (filePath: string) => boolean;

interface ITester {
  test: TestFunction;
}

const cache = new Cache<string, ITester>();
const SLASH_AT_BEGIN_AND_END = /^!?\/+|^!|\/+$/gu;
const PARENT_RELATIVE_PATH = /^\.\./u;
const NEVER_IGNORED = /^(?:readme\.[^.]*|(?:licen[cs]e|changes|changelog|history)(?:\.[^.]*)?)$/iu;

/**
 * Checks whether or not a given file name is a relative path to a ancestor
 * directory.
 *
 * @param {string} filePath - A file name to check.
 * @returns {boolean} `true` if the file name is a relative path to a ancestor
 *      directory.
 */
const isAncestorFiles = (filePath: string): boolean => PARENT_RELATIVE_PATH.test(filePath);

/**
 * @param {function} f - A function.
 * @param {function} g - A function.
 * @returns {function} A logical-and function of `f` and `g`.
 */
const and =
  (f: TestFunction, g: TestFunction): TestFunction =>
  (filePath) =>
    f(filePath) && g(filePath);

/**
 * @param {function} f - A function.
 * @param {function} g - A function.
 * @param {function|null} h - A function.
 * @returns {function} A logical-or function of `f`, `g`, and `h`.
 */
const or =
  (f: TestFunction, g: TestFunction, h?: TestFunction | null): TestFunction =>
  (filePath) =>
    f(filePath) || g(filePath) || !!h?.(filePath);

/**
 * @param {function} f - A function.
 * @returns {function} A logical-not function of `f`.
 */
const not =
  (f: TestFunction): TestFunction =>
  (filePath) =>
    !f(filePath);

/**
 * Creates a function which checks whether or not a given file is ignoreable.
 *
 * @param {IPackageJson} p - An object of package.json.
 * @returns {TestFunction} A function which checks whether or not a given file is ignoreable.
 */
const filterNeverIgnoredFiles = (p: IPackageJson): TestFunction => {
  const basedir = path.dirname(p.filePath);
  const mainFilePath = typeof p.main === 'string' ? path.join(basedir, p.main) : null;

  return (filePath) =>
    path.join(basedir, filePath) !== mainFilePath &&
    filePath !== 'package.json' &&
    !NEVER_IGNORED.test(path.relative(basedir, filePath));
};

/**
 * Creates a function which checks whether or not a given file should be ignored.
 *
 * @param {string[]|null} files - File names of whitelist.
 * @returns {function|null} A function which checks whether or not a given file should be ignored.
 */
const parseWhiteList = (files?: string[]): TestFunction | null => {
  if (!files || !Array.isArray(files)) {
    return null;
  }

  const ig = ignore();
  const igN = ignore();
  let hasN = false;

  for (const file of files) {
    if (typeof file === 'string' && file) {
      const body = file.replace(SLASH_AT_BEGIN_AND_END, '');

      if (file.startsWith('!')) {
        igN.add(`${body}`);
        igN.add(`${body}/**`);
        hasN = true;
      } else {
        ig.add(`/${body}`);
        ig.add(`/${body}/**`);
      }
    }
  }

  return hasN ? or(ig.createFilter(), not(igN.createFilter())) : ig.createFilter();
};

/**
 * Creates a function which checks whether or not a given file should be ignored.
 *
 * @param {string} basedir - The directory path "package.json" exists.
 * @param {boolean} filesFieldExists - `true` if `files` field of `package.json` exists.
 * @returns {TestFunction|null} A function which checks whether or not a given file should be ignored.
 */
const parseNpmignore = (basedir: string, filesFieldExists: boolean): TestFunction | null => {
  let filePath = path.join(basedir, '.npmignore');

  if (!exists(filePath)) {
    if (filesFieldExists) {
      return null;
    }

    filePath = path.join(basedir, '.gitignore');

    if (!exists(filePath)) {
      return null;
    }
  }

  const ig = ignore();

  ig.add(readFileSync(filePath, 'utf8'));

  return not(ig.createFilter());
};

/**
 * Gets an object to check whether a given path should be ignored or not.
 * The object is created from:
 *
 * - `files` field of `package.json`
 * - `.npmignore`
 *
 * @param {string} startPath - A file path to lookup.
 * @returns {ITester}
 *      An object to check whether or not a given path should be ignored.
 *      The object has a method `match`.
 *      `match` returns `true` if a given file path should be ignored.
 */
export const getNpmignore = (startPath: string): ITester => {
  const ret = { test: isAncestorFiles };
  const p = getPackageJson(startPath);

  if (p) {
    const data = cache.get(p.filePath);

    if (data) {
      return data;
    }

    const filesIgnore = parseWhiteList(p.files);
    const npmignoreIgnore = parseNpmignore(path.dirname(p.filePath), Boolean(filesIgnore));

    if (filesIgnore && npmignoreIgnore) {
      ret.test = and(filterNeverIgnoredFiles(p), or(isAncestorFiles, filesIgnore, npmignoreIgnore));
    } else if (filesIgnore) {
      ret.test = and(filterNeverIgnoredFiles(p), or(isAncestorFiles, filesIgnore));
    } else if (npmignoreIgnore) {
      ret.test = and(filterNeverIgnoredFiles(p), or(isAncestorFiles, npmignoreIgnore));
    }

    cache.set(p.filePath, ret);
  }

  return ret;
};
