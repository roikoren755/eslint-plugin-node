import { createRule } from '../util/create-rule';
import type { TSESTree } from '@typescript-eslint/typescript-estree';

export const category = 'Stylistic Issues';
export default createRule<[options: { allowAtRootLevel: boolean }], 'noSync'>({
  name: 'no-sync',
  meta: {
    type: 'suggestion',
    docs: { description: 'disallow synchronous methods', recommended: false },
    schema: [
      {
        type: 'object',
        properties: { allowAtRootLevel: { type: 'boolean', default: false } },
        additionalProperties: false,
      },
    ],
    messages: { noSync: "Unexpected sync method: '{{propertyName}}'." },
  },
  defaultOptions: [{ allowAtRootLevel: false }],
  create(context, options) {
    const selector = options[0].allowAtRootLevel
      ? ':function MemberExpression[property.name=/.*Sync$/]'
      : 'MemberExpression[property.name=/.*Sync$/]';

    return {
      [selector](node: TSESTree.MemberExpressionNonComputedName) {
        context.report({ node, messageId: 'noSync', data: { propertyName: node.property.name } });
      },
    };
  },
});
