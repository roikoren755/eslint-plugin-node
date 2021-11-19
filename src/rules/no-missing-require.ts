import { checkExistence, missing } from '../util/check-existence';
import { createRule } from '../util/create-rule';
import { schema as allowModulesSchema } from '../util/get-allow-modules';
import type { IAllowModules } from '../util/get-allow-modules';
import { schema as resolvePathsSchema } from '../util/get-resolve-paths';
import type { IResolvePaths } from '../util/get-resolve-paths';
import { schema as tryExtensionsSchema } from '../util/get-try-extensions';
import type { ITryExtensions } from '../util/get-try-extensions';
import { visitRequire } from '../util/visit-require';

export const category = 'Possible Errors';
export default createRule<[options: IAllowModules & IResolvePaths & ITryExtensions], 'missing'>({
  name: 'no-missing-require',
  meta: {
    type: 'problem',
    docs: { description: 'disallow `require()` expressions which import non-existence modules', recommended: 'error' },
    schema: [
      {
        type: 'object',
        properties: {
          allowModules: allowModulesSchema,
          tryExtensions: tryExtensionsSchema,
          resolvePaths: resolvePathsSchema,
        },
        additionalProperties: false,
      },
    ],
    messages: { missing },
  },
  defaultOptions: [{}],
  create(context, options) {
    const filePath = context.getFilename();

    if (filePath === '<input>') {
      return {};
    }

    return visitRequire(context, options, {}, (targets) => {
      checkExistence(context, options, targets);
    });
  },
});
