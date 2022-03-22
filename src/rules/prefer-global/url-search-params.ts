import { ASTUtils } from '@typescript-eslint/utils';

import { checkForPreferGlobal, defaultOptions, schema } from '../../util/check-prefer-global';
import type { MessageIds, Options } from '../../util/check-prefer-global';
import { createRule } from '../../util/create-rule';

export const category = 'Stylistic Issues';
export default createRule<Options, MessageIds>({
  name: 'prefer-global/url-search-params',
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce either `URLSearchParams` or `require("url").URLSearchParams`', recommended: false },
    schema,
    messages: {
      preferGlobal:
        "Unexpected use of 'require(\"url\").URLSearchParams'. Use the global variable 'URLSearchParams' instead.",
      preferModule:
        "Unexpected use of the global variable 'URLSearchParams'. Use 'require(\"url\").URLSearchParams' instead.",
    },
  },
  defaultOptions,
  create(context) {
    return {
      'Program:exit'() {
        checkForPreferGlobal(context, {
          globals: { URLSearchParams: { [ASTUtils.ReferenceTracker.READ]: true } },
          modules: { url: { URLSearchParams: { [ASTUtils.ReferenceTracker.READ]: true } } },
        });
      },
    };
  },
});
