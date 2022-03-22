import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/exports-style';

const assignError = { messageId: 'exportsAssignment' as const, line: 1, type: AST_NODE_TYPES.Identifier };
const accessError = (bad: 'exports' | 'module.exports'): TSESLint.TestCaseError<'exportsAccess'> => ({
  messageId: 'exportsAccess',
  line: 1,
  type: bad === 'exports' ? AST_NODE_TYPES.Identifier : AST_NODE_TYPES.MemberExpression,
  data: { bad, good: bad === 'exports' ? 'module.exports' : 'exports' },
});

new TSESLint.RuleTester().run('exports-style', rule, {
  valid: [
    { code: 'module.exports = {foo: 1}', globals: { module: 'readonly', exports: true } },
    { code: 'module.exports = {foo: 1}', options: ['module.exports'], globals: { module: 'readonly', exports: true } },
    { code: 'exports.foo = 1', options: ['exports'], globals: { module: 'readonly', exports: true } },
    {
      code: 'exports = module.exports = {foo: 1}',
      options: ['module.exports', { allowBatchAssign: true }],
      globals: { module: 'readonly', exports: true },
    },
    {
      code: 'module.exports = exports = {foo: 1}',
      options: ['module.exports', { allowBatchAssign: true }],
      globals: { module: 'readonly', exports: true },
    },
    {
      code: 'exports = module.exports = {foo: 1}',
      options: ['exports', { allowBatchAssign: true }],
      globals: { module: 'readonly', exports: true },
    },
    {
      code: 'module.exports = exports = {foo: 1}',
      options: ['exports', { allowBatchAssign: true }],
      globals: { module: 'readonly', exports: true },
    },
    {
      code: 'exports = module.exports = {foo: 1}; exports.bar = 2',
      options: ['exports', { allowBatchAssign: true }],
      globals: { module: 'readonly', exports: true },
    },
    {
      code: 'module.exports = exports = {foo: 1}; exports.bar = 2',
      options: ['exports', { allowBatchAssign: true }],
      globals: { module: 'readonly', exports: true },
    },

    // allow accesses of `modules` except `module.exports`
    { code: 'module = {}; module.foo = 1', options: ['exports'], globals: { module: 'readonly', exports: true } },

    // Ignores if it's not defined.
    { code: 'exports.foo = 1', options: ['module.exports'] },
    { code: 'module.exports = {foo: 1}', options: ['exports'] },
  ],
  invalid: [
    {
      code: 'exports = {foo: 1}',
      output: null,
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },
    {
      code: 'exports.foo = 1',
      output: null,
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },
    {
      code: 'module.exports = exports = {foo: 1}',
      output: null,
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 18 }],
    },
    {
      code: 'exports = module.exports = {foo: 1}',
      output: null,
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },

    {
      code: 'exports = {foo: 1}',
      output: null,
      options: ['module.exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },
    {
      code: 'exports.foo = 1',
      output: null,
      options: ['module.exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },
    {
      code: 'module.exports = exports = {foo: 1}',
      output: null,
      options: ['module.exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 18 }],
    },
    {
      code: 'exports = module.exports = {foo: 1}',
      output: null,
      options: ['module.exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },
    {
      code: 'exports = {foo: 1}',
      output: null,
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...assignError, column: 1 }],
    },
    {
      code: 'module.exports = {foo: 1}',
      output: 'exports.foo = 1;',
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports.foo = 1',
      output: 'exports.foo = 1',
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports = { a: 1 }',
      output: 'exports.a = 1;',
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports = { a: 1, b: 2 }',
      output: 'exports.a = 1;\n\nexports.b = 2;',
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports = { // before a\na: 1, // between a and b\nb: 2 // after b\n}',
      output: '// before a\nexports.a = 1;\n\n// between a and b\nexports.b = 2;\n// after b',
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'foo(module.exports = {foo: 1})',
      output: null,
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 5 }],
    },
    {
      code: 'module.exports = { get a() {} }',
      output: null,
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports = { a }',
      output: 'exports.a = a;',
      options: ['exports'],
      parserOptions: { ecmaVersion: 6 },
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports = { ...a }',
      output: null,
      options: ['exports'],
      parserOptions: { ecmaVersion: 9 },
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: "module.exports = { ['a' + 'b']: 1 }",
      output: "exports['a' + 'b'] = 1;",
      options: ['exports'],
      parserOptions: { ecmaVersion: 6 },
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: "module.exports = { 'foo': 1 }",
      output: "exports['foo'] = 1;",
      options: ['exports'],
      parserOptions: { ecmaVersion: 6 },
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports = { foo(a) {} }',
      output: 'exports.foo = function (a) {};',
      options: ['exports'],
      parserOptions: { ecmaVersion: 8 },
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports = { *foo(a) {} }',
      output: 'exports.foo = function* (a) {};',
      options: ['exports'],
      parserOptions: { ecmaVersion: 6 },
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports = { async foo(a) {} }',
      output: 'exports.foo = async function (a) {};',
      options: ['exports'],
      parserOptions: { ecmaVersion: 8 },
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports.foo()',
      output: 'exports.foo()',
      options: ['exports'],
      parserOptions: { ecmaVersion: 8 },
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: "a = module.exports.foo + module.exports['bar']",
      output: "a = exports.foo + exports['bar']",
      options: ['exports'],
      parserOptions: { ecmaVersion: 8 },
      globals: { module: 'readonly', exports: true },
      errors: [
        { ...accessError('module.exports'), column: 5 },
        { ...accessError('module.exports'), column: 26 },
      ],
    },
    {
      code: 'module.exports = exports = {foo: 1}',
      output: null,
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [
        { ...accessError('module.exports'), column: 1 },
        { ...assignError, column: 18 },
      ],
    },
    {
      code: 'exports = module.exports = {foo: 1}',
      output: null,
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [
        { ...assignError, column: 1 },
        { ...accessError('module.exports'), column: 11 },
      ],
    },
    {
      code: 'module.exports = exports = {foo: 1}; exports = obj',
      output: null,
      options: ['exports', { allowBatchAssign: true }],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...assignError, column: 38 }],
    },
    {
      code: 'exports = module.exports = {foo: 1}; exports = obj',
      output: null,
      options: ['exports', { allowBatchAssign: true }],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...assignError, column: 38 }],
    },
  ],
});
