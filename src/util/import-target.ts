import path from 'path';

import type { TSESTree } from '@typescript-eslint/typescript-estree';
import { sync } from 'resolve';
import type { SyncOpts } from 'resolve';

type Options = SyncOpts & { basedir: string };

/**
 * Resolve the given id to file paths.
 * @param {boolean} isModule The flag which indicates this id is a module.
 * @param {string} id The id to resolve.
 * @param {Options} options The options of node-resolve module.
 * It requires `options.basedir`.
 * @returns {string|null} The resolved path.
 */
const getFilePath = (isModule: boolean, id: string, options: Options): string | null => {
  try {
    return sync(id, options);
  } catch {
    if (isModule) {
      return null;
    }

    return path.resolve(options.basedir, id);
  }
};

/**
 * Gets the module name of a given path.
 *
 * e.g. `eslint/lib/ast-utils` -> `eslint`
 *
 * @param {string} nameOrPath - A path to get.
 * @returns {string} The module name of the path.
 */
const getModuleName = (nameOrPath: string): string => {
  let end = nameOrPath.indexOf('/');

  if (end !== -1 && nameOrPath.startsWith('@')) {
    end = nameOrPath.indexOf('/', 1 + end);
  }

  return end === -1 ? nameOrPath : nameOrPath.slice(0, end);
};

/**
 * Information of an import target.
 */
export class ImportTarget {
  node: TSESTree.Node;

  name: string;

  filePath: string | null;

  moduleName: string | null;

  /**
   * Initialize this instance.
   * @param {TSESTree.Node} node - The node of a `require()` or a module declaraiton.
   * @param {string} name - The name of an import target.
   * @param {Options} options - The options of `node-resolve` module.
   */
  constructor(node: TSESTree.Node, name: string, options: Options) {
    const isModule = !/^(?:[./\\]|\w+:)/u.test(name);

    /**
     * The node of a `require()` or a module declaration.
     * @type {TSESTree.Node}
     */
    this.node = node;

    /**
     * The name of this import target.
     * @type {string}
     */
    this.name = name;

    /**
     * The full path of this import target.
     * If the target is a module and it does not exist then this is `null`.
     * @type {string|null}
     */
    this.filePath = getFilePath(isModule, name, options);

    /**
     * The module name of this import target.
     * If the target is a relative path then this is `null`.
     * @type {string|null}
     */
    this.moduleName = isModule ? getModuleName(name) : null;
  }
}
