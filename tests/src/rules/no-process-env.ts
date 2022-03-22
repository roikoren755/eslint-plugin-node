import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-process-env';

const error = {
  messageId: 'unexpectedProcessEnv' as const,
  line: 1,
  column: 1,
  data: {},
  type: AST_NODE_TYPES.MemberExpression,
};

new TSESLint.RuleTester().run('no-process-env', rule, {
  valid: ['Process.env', 'process[env]', 'process.nextTick', 'process.execArgv'],
  invalid: [
    { code: 'process.env', errors: [error] },
    { code: 'process.env.ENV', errors: [error] },
    { code: 'f(process.env)', errors: [{ ...error, column: 3 }] },
  ],
});
