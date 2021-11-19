import { createRule } from '../util/create-rule';

export const category = 'Possible Errors';
export default createRule<[], 'noNewRequire'>({
  name: 'no-new-require',
  meta: {
    type: 'suggestion',
    docs: { description: 'disallow `new` operators with calls to `require`', recommended: false },
    schema: [],
    messages: { noNewRequire: 'Unexpected use of new with require.' },
  },
  defaultOptions: [],
  create(context) {
    return {
      NewExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
          context.report({ node, messageId: 'noNewRequire' });
        }
      },
    };
  },
});
