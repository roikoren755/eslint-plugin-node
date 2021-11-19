import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

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
    // { code: 'module.exports = {foo: 1}', globals: { module: 'readonly', exports: true } },
    // { code: 'module.exports = {foo: 1}', options: ['module.exports'], globals: { module: 'readonly', exports: true } },
    // { code: 'exports.foo = 1', options: ['exports'], globals: { module: 'readonly', exports: true } },
    // {
    //   code: 'exports = module.exports = {foo: 1}',
    //   options: ['module.exports', { allowBatchAssign: true }],
    //   globals: { module: 'readonly', exports: true },
    // },
    // {
    //   code: 'module.exports = exports = {foo: 1}',
    //   options: ['module.exports', { allowBatchAssign: true }],
    //   globals: { module: 'readonly', exports: true },
    // },
    // {
    //   code: 'exports = module.exports = {foo: 1}',
    //   options: ['exports', { allowBatchAssign: true }],
    //   globals: { module: 'readonly', exports: true },
    // },
    // {
    //   code: 'module.exports = exports = {foo: 1}',
    //   options: ['exports', { allowBatchAssign: true }],
    //   globals: { module: 'readonly', exports: true },
    // },
    // {
    //   code: 'exports = module.exports = {foo: 1}; exports.bar = 2',
    //   options: ['exports', { allowBatchAssign: true }],
    //   globals: { module: 'readonly', exports: true },
    // },
    // {
    //   code: 'module.exports = exports = {foo: 1}; exports.bar = 2',
    //   options: ['exports', { allowBatchAssign: true }],
    //   globals: { module: 'readonly', exports: true },
    // },
    //
    // // allow accesses of `modules` except `module.exports`
    // { code: 'module = {}; module.foo = 1', options: ['exports'], globals: { module: 'readonly', exports: true } },
    //
    // // Ignores if it's not defined.
    // { code: 'exports.foo = 1', options: ['module.exports'] },
    // { code: 'module.exports = {foo: 1}', options: ['exports'] },
  ],
  invalid: [
    {
      code: 'exports = {foo: 1}',
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },
    {
      code: 'exports.foo = 1',
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },
    {
      code: 'module.exports = exports = {foo: 1}',
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 18 }],
    },
    {
      code: 'exports = module.exports = {foo: 1}',
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },

    {
      code: 'exports = {foo: 1}',
      options: ['module.exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },
    {
      code: 'exports.foo = 1',
      options: ['module.exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },
    {
      code: 'module.exports = exports = {foo: 1}',
      options: ['module.exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 18 }],
    },
    {
      code: 'exports = module.exports = {foo: 1}',
      options: ['module.exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('exports'), column: 1 }],
    },
    {
      code: 'exports = {foo: 1}',
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...assignError, column: 1 }],
    },
    {
      code: 'module.exports = {foo: 1}',
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports.foo = 1',
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...accessError('module.exports'), column: 1 }],
    },
    {
      code: 'module.exports = exports = {foo: 1}',
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [
        { ...accessError('module.exports'), column: 1 },
        { ...assignError, column: 18 },
      ],
    },
    {
      code: 'exports = module.exports = {foo: 1}',
      options: ['exports'],
      globals: { module: 'readonly', exports: true },
      errors: [
        { ...assignError, column: 1 },
        { ...accessError('module.exports'), column: 11 },
      ],
    },
    {
      code: 'module.exports = exports = {foo: 1}; exports = obj',
      options: ['exports', { allowBatchAssign: true }],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...assignError, column: 38 }],
    },
    {
      code: 'exports = module.exports = {foo: 1}; exports = obj',
      options: ['exports', { allowBatchAssign: true }],
      globals: { module: 'readonly', exports: true },
      errors: [{ ...assignError, column: 38 }],
    },
  ],
});
