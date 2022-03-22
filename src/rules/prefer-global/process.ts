import { ASTUtils } from '@typescript-eslint/utils';

import { checkForPreferGlobal, defaultOptions, schema } from '../../util/check-prefer-global';
import type { MessageIds, Options } from '../../util/check-prefer-global';
import { createRule } from '../../util/create-rule';

export const category = 'Stylistic Issues';
export default createRule<Options, MessageIds>({
  name: 'prefer-global/process',
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce either `process` or `require("process")`', recommended: false },
    schema,
    messages: {
      preferGlobal: "Unexpected use of 'require(\"process\")'. Use the global variable 'process' instead.",
      preferModule: "Unexpected use of the global variable 'process'. Use 'require(\"process\")' instead.",
    },
  },
  defaultOptions,
  create(context) {
    return {
      'Program:exit'() {
        checkForPreferGlobal(context, {
          globals: { process: { [ASTUtils.ReferenceTracker.READ]: true } },
          modules: { process: { [ASTUtils.ReferenceTracker.READ]: true } },
        });
      },
    };
  },
});
