import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-new-require';

const error = { messageId: 'noNewRequire' as const, line: 1, column: 17, type: AST_NODE_TYPES.NewExpression, data: {} };

new TSESLint.RuleTester().run('no-new-require', rule, {
  valid: [
    "var appHeader = require('app-header')",
    "var AppHeader = new (require('app-header'))",
    "var AppHeader = new (require('headers').appHeader)",
  ],
  invalid: [
    { code: "var appHeader = new require('app-header')", errors: [error] },
    { code: "var appHeader = new require('headers').appHeader", errors: [error] },
  ],
});
