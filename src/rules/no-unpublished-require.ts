import { checkPublish, notPublished } from '../util/check-publish';
import { createRule } from '../util/create-rule';
import { schema as allowModulesSchema } from '../util/get-allow-modules';
import type { IAllowModules } from '../util/get-allow-modules';
import { schema as convertPathSchema } from '../util/get-convert-path';
import type { IConvertPath } from '../util/get-convert-path';
import { schema as resolvePathsSchema } from '../util/get-resolve-paths';
import type { IResolvePaths } from '../util/get-resolve-paths';
import { schema as tryExtensionsSchema } from '../util/get-try-extensions';
import type { ITryExtensions } from '../util/get-try-extensions';
import { visitRequire } from '../util/visit-require';

export const category = 'Possible Errors';
export default createRule<[options: IAllowModules & IConvertPath & IResolvePaths & ITryExtensions], 'notPublished'>({
  name: 'no-unpublished-require',
  meta: {
    type: 'problem',
    docs: { description: 'disallow `require()` expressions which import private modules', recommended: 'error' },
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
    messages: { notPublished },
  },
  defaultOptions: [{}],
  create(context, options) {
    const filePath = context.getFilename();

    if (filePath === '<input>') {
      return {};
    }

    return visitRequire(context, options, {}, (targets) => {
      checkPublish(context, options, filePath, targets);
    });
  },
});
