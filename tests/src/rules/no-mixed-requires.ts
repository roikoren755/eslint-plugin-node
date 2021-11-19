import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import rule from '../../../src/rules/no-mixed-requires';

const baseError = { line: 1, column: 1, data: {}, type: AST_NODE_TYPES.VariableDeclaration };
const noMixRequireError = { ...baseError, messageId: 'noMixRequire' as const };
const noMixCoreError = { ...baseError, messageId: 'noMixCoreModuleFileComputed' as const };

new TSESLint.RuleTester().run('no-mixed-requires', rule, {
  valid: [
    { code: 'var a, b = 42, c = doStuff()', options: [false] },
    { code: "var a = require(42), b = require(), c = require('y'), d = require(doStuff())", options: [false] },
    { code: "var fs = require('fs'), foo = require('foo')", options: [false] },
    { code: "var exec = require('child_process').exec, foo = require('foo')", options: [false] },
    { code: "var fs = require('fs'), foo = require('./foo')", options: [false] },
    { code: "var foo = require('foo'), foo2 = require('./foo')", options: [false] },
    { code: "var emitter = require('events').EventEmitter, fs = require('fs')", options: [false] },
    { code: 'var foo = require(42), bar = require(getName())', options: [false] },
    { code: 'var foo = require(42), bar = require(getName())', options: [true] },
    { code: "var fs = require('fs'), foo = require('./foo')", options: [{ grouping: false }] },
    { code: "var foo = require('foo'), bar = require(getName())", options: [false] },
    { code: 'var a;', options: [true] },
    {
      code: "var async = require('async'), debug = require('diagnostics')('my-module')",
      options: [{ allowCall: true }],
    },
  ],
  invalid: [
    { code: "var fs = require('fs'), foo = 42", options: [false], errors: [noMixRequireError] },
    { code: "var fs = require('fs'), foo", options: [false], errors: [noMixRequireError] },
    {
      code: "var a = require(42), b = require(), c = require('y'), d = require(doStuff())",
      options: [true],
      errors: [noMixCoreError],
    },
    { code: "var fs = require('fs'), foo = require('foo')", options: [true], errors: [noMixCoreError] },
    { code: "var fs = require('fs'), foo = require('foo')", options: [{ grouping: true }], errors: [noMixCoreError] },
    {
      code: "var exec = require('child_process').exec, foo = require('foo')",
      options: [true],
      errors: [noMixCoreError],
    },
    { code: "var fs = require('fs'), foo = require('./foo')", options: [true], errors: [noMixCoreError] },
    { code: "var foo = require('foo'), foo2 = require('./foo')", options: [true], errors: [noMixCoreError] },
    { code: "var foo = require('foo'), bar = require(getName())", options: [true], errors: [noMixCoreError] },
    {
      code: "var async = require('async'), debug = require('diagnostics').someFun('my-module')",
      options: [{ allowCall: true }],
      errors: [noMixRequireError],
    },
  ],
});
