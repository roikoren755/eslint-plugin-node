import type { TSESTree } from '@typescript-eslint/typescript-estree';

import { createRule } from '../util/create-rule';

/**
 * Determine if a node has a possibility to be an Error object
 * @param  {TSESTree.Node}  node  ASTNode to check
 * @returns {boolean}       True if there is a chance it contains an Error obj
 */
const couldBeError = (node: TSESTree.CallExpressionArgument): boolean => {
  switch (node.type) {
    case 'Identifier':
    case 'CallExpression':
    case 'NewExpression':
    case 'MemberExpression':
    case 'TaggedTemplateExpression':
    case 'YieldExpression':
      return true; // possibly an error object.

    case 'AssignmentExpression':
      return couldBeError(node.right);

    case 'SequenceExpression': {
      const exprs = node.expressions;

      return exprs.length > 0 && couldBeError(exprs[exprs.length - 1]);
    }

    case 'LogicalExpression':
      return couldBeError(node.left) || couldBeError(node.right);

    case 'ConditionalExpression':
      return couldBeError(node.consequent) || couldBeError(node.alternate);

    default:
      return !('value' in node) || node.value === null;
  }
};

export const category = 'Possible Errors';
export default createRule<[], 'unexpected'>({
  name: 'no-callback-literal',
  meta: {
    type: 'problem',
    docs: { description: 'enforce Node.js-style error-first callback pattern is followed', recommended: false },
    schema: [],
    messages: { unexpected: 'Unexpected literal in error position of callback.' },
  },
  defaultOptions: [],
  create(context) {
    const callbackNames = new Set(['callback', 'cb']);

    return {
      CallExpression(node) {
        const [errorArg] = node.arguments;
        const calleeName = 'name' in node.callee ? node.callee.name : '';

        if (errorArg && !couldBeError(errorArg) && callbackNames.has(calleeName)) {
          context.report({ node, messageId: 'unexpected' });
        }
      },
    };
  },
});
