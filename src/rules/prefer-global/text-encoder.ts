import { ASTUtils } from '@typescript-eslint/experimental-utils';

import { checkForPreferGlobal, defaultOptions, schema } from '../../util/check-prefer-global';
import type { MessageIds, Options } from '../../util/check-prefer-global';
import { createRule } from '../../util/create-rule';

export const category = 'Stylistic Issues';
export default createRule<Options, MessageIds>({
  name: 'prefer-global/text-encoder',
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce either `TextEncoder` or `require("util").TextEncoder`', recommended: false },
    schema,
    messages: {
      preferGlobal: "Unexpected use of 'require(\"util\").TextEncoder'. Use the global variable 'TextEncoder' instead.",
      preferModule: "Unexpected use of the global variable 'TextEncoder'. Use 'require(\"util\").TextEncoder' instead.",
    },
  },
  defaultOptions,
  create(context) {
    return {
      'Program:exit'() {
        checkForPreferGlobal(context, {
          globals: { TextEncoder: { [ASTUtils.ReferenceTracker.READ]: true } },
          modules: { util: { TextEncoder: { [ASTUtils.ReferenceTracker.READ]: true } } },
        });
      },
    };
  },
});
