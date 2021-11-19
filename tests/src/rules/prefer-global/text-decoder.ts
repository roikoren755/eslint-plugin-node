import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import rule from '../../../../src/rules/prefer-global/text-decoder';

const error = (global?: boolean): TSESLint.TestCaseError<`prefer${'Global' | 'Module'}`> => ({
  messageId: `prefer${global ? 'Global' : 'Module'}`,
  line: 1,
  column: global ? 7 : 13,
  data: {},
  type: global ? AST_NODE_TYPES.Property : AST_NODE_TYPES.Identifier,
});

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015 },
  globals: { TextDecoder: 'readonly', require: 'readonly' },
} as unknown as TSESLint.RuleTesterConfig).run('prefer-global/text-decoder', rule, {
  valid: [
    'var b = new TextDecoder(s)',
    { code: 'var b = new TextDecoder(s)', options: ['always'] },
    { code: "var { TextDecoder } = require('util'); var b = new TextDecoder(s)", options: ['never'] },
  ],
  invalid: [
    {
      code: "var { TextDecoder } = require('util'); var b = new TextDecoder(s)",
      errors: [error(true)],
    },
    {
      code: "var { TextDecoder } = require('util'); var b = new TextDecoder(s)",
      options: ['always'],
      errors: [error(true)],
    },
    { code: 'var b = new TextDecoder(s)', options: ['never'], errors: [error()] },
  ],
});
