import { checkExtraneous, extraneous } from '../util/check-extraneous';
import { createRule } from '../util/create-rule';
import type { IAllowModules } from '../util/get-allow-modules';
import { schema as allowModulesSchema } from '../util/get-allow-modules';
import type { IConvertPath } from '../util/get-convert-path';
import { schema as convertPathSchema } from '../util/get-convert-path';
import type { IResolvePaths } from '../util/get-resolve-paths';
import { schema as resolvePathsSchema } from '../util/get-resolve-paths';
import type { ITryExtensions } from '../util/get-try-extensions';
import { schema as tryExtensionsSchema } from '../util/get-try-extensions';
import { schema as yarnWorkspacesSchema } from '../util/get-yarn-workspaces';
import type { IYarnWorkspaces } from '../util/get-yarn-workspaces';
import { visitRequire } from '../util/visit-require';

export const category = 'Possible Errors';
export default createRule<
  [options: IAllowModules & IConvertPath & IResolvePaths & ITryExtensions & IYarnWorkspaces],
  'extraneous'
>({
  name: 'no-extraneous-require',
  meta: {
    type: 'problem',
    docs: { description: 'disallow `require()` expressions which import extraneous modules', recommended: 'error' },
    schema: [
      {
        type: 'object',
        properties: {
          allowModules: allowModulesSchema,
          convertPath: convertPathSchema,
          resolvePaths: resolvePathsSchema,
          tryExtensions: tryExtensionsSchema,
          yarnWorkspaces: yarnWorkspacesSchema,
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

    return visitRequire(context, options, {}, (targets) => {
      checkExtraneous(context, options, filePath, targets);
    });
  },
});
