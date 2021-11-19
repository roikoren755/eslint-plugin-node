import fs from 'fs';
import path from 'path';
import type { PackageJson } from 'type-fest';

import { Cache } from './cache';

export interface IPackageJson extends PackageJson {
  filePath: string;
}

const cache = new Cache<string, IPackageJson>();

/**
 * Reads the `package.json` data in a given path.
 *
 * Don't cache the data.
 *
 * @param {string} dir - The path to a directory to read.
 * @returns {IPackageJson|null} The read `package.json` data, or null.
 */
const readPackageJson = (dir: string): IPackageJson | null => {
  const filePath = path.join(dir, 'package.json');

  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(text) as IPackageJson | null;

    if (typeof data === 'object' && data !== null) {
      data.filePath = filePath;

      return data;
    }
  } catch {
    // do nothing.
  }

  return null;
};

/**
 * Gets a `package.json` data.
 * The data is cached if found, then it's used after.
 *
 * @param {string} [startPath] - A file path to lookup.
 * @returns {object|null} A found `package.json` data or `null`.
 *      This object have additional property `filePath`.
 */
export const getPackageJson = (startPath = 'a.js'): IPackageJson | null => {
  const startDir = path.dirname(path.resolve(startPath));
  let dir = startDir;
  let prevDir = '';
  let data: IPackageJson | null = null;

  do {
    data = cache.get(dir);

    if (data) {
      if (dir !== startDir) {
        cache.set(startDir, data);
      }

      return data;
    }

    data = readPackageJson(dir);

    if (data) {
      cache.set(dir, data);
      cache.set(startDir, data);

      return data;
    }

    // Go to next.
    prevDir = dir;
    dir = path.resolve(dir, '..');
  } while (dir !== prevDir);

  cache.set(startDir, null);

  return null;
};
