import type { TSESLint } from '@typescript-eslint/experimental-utils';
import type { TSESTree } from '@typescript-eslint/typescript-estree';

import { createRule } from '../util/create-rule';

const ACCEPTABLE_PARENTS = new Set([
  'AssignmentExpression',
  'VariableDeclarator',
  'MemberExpression',
  'ExpressionStatement',
  'CallExpression',
  'ConditionalExpression',
  'Program',
  'VariableDeclaration',
]);

/**
 * Finds the eslint-scope reference in the given scope.
 * @param {TSESLint.Scope.Scope} scope The scope to search.
 * @param {TSESTree.Node} node The identifier node.
 * @returns {TSESLint.Scope.Reference|null} Returns the found reference or null if none were found.
 */
const findReference = (scope: TSESLint.Scope.Scope, node: TSESTree.Identifier): TSESLint.Scope.Reference | null => {
  const references = scope.references.filter(
    (reference) => reference.identifier.range[0] === node.range[0] && reference.identifier.range[1] === node.range[1],
  );

  /* istanbul ignore else: correctly returns null */
  if (references.length === 1) {
    return references[0];
  }

  return null;
};

/**
 * Checks if the given identifier node is shadowed in the given scope.
 * @param {TSESLint.Scope.Scope} scope The current scope.
 * @param {TSESTree.Node} node The identifier node to check.
 * @returns {boolean} Whether or not the name is shadowed.
 */
const isShadowed = (scope: TSESLint.Scope.Scope, node: TSESTree.Identifier): boolean => {
  const reference = findReference(scope, node);

  return !!reference?.resolved?.defs.length;
};

export const category = 'Stylistic Issues';
export default createRule<[], 'unexpected'>({
  name: 'global-require',
  meta: {
    type: 'suggestion',
    docs: { description: 'require `require()` calls to be placed at top-level module scope', recommended: false },
    schema: [],
    messages: { unexpected: 'Unexpected require().' },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const currentScope = context.getScope();

        if ('name' in node.callee && node.callee.name === 'require' && !isShadowed(currentScope, node.callee)) {
          const isGoodRequire = context.getAncestors().every((parent) => ACCEPTABLE_PARENTS.has(parent.type));

          if (!isGoodRequire) {
            context.report({ node, messageId: 'unexpected' });
          }
        }
      },
    };
  },
});
