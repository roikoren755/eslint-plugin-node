import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../../src/rules/prefer-global/text-encoder';

const error = (global?: boolean): TSESLint.TestCaseError<`prefer${'Global' | 'Module'}`> => ({
  messageId: `prefer${global ? 'Global' : 'Module'}`,
  line: 1,
  column: global ? 7 : 13,
  data: {},
  type: global ? AST_NODE_TYPES.Property : AST_NODE_TYPES.Identifier,
});

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015 },
  globals: { TextEncoder: 'readonly', require: 'readonly' },
} as unknown as TSESLint.RuleTesterConfig).run('prefer-global/text-encoder', rule, {
  valid: [
    'var b = new TextEncoder(s)',
    { code: 'var b = new TextEncoder(s)', options: ['always'] },
    { code: "var { TextEncoder } = require('util'); var b = new TextEncoder(s)", options: ['never'] },
  ],
  invalid: [
    {
      code: "var { TextEncoder } = require('util'); var b = new TextEncoder(s)",
      errors: [error(true)],
    },
    {
      code: "var { TextEncoder } = require('util'); var b = new TextEncoder(s)",
      options: ['always'],
      errors: [error(true)],
    },
    { code: 'var b = new TextEncoder(s)', options: ['never'], errors: [error()] },
  ],
});
