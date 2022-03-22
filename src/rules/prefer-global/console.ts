import { ASTUtils } from '@typescript-eslint/utils';

import { checkForPreferGlobal, defaultOptions, schema } from '../../util/check-prefer-global';
import type { MessageIds, Options } from '../../util/check-prefer-global';
import { createRule } from '../../util/create-rule';

export const category = 'Stylistic Issues';
export default createRule<Options, MessageIds>({
  name: 'prefer-global/console',
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce either `console` or `require("console")`', recommended: false },
    schema,
    messages: {
      preferGlobal: "Unexpected use of 'require(\"console\")'. Use the global variable 'console' instead.",
      preferModule: "Unexpected use of the global variable 'console'. Use 'require(\"console\")' instead.",
    },
  },
  defaultOptions,
  create(context) {
    return {
      'Program:exit'() {
        checkForPreferGlobal(context, {
          globals: { console: { [ASTUtils.ReferenceTracker.READ]: true } },
          modules: { console: { [ASTUtils.ReferenceTracker.READ]: true } },
        });
      },
    };
  },
});
