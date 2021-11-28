import { checkExistence, missing } from '../util/check-existence';
import { createRule } from '../util/create-rule';
import { schema as allowModulesSchema } from '../util/get-allow-modules';
import type { IAllowModules } from '../util/get-allow-modules';
import { schema as onlyRelativePathSchema } from '../util/get-only-relative-path';
import type { IOnlyRelativePath } from '../util/get-only-relative-path';
import { schema as resolvePathsSchema } from '../util/get-resolve-paths';
import type { IResolvePaths } from '../util/get-resolve-paths';
import { schema as tryExtensionsSchema } from '../util/get-try-extensions';
import type { ITryExtensions } from '../util/get-try-extensions';
import { visitImport } from '../util/visit-import';

export const category = 'Possible Errors';
export default createRule<[options: IAllowModules & IOnlyRelativePath & IResolvePaths & ITryExtensions], 'missing'>({
  name: 'no-missing-import',
  meta: {
    type: 'problem',
    docs: { description: 'disallow `import` declarations which import non-existent modules', recommended: 'error' },
    schema: [
      {
        type: 'object',
        properties: {
          allowModules: allowModulesSchema,
          onlyRelativePath: onlyRelativePathSchema,
          resolvePaths: resolvePathsSchema,
          tryExtensions: tryExtensionsSchema,
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

    return visitImport(context, options, {}, (targets) => {
      checkExistence(context, options, targets);
    });
  },
});
