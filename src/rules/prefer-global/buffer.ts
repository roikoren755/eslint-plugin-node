import { ASTUtils } from '@typescript-eslint/utils';

import { checkForPreferGlobal, defaultOptions, schema } from '../../util/check-prefer-global';
import type { MessageIds, Options } from '../../util/check-prefer-global';
import { createRule } from '../../util/create-rule';

export const category = 'Stylistic Issues';
export default createRule<Options, MessageIds>({
  name: 'prefer-global/buffer',
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce either `Buffer` or `require("buffer").Buffer`', recommended: false },
    schema,
    messages: {
      preferGlobal: "Unexpected use of 'require(\"buffer\").Buffer'. Use the global variable 'Buffer' instead.",
      preferModule: "Unexpected use of the global variable 'Buffer'. Use 'require(\"buffer\").Buffer' instead.",
    },
  },
  defaultOptions,
  create(context) {
    return {
      'Program:exit'() {
        checkForPreferGlobal(context, {
          globals: { Buffer: { [ASTUtils.ReferenceTracker.READ]: true } },
          modules: { buffer: { Buffer: { [ASTUtils.ReferenceTracker.READ]: true } } },
        });
      },
    };
  },
});
