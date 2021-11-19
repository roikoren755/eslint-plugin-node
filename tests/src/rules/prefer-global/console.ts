import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import rule from '../../../../src/rules/prefer-global/console';

const error = (global?: boolean): TSESLint.TestCaseError<`prefer${'Global' | 'Module'}`> => ({
  messageId: `prefer${global ? 'Global' : 'Module'}`,
  line: 1,
  column: global ? 15 : 1,
  data: {},
  type: global ? AST_NODE_TYPES.CallExpression : AST_NODE_TYPES.Identifier,
});

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015 },
  globals: { console: 'readonly', require: 'readonly' },
} as unknown as TSESLint.RuleTesterConfig).run('prefer-global/console', rule, {
  valid: [
    'console.log(10)',
    { code: 'console.log(10)', options: ['always'] },
    { code: "var console = require('console'); console.log(10)", options: ['never'] },
  ],
  invalid: [
    { code: "var console = require('console'); console.log(10)", errors: [error(true)] },
    { code: "var console = require('console'); console.log(10)", options: ['always'], errors: [error(true)] },
    { code: 'console.log(10)', options: ['never'], errors: [error()] },
  ],
});
