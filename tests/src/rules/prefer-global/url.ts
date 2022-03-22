import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../../src/rules/prefer-global/url';

const error = (global?: boolean): TSESLint.TestCaseError<`prefer${'Global' | 'Module'}`> => ({
  messageId: `prefer${global ? 'Global' : 'Module'}`,
  line: 1,
  column: global ? 7 : 13,
  data: {},
  type: global ? AST_NODE_TYPES.Property : AST_NODE_TYPES.Identifier,
});

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015 },
  globals: { URL: 'readonly', require: 'readonly' },
} as unknown as TSESLint.RuleTesterConfig).run('prefer-global/url', rule, {
  valid: [
    'var b = new URL(s)',
    { code: 'var b = new URL(s)', options: ['always'] },
    { code: "var { URL } = require('url'); var b = new URL(s)", options: ['never'] },
  ],
  invalid: [
    { code: "var { URL } = require('url'); var b = new URL(s)", errors: [error(true)] },
    { code: "var { URL } = require('url'); var b = new URL(s)", options: ['always'], errors: [error(true)] },
    { code: 'var b = new URL(s)', options: ['never'], errors: [error()] },
  ],
});
