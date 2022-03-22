import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../../src/rules/prefer-global/process';

const error = (global?: boolean): TSESLint.TestCaseError<`prefer${'Global' | 'Module'}`> => ({
  messageId: `prefer${global ? 'Global' : 'Module'}`,
  line: 1,
  column: global ? 15 : 1,
  data: {},
  type: global ? AST_NODE_TYPES.CallExpression : AST_NODE_TYPES.Identifier,
});

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015 },
  globals: { process: 'readonly', require: 'readonly' },
} as unknown as TSESLint.RuleTesterConfig).run('prefer-global/process', rule, {
  valid: [
    'process.exit(0)',
    { code: 'process.exit(0)', options: ['always'] },
    { code: "var process = require('process'); process.exit(0)", options: ['never'] },
  ],
  invalid: [
    { code: "var process = require('process'); process.exit(0)", errors: [error(true)] },
    { code: "var process = require('process'); process.exit(0)", options: ['always'], errors: [error(true)] },
    { code: 'process.exit(0)', options: ['never'], errors: [error()] },
  ],
});
