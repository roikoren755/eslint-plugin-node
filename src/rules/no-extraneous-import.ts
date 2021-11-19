import { checkExtraneous, extraneous } from '../util/check-extraneous';
import { createRule } from '../util/create-rule';
import { schema as allowModulesSchema } from '../util/get-allow-modules';
import type { IAllowModules } from '../util/get-allow-modules';
import { schema as convertPathSchema } from '../util/get-convert-path';
import type { IConvertPath } from '../util/get-convert-path';
import { schema as resolvePathsSchema } from '../util/get-resolve-paths';
import type { IResolvePaths } from '../util/get-resolve-paths';
import { schema as tryExtensionsSchema } from '../util/get-try-extensions';
import type { ITryExtensions } from '../util/get-try-extensions';
import { visitImport } from '../util/visit-import';

export const category = 'Possible Errors';
export default createRule<[options: IAllowModules & IConvertPath & IResolvePaths & ITryExtensions], 'extraneous'>({
  name: 'no-extraneous-import',
  meta: {
    type: 'problem',
    docs: { description: 'disallow `import` declarations which import extraneous modules', recommended: 'warn' },
    schema: [
      {
        type: 'object',
        properties: {
          allowModules: allowModulesSchema,
          convertPath: convertPathSchema,
          resolvePaths: resolvePathsSchema,
          tryExtensions: tryExtensionsSchema,
        },
        additionalProperties: false,
      },
    ],
    messages: { extraneous },
  },
  defaultOptions: [{}],
  create(context, options) {
    const filePath = context.getFilename();

    if (filePath === '<input>') {
      return {};
    }

    return visitImport(context, options, {}, (targets) => {
      checkExtraneous(context, options, filePath, targets);
    });
  },
});
