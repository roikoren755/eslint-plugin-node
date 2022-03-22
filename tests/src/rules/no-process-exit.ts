import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-process-exit';

const error = { messageId: 'noProcessExit' as const, line: 1, column: 1, data: {}, type: AST_NODE_TYPES.CallExpression };

new TSESLint.RuleTester().run('no-process-exit', rule, {
  valid: ['Process.exit()', 'var exit = process.exit;', 'f(process.exit)'],
  invalid: [
    { code: 'process.exit(0);', errors: [error] },
    { code: 'process.exit(1);', errors: [error] },
    { code: 'f(process.exit(1));', errors: [{ ...error, column: 3 }] },
  ],
});
