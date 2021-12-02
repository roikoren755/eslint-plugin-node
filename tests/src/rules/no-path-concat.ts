/* eslint-disable no-template-curly-in-string */
import path from 'path';

import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import rule from '../../../src/rules/no-path-concat';

const error = { messageId: 'usePathFunctions' as const, line: 1, column: 16, data: {} };

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015 },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  globals: { __dirname: 'readonly', __filename: 'readonly', require: 'readonly' },
} as unknown as TSESLint.RuleTesterConfig).run('no-path-concat', rule, {
  valid: [
    'var fullPath = dirname + "foo.js";',
    'var fullPath = __dirname == "foo.js";',
    'if (fullPath === __dirname) {}',
    'if (__dirname === fullPath) {}',
    'var fullPath = "/foo.js" + __filename;',
    'var fullPath = "/foo.js" + __dirname;',
    'var fullPath = __filename + ".map";',
    'var fullPath = `${__filename}.map`;',
    'var fullPath = __filename + (test ? ".js" : ".ts");',
    'var fullPath = __filename + (ext || ".js");',
  ],
  invalid: [
    {
      code: 'var fullPath = __dirname + "/foo.js";',
      errors: [{ ...error, type: AST_NODE_TYPES.BinaryExpression }],
    },
    {
      code: 'var fullPath = __filename + "/foo.js";',
      errors: [{ ...error, type: AST_NODE_TYPES.BinaryExpression }],
    },
    {
      code: 'var fullPath = `${__dirname}/foo.js`;',
      errors: [{ ...error, type: AST_NODE_TYPES.TemplateLiteral }],
    },
    {
      code: 'var fullPath = `${__filename}/foo.js`;',
      errors: [{ ...error, type: AST_NODE_TYPES.TemplateLiteral }],
    },
    {
      code: 'var path = require("path"); var fullPath = `${__dirname}${path.sep}foo.js`;',
      errors: [{ ...error, type: AST_NODE_TYPES.TemplateLiteral, column: 44 }],
    },
    {
      code: 'var path = require("path"); var fullPath = `${__filename}${path.sep}foo.js`;',
      errors: [{ ...error, type: AST_NODE_TYPES.TemplateLiteral, column: 44 }],
    },
    {
      code: 'var path = require("path"); var fullPath = __dirname + path.sep + `foo.js`;',
      errors: [{ ...error, type: AST_NODE_TYPES.BinaryExpression, column: 44 }],
    },
    {
      code: 'var fullPath = __dirname + "/" + "foo.js";',
      errors: [{ ...error, type: AST_NODE_TYPES.BinaryExpression }],
    },
    {
      code: 'var fullPath = __dirname + ("/" + "foo.js");',
      errors: [{ ...error, type: AST_NODE_TYPES.BinaryExpression }],
    },
    {
      code: 'var fullPath = __dirname + (test ? "/foo.js" : "/bar.js");',
      errors: [{ ...error, type: AST_NODE_TYPES.BinaryExpression }],
    },
    {
      code: 'var fullPath = __dirname + (extraPath || "/default.js");',
      errors: [{ ...error, type: AST_NODE_TYPES.BinaryExpression }],
    },
    {
      code: `var fullPath = __dirname + "\\${path.sep}foo.js";`,
      errors: [{ ...error, type: AST_NODE_TYPES.BinaryExpression }],
    },
    {
      code: `var fullPath = __filename + "\\${path.sep}foo.js";`,
      errors: [{ ...error, type: AST_NODE_TYPES.BinaryExpression }],
    },
    {
      code: `var fullPath = \`\${__dirname}\\${path.sep}foo.js\`;`,
      errors: [{ ...error, type: AST_NODE_TYPES.TemplateLiteral }],
    },
    {
      code: `var fullPath = \`\${__filename}\\${path.sep}foo.js\`;`,
      errors: [{ ...error, type: AST_NODE_TYPES.TemplateLiteral }],
    },
  ],
});
