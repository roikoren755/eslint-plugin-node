import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import rule from '../../../src/rules/no-callback-literal';

const error = { messageId: 'unexpected' as const, line: 1, type: AST_NODE_TYPES.CallExpression, data: {} };

new TSESLint.RuleTester().run('no-callback-literal', rule, {
  valid: [
    // random stuff
    'horse()',
    'sort(null)',
    'require("zyx")',
    'require("zyx", data)',

    // callback()
    'callback()',
    'callback(undefined)',
    'callback(null)',
    'callback(x)',
    'callback(new Error("error"))',
    'callback(friendly, data)',
    'callback(undefined, data)',
    'callback(null, data)',
    'callback(x, data)',
    'callback(new Error("error"), data)',
    'callback(x = obj, data)',
    'callback((1, a), data)',
    'callback(a || b, data)',
    'callback(a ? b : c, data)',
    'callback(a ? 1 : c, data)',
    'callback(a ? b : 1, data)',

    // cb()
    'cb()',
    'cb(undefined)',
    'cb(null)',
    'cb(undefined, "super")',
    'cb(null, "super")',
  ],
  invalid: [
    // callback
    { code: 'callback(false, "snork")', errors: [{ ...error, column: 1 }] },
    { code: 'callback("help")', errors: [{ ...error, column: 1 }] },
    { code: 'callback("help", data)', errors: [{ ...error, column: 1 }] },

    // cb
    { code: 'cb(false)', errors: [{ ...error, column: 1 }] },
    { code: 'cb("help")', errors: [{ ...error, column: 1 }] },
    { code: 'cb("help", data)', errors: [{ ...error, column: 1 }] },
    { code: 'callback((a, 1), data)', errors: [{ ...error, column: 1 }] },
  ],
});
