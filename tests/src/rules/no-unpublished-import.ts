import path from 'path';

import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-unpublished-import';
import { DynamicImportSupported } from '../dynamic-import';

if (!DynamicImportSupported) {
  console.warn("[%s] Skip tests for 'import()'", path.basename(__filename, '.js'));
}

const error = (name: string): TSESLint.TestCaseError<'notPublished'> => ({
  messageId: 'notPublished',
  line: 1,
  data: { name },
  type: AST_NODE_TYPES.Literal,
});

/**
 * Makes a file path to a fixture.
 * @param {string} name - A name.
 * @returns {string} A file path to a fixture.
 */
const fixture = (name: string): string => path.resolve(__dirname, '../../fixtures/no-unpublished', name);

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
} as unknown as TSESLint.RuleTesterConfig).run('no-unpublished-import', rule, {
  valid: [
    { filename: fixture('1/test.js'), code: "import fs from 'fs';" },
    { filename: fixture('1/test.js'), code: "import aaa from 'aaa'; aaa();" },
    { filename: fixture('1/test.js'), code: "import c from 'aaa/a/b/c';" },
    { filename: fixture('1/test.js'), code: "import a from './a';" },
    { filename: fixture('1/test.js'), code: "import a from './a.js';" },
    { filename: fixture('2/ignore1.js'), code: "import test from './test';" },
    { filename: fixture('2/ignore1.js'), code: "import bbb from 'bbb';" },
    { filename: fixture('2/ignore1.js'), code: "import c from 'bbb/a/b/c';" },
    { filename: fixture('2/ignore1.js'), code: "import ignore2 from './ignore2';" },
    { filename: fixture('3/test.js'), code: "import a from './pub/a';" },
    { filename: fixture('3/test.js'), code: "import test2 from './test2';" },
    { filename: fixture('3/test.js'), code: "import aaa from 'aaa';" },
    { filename: fixture('3/test.js'), code: "import bbb from 'bbb';" },
    { filename: fixture('3/pub/ignore1.js'), code: "import bbb from 'bbb';" },
    { filename: fixture('3/pub/test.js'), code: "import p from '../package.json';" },
    { filename: fixture('3/src/pub/test.js'), code: "import bbb from 'bbb';" },
    { filename: fixture('3/src/pub/test.js'), code: "import bbb from 'bbb!foo?a=b&c=d';" },

    // Ignores it if the filename is unknown.
    "import noExistPackage0 from 'no-exist-package-0';",
    "import b from './b';",

    // Should work fine if the filename is relative.
    { filename: 'tests/fixtures/no-unpublished/2/test.js', code: "import aaa from 'aaa';" },
    { filename: 'tests/fixtures/no-unpublished/2/test.js', code: "import a from './a';" },

    {
      filename: fixture('1/test.js'),
      code: "import electron from 'electron';",
      options: [{ allowModules: ['electron'] }],
    },

    // Auto-published files only apply to root package directory
    { filename: fixture('3/src/readme.js'), code: "import bbb from 'bbb';", env: { node: true } },

    // Negative patterns in files field.
    { filename: fixture('negative-in-files/lib/__test__/index.js'), code: "import bbb from 'bbb';" },
  ],
  invalid: [
    {
      filename: fixture('2/test.js'),
      code: "import ignore1 from './ignore1.js';",
      errors: [{ ...error('./ignore1.js'), column: 21 }],
    },
    {
      filename: fixture('2/test.js'),
      code: "import ignore1 from './ignore1';",
      errors: [{ ...error('./ignore1'), column: 21 }],
    },
    { filename: fixture('3/pub/test.js'), code: "import bbb from 'bbb';", errors: [{ ...error('bbb'), column: 17 }] },
    {
      filename: fixture('3/pub/test.js'),
      code: "import ignore1 from './ignore1';",
      errors: [{ ...error('./ignore1'), column: 21 }],
    },
    {
      filename: fixture('3/pub/test.js'),
      code: "import abc from './abc';",
      errors: [{ ...error('./abc'), column: 17 }],
    },
    {
      filename: fixture('3/pub/test.js'),
      code: "import test from '../test';",
      errors: [{ ...error('../test'), column: 18 }],
    },
    {
      filename: fixture('3/pub/test.js'),
      code: "import a from '../src/pub/a.js';",
      errors: [{ ...error('../src/pub/a.js'), column: 15 }],
    },

    { filename: fixture('1/test.js'), code: "import a from '../a.js';", errors: [{ ...error('../a.js'), column: 15 }] },

    // Should work fine if the filename is relative.
    {
      filename: 'tests/fixtures/no-unpublished/2/test.js',
      code: "import ignore1 from './ignore1';",
      errors: [{ ...error('./ignore1'), column: 21 }],
    },

    // `convertPath` option.
    {
      filename: fixture('3/src/test.jsx'),
      code: "import a from '../test';",
      errors: [{ ...error('../test'), column: 15 }],
      settings: {
        node: {
          convertPath: [{ include: ['src/**/*.jsx'], replace: ['src/(.+?)\\.jsx', 'pub/$1.js'] }],
          tryExtensions: ['.js', '.jsx', '.json'],
        },
      },
    },
    {
      filename: fixture('3/src/test.jsx'),
      code: "import a from '../test';",
      options: [
        {
          convertPath: [{ include: ['src/**/*.jsx'], replace: ['src/(.+?)\\.jsx', 'pub/$1.js'] }],
          tryExtensions: ['.js', '.jsx', '.json'],
        },
      ],
      errors: [{ ...error('../test'), column: 15 }],
    },

    // outside of the package.
    {
      filename: fixture('1/test.js'),
      code: "import a from '../2/a.js';",
      env: { node: true },
      errors: [{ ...error('../2/a.js'), column: 15 }],
    },

    // import()
    ...(DynamicImportSupported
      ? [
          {
            filename: fixture('2/test.js'),
            code: "function f() { import('./ignore1.js') }",
            parserOptions: { ecmaVersion: 2020 as const },
            errors: [{ ...error('./ignore1.js'), column: 23 }],
          },
        ]
      : []),
  ],
});
