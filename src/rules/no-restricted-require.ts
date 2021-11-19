import { checkRestricted } from '../util/check-restricted';
import type { RestrictionDefinition } from '../util/check-restricted';
import { createRule } from '../util/create-rule';
import { visitRequire } from '../util/visit-require';

export const category = 'Stylistic Issues';
export default createRule<[restrictions: RestrictionDefinition[]], 'restricted'>({
  name: 'no-restricted-require',
  meta: {
    type: 'suggestion',
    docs: { description: 'disallow specified modules when loaded by `require`', recommended: false },
    schema: [
      {
        type: 'array',
        items: {
          anyOf: [
            { type: 'string' },
            {
              type: 'object',
              properties: {
                name: {
                  anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' }, additionalItems: false }],
                },
                message: { type: 'string' },
              },
              additionalProperties: false,
              required: ['name'],
            },
          ],
        },
        additionalItems: false,
      },
    ],
    messages: { restricted: "'{{name}}' module is restricted from being used.{{customMessage}}" },
  },
  defaultOptions: [[]],
  create(context, options) {
    return visitRequire(context, options, { includeCore: true }, (targets) => {
      checkRestricted(context, targets);
    });
  },
});
