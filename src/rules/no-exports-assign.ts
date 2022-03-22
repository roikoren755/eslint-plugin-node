import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type { TSESLint } from '@typescript-eslint/utils';
import { ASTUtils } from '@typescript-eslint/utils';

import { createRule } from '../util/create-rule';

const isExports = (node: TSESTree.Expression | undefined, scope: TSESLint.Scope.Scope): boolean =>
  node?.type === 'Identifier' && node.name === 'exports' && ASTUtils.findVariable(scope, node)?.scope.type === 'global';

const isModuleExports = (node: TSESTree.Expression | undefined, scope: TSESLint.Scope.Scope): boolean =>
  node?.type === 'MemberExpression' &&
  !node.computed &&
  node.object.type === 'Identifier' &&
  node.object.name === 'module' &&
  node.property.type === 'Identifier' &&
  node.property.name === 'exports' &&
  ASTUtils.findVariable(scope, node.object)?.scope.type === 'global';

export const category = 'Possible Errors';
export default createRule<[], 'forbidden'>({
  name: 'no-exports-assign',
  meta: {
    type: 'problem',
    docs: { description: 'disallow the assignment to `exports`', recommended: 'error' },
    schema: [],
    messages: { forbidden: "Unexpected assignment to 'exports' variable. Use 'module.exports' instead." },
  },
  defaultOptions: [],
  create(context) {
    return {
      AssignmentExpression(node) {
        const scope = context.getScope();

        if (
          !isExports(node.left, scope) ||
          // module.exports = exports = {}
          (node.parent?.type === 'AssignmentExpression' &&
            node.parent.right === node &&
            isModuleExports(node.parent.left, scope)) ||
          // exports = module.exports = {}
          (node.right.type === 'AssignmentExpression' && isModuleExports(node.right.left, scope))
        ) {
          return;
        }

        context.report({ node, messageId: 'forbidden' });
      },
    };
  },
});
