import path from 'path';
import { ASTUtils } from '@typescript-eslint/experimental-utils';
import type { TSESTree } from '@typescript-eslint/typescript-estree';
import isCoreModule from 'is-core-module';

import { getResolvePaths } from './get-resolve-paths';
import { getTryExtensions } from './get-try-extensions';
import { ImportTarget } from './import-target';
import { stripImportPathParams } from './strip-import-path-params';
import type { Visitor } from './interfaces';

/**
 * Gets a list of `require()` targets.
 *
 * Core modules of Node.js (e.g. `fs`, `http`) are excluded.
 *
 * @param {RuleContext} context - The rule context.
 * @param {readonly unknown[]} ruleOptions - The rule options.
 * @param {Object} [options] - The flag to include core modules.
 * @param {boolean} [options.includeCore] - The flag to include core modules.
 * @param {function(ImportTarget[]):void} callback The callback function to get result.
 * @returns {Object} The visitor.
 */
export const visitRequire: Visitor = (context, ruleOptions, { includeCore, optionIndex }, callback) => {
  const targets: ImportTarget[] = [];
  const basedir = path.dirname(path.resolve(context.getFilename()));
  const paths = getResolvePaths(context, ruleOptions, optionIndex);
  const extensions = getTryExtensions(context, ruleOptions, optionIndex);
  const options = { basedir, paths, extensions };

  return {
    'Program:exit'() {
      const tracker = new ASTUtils.ReferenceTracker(context.getScope());
      const references = tracker.iterateGlobalReferences({
        require: { [ASTUtils.ReferenceTracker.CALL]: true, resolve: { [ASTUtils.ReferenceTracker.CALL]: true } },
      });

      for (const { node } of references) {
        const [targetNode] = (node as TSESTree.CallExpression).arguments;
        const rawName = ASTUtils.getStringIfConstant(targetNode);
        const name = rawName && stripImportPathParams(rawName);

        // Note: "999" arbitrary to check current/future Node.js version
        if (name && (includeCore || !isCoreModule(name, '999'))) {
          targets.push(new ImportTarget(targetNode, name, options));
        }
      }

      callback(targets);
    },
  };
};
