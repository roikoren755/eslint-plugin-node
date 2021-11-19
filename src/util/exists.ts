import { readdirSync, statSync } from 'fs';
import path from 'path';
import { Cache } from './cache';

const ROOT = /^(?:[/.]|\.\.|[A-Z]:\\|\\\\)(?:[/\\]\.\.)*$/u;
const cache = new Cache<string, boolean | null>();

/**
 * Check whether the file exists or not.
 * @param {string} filePath The file path to check.
 * @returns {boolean} `true` if the file exists.
 */
const existsCaseSensitive = (filePath: string): boolean => {
  let dirPath = filePath;

  while (dirPath !== '' && !ROOT.test(dirPath)) {
    const fileName = path.basename(dirPath);

    dirPath = path.dirname(dirPath);

    if (!readdirSync(dirPath).includes(fileName)) {
      return false;
    }
  }

  return true;
};

/**
 * Checks whether or not the file of a given path exists.
 *
 * @param {string} filePath - A file path to check.
 * @returns {boolean} `true` if the file of a given path exists.
 */
export const exists = (filePath: string): boolean => {
  let result = cache.get(filePath);

  if (result === null) {
    try {
      const relativePath = path.relative(process.cwd(), filePath);

      result = statSync(relativePath).isFile() && existsCaseSensitive(relativePath);
    } catch (error) {
      if ((error as { code: string }).code !== 'ENOENT') {
        throw error;
      }

      result = false;
    }

    cache.set(filePath, result);
  }

  return result;
};
