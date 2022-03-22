import { ASTUtils } from '@typescript-eslint/utils';

import { checkForPreferGlobal, defaultOptions, schema } from '../../util/check-prefer-global';
import type { MessageIds, Options } from '../../util/check-prefer-global';
import { createRule } from '../../util/create-rule';

export const category = 'Stylistic Issues';
export default createRule<Options, MessageIds>({
  name: 'prefer-global/text-decoder',
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce either `TextDecoder` or `require("util").TextDecoder`', recommended: false },
    schema,
    messages: {
      preferGlobal: "Unexpected use of 'require(\"util\").TextDecoder'. Use the global variable 'TextDecoder' instead.",
      preferModule: "Unexpected use of the global variable 'TextDecoder'. Use 'require(\"util\").TextDecoder' instead.",
    },
  },
  defaultOptions,
  create(context) {
    return {
      'Program:exit'() {
        checkForPreferGlobal(context, {
          globals: { TextDecoder: { [ASTUtils.ReferenceTracker.READ]: true } },
          modules: { util: { TextDecoder: { [ASTUtils.ReferenceTracker.READ]: true } } },
        });
      },
    };
  },
});
