import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import rule from '../../../src/rules/no-mixed-requires';

const baseError = { line: 1, column: 1, data: {}, type: AST_NODE_TYPES.VariableDeclaration };
const noMixRequireError = { ...baseError, messageId: 'noMixRequire' as const };
const noMixCoreError = { ...baseError, messageId: 'noMixCoreModuleFileComputed' as const };

new TSESLint.RuleTester().run('no-mixed-requires', rule, {
  valid: [
    'var a, b = 42, c = doStuff()',
    "var a = require(42), b = require(), c = require('y'), d = require(doStuff())",
    "var fs = require('fs'), foo = require('foo')",
    "var exec = require('child_process').exec, foo = require('foo')",
    "var fs = require('fs'), foo = require('./foo')",
    "var foo = require('foo'), foo2 = require('./foo')",
    "var emitter = require('events').EventEmitter, fs = require('fs')",
    'var foo = require(42), bar = require(getName())',
    { code: 'var foo = require(42), bar = require(getName())', options: [{ grouping: true }] },
    { code: "var fs = require('fs'), foo = require('./foo')", options: [{ grouping: false }] },
    "var foo = require('foo'), bar = require(getName())",
    { code: 'var a;', options: [{ grouping: true }] },
    {
      code: "var async = require('async'), debug = require('diagnostics')('my-module')",
      options: [{ allowCall: true }],
    },
  ],
  invalid: [
    { code: "var fs = require('fs'), foo = 42", errors: [noMixRequireError] },
    { code: "var fs = require('fs'), foo", errors: [noMixRequireError] },
    {
      code: "var a = require(42), b = require(), c = require('y'), d = require(doStuff())",
      options: [{ grouping: true }],
      errors: [noMixCoreError],
    },
    { code: "var fs = require('fs'), foo = require('foo')", options: [{ grouping: true }], errors: [noMixCoreError] },
    {
      code: "var exec = require('child_process').exec, foo = require('foo')",
      options: [{ grouping: true }],
      errors: [noMixCoreError],
    },
    { code: "var fs = require('fs'), foo = require('./foo')", options: [{ grouping: true }], errors: [noMixCoreError] },
    {
      code: "var foo = require('foo'), foo2 = require('./foo')",
      options: [{ grouping: true }],
      errors: [noMixCoreError],
    },
    {
      code: "var foo = require('foo'), bar = require(getName())",
      options: [{ grouping: true }],
      errors: [noMixCoreError],
    },
    {
      code: "var async = require('async'), debug = require('diagnostics').someFun('my-module')",
      options: [{ allowCall: true }],
      errors: [noMixRequireError],
    },
  ],
});
