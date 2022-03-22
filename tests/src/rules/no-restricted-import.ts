import path from 'path';

import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-restricted-import';
import { DynamicImportSupported } from '../dynamic-import';

if (!DynamicImportSupported) {
  // eslint-disable-next-line no-console
  console.warn("[%s] Skip tests for 'import()'", path.basename(__filename, '.js'));
}

const error = (name: string, replace?: string): TSESLint.TestCaseError<'restricted'> => ({
  messageId: 'restricted',
  line: 1,
  column: 8,
  data: { name, customMessage: replace ? ` Please use '${replace}' module instead.` : '' },
  type: AST_NODE_TYPES.Literal,
});

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
} as unknown as TSESLint.RuleTesterConfig).run('no-restricted-import', rule, {
  valid: [
    { code: 'import "fs"', options: [['crypto']] },
    { code: 'import "path"', options: [['crypto', 'stream', 'os']] },
    'import "fs "',
    { code: 'import "foo/bar";', options: [['foo']] },
    { code: 'import "foo/bar";', options: [[{ name: ['foo', 'bar'] }]] },
    { code: 'import "foo/bar";', options: [[{ name: ['foo/c*'] }]] },
    { code: 'import "foo/bar";', options: [[{ name: ['foo'] }, { name: ['foo/c*'] }]] },
    { code: 'import "foo/bar";', options: [[{ name: ['foo'] }, { name: ['foo/*', '!foo/bar'] }]] },
    { code: 'import "os "', options: [['fs', 'crypto ', 'stream', 'os']] },
    { code: 'import "./foo"', options: [['foo']] },
    { code: 'import "foo"', options: [['./foo']] },
    { code: 'import "foo/bar";', options: [[{ name: '@foo/bar' }]] },
    {
      filename: path.resolve(__dirname, 'lib/sub/test.js'),
      code: 'import "../foo";',
      options: [[{ name: path.resolve(__dirname, 'foo') }]],
    },

    // import()
    ...(DynamicImportSupported
      ? [{ code: 'import(fs)', options: [['fs']] as readonly [['fs']], parserOptions: { ecmaVersion: 2020 as const } }]
      : []),
  ],
  invalid: [
    { code: 'import "fs"', options: [['fs']], errors: [error('fs')] },
    { code: 'import fs from "fs"', options: [['fs']], errors: [{ ...error('fs'), column: 16 }] },
    { code: 'import {} from "fs"', options: [['fs']], errors: [{ ...error('fs'), column: 16 }] },
    { code: 'export * from "fs"', options: [['fs']], errors: [{ ...error('fs'), column: 15 }] },
    { code: 'export {} from "fs"', options: [['fs']], errors: [{ ...error('fs'), column: 16 }] },
    { code: 'import "foo/bar";', options: [['foo/bar']], errors: [error('foo/bar')] },
    { code: 'import "foo/bar";', options: [[{ name: ['foo/bar'] }]], errors: [error('foo/bar')] },
    { code: 'import "foo/bar";', options: [[{ name: ['foo/*'] }]], errors: [error('foo/bar')] },
    { code: 'import "foo/bar";', options: [[{ name: ['foo/*'] }, { name: ['foo'] }]], errors: [error('foo/bar')] },
    {
      code: 'import "foo/bar";',
      options: [[{ name: ['foo/*', '!foo/baz'] }, { name: ['foo'] }]],
      errors: [error('foo/bar')],
    },
    {
      code: 'import "foo";',
      options: [[{ name: 'foo', message: "Please use 'bar' module instead." }]],
      errors: [error('foo', 'bar')],
    },
    {
      code: 'import "bar";',
      options: [['foo', { name: 'bar', message: "Please use 'baz' module instead." }, 'baz']],
      errors: [error('bar', 'baz')],
    },
    { code: 'import "@foo/bar";', options: [[{ name: '@foo/*' }]], errors: [error('@foo/bar')] },
    { code: 'import "./foo/bar";', options: [[{ name: './foo/*' }]], errors: [error('./foo/bar')] },
    {
      filename: path.resolve(__dirname, 'lib/test.js'),
      code: 'import "../foo";',
      options: [[{ name: path.resolve(__dirname, 'foo') }]],
      errors: [error('../foo')],
    },
    {
      filename: path.resolve(__dirname, 'lib/sub/test.js'),
      code: 'import "../../foo";',
      options: [[{ name: path.resolve(__dirname, 'foo') }]],
      errors: [error('../../foo')],
    },

    // import()
    ...(DynamicImportSupported
      ? [
          {
            code: 'import("fs")',
            options: [['fs']] as readonly [['fs']],
            parserOptions: { ecmaVersion: 2020 as const },
            errors: [error('fs')],
          },
        ]
      : []),
  ],
});
