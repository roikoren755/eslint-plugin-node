import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-exports-assign';

const error = {
  messageId: 'forbidden' as const,
  line: 1,
  column: 1,
  data: {},
  type: AST_NODE_TYPES.AssignmentExpression,
};

new TSESLint.RuleTester({
  globals: { exports: 'writable', module: 'readonly' },
} as unknown as TSESLint.RuleTesterConfig).run('no-exports-assign', rule, {
  valid: [
    'module.exports.foo = 1',
    'exports.bar = 1',
    'module.exports = exports = {}',
    'exports = module.exports = {}',
    'function f(exports) { exports = {} }',
  ],
  invalid: [{ code: 'exports = {}', errors: [error] }],
});
