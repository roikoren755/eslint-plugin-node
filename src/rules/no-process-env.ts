import type { TSESTree } from '@typescript-eslint/typescript-estree';

import { createRule } from '../util/create-rule';

export const category = 'Stylistic Issues';
export default createRule<[], 'unexpectedProcessEnv'>({
  name: 'no-process-env',
  meta: {
    type: 'suggestion',
    docs: { description: 'disallow the use of `process.env`', recommended: false },
    schema: [],
    messages: { unexpectedProcessEnv: 'Unexpected use of process.env.' },
  },
  defaultOptions: [],
  create(context) {
    return {
      MemberExpression(node) {
        const objectName = (node.object as TSESTree.Identifier).name;
        const propertyName = (node.property as TSESTree.Identifier).name;

        if (objectName === 'process' && !node.computed && propertyName === 'env') {
          context.report({ node, messageId: 'unexpectedProcessEnv' });
        }
      },
    };
  },
});
