/* eslint-disable max-lines */
import path from 'path';

import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/types';
import { builtin } from 'globals';

import rule from '../../../../src/rules/no-unsupported-features/es-syntax';
import { concat } from '../../concat';
import { ecmaVersion } from '../../es2020';

const error = (
  messageId: string,
  supported?: string,
  version?: string,
  code?: number,
): TSESLint.TestCaseError<string> => ({
  messageId,
  line: 1,
  column: 1,
  data: { supported, version, code },
});

/**
 * Makes a file path to a fixture.
 * @param {string} name - A name.
 * @returns {string} A file path to a fixture.
 */
const fixture = (name: string): string =>
  path.resolve(__dirname, '../../../fixtures/no-unsupported-features--ecma', name);

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion },
  globals: builtin,
} as unknown as TSESLint.RuleTesterConfig).run(
  'no-unsupported-features/es-syntax',
  rule,
  concat([
    // ----------------------------------------------------------------------
    // ES2015
    // ----------------------------------------------------------------------
    {
      keyword: 'arrowFunctions',
      valid: [
        { code: 'function f() {}', options: [{ version: '3.9.9' }] },
        { code: '!function f() {}', options: [{ version: '3.9.9' }] },
        { code: '(() => 1)', options: [{ version: '4.0.0' }] },
        { code: '(() => {})', options: [{ version: '4.0.0' }] },
      ],
      invalid: [
        {
          code: '(() => 1)',
          options: [{ version: '3.9.9' }],
          errors: [
            {
              ...error('no-arrow-functions', '4.0.0', '3.9.9'),
              column: 2,
              type: AST_NODE_TYPES.ArrowFunctionExpression,
            },
          ],
        },
        {
          code: '(() => {})',
          options: [{ version: '3.9.9' }],
          errors: [
            {
              ...error('no-arrow-functions', '4.0.0', '3.9.9'),
              column: 2,
              type: AST_NODE_TYPES.ArrowFunctionExpression,
            },
          ],
        },
      ],
    },
    {
      keyword: 'binaryNumericLiterals',
      valid: [
        { code: '0x01', options: [{ version: '3.9.9' }] },
        { code: '1', options: [{ version: '3.9.9' }] },
        { code: '0b01', options: [{ version: '4.0.0' }] },
      ],
      invalid: [
        {
          code: '0b01',
          options: [{ version: '3.9.9' }],
          errors: [{ ...error('no-binary-numeric-literals', '4.0.0', '3.9.9'), type: AST_NODE_TYPES.Literal }],
        },
      ],
    },
    {
      keyword: 'blockScopedFunctions',
      valid: [
        { code: "'use strict'; if (a) { function f() {} }", options: [{ version: '4.0.0' }] },
        { code: "'use strict'; function wrap() { if (a) { function f() {} } }", options: [{ version: '4.0.0' }] },
        { code: "function wrap() { 'use strict'; if (a) { function f() {} } }", options: [{ version: '4.0.0' }] },
        { code: 'if (a) { function f() {} }', options: [{ version: '6.0.0' }] },
      ],
      invalid: [
        {
          code: "'use strict'; if (a) { function f() {} }",
          options: [{ version: '3.9.9' }],
          errors: [
            {
              ...error('no-block-scoped-functions-strict', '4.0.0', '3.9.9'),
              column: 24,
              type: AST_NODE_TYPES.FunctionDeclaration,
            },
          ],
        },
        {
          code: 'if (a) { function f() {} }',
          options: [{ version: '5.9.9' }],
          errors: [
            {
              ...error('no-block-scoped-functions-sloppy', '6.0.0', '5.9.9'),
              column: 10,
              type: AST_NODE_TYPES.FunctionDeclaration,
            },
          ],
        },
      ],
    },
    {
      keyword: 'blockScopedVariables',
      valid: [
        { code: 'var a = 0', options: [{ version: '3.9.9' }] },
        { code: "'use strict'; let a = 0", options: [{ version: '4.0.0' }] },
        { code: "'use strict'; const a = 0", options: [{ version: '4.0.0' }] },
        { code: "'use strict'; function wrap() { const a = 0 }", options: [{ version: '4.0.0' }] },
        { code: "function wrap() { 'use strict'; const a = 0 }", options: [{ version: '4.0.0' }] },
        { code: 'let a = 0', options: [{ version: '6.0.0' }] },
        { code: 'const a = 0', options: [{ version: '6.0.0' }] },
      ],
      invalid: [
        {
          code: "'use strict'; let a = 0",
          options: [{ version: '3.9.9' }],
          errors: [
            {
              ...error('no-block-scoped-variables-strict', '4.0.0', '3.9.9'),
              column: 15,
              type: AST_NODE_TYPES.VariableDeclaration,
            },
          ],
        },
        {
          code: "'use strict'; const a = 0",
          options: [{ version: '3.9.9' }],
          errors: [
            {
              ...error('no-block-scoped-variables-strict', '4.0.0', '3.9.9'),
              column: 15,
              type: AST_NODE_TYPES.VariableDeclaration,
            },
          ],
        },
        {
          code: 'let a = 0',
          options: [{ version: '5.9.9' }],
          errors: [
            { ...error('no-block-scoped-variables-sloppy', '6.0.0', '5.9.9'), type: AST_NODE_TYPES.VariableDeclaration },
          ],
        },
        {
          code: 'const a = 0',
          options: [{ version: '5.9.9' }],
          errors: [
            { ...error('no-block-scoped-variables-sloppy', '6.0.0', '5.9.9'), type: AST_NODE_TYPES.VariableDeclaration },
          ],
        },
      ],
    },
    {
      keyword: 'classes',
      valid: [
        { code: "'use strict'; class A {}", options: [{ version: '4.0.0' }] },
        { code: "'use strict'; function wrap() { class A {} }", options: [{ version: '4.0.0' }] },
        { code: "function wrap() { 'use strict'; class A {} }", options: [{ version: '4.0.0' }] },
        { code: 'class A {}', options: [{ version: '6.0.0' }] },
      ],
      invalid: [
        {
          code: "'use strict'; class A {}",
          options: [{ version: '3.9.9' }],
          errors: [
            { ...error('no-classes-strict', '4.0.0', '3.9.9'), column: 15, type: AST_NODE_TYPES.ClassDeclaration },
          ],
        },
        {
          code: 'class A {}',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-classes-sloppy', '6.0.0', '5.9.9'), type: AST_NODE_TYPES.ClassDeclaration }],
        },
      ],
    },
    {
      keyword: 'computedProperties',
      valid: [
        {
          code: "({ 0: 0, key: 1, 'key2': 2, key3, key4() {} })",
          options: [{ version: '3.9.9', ignores: ['propertyShorthands'] }],
        },
        { code: '({ [key]: 1 })', options: [{ version: '4.0.0' }] },
        { code: '({ [key]() {} })', options: [{ version: '4.0.0' }] },
        { code: 'class A { [key]() {} }', options: [{ version: '4.0.0', ignores: ['classes'] }] },
        { code: '(class { [key]() {} })', options: [{ version: '4.0.0', ignores: ['classes'] }] },
      ],
      invalid: [
        {
          code: '({ [key]: 1 })',
          options: [{ version: '3.9.9' }],
          errors: [{ ...error('no-computed-properties', '4.0.0', '3.9.9'), column: 4, type: AST_NODE_TYPES.Property }],
        },
        {
          code: '({ [key]() {} })',
          options: [{ version: '3.9.9', ignores: ['propertyShorthands'] }],
          errors: [{ ...error('no-computed-properties', '4.0.0', '3.9.9'), column: 4, type: AST_NODE_TYPES.Property }],
        },
        {
          code: 'class A { [key]() {} }',
          options: [{ version: '3.9.9', ignores: ['classes'] }],
          errors: [
            { ...error('no-computed-properties', '4.0.0', '3.9.9'), column: 11, type: AST_NODE_TYPES.MethodDefinition },
          ],
        },
        {
          code: '(class { [key]() {} })',
          options: [{ version: '3.9.9', ignores: ['classes'] }],
          errors: [
            { ...error('no-computed-properties', '4.0.0', '3.9.9'), column: 10, type: AST_NODE_TYPES.MethodDefinition },
          ],
        },
      ],
    },
    {
      keyword: 'defaultParameters',
      valid: [
        { code: 'a = 0', options: [{ version: '5.9.9' }] },
        { code: 'var a = 0', options: [{ version: '5.9.9' }] },
        { code: 'var [a = 0] = []', options: [{ version: '5.9.9', ignores: ['destructuring'] }] },
        { code: 'var {a = 0} = {}', options: [{ version: '5.9.9', ignores: ['destructuring'] }] },
        { code: 'function f(a = 0) {}', options: [{ version: '6.0.0' }] },
        { code: '(function(a = 0) {})', options: [{ version: '6.0.0' }] },
        { code: '((a = 0) => a)', options: [{ version: '6.0.0' }] },
        { code: '({ key(a = 0) {} })', options: [{ version: '6.0.0' }] },
        { code: 'class A { key(a = 0) {} }', options: [{ version: '6.0.0' }] },
        { code: '(class { key(a = 0) {} })', options: [{ version: '6.0.0' }] },
        { code: 'function f(a = 0) {}', options: [{ version: '5.9.9', ignores: ['defaultParameters'] }] },
        { code: '(function(a = 0) {})', options: [{ version: '5.9.9', ignores: ['defaultParameters'] }] },
        { code: '((a = 0) => a)', options: [{ version: '5.9.9', ignores: ['defaultParameters'] }] },
        { code: '({ key(a = 0) {} })', options: [{ version: '5.9.9', ignores: ['defaultParameters'] }] },
        {
          code: 'class A { key(a = 0) {} }',
          options: [{ version: '5.9.9', ignores: ['classes', 'defaultParameters'] }],
        },
        {
          code: '(class { key(a = 0) {} })',
          options: [{ version: '5.9.9', ignores: ['classes', 'defaultParameters'] }],
        },
      ],
      invalid: [
        {
          code: 'function f(a = 0) {}',
          options: [{ version: '5.9.9' }],
          errors: [
            { ...error('no-default-parameters', '6.0.0', '5.9.9'), column: 12, type: AST_NODE_TYPES.AssignmentPattern },
          ],
        },
        {
          code: '(function(a = 0) {})',
          options: [{ version: '5.9.9' }],
          errors: [
            { ...error('no-default-parameters', '6.0.0', '5.9.9'), column: 11, type: AST_NODE_TYPES.AssignmentPattern },
          ],
        },
        {
          code: '((a = 0) => a)',
          options: [{ version: '5.9.9' }],
          errors: [
            { ...error('no-default-parameters', '6.0.0', '5.9.9'), column: 3, type: AST_NODE_TYPES.AssignmentPattern },
          ],
        },
        {
          code: '({ key(a = 0) {} })',
          options: [{ version: '5.9.9' }],
          errors: [
            { ...error('no-default-parameters', '6.0.0', '5.9.9'), column: 8, type: AST_NODE_TYPES.AssignmentPattern },
          ],
        },
        {
          code: 'class A { key(a = 0) {} }',
          options: [{ version: '5.9.9', ignores: ['classes'] }],
          errors: [
            { ...error('no-default-parameters', '6.0.0', '5.9.9'), column: 15, type: AST_NODE_TYPES.AssignmentPattern },
          ],
        },
        {
          code: '(class { key(a = 0) {} })',
          options: [{ version: '5.9.9', ignores: ['classes'] }],
          errors: [
            { ...error('no-default-parameters', '6.0.0', '5.9.9'), column: 14, type: AST_NODE_TYPES.AssignmentPattern },
          ],
        },
      ],
    },
    {
      keyword: 'destructuring',
      valid: [
        { code: 'function f(a = 0) {}', options: [{ version: '5.9.9', ignores: ['defaultParameters'] }] },
        { code: '[...a]', options: [{ version: '5.9.9' }] },
        { code: 'f(...a)', options: [{ version: '5.9.9' }] },
        { code: 'new A(...a)', options: [{ version: '5.9.9' }] },
        { code: 'var a = {}', options: [{ version: '5.9.9' }] },
        { code: 'var {a} = {}', options: [{ version: '6.0.0' }] },
        { code: 'var [a] = {}', options: [{ version: '6.0.0' }] },
        { code: 'function f({a}) {}', options: [{ version: '6.0.0' }] },
        { code: 'function f([a]) {}', options: [{ version: '6.0.0' }] },
      ],
      invalid: [
        {
          code: 'var {a} = {}',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-destructuring', '6.0.0', '5.9.9'), column: 5, type: AST_NODE_TYPES.ObjectPattern }],
        },
        {
          code: 'var [a] = {}',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-destructuring', '6.0.0', '5.9.9'), column: 5, type: AST_NODE_TYPES.ArrayPattern }],
        },
        {
          code: 'function f({a}) {}',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-destructuring', '6.0.0', '5.9.9'), column: 12, type: AST_NODE_TYPES.ObjectPattern }],
        },
        {
          code: 'function f([a]) {}',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-destructuring', '6.0.0', '5.9.9'), column: 12, type: AST_NODE_TYPES.ArrayPattern }],
        },
        // One error even if it's nested.
        {
          code: 'var {a: {b: [c = 0]}} = {}',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-destructuring', '6.0.0', '5.9.9'), column: 5, type: AST_NODE_TYPES.ObjectPattern }],
        },
        {
          code: 'var [{a: [b = 0]}] = {}',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-destructuring', '6.0.0', '5.9.9'), column: 5, type: AST_NODE_TYPES.ArrayPattern }],
        },
        {
          code: 'function f({a: {b: [c = 0]}}) {}',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-destructuring', '6.0.0', '5.9.9'), column: 12, type: AST_NODE_TYPES.ObjectPattern }],
        },
        {
          code: 'function f([{a: [b = 0]}]) {}',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-destructuring', '6.0.0', '5.9.9'), column: 12, type: AST_NODE_TYPES.ArrayPattern }],
        },
      ],
    },
    {
      keyword: 'forOfLoops',
      valid: [
        { code: 'for (;;);', options: [{ version: '0.11.9' }] },
        { code: 'for (a in b);', options: [{ version: '0.11.9' }] },
        { code: 'for (var a in b);', options: [{ version: '0.11.9' }] },
        { code: 'for (a of b);', options: [{ version: '0.12.0' }] },
        { code: 'for (var a of b);', options: [{ version: '0.12.0' }] },
      ],
      invalid: [
        {
          code: 'for (a of b);',
          options: [{ version: '0.11.9' }],
          errors: [{ ...error('no-for-of-loops', '0.12.0', '0.11.9'), type: AST_NODE_TYPES.ForOfStatement }],
        },
        {
          code: 'for (var a of b);',
          options: [{ version: '0.11.9' }],
          errors: [{ ...error('no-for-of-loops', '0.12.0', '0.11.9'), type: AST_NODE_TYPES.ForOfStatement }],
        },
        {
          code: 'async function wrap() { for await (var a of b); }',
          options: [{ version: '0.11.9', ignores: ['asyncFunctions', 'asyncIteration'] }],
          errors: [{ ...error('no-for-of-loops', '0.12.0', '0.11.9'), column: 25, type: AST_NODE_TYPES.ForOfStatement }],
        },
      ],
    },
    {
      keyword: 'generators',
      valid: [
        { code: 'function f() {}', options: [{ version: '3.9.9' }] },
        { code: 'async function f() {}', options: [{ version: '3.9.9', ignores: ['asyncFunctions'] }] },
        { code: 'function* f() {}', options: [{ version: '4.0.0' }] },
        { code: '(function*() {})', options: [{ version: '4.0.0' }] },
        { code: '({ *f() {} })', options: [{ version: '4.0.0', ignores: ['propertyShorthands'] }] },
        { code: 'class A { *f() {} }', options: [{ version: '4.0.0', ignores: ['classes'] }] },
        { code: '(class { *f() {} })', options: [{ version: '4.0.0', ignores: ['classes'] }] },
      ],
      invalid: [
        {
          code: 'function* f() {}',
          options: [{ version: '3.9.9' }],
          errors: [{ ...error('no-generators', '4.0.0', '3.9.9'), type: AST_NODE_TYPES.FunctionDeclaration }],
        },
        {
          code: '(function*() {})',
          options: [{ version: '3.9.9' }],
          errors: [{ ...error('no-generators', '4.0.0', '3.9.9'), column: 2, type: AST_NODE_TYPES.FunctionExpression }],
        },
        {
          code: '({ *f() {} })',
          options: [{ version: '3.9.9', ignores: ['propertyShorthands'] }],
          errors: [{ ...error('no-generators', '4.0.0', '3.9.9'), column: 6, type: AST_NODE_TYPES.FunctionExpression }],
        },
        {
          code: 'class A { *f() {} }',
          options: [{ version: '3.9.9', ignores: ['classes'] }],
          errors: [{ ...error('no-generators', '4.0.0', '3.9.9'), column: 13, type: AST_NODE_TYPES.FunctionExpression }],
        },
        {
          code: '(class { *f() {} })',
          options: [{ version: '3.9.9', ignores: ['classes'] }],
          errors: [{ ...error('no-generators', '4.0.0', '3.9.9'), column: 12, type: AST_NODE_TYPES.FunctionExpression }],
        },
      ],
    },
    {
      keyword: 'modules',
      valid: [
        { code: "require('a')", options: [{ version: '0.0.0' }] },
        { code: 'module.exports = {}', options: [{ version: '0.0.0' }] },
        { code: 'exports.a = {}', options: [{ version: '0.0.0' }] },
        {
          code: "import a from 'a'",
          parserOptions: { sourceType: 'module' },
          options: [{ version: '13.1.0', ignores: ['modules'] }],
        },
        {
          code: 'export default {}',
          parserOptions: { sourceType: 'module' },
          options: [{ version: '13.1.0', ignores: ['modules'] }],
        },
        {
          code: 'export const a = {}',
          parserOptions: { sourceType: 'module' },
          options: [{ version: '13.1.0', ignores: ['modules'] }],
        },
        {
          code: 'export {}',
          parserOptions: { sourceType: 'module' },
          options: [{ version: '13.1.0', ignores: ['modules'] }],
        },
      ],
      invalid: [
        {
          code: "import a from 'a'",
          parserOptions: { sourceType: 'module' },
          options: [{ version: '10.0.0' }],
          errors: [{ ...error('no-modules'), type: AST_NODE_TYPES.ImportDeclaration }],
        },
        {
          code: 'export default {}',
          parserOptions: { sourceType: 'module' },
          options: [{ version: '10.0.0' }],
          errors: [{ ...error('no-modules'), type: AST_NODE_TYPES.ExportDefaultDeclaration }],
        },
        {
          code: 'export const a = {}',
          parserOptions: { sourceType: 'module' },
          options: [{ version: '10.0.0' }],
          errors: [{ ...error('no-modules'), type: AST_NODE_TYPES.ExportNamedDeclaration }],
        },
        {
          code: 'export {}',
          parserOptions: { sourceType: 'module' },
          options: [{ version: '10.0.0' }],
          errors: [{ ...error('no-modules'), type: AST_NODE_TYPES.ExportNamedDeclaration }],
        },
      ],
    },
    {
      keyword: 'new.target',
      valid: [
        { code: 'new target', options: [{ version: '4.9.9' }] },
        { code: 'class A { constructor() { new.target } }', options: [{ version: '5.0.0', ignores: ['classes'] }] },
        { code: 'function A() { new.target }', options: [{ version: '5.0.0' }] },
      ],
      invalid: [
        {
          code: 'class A { constructor() { new.target } }',
          options: [{ version: '4.9.9', ignores: ['classes'] }],
          errors: [{ ...error('no-new-target', '5.0.0', '4.9.9'), column: 27, type: AST_NODE_TYPES.MetaProperty }],
        },
        {
          code: 'function A() { new.target }',
          options: [{ version: '4.9.9' }],
          errors: [{ ...error('no-new-target', '5.0.0', '4.9.9'), column: 16, type: AST_NODE_TYPES.MetaProperty }],
        },
      ],
    },
    {
      keyword: 'objectSuperProperties',
      valid: [
        { code: 'class A { foo() { super.foo } }', options: [{ version: '3.9.9', ignores: ['classes'] }] },
        { code: '(class { foo() { super.foo } })', options: [{ version: '3.9.9', ignores: ['classes'] }] },
        {
          code: 'class A extends B { constructor() { super() } }',
          options: [{ version: '3.9.9', ignores: ['classes'] }],
        },
        { code: '({ foo() { super.foo } })', options: [{ version: '4.0.0', ignores: ['propertyShorthands'] }] },
        { code: '({ foo() { super.foo() } })', options: [{ version: '4.0.0', ignores: ['propertyShorthands'] }] },
      ],
      invalid: [
        {
          code: '({ foo() { super.foo } })',
          options: [{ version: '3.9.9', ignores: ['propertyShorthands'] }],
          errors: [{ ...error('no-object-super-properties', '4.0.0', '3.9.9'), column: 12, type: AST_NODE_TYPES.Super }],
        },
        {
          code: '({ foo() { super.foo() } })',
          options: [{ version: '3.9.9', ignores: ['propertyShorthands'] }],
          errors: [{ ...error('no-object-super-properties', '4.0.0', '3.9.9'), column: 12, type: AST_NODE_TYPES.Super }],
        },
      ],
    },
    {
      keyword: 'octalNumericLiterals',
      valid: [
        { code: '0755', options: [{ version: '3.9.9' }] },
        { code: '0x755', options: [{ version: '3.9.9' }] },
        { code: '0X755', options: [{ version: '3.9.9' }] },
        { code: '0b01', options: [{ version: '3.9.9', ignores: ['binaryNumericLiterals'] }] },
        { code: '0B01', options: [{ version: '3.9.9', ignores: ['binaryNumericLiterals'] }] },
        { code: '0o755', options: [{ version: '4.0.0' }] },
        { code: '0O755', options: [{ version: '4.0.0' }] },
      ],
      invalid: [
        {
          code: '0o755',
          options: [{ version: '3.9.9' }],
          errors: [{ ...error('no-octal-numeric-literals', '4.0.0', '3.9.9'), type: AST_NODE_TYPES.Literal }],
        },
        {
          code: '0O755',
          options: [{ version: '3.9.9' }],
          errors: [{ ...error('no-octal-numeric-literals', '4.0.0', '3.9.9'), type: AST_NODE_TYPES.Literal }],
        },
      ],
    },
    {
      keyword: 'propertyShorthands',
      valid: [
        { code: '({ a: 1 })', options: [{ version: '3.9.9' }] },
        { code: '({ get: get })', options: [{ version: '3.9.9' }] },
        { code: '({ get a() {} })', options: [{ version: '3.9.9' }] },
        { code: '({ a })', options: [{ version: '4.0.0' }] },
        { code: '({ b() {} })', options: [{ version: '4.0.0' }] },
        { code: '({ get() {} })', options: [{ version: '4.0.0' }] },
        { code: '({ [c]() {} })', options: [{ version: '4.0.0', ignores: ['computedProperties'] }] },
        { code: '({ get })', options: [{ version: '6.0.0' }] },
        { code: '({ set })', options: [{ version: '6.0.0' }] },
      ],
      invalid: [
        {
          code: '({ a })',
          options: [{ version: '3.9.9' }],
          errors: [{ ...error('no-property-shorthands', '4.0.0', '3.9.9'), column: 4, type: AST_NODE_TYPES.Property }],
        },
        {
          code: '({ b() {} })',
          options: [{ version: '3.9.9' }],
          errors: [{ ...error('no-property-shorthands', '4.0.0', '3.9.9'), column: 4, type: AST_NODE_TYPES.Property }],
        },
        {
          code: '({ [c]() {} })',
          options: [{ version: '3.9.9', ignores: ['computedProperties'] }],
          errors: [{ ...error('no-property-shorthands', '4.0.0', '3.9.9'), column: 4, type: AST_NODE_TYPES.Property }],
        },
        {
          code: '({ get })',
          options: [{ version: '3.9.9' }],
          errors: [
            { ...error('no-property-shorthands-getset', '6.0.0', '3.9.9'), column: 4, type: AST_NODE_TYPES.Property },
          ],
        },
        {
          code: '({ set })',
          options: [{ version: '3.9.9' }],
          errors: [
            { ...error('no-property-shorthands-getset', '6.0.0', '3.9.9'), column: 4, type: AST_NODE_TYPES.Property },
          ],
        },
        {
          code: '({ get })',
          options: [{ version: '5.9.9' }],
          errors: [
            { ...error('no-property-shorthands-getset', '6.0.0', '5.9.9'), column: 4, type: AST_NODE_TYPES.Property },
          ],
        },
        {
          code: '({ set })',
          options: [{ version: '5.9.9' }],
          errors: [
            { ...error('no-property-shorthands-getset', '6.0.0', '5.9.9'), column: 4, type: AST_NODE_TYPES.Property },
          ],
        },
      ],
    },
    {
      keyword: 'regexpU',
      valid: [
        { code: '/foo/', options: [{ version: '5.9.9' }] },
        { code: '/foo/gmi', options: [{ version: '5.9.9' }] },
        { code: '/foo/y', options: [{ version: '5.9.9', ignores: ['regexpY'] }] },
        { code: '/foo/u', options: [{ version: '6.0.0' }] },
      ],
      invalid: [
        {
          code: '/foo/u',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-regexp-u-flag', '6.0.0', '5.9.9'), type: AST_NODE_TYPES.Literal }],
        },
      ],
    },
    {
      keyword: 'regexpY',
      valid: [
        { code: '/foo/', options: [{ version: '5.9.9' }] },
        { code: '/foo/gmi', options: [{ version: '5.9.9' }] },
        { code: '/foo/u', options: [{ version: '5.9.9', ignores: ['regexpU'] }] },
        { code: '/foo/y', options: [{ version: '6.0.0' }] },
      ],
      invalid: [
        {
          code: '/foo/y',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-regexp-y-flag', '6.0.0', '5.9.9'), type: AST_NODE_TYPES.Literal }],
        },
      ],
    },
    {
      keyword: 'restParameters',
      valid: [
        { code: 'var [...a] = b', options: [{ version: '5.9.9', ignores: ['destructuring'] }] },
        { code: 'var {...a} = b', options: [{ version: '5.9.9', ignores: ['destructuring', 'restSpreadProperties'] }] },
        { code: 'var a = [...b]', options: [{ version: '5.9.9' }] },
        { code: 'var a = {...b}', options: [{ version: '5.9.9', ignores: ['restSpreadProperties'] }] },
        { code: 'f(...a)', options: [{ version: '5.9.9' }] },
        { code: 'function f(...a) {}', options: [{ version: '6.0.0' }] },
        { code: 'function f(...[a, b = 0]) {}', options: [{ version: '6.0.0', ignores: ['destructuring'] }] },
        { code: '(function(...a) {})', options: [{ version: '6.0.0' }] },
        { code: '((...a) => {})', options: [{ version: '6.0.0' }] },
        { code: '({ f(...a) {} })', options: [{ version: '6.0.0' }] },
        { code: 'class A { f(...a) {} }', options: [{ version: '6.0.0', ignores: ['classes'] }] },
        { code: '(class { f(...a) {} })', options: [{ version: '6.0.0', ignores: ['classes'] }] },
      ],
      invalid: [
        {
          code: 'function f(...a) {}',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-rest-parameters', '6.0.0', '5.9.9'), column: 12, type: AST_NODE_TYPES.RestElement }],
        },
        {
          code: 'function f(...[a, b = 0]) {}',
          options: [{ version: '5.9.9', ignores: ['destructuring'] }],
          errors: [{ ...error('no-rest-parameters', '6.0.0', '5.9.9'), column: 12, type: AST_NODE_TYPES.RestElement }],
        },
        {
          code: '(function(...a) {})',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-rest-parameters', '6.0.0', '5.9.9'), column: 11, type: AST_NODE_TYPES.RestElement }],
        },
        {
          code: '((...a) => {})',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-rest-parameters', '6.0.0', '5.9.9'), column: 3, type: AST_NODE_TYPES.RestElement }],
        },
        {
          code: '({ f(...a) {} })',
          options: [{ version: '5.9.9' }],
          errors: [{ ...error('no-rest-parameters', '6.0.0', '5.9.9'), column: 6, type: AST_NODE_TYPES.RestElement }],
        },
        {
          code: 'class A { f(...a) {} }',
          options: [{ version: '5.9.9', ignores: ['classes'] }],
          errors: [{ ...error('no-rest-parameters', '6.0.0', '5.9.9'), column: 13, type: AST_NODE_TYPES.RestElement }],
        },
        {
          code: '(class { f(...a) {} })',
          options: [{ version: '5.9.9', ignores: ['classes'] }],
          errors: [{ ...error('no-rest-parameters', '6.0.0', '5.9.9'), column: 12, type: AST_NODE_TYPES.RestElement }],
        },
      ],
    },
    {
      keyword: 'spreadElements',
      valid: [
        { code: 'var [...a] = b', options: [{ version: '4.9.9', ignores: ['destructuring'] }] },
        { code: 'var {...a} = b', options: [{ version: '4.9.9', ignores: ['destructuring', 'restSpreadProperties'] }] },
        { code: 'var a = {...b}', options: [{ version: '4.9.9', ignores: ['restSpreadProperties'] }] },
        { code: 'function f(...a) {}', options: [{ version: '4.9.9', ignores: ['restParameters'] }] },
        { code: '[...a]', options: [{ version: '5.0.0' }] },
        { code: '[...a, ...b]', options: [{ version: '5.0.0' }] },
        { code: 'f(...a)', options: [{ version: '5.0.0' }] },
        { code: 'new F(...a)', options: [{ version: '5.0.0' }] },
      ],
      invalid: [
        {
          code: '[...a]',
          options: [{ version: '4.9.9' }],
          errors: [{ ...error('no-spread-elements', '5.0.0', '4.9.9'), column: 2, type: AST_NODE_TYPES.SpreadElement }],
        },
        {
          code: '[...a, ...b]',
          options: [{ version: '4.9.9' }],
          errors: [
            { ...error('no-spread-elements', '5.0.0', '4.9.9'), column: 2, type: AST_NODE_TYPES.SpreadElement },
            { ...error('no-spread-elements', '5.0.0', '4.9.9'), column: 8, type: AST_NODE_TYPES.SpreadElement },
          ],
        },
        {
          code: 'f(...a)',
          options: [{ version: '4.9.9' }],
          errors: [{ ...error('no-spread-elements', '5.0.0', '4.9.9'), column: 3, type: AST_NODE_TYPES.SpreadElement }],
        },
        {
          code: 'new F(...a)',
          options: [{ version: '4.9.9' }],
          errors: [{ ...error('no-spread-elements', '5.0.0', '4.9.9'), column: 7, type: AST_NODE_TYPES.SpreadElement }],
        },
      ],
    },
    {
      /* eslint-disable no-template-curly-in-string */
      keyword: 'templateLiterals',
      valid: [
        { code: "'`foo`'", options: [{ version: '3.9.9' }] },
        { code: '`foo`', options: [{ version: '4.0.0' }] },
        { code: '`foo${a}bar`', options: [{ version: '4.0.0' }] },
        { code: 'tag`foo`', options: [{ version: '4.0.0' }] },
        { code: 'tag`foo${a}bar`', options: [{ version: '4.0.0' }] },
      ],
      invalid: [
        {
          code: '`foo`',
          options: [{ version: '3.9.9' }],
          errors: [{ ...error('no-template-literals', '4.0.0', '3.9.9'), type: AST_NODE_TYPES.TemplateLiteral }],
        },
        {
          code: '`foo${a}bar`',
          options: [{ version: '3.9.9' }],
          errors: [{ ...error('no-template-literals', '4.0.0', '3.9.9'), type: AST_NODE_TYPES.TemplateLiteral }],
        },
        {
          code: 'tag`foo`',
          options: [{ version: '3.9.9' }],
          errors: [
            { ...error('no-template-literals', '4.0.0', '3.9.9'), type: AST_NODE_TYPES.TaggedTemplateExpression },
          ],
        },
        {
          code: 'tag`foo${a}bar`',
          options: [{ version: '3.9.9' }],
          errors: [
            { ...error('no-template-literals', '4.0.0', '3.9.9'), type: AST_NODE_TYPES.TaggedTemplateExpression },
          ],
        },
      ],
      /* eslint-enable no-template-curly-in-string */
    },
    {
      keyword: 'unicodeCodePointEscapes',
      valid: [
        { code: String.raw`var a = "\u0061"`, options: [{ version: '3.9.9' }] },
        { code: String.raw`var a = "\u0061"`, options: [{ version: '3.9.9' }] },
        { code: String.raw`var a = "\\u{61}"`, options: [{ version: '3.9.9' }] },
        { code: String.raw`var \u{61} = 0`, options: [{ version: '4.0.0' }] },
        { code: String.raw`var a = "\u{61}"`, options: [{ version: '4.0.0' }] },
        { code: String.raw`var a = '\u{61}'`, options: [{ version: '4.0.0' }] },
        { code: 'var a = `\\u{61}`', options: [{ version: '4.0.0' }] },
      ],
      invalid: [
        {
          code: String.raw`var \u{61} = 0`,
          options: [{ version: '3.9.9' }],
          errors: [
            { ...error('no-unicode-codepoint-escapes', '4.0.0', '3.9.9'), column: 5, type: AST_NODE_TYPES.Identifier },
          ],
        },
        {
          code: String.raw`var a = "\u{61}"`,
          options: [{ version: '3.9.9' }],
          errors: [
            { ...error('no-unicode-codepoint-escapes', '4.0.0', '3.9.9'), column: 10, type: AST_NODE_TYPES.Literal },
          ],
        },
        {
          code: String.raw`var a = "\\\u{61}"`,
          options: [{ version: '3.9.9' }],
          errors: [
            { ...error('no-unicode-codepoint-escapes', '4.0.0', '3.9.9'), column: 12, type: AST_NODE_TYPES.Literal },
          ],
        },
        {
          code: String.raw`var a = '\u{61}'`,
          options: [{ version: '3.9.9' }],
          errors: [
            { ...error('no-unicode-codepoint-escapes', '4.0.0', '3.9.9'), column: 10, type: AST_NODE_TYPES.Literal },
          ],
        },
        {
          code: 'var a = `\\u{61}`',
          options: [{ version: '3.9.9', ignores: ['templateLiterals'] }],
          errors: [
            {
              ...error('no-unicode-codepoint-escapes', '4.0.0', '3.9.9'),
              column: 10,
              type: AST_NODE_TYPES.TemplateElement,
            },
          ],
        },
      ],
    },

    // ----------------------------------------------------------------------
    // ES2016
    // ----------------------------------------------------------------------
    {
      keyword: 'exponentialOperators',
      valid: [
        { code: 'a ** b', options: [{ version: '7.0.0' }] },
        { code: 'a **= b', options: [{ version: '7.0.0' }] },
        { code: 'a * b', options: [{ version: '6.9.9' }] },
        { code: 'a *= b', options: [{ version: '6.9.9' }] },
      ],
      invalid: [
        {
          code: 'a ** b',
          options: [{ version: '6.9.9' }],
          errors: [{ ...error('no-exponential-operators', '7.0.0', '6.9.9'), type: AST_NODE_TYPES.BinaryExpression }],
        },
        {
          code: 'a **= b',
          options: [{ version: '6.9.9' }],
          errors: [
            { ...error('no-exponential-operators', '7.0.0', '6.9.9'), type: AST_NODE_TYPES.AssignmentExpression },
          ],
        },
      ],
    },

    // ----------------------------------------------------------------------
    // ES2017
    // ----------------------------------------------------------------------
    {
      keyword: 'asyncFunctions',
      valid: [
        { code: 'async function f() {}', options: [{ version: '7.6.0' }] },
        { code: 'async function f() { await 1 }', options: [{ version: '7.6.0' }] },
        { code: '(async function() { await 1 })', options: [{ version: '7.6.0' }] },
        { code: '(async() => { await 1 })', options: [{ version: '7.6.0' }] },
        { code: '({ async method() { await 1 } })', options: [{ version: '7.6.0' }] },
        { code: 'class A { async method() { await 1 } }', options: [{ version: '7.6.0' }] },
        { code: '(class { async method() { await 1 } })', options: [{ version: '7.6.0' }] },
      ],
      invalid: [
        {
          code: 'async function f() {}',
          options: [{ version: '7.5.9' }],
          errors: [{ ...error('no-async-functions', '7.6.0', '7.5.9'), type: AST_NODE_TYPES.FunctionDeclaration }],
        },
        {
          code: 'async function f() { await 1 }',
          options: [{ version: '7.5.9' }],
          errors: [{ ...error('no-async-functions', '7.6.0', '7.5.9'), type: AST_NODE_TYPES.FunctionDeclaration }],
        },
        {
          code: '(async function() { await 1 })',
          options: [{ version: '7.5.9' }],
          errors: [
            { ...error('no-async-functions', '7.6.0', '7.5.9'), column: 2, type: AST_NODE_TYPES.FunctionExpression },
          ],
        },
        {
          code: '(async() => { await 1 })',
          options: [{ version: '7.5.9' }],
          errors: [
            {
              ...error('no-async-functions', '7.6.0', '7.5.9'),
              column: 2,
              type: AST_NODE_TYPES.ArrowFunctionExpression,
            },
          ],
        },
        {
          code: '({ async method() { await 1 } })',
          options: [{ version: '7.5.9' }],
          errors: [
            { ...error('no-async-functions', '7.6.0', '7.5.9'), column: 16, type: AST_NODE_TYPES.FunctionExpression },
          ],
        },
        {
          code: 'class A { async method() { await 1 } }',
          options: [{ version: '7.5.9' }],
          errors: [
            { ...error('no-async-functions', '7.6.0', '7.5.9'), column: 23, type: AST_NODE_TYPES.FunctionExpression },
          ],
        },
        {
          code: '(class { async method() { await 1 } })',
          options: [{ version: '7.5.9' }],
          errors: [
            { ...error('no-async-functions', '7.6.0', '7.5.9'), column: 22, type: AST_NODE_TYPES.FunctionExpression },
          ],
        },
      ],
    },
    {
      keyword: 'trailingCommasInFunctions',
      valid: [
        { code: 'function f(a,) {}', options: [{ version: '8.0.0' }] },
        { code: '(function(a,) {})', options: [{ version: '8.0.0' }] },
        { code: '((a,) => {})', options: [{ version: '8.0.0' }] },
        { code: '({ method(a,) {} })', options: [{ version: '8.0.0' }] },
        { code: 'class A { method(a,) {} }', options: [{ version: '8.0.0' }] },
        { code: '(class { method(a,) {} })', options: [{ version: '8.0.0' }] },
        { code: 'f(1,)', options: [{ version: '8.0.0' }] },
        { code: 'new A(1,)', options: [{ version: '8.0.0' }] },
      ],
      invalid: [
        {
          code: 'function f(a,) {}',
          options: [{ version: '7.9.9' }],
          errors: [{ ...error('no-trailing-function-commas', '8.0.0', '7.9.9'), column: 13, type: undefined }],
        },
        {
          code: '(function(a,) {})',
          options: [{ version: '7.9.9' }],
          errors: [{ ...error('no-trailing-function-commas', '8.0.0', '7.9.9'), column: 12, type: undefined }],
        },
        {
          code: '((a,) => {})',
          options: [{ version: '7.9.9' }],
          errors: [{ ...error('no-trailing-function-commas', '8.0.0', '7.9.9'), column: 4, type: undefined }],
        },
        {
          code: '({ method(a,) {} })',
          options: [{ version: '7.9.9' }],
          errors: [{ ...error('no-trailing-function-commas', '8.0.0', '7.9.9'), column: 12, type: undefined }],
        },
        {
          code: 'class A { method(a,) {} }',
          options: [{ version: '7.9.9' }],
          errors: [{ ...error('no-trailing-function-commas', '8.0.0', '7.9.9'), column: 19, type: undefined }],
        },
        {
          code: '(class { method(a,) {} })',
          options: [{ version: '7.9.9' }],
          errors: [{ ...error('no-trailing-function-commas', '8.0.0', '7.9.9'), column: 18, type: undefined }],
        },
        {
          code: 'f(1,)',
          options: [{ version: '7.9.9' }],
          errors: [{ ...error('no-trailing-function-commas', '8.0.0', '7.9.9'), column: 4, type: undefined }],
        },
        {
          code: 'new A(1,)',
          options: [{ version: '7.9.9' }],
          errors: [{ ...error('no-trailing-function-commas', '8.0.0', '7.9.9'), column: 8, type: undefined }],
        },
      ],
    },

    // ----------------------------------------------------------------------
    // ES2018
    // ----------------------------------------------------------------------
    {
      keyword: 'asyncIteration',
      valid: [
        { code: 'async function f() { for await (const x of xs) {} }', options: [{ version: '10.0.0' }] },
        { code: 'async function* f() { }', options: [{ version: '10.0.0' }] },
        { code: '(async function* () { })', options: [{ version: '10.0.0' }] },
        { code: '({ async* method() { } })', options: [{ version: '10.0.0' }] },
        { code: 'class A { async* method() { } }', options: [{ version: '10.0.0' }] },
        { code: '(class { async* method() { } })', options: [{ version: '10.0.0' }] },
        { code: 'function f() { for (const x of xs) {} }', options: [{ version: '9.9.9' }] },
        { code: 'async function f() { }', options: [{ version: '9.9.9' }] },
        { code: 'function* f() { }', options: [{ version: '9.9.9' }] },
      ],
      invalid: [
        {
          code: 'async function f() { for await (const x of xs) {} }',
          options: [{ version: '9.9.9' }],
          errors: [
            { ...error('no-async-iteration', '10.0.0', '9.9.9'), column: 22, type: AST_NODE_TYPES.ForOfStatement },
          ],
        },
        {
          code: 'async function* f() { }',
          options: [{ version: '9.9.9' }],
          errors: [{ ...error('no-async-iteration', '10.0.0', '9.9.9'), type: AST_NODE_TYPES.FunctionDeclaration }],
        },
        {
          code: '(async function* () { })',
          options: [{ version: '9.9.9' }],
          errors: [
            { ...error('no-async-iteration', '10.0.0', '9.9.9'), column: 2, type: AST_NODE_TYPES.FunctionExpression },
          ],
        },
        {
          code: '({ async* method() { } })',
          options: [{ version: '9.9.9' }],
          errors: [
            { ...error('no-async-iteration', '10.0.0', '9.9.9'), column: 17, type: AST_NODE_TYPES.FunctionExpression },
          ],
        },
        {
          code: 'class A { async* method() { } }',
          options: [{ version: '9.9.9' }],
          errors: [
            { ...error('no-async-iteration', '10.0.0', '9.9.9'), column: 24, type: AST_NODE_TYPES.FunctionExpression },
          ],
        },
        {
          code: '(class { async* method() { } })',
          options: [{ version: '9.9.9' }],
          errors: [
            { ...error('no-async-iteration', '10.0.0', '9.9.9'), column: 23, type: AST_NODE_TYPES.FunctionExpression },
          ],
        },
      ],
    },
    {
      keyword: 'malformedTemplateLiterals',
      valid: [{ code: 'tag`\\unicode`', options: [{ version: '8.10.0' }] }],
      invalid: [
        {
          code: 'tag`\\unicode`',
          options: [{ version: '8.9.9' }],
          errors: [
            {
              ...error('no-malformed-template-literals', '8.10.0', '8.9.9'),
              column: 4,
              type: AST_NODE_TYPES.TemplateLiteral,
            },
          ],
        },
      ],
    },
    {
      keyword: 'regexpLookbehind',
      valid: [
        { code: 'var a = /(?<=a)foo/', options: [{ version: '8.10.0' }] },
        { code: 'var a = /(?<!a)foo/', options: [{ version: '8.10.0' }] },
        { code: 'var a = new RegExp("/(?<=a)foo/")', options: [{ version: '8.10.0' }] },
        { code: 'var a = new RegExp(pattern)', options: [{ version: '8.9.9' }] },
        { code: 'var a = new RegExp("(?<=")', options: [{ version: '8.9.9' }] },
        { code: 'var a = /\\(?<=a\\)foo/', options: [{ version: '8.9.9' }] },
      ],
      invalid: [
        {
          code: 'var a = /(?<=a)foo/',
          options: [{ version: '8.9.9' }],
          errors: [
            { ...error('no-regexp-lookbehind-assertions', '8.10.0', '8.9.9'), column: 9, type: AST_NODE_TYPES.Literal },
          ],
        },
        {
          code: 'var a = /(?<!a)foo/',
          options: [{ version: '8.9.9' }],
          errors: [
            { ...error('no-regexp-lookbehind-assertions', '8.10.0', '8.9.9'), column: 9, type: AST_NODE_TYPES.Literal },
          ],
        },
        {
          code: 'var a = new RegExp("/(?<=a)foo/")',
          options: [{ version: '8.9.9' }],
          errors: [
            {
              ...error('no-regexp-lookbehind-assertions', '8.10.0', '8.9.9'),
              column: 9,
              type: AST_NODE_TYPES.NewExpression,
            },
          ],
        },
      ],
    },
    {
      keyword: 'regexpNamedCaptureGroups',
      valid: [
        { code: 'var a = /(?<key>a)foo/', options: [{ version: '10.0.0' }] },
        { code: 'var a = /(?<key>a)\\k<key>/', options: [{ version: '10.0.0' }] },
        { code: 'var a = new RegExp("(?<key>a)foo")', options: [{ version: '10.0.0' }] },
        { code: 'var a = new RegExp(pattern)', options: [{ version: '8.9.9' }] },
        { code: 'var a = new RegExp("(?<key")', options: [{ version: '8.9.9' }] },
        { code: 'var a = /\\(?<key>a\\)foo/', options: [{ version: '8.9.9' }] },
      ],
      invalid: [
        {
          code: 'var a = /(?<key>a)foo/',
          options: [{ version: '9.9.9' }],
          errors: [
            { ...error('no-regexp-named-capture-groups', '10.0.0', '9.9.9'), column: 9, type: AST_NODE_TYPES.Literal },
          ],
        },
        {
          code: 'var a = /(?<key>a)\\k<key>/',
          options: [{ version: '9.9.9' }],
          errors: [
            { ...error('no-regexp-named-capture-groups', '10.0.0', '9.9.9'), column: 9, type: AST_NODE_TYPES.Literal },
          ],
        },
        {
          code: 'var a = new RegExp("(?<key>a)foo")',
          options: [{ version: '9.9.9' }],
          errors: [
            {
              ...error('no-regexp-named-capture-groups', '10.0.0', '9.9.9'),
              column: 9,
              type: AST_NODE_TYPES.NewExpression,
            },
          ],
        },
      ],
    },
    {
      keyword: 'regexpS',
      valid: [
        { code: 'var a = /foo/s', options: [{ version: '8.10.0' }] },
        { code: 'var a = new RegExp("foo", "s")', options: [{ version: '8.10.0' }] },
        { code: 'var a = new RegExp(a, b)', options: [{ version: '8.9.9' }] },
        { code: 'var a = new RegExp("(aaaaa", b)', options: [{ version: '8.9.9' }] },
      ],
      invalid: [
        {
          code: 'var a = /foo/s',
          options: [{ version: '8.9.9' }],
          errors: [{ ...error('no-regexp-s-flag', '8.10.0', '8.9.9'), column: 9, type: AST_NODE_TYPES.Literal }],
        },
        {
          code: 'var a = new RegExp("foo", "s")',
          options: [{ version: '8.9.9' }],
          errors: [{ ...error('no-regexp-s-flag', '8.10.0', '8.9.9'), column: 9, type: AST_NODE_TYPES.NewExpression }],
        },
      ],
    },
    {
      keyword: 'regexpUnicodeProperties',
      valid: [
        { code: 'var a = /\\p{Letter}/u', options: [{ version: '10.0.0' }] },
        { code: 'var a = /\\P{Letter}/u', options: [{ version: '10.0.0' }] },
        { code: 'var a = new RegExp("\\\\p{Letter}", "u")', options: [{ version: '10.0.0' }] },
        { code: 'var a = new RegExp("\\\\p{Letter}")', options: [{ version: '9.9.9' }] },
        { code: 'var a = new RegExp(pattern, "u")', options: [{ version: '9.9.9' }] },
        { code: 'var a = new RegExp("\\\\p{Letter")', options: [{ version: '9.9.9' }] },
      ],
      invalid: [
        {
          code: 'var a = /\\p{Letter}/u',
          options: [{ version: '9.9.9' }],
          errors: [
            {
              ...error('no-regexp-unicode-property-escapes', '10.0.0', '9.9.9'),
              column: 9,
              type: AST_NODE_TYPES.Literal,
            },
          ],
        },
        {
          code: 'var a = /\\P{Letter}/u',
          options: [{ version: '9.9.9' }],
          errors: [
            {
              ...error('no-regexp-unicode-property-escapes', '10.0.0', '9.9.9'),
              column: 9,
              type: AST_NODE_TYPES.Literal,
            },
          ],
        },
        {
          code: 'var a = new RegExp("\\\\p{Letter}", "u")',
          options: [{ version: '9.9.9' }],
          errors: [
            {
              ...error('no-regexp-unicode-property-escapes', '10.0.0', '9.9.9'),
              column: 9,
              type: AST_NODE_TYPES.NewExpression,
            },
          ],
        },
      ],
    },
    {
      keyword: 'restSpreadProperties',
      valid: [
        { code: '({ ...obj })', options: [{ version: '8.3.0' }] },
        { code: '({ ...rest } = obj)', options: [{ version: '8.3.0' }] },
        { code: '({ obj })', options: [{ version: '8.2.9' }] },
        { code: '({ obj: 1 })', options: [{ version: '8.2.9' }] },
        { code: '({ obj } = a)', options: [{ version: '8.2.9' }] },
        { code: '({ obj: a } = b)', options: [{ version: '8.2.9' }] },
        { code: '([...xs])', options: [{ version: '8.2.9' }] },
        { code: '([a, ...xs] = ys)', options: [{ version: '8.2.9' }] },
      ],
      invalid: [
        {
          code: '({ ...obj })',
          options: [{ version: '8.2.9' }],
          errors: [
            { ...error('no-rest-spread-properties', '8.3.0', '8.2.9'), column: 4, type: AST_NODE_TYPES.SpreadElement },
          ],
        },
        {
          code: '({ ...rest } = obj)',
          options: [{ version: '8.2.9' }],
          errors: [
            { ...error('no-rest-spread-properties', '8.3.0', '8.2.9'), column: 4, type: AST_NODE_TYPES.RestElement },
          ],
        },
      ],
    },

    // ----------------------------------------------------------------------
    // ES2019
    // ----------------------------------------------------------------------
    {
      keyword: 'jsonSuperset',
      valid: [
        { code: "var s = 'foo'", options: [{ version: '9.99.99' }] },
        { code: "var s = '\\\u2028'", options: [{ version: '9.99.99' }] },
        { code: "var s = '\\\u2029'", options: [{ version: '9.99.99' }] },
        { code: "var s = '\u2028'", options: [{ version: '10.0.0' }] },
        { code: "var s = '\u2029'", options: [{ version: '10.0.0' }] },
      ],
      invalid: [
        {
          code: "var s = '\u2028'",
          options: [{ version: '9.99.99' }],
          errors: [
            { ...error('no-json-superset', '10.0.0', '9.99.99', 2028), column: 10, type: AST_NODE_TYPES.Literal },
          ],
        },
        {
          code: "var s = '\u2029'",
          options: [{ version: '9.99.99' }],
          errors: [
            { ...error('no-json-superset', '10.0.0', '9.99.99', 2029), column: 10, type: AST_NODE_TYPES.Literal },
          ],
        },
      ],
    },
    {
      keyword: 'optionalCatchBinding',
      valid: [
        { code: 'try {} catch {}', options: [{ version: '10.0.0' }] },
        { code: 'try {} catch (error) {}', options: [{ version: '9.99.99' }] },
      ],
      invalid: [
        {
          code: 'try {} catch {}',
          options: [{ version: '9.99.99' }],
          errors: [
            { ...error('no-optional-catch-binding', '10.0.0', '9.99.99'), column: 8, type: AST_NODE_TYPES.CatchClause },
          ],
        },
      ],
    },

    // ----------------------------------------------------------------------
    // ES2020
    // ----------------------------------------------------------------------
    {
      keyword: 'bigint',
      requiredEcmaVersion: 2020,
      valid: [
        { code: 'var n = 0n', options: [{ version: '10.4.0' }] },
        { code: 'var n = BigInt(0)', options: [{ version: '10.3.0' }] },
        { code: 'var n = new BigInt64Array()', options: [{ version: '10.3.0' }] },
        { code: 'var n = new BigUint64Array()', options: [{ version: '10.3.0' }] },
        { code: 'var n = { [0n]: 0 }', options: [{ version: '10.4.0' }] },
        { code: 'var n = class { [0n]() {} }', options: [{ version: '10.4.0' }] },
      ],
      invalid: [
        {
          code: 'var n = 0n',
          options: [{ version: '10.3.0' }],
          errors: [{ ...error('no-bigint', '10.4.0', '10.3.0'), column: 9, type: AST_NODE_TYPES.Literal }],
        },
        {
          code: 'var n = { 0n: 0 }',
          options: [{ version: '12.0.0' }],
          errors: [
            { ...error('no-bigint-property-names', '12.4.0', '12.0.0'), column: 11, type: AST_NODE_TYPES.Literal },
          ],
        },
        {
          code: 'var n = class { 0n() {} }',
          options: [{ version: '12.0.0' }],
          errors: [
            { ...error('no-bigint-property-names', '12.4.0', '12.0.0'), column: 17, type: AST_NODE_TYPES.Literal },
          ],
        },
      ],
    },
    {
      keyword: 'dynamicImport',
      requiredEcmaVersion: 2020,
      valid: [
        { code: 'obj.import(source)', options: [{ version: '12.0.0' }] },
        { code: 'import(source)', options: [{ version: '12.17.0' }] },
        { code: 'import(source)', options: [{ version: '13.2.0' }] },
      ],
      invalid: [
        {
          code: 'import(source)',
          options: [{ version: '12.16.0' }],
          errors: [
            {
              ...error('no-dynamic-import', '>=12.17.0 <13.0.0-0||>=13.2.0', '12.16.0'),
              type: AST_NODE_TYPES.ImportExpression,
            },
          ],
        },
        {
          code: 'import(source)',
          options: [{ version: '13.0.0' }],
          errors: [
            {
              ...error('no-dynamic-import', '>=12.17.0 <13.0.0-0||>=13.2.0', '13.0.0'),
              type: AST_NODE_TYPES.ImportExpression,
            },
          ],
        },
        {
          code: 'import(source)',
          options: [{ version: '13.1.0' }],
          errors: [
            {
              ...error('no-dynamic-import', '>=12.17.0 <13.0.0-0||>=13.2.0', '13.1.0'),
              type: AST_NODE_TYPES.ImportExpression,
            },
          ],
        },
      ],
    },
    {
      keyword: 'optionalChaining',
      requiredEcmaVersion: 2020,
      valid: [{ code: 'foo?.bar;', options: [{ version: '14.0.0' }] }],
      invalid: [
        {
          code: 'foo?.bar',
          options: [{ version: '13.0.0' }],
          errors: [
            {
              ...error('no-optional-chaining', '14.0.0', '13.0.0'),
              column: 4,
              // TODO - type should be AST_TOKEN_TYPES.Punctuator, but it doesn't return as such in eslint@6
              // TODO - we should revert this change when dropping support for eslint@6
              // type: AST_TOKEN_TYPES.Punctuator,
            },
          ],
        },
      ],
    },
    {
      keyword: 'nullishCoalescingOperators',
      requiredEcmaVersion: 2020,
      valid: [{ code: 'foo ?? bar;', options: [{ version: '14.0.0' }] }],
      invalid: [
        {
          code: 'foo ?? bar',
          options: [{ version: '13.0.0' }],
          errors: [
            {
              ...error('no-nullish-coalescing-operators', '14.0.0', '13.0.0'),
              column: 5,
              type: AST_TOKEN_TYPES.Punctuator,
            },
          ],
        },
      ],
    },

    // ----------------------------------------------------------------------
    // ES2021
    // ----------------------------------------------------------------------
    {
      keyword: 'logicalAssignmentOperators',
      requiredEcmaVersion: 2021,
      valid: [
        { code: 'a ||= b', options: [{ version: '15.0.0' }] },
        { code: 'a &&= b', options: [{ version: '15.0.0' }] },
        { code: 'a ??= b', options: [{ version: '15.0.0' }] },
      ],
      invalid: [
        {
          code: 'a ||= b',
          options: [{ version: '14.0.0' }],
          errors: [
            {
              ...error('no-logical-assignment-operators', '15.0.0', '14.0.0'),
              column: 3,
              type: AST_TOKEN_TYPES.Punctuator,
            },
          ],
        },
        {
          code: 'a &&= b',
          options: [{ version: '14.0.0' }],
          errors: [
            {
              ...error('no-logical-assignment-operators', '15.0.0', '14.0.0'),
              column: 3,
              type: AST_TOKEN_TYPES.Punctuator,
            },
          ],
        },
        {
          code: 'a ??= b',
          options: [{ version: '14.0.0' }],
          errors: [
            {
              ...error('no-logical-assignment-operators', '15.0.0', '14.0.0'),
              column: 3,
              type: AST_TOKEN_TYPES.Punctuator,
            },
          ],
        },
      ],
    },
    {
      keyword: 'numericSeparators',
      requiredEcmaVersion: 2021,
      valid: [{ code: 'a = 123_456_789', options: [{ version: '12.5.0' }] }],
      invalid: [
        {
          code: 'a = 123_456_789',
          options: [{ version: '12.4.0' }],
          errors: [
            {
              ...error('no-numeric-separators', '12.5.0', '12.4.0'),
              column: 5,
              type: AST_NODE_TYPES.Literal,
            },
          ],
        },
      ],
    },

    // ----------------------------------------------------------------------
    // MISC
    // ----------------------------------------------------------------------
    {
      valid: [
        { filename: fixture('gte-4.0.0/a.js'), code: 'var a = () => 1' },
        { filename: fixture('gte-4.4.0-lt-5.0.0/a.js'), code: 'var a = () => 1' },
        { filename: fixture('hat-4.1.2/a.js'), code: 'var a = () => 1' },
        { code: "'\\\\u{0123}'" },
        {
          filename: fixture('gte-4.0.0/a.js'),
          code: 'var a = async () => 1',
          options: [{ ignores: ['asyncFunctions'] }],
        },
        { filename: fixture('gte-7.6.0/a.js'), code: 'var a = async () => 1' },
        { filename: fixture('gte-7.10.0/a.js'), code: 'var a = async () => 1' },
        { filename: fixture('invalid/a.js'), code: 'var a = () => 1' },
        { filename: fixture('nothing/a.js'), code: 'var a = () => 1' },
        { code: 'var a = async () => 1', options: [{ version: '7.10.0' }] },
        { filename: fixture('without-node/a.js'), code: 'var a = () => 1' },
      ],
      invalid: [
        {
          filename: fixture('gte-0.12.8/a.js'),
          code: 'var a = () => 1',
          errors: [
            {
              ...error('no-arrow-functions', '4.0.0', '>=0.12.8'),
              column: 9,
              type: AST_NODE_TYPES.ArrowFunctionExpression,
            },
          ],
        },
        {
          filename: fixture('invalid/a.js'),
          code: 'var a = { ...obj }',
          errors: [
            {
              ...error('no-rest-spread-properties', '8.3.0', '>=8.0.0'),
              column: 11,
              type: AST_NODE_TYPES.SpreadElement,
            },
          ],
        },
        {
          filename: fixture('lt-6.0.0/a.js'),
          code: 'var a = () => 1',
          errors: [
            {
              ...error('no-arrow-functions', '4.0.0', '<6.0.0'),
              column: 9,
              type: AST_NODE_TYPES.ArrowFunctionExpression,
            },
          ],
        },
        {
          filename: fixture('nothing/a.js'),
          code: 'var a = { ...obj }',
          errors: [
            {
              ...error('no-rest-spread-properties', '8.3.0', '>=8.0.0'),
              column: 11,
              type: AST_NODE_TYPES.SpreadElement,
            },
          ],
        },
        {
          filename: fixture('gte-7.5.0/a.js'),
          code: 'var a = async () => 1',
          errors: [
            {
              ...error('no-async-functions', '7.6.0', '>=7.5.0'),
              column: 9,
              type: AST_NODE_TYPES.ArrowFunctionExpression,
            },
          ],
        },
        {
          filename: fixture('star/a.js'),
          code: '"use strict"; let a = 1',
          errors: [
            {
              ...error('no-block-scoped-variables-strict', '4.0.0', '*'),
              column: 15,
              type: AST_NODE_TYPES.VariableDeclaration,
            },
          ],
        },
        {
          code: 'var a = async () => 1',
          options: [{ version: '7.1.0' }],
          errors: [
            {
              ...error('no-async-functions', '7.6.0', '7.1.0'),
              column: 9,
              type: AST_NODE_TYPES.ArrowFunctionExpression,
            },
          ],
        },
      ],
    },
  ]),
);
