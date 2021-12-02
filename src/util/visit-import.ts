import path from 'path';

import type { TSESTree } from '@typescript-eslint/typescript-estree';
import isCoreModule from 'is-core-module';

import { getResolvePaths } from './get-resolve-paths';
import { getTryExtensions } from './get-try-extensions';
import { ImportTarget } from './import-target';
import type { Visitor } from './interfaces';
import { stripImportPathParams } from './strip-import-path-params';

/**
 * Gets a list of `import`/`export` declaration targets.
 *
 * Core modules of Node.js (e.g. `fs`, `http`) are excluded.
 *
 * @param {RuleContext} context - The rule context.
 * @param {readonly unknown[]} ruleOptions - The rule options.
 * @param {Object} [options] - The flag to include core modules.
 * @param {boolean} [options.includeCore] - The flag to include core modules.
 * @param {number} [options.optionIndex] - The index of rule options.
 * @param {function(ImportTarget[]):void} callback The callback function to get result.
 * @returns {ImportTarget[]} A list of found target's information.
 */
export const visitImport: Visitor = (context, ruleOptions, { includeCore, optionIndex }, callback) => {
  const targets: ImportTarget[] = [];
  const basedir = path.dirname(path.resolve(context.getFilename()));
  const paths = getResolvePaths(context, ruleOptions, optionIndex);
  const extensions = getTryExtensions(context, ruleOptions, optionIndex);
  const options = { basedir, paths, extensions };
  const visitor = (
    node:
      | TSESTree.ExportAllDeclaration
      | TSESTree.ExportNamedDeclaration
      | TSESTree.ImportDeclaration
      | TSESTree.ImportExpression,
  ): void => {
    const sourceNode = node.source;

    // skip `import(foo)`
    if (node.type === 'ImportExpression' && sourceNode && sourceNode.type !== 'Literal') {
      return;
    }

    const name = sourceNode && stripImportPathParams((sourceNode as TSESTree.Literal).value as string);

    // Note: "999" arbitrary to check current/future Node.js version
    if (name && (includeCore || !isCoreModule(name, '999'))) {
      targets.push(new ImportTarget(sourceNode, name, options));
    }
  };

  return {
    ExportAllDeclaration: visitor,
    ExportNamedDeclaration: visitor,
    ImportDeclaration: visitor,
    ImportExpression: visitor,

    'Program:exit'() {
      callback(targets);
    },
  };
};
