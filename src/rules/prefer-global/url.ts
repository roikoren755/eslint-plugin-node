import { ASTUtils } from '@typescript-eslint/utils';

import { checkForPreferGlobal, defaultOptions, schema } from '../../util/check-prefer-global';
import type { MessageIds, Options } from '../../util/check-prefer-global';
import { createRule } from '../../util/create-rule';

export const category = 'Stylistic Issues';
export default createRule<Options, MessageIds>({
  name: 'prefer-global/url',
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce either `URL` or `require("url").URL`', recommended: false },
    schema,
    messages: {
      preferGlobal: "Unexpected use of 'require(\"url\").URL'. Use the global variable 'URL' instead.",
      preferModule: "Unexpected use of the global variable 'URL'. Use 'require(\"url\").URL' instead.",
    },
  },
  defaultOptions,
  create(context) {
    return {
      'Program:exit'() {
        checkForPreferGlobal(context, {
          globals: { URL: { [ASTUtils.ReferenceTracker.READ]: true } },
          modules: { url: { URL: { [ASTUtils.ReferenceTracker.READ]: true } } },
        });
      },
    };
  },
});
