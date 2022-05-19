import type { TSESTree } from '@typescript-eslint/typescript-estree';

import { createRule } from '../util/create-rule';

/**
 * Determines whether the callback is part of a callback expression.
 * @param {TSESTree.CallExpression} node The callback node
 * @param {TSESTree.Statement} parentNode The expression node
 * @returns {boolean} Whether or not this is part of a callback expression
 */
const isCallbackExpression = (node: TSESTree.CallExpression, parentNode?: TSESTree.Statement): boolean => {
  // ensure the parent node exists and is an expression
  if (!parentNode || parentNode.type !== 'ExpressionStatement') {
    return false;
  }

  // cb()
  if (parentNode.expression === node) {
    return true;
  }

  // special case for cb && cb() and similar
  return (
    (parentNode.expression.type === 'BinaryExpression' || parentNode.expression.type === 'LogicalExpression') &&
    parentNode.expression.right === node
  );
};

export const category = 'Stylistic Issues';
export default createRule<[callbacks: string[]], 'missingReturn'>({
  name: 'callback-return',
  meta: {
    type: 'suggestion',
    docs: { description: 'require `return` statements after callbacks', recommended: false },
    schema: [{ type: 'array', items: { type: 'string' } }],
    messages: { missingReturn: 'Expected return with your callback function.' },
  },
  defaultOptions: [['callback', 'cb', 'next']],
  create(context, options) {
    const [callbacks] = options;
    const sourceCode = context.getSourceCode();

    /**
     * Find the closest parent matching a list of types.
     * @param {TSESTree.Node} node The node whose parents we are searching
     * @param {string[]} types The node types to match
     * @returns {TSESTree.Node} The matched node or undefined.
     */
    const findClosestParentOfType = (node: TSESTree.Node, types: string[]): TSESTree.Node | null => {
      if (!node.parent) {
        return null;
      }

      if (!types.includes(node.parent.type)) {
        return findClosestParentOfType(node.parent, types);
      }

      return node.parent;
    };

    /**
     * Check to see if a node contains only identifiers
     * @param node The node to check
     * @returns {boolean} Whether or not the node contains only identifiers
     */
    const containsOnlyIdentifiers = (node: TSESTree.Expression): boolean => {
      if (node.type === 'Identifier') {
        return true;
      }

      if (node.type === 'MemberExpression') {
        if (node.object.type === 'Identifier') {
          return true;
        }

        if (node.object.type === 'MemberExpression') {
          return containsOnlyIdentifiers(node.object);
        }
      }

      return false;
    };

    /**
     * Check to see if a CallExpression is in our callback list.
     * @param {TSESTree.CallExpression} node The node to check against our callback names list.
     * @returns {boolean} Whether or not this function matches our callback name.
     */
    const isCallback = (node: TSESTree.CallExpression): boolean =>
      containsOnlyIdentifiers(node.callee) && callbacks.includes(sourceCode.getText(node.callee));

    return {
      CallExpression(node) {
        // if we're not a callback we can return
        if (!isCallback(node)) {
          return;
        }

        // find the closest block, return or loop
        const closestBlock =
          findClosestParentOfType(node, ['BlockStatement', 'ReturnStatement', 'ArrowFunctionExpression']) ??
          ({} as TSESTree.Node);

        // if our parent is a return we know we're ok
        if (closestBlock.type === 'ReturnStatement') {
          return;
        }

        // arrow functions don't always have blocks and implicitly return
        if (closestBlock.type === 'ArrowFunctionExpression') {
          return;
        }

        // block statements are part of functions and most if statements
        if (closestBlock.type === 'BlockStatement') {
          // find the last item in the block
          const lastItem = closestBlock.body[closestBlock.body.length - 1];

          // if the callback is the last thing in a block that might be ok
          if (isCallbackExpression(node, lastItem)) {
            const parentType = closestBlock.parent?.type;

            // but only if the block is part of a function
            if (
              parentType === 'FunctionExpression' ||
              parentType === 'FunctionDeclaration' ||
              parentType === 'ArrowFunctionExpression'
            ) {
              return;
            }
          }

          // ending a block with a return is also ok
          if (
            lastItem.type === 'ReturnStatement' && // but only if the callback is immediately before
            isCallbackExpression(node, closestBlock.body[closestBlock.body.length - 2])
          ) {
            return;
          }
        }

        // as long as you're the child of a function at this point you should be asked to return
        if (findClosestParentOfType(node, ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])) {
          context.report({ node, messageId: 'missingReturn' });
        }
      },
    };
  },
});
