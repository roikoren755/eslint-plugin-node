import type { TSESTree } from '@typescript-eslint/typescript-estree';

import { createRule } from '../util/create-rule';

export const category = 'Possible Errors';
export default createRule<[], 'noProcessExit'>({
  name: 'no-process-exit',
  meta: {
    type: 'suggestion',
    docs: { description: 'disallow the use of `process.exit()`', recommended: false },
    schema: [],
    messages: { noProcessExit: "Don't use process.exit(); throw an error instead." },
  },
  defaultOptions: [],
  create(context) {
    return {
      "CallExpression > MemberExpression.callee[object.name = 'process'][property.name = 'exit']"(
        node: TSESTree.MemberExpression,
      ) {
        if (node.parent) {
          context.report({ node: node.parent, messageId: 'noProcessExit' });
        }
      },
    };
  },
});
