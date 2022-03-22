import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../../src/rules/prefer-global/buffer';

const error = (global?: boolean): TSESLint.TestCaseError<`prefer${'Global' | 'Module'}`> => ({
  messageId: `prefer${global ? 'Global' : 'Module'}`,
  line: 1,
  column: global ? 7 : 9,
  data: {},
  type: global ? AST_NODE_TYPES.Property : AST_NODE_TYPES.Identifier,
});

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015 },
  globals: { Buffer: 'readonly', require: 'readonly' },
} as unknown as TSESLint.RuleTesterConfig).run('prefer-global/buffer', rule, {
  valid: [
    'var b = Buffer.alloc(10)',
    { code: 'var b = Buffer.alloc(10)', options: ['always'] },
    { code: "var { Buffer } = require('buffer'); var b = Buffer.alloc(10)", options: ['never'] },
  ],
  invalid: [
    { code: "var { Buffer } = require('buffer'); var b = Buffer.alloc(10)", errors: [error(true)] },
    { code: "var { Buffer } = require('buffer'); var b = Buffer.alloc(10)", options: ['always'], errors: [error(true)] },
    { code: 'var b = Buffer.alloc(10)', options: ['never'], errors: [error()] },
  ],
});
