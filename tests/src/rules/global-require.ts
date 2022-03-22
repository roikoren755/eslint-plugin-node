import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/global-require';

const error = { messageId: 'unexpected' as const, type: AST_NODE_TYPES.CallExpression, line: 1, data: {} };
const parser = require.resolve('@typescript-eslint/parser');

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
    { code: "const t = require('something') as any", parser },
    { code: "const t = <any>require('something')", parser },
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

    // TypeScript block statements
    {
      code: "if (process.env.NODE_ENV === 'DEVELOPMENT') {\n\trequire('debug') as any;\n}",
      parser,
      errors: [{ ...error, line: 2, column: 2 }],
    },
    {
      code: "if (process.env.NODE_ENV === 'DEVELOPMENT') {\n <any>require('debug') as any;\n}",
      parser,
      errors: [{ ...error, line: 2, column: 7 }],
    },
    { code: "var x; if (y) { x = require('debug') as any; }", parser, errors: [{ ...error, column: 21 }] },
    { code: "var x; if (y) { x = <any>require('debug'); }", parser, errors: [{ ...error, column: 26 }] },
    { code: "var x; if (y) { x = (require('debug') as any).baz; }", parser, errors: [{ ...error, column: 22 }] },
    { code: "var x; if (y) { x = (<any>require('debug')).baz; }", parser, errors: [{ ...error, column: 27 }] },
    { code: "function x() { require('y') as any }", parser, errors: [{ ...error, column: 16 }] },
    { code: "function x() { <any>require('y') }", parser, errors: [{ ...error, column: 21 }] },
    { code: "try { require('x') as any; } catch (e) { console.log(e); }", parser, errors: [{ ...error, column: 7 }] },
    { code: "try { <any>require('x'); } catch (e) { console.log(e); }", parser, errors: [{ ...error, column: 12 }] },

    // TypeScript non-block statements
    {
      code: 'var getModule = x => require(x) as any;',
      parser,
      parserOptions: { ecmaVersion: 6 },
      errors: [{ ...error, column: 22 }],
    },
    {
      code: 'var getModule = x => <any>require(x);',
      parser,
      parserOptions: { ecmaVersion: 6 },
      errors: [{ ...error, column: 27 }],
    },
    {
      code: "var x = (x => require(x) as any)('weird')",
      parser,
      parserOptions: { ecmaVersion: 6 },
      errors: [{ ...error, column: 15 }],
    },
    {
      code: "var x = (x => <any>require(x))('weird')",
      parser,
      parserOptions: { ecmaVersion: 6 },
      errors: [{ ...error, column: 20 }],
    },
    { code: "switch(x) { case '1': require('1') as any; break; }", parser, errors: [{ ...error, column: 23 }] },
    { code: "switch(x) { case '1': <any>require('1'); break; }", parser, errors: [{ ...error, column: 28 }] },
  ],
});
