import path from 'path';

import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import rule from '../../../src/rules/no-missing-import';
import { DynamicImportSupported } from '../dynamic-import';

if (!DynamicImportSupported) {
  // eslint-disable-next-line no-console
  console.warn("[%s] Skip tests for 'import()'", path.basename(__filename, '.js'));
}

const error = (name: string): TSESLint.TestCaseError<'missing'> => ({
  messageId: 'missing',
  line: 1,
  data: { name },
  type: AST_NODE_TYPES.Literal,
});

/**
 * Makes a file path to a fixture.
 * @param {string} name - A name.
 * @returns {string} A file path to a fixture.
 */
const fixture = (name: string): string => path.resolve(__dirname, '../../fixtures/no-missing', name);

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
} as unknown as TSESLint.RuleTesterConfig).run('no-missing-import', rule, {
  valid: [
    { filename: fixture('test.js'), code: "import eslint from 'eslint';" },
    { filename: fixture('test.js'), code: "import fs from 'fs';" },
    { filename: fixture('test.js'), code: "import fs from 'node:fs';" },
    { filename: fixture('test.js'), code: "import eslint from 'eslint/lib/api';" },
    { filename: fixture('test.js'), code: "import a from './a'; a();" },
    { filename: fixture('test.js'), code: "import a from './a.js';" },
    { filename: fixture('test.js'), code: "import aConfig from './a.config';" },
    { filename: fixture('test.js'), code: "import aConfig from './a.config.js';" },
    { filename: fixture('test.js'), code: "import b from './b';" },
    { filename: fixture('test.js'), code: "import b from './b.json';" },
    { filename: fixture('test.js'), code: "import c from './c.coffee';" },
    { filename: fixture('test.js'), code: "import mocha from 'mocha';" },
    { filename: fixture('test.js'), code: "import mocha from 'mocha!foo?a=b&c=d';" },

    // tryExtensions
    { filename: fixture('test.js'), code: "import c from './c';", options: [{ tryExtensions: ['.coffee'] }] },
    { filename: fixture('test.js'), code: "import c from './c';", settings: { node: { tryExtensions: ['.coffee'] } } },

    // Ignores it if the filename is unknown.
    "import abc from 'no-exist-package-0';",
    "import b from './b';",

    // no source.
    { filename: fixture('test.js'), code: 'const foo=0, bar=1; export {foo, bar};' },

    // Should work fine if the filename is relative.
    { filename: 'tests/fixtures/no-missing/test.js', code: "import eslint from 'eslint'" },
    { filename: 'tests/fixtures/no-missing/test.js', code: "import a from './a';" },

    // Relative paths to a directory should work.
    { filename: fixture('test.js'), code: "import a from '.';" },
    { filename: fixture('test.js'), code: "import a from './';" },
    { filename: fixture('test.js'), code: "import a from './foo';" },
    { filename: fixture('test.js'), code: "import a from './foo/';" },

    // allow option.
    {
      filename: fixture('test.js'),
      code: "import electron from 'electron';",
      options: [{ allowModules: ['electron'] }],
    },

    // resolvePaths
    {
      filename: fixture('test.js'),
      code: "import a from 'fixtures/no-missing/a';",
      env: { node: true },
      settings: { node: { resolvePaths: [path.resolve(__dirname, '../../')] } },
    },
    {
      filename: fixture('test.js'),
      code: "import a from 'fixtures/no-missing/a';",
      options: [{ resolvePaths: [path.resolve(__dirname, '../../')] }],
      env: { node: true },
    },
    {
      filename: fixture('test.js'),
      code: "import a from 'fixtures/no-missing/a';",
      options: [{ resolvePaths: ['tests'] }],
      env: { node: true },
    },

    // import()
    ...(DynamicImportSupported
      ? [
          {
            filename: fixture('test.js'),
            code: 'function f() { import(foo) }',
            parserOptions: { ecmaVersion: 2020 as const },
          },
        ]
      : []),
  ],
  invalid: [
    {
      filename: fixture('test.js'),
      code: "import abc from 'no-exist-package-0';",
      errors: [{ ...error('no-exist-package-0'), column: 17 }],
    },
    {
      filename: fixture('test.js'),
      code: "import test from '@roikoren/test';",
      errors: [{ ...error('@roikoren/test'), column: 18 }],
    },
    { filename: fixture('test.js'), code: "import c from './c';", errors: [{ ...error('./c'), column: 15 }] },
    { filename: fixture('test.js'), code: "import d from './d';", errors: [{ ...error('./d'), column: 15 }] },
    { filename: fixture('test.js'), code: "import a from './a.json';", errors: [{ ...error('./a.json'), column: 15 }] },

    // Should work fine if the filename is relative.
    {
      filename: 'tests/fixtures/no-missing/test.js',
      code: "import eslint from 'no-exist-package-0';",
      errors: [{ ...error('no-exist-package-0'), column: 20 }],
    },
    {
      filename: 'tests/fixtures/no-missing/test.js',
      code: "import c from './c';",
      errors: [{ ...error('./c'), column: 15 }],
    },

    // Relative paths to a directory should work.
    { filename: fixture('test.js'), code: "import a from './bar';", errors: [{ ...error('./bar'), column: 15 }] },
    { filename: fixture('test.js'), code: "import a from './bar/';", errors: [{ ...error('./bar/'), column: 15 }] },

    // Case sensitive
    { filename: fixture('test.js'), code: "import a from './A.js';", errors: [{ ...error('./A.js'), column: 15 }] },

    // import()
    ...(DynamicImportSupported
      ? [
          {
            filename: fixture('test.js'),
            code: "function f() { import('no-exist-package-0') }",
            parserOptions: { ecmaVersion: 2020 as const },
            errors: [{ ...error('no-exist-package-0'), column: 23 }],
          },
        ]
      : []),
  ],
});
