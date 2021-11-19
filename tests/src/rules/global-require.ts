import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import rule from '../../../src/rules/global-require';

const error = { messageId: 'unexpected' as const, type: AST_NODE_TYPES.CallExpression, line: 1, data: {} };

new TSESLint.RuleTester().run('global-require', rule, {
  valid: [
    "var x = require('y');",
    "if (x) { x.require('y'); }",
    "var x;\nx = require('y');",
    "var x = 1, y = require('y');",
    "var x = require('y'), y = require('y'), z = require('z');",
    "var x = require('y').foo;",
    "require('y').foo();",
    "require('y');",
    "function x(){}\n\n\nx();\n\n\nif (x > y) {\n\tdoSomething()\n\n}\n\nvar x = require('y').foo;",
    "var logger = require(DEBUG ? 'dev-logger' : 'logger');",
    "var logger = DEBUG ? require('dev-logger') : require('logger');",
    "function localScopedRequire(require) { require('y'); }",
    "var someFunc = require('./someFunc'); someFunc(function(require) { return('bananas'); });",
  ],
  invalid: [
    // block statements
    {
      code: "if (process.env.NODE_ENV === 'DEVELOPMENT') {\n\trequire('debug');\n}",
      errors: [{ ...error, line: 2, column: 2 }],
    },
    { code: "var x; if (y) { x = require('debug'); }", errors: [{ ...error, column: 21 }] },
    { code: "var x; if (y) { x = require('debug').baz; }", errors: [{ ...error, column: 21 }] },
    { code: "function x() { require('y') }", errors: [{ ...error, column: 16 }] },
    { code: "try { require('x'); } catch (e) { console.log(e); }", errors: [{ ...error, column: 7 }] },

    // non-block statements
    { code: 'var getModule = x => require(x);', parserOptions: { ecmaVersion: 6 }, errors: [{ ...error, column: 22 }] },
    {
      code: "var x = (x => require(x))('weird')",
      parserOptions: { ecmaVersion: 6 },
      errors: [{ ...error, column: 15 }],
    },
    { code: "switch(x) { case '1': require('1'); break; }", errors: [{ ...error, column: 23 }] },
  ],
});
