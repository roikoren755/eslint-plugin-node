/* eslint-disable max-lines */
import path from 'path';

import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';
import { gte } from 'semver';

import rule from '../../../src/rules/file-extension-in-import';
import { DynamicImportSupported } from '../dynamic-import';

const error = (ext: string, notForbid?: boolean): TSESLint.TestCaseError<`${'forbid' | 'require'}Ext`> => ({
  messageId: `${notForbid ? 'require' : 'forbid'}Ext`,
  data: { ext: `.${ext}` },
  line: 1,
  column: 8,
  type: AST_NODE_TYPES.Literal,
});

if (!DynamicImportSupported) {
  // eslint-disable-next-line no-console
  console.warn("[%s] Skip tests for 'import()'", path.basename(__filename, '.js'));
}

const fixture = (filename: string, ts?: boolean): string =>
  path.resolve(__dirname, `../../fixtures/file-extension-in-import${ts ? '-ts' : ''}`, filename);

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
  settings: { node: { tryExtensions: ['.mjs', '.cjs', '.js', '.json', '.node'] } },
} as unknown as TSESLint.RuleTesterConfig).run('file-extension-in-import', rule, {
  valid: [
    { filename: fixture('test.js'), code: "import 'eslint'" },
    { filename: fixture('test.js'), code: "import '@typescript-eslint/parser'" },
    { filename: fixture('test.js'), code: "import '@typescript-eslint\\parser'" },
    { filename: fixture('test.js'), code: "import 'punycode/'" },
    { filename: fixture('test.js'), code: "import 'xxx'" },
    { filename: fixture('test.js'), code: "import './a.js'" },
    { filename: fixture('test.js'), code: "import './b.json'" },
    { filename: fixture('test.js'), code: "import './c.mjs'" },
    { filename: fixture('test.js'), code: "import './a.js'", options: ['always'] },
    { filename: fixture('test.js'), code: "import './b.json'", options: ['always'] },
    { filename: fixture('test.js'), code: "import './c.mjs'", options: ['always'] },
    { filename: fixture('test.js'), code: "import './a'", options: ['never'] },
    { filename: fixture('test.js'), code: "import './b'", options: ['never'] },
    { filename: fixture('test.js'), code: "import './c'", options: ['never'] },
    /* eslint-disable @typescript-eslint/naming-convention */
    { filename: fixture('test.js'), code: "import './a'", options: ['always', { '.js': 'never' }] },
    { filename: fixture('test.js'), code: "import './b.json'", options: ['always', { '.js': 'never' }] },
    { filename: fixture('test.js'), code: "import './c.mjs'", options: ['always', { '.js': 'never' }] },
    { filename: fixture('test.js'), code: "import './a'", options: ['never', { '.json': 'always' }] },
    { filename: fixture('test.js'), code: "import './b.json'", options: ['never', { '.json': 'always' }] },
    { filename: fixture('test.js'), code: "import './c'", options: ['never', { '.json': 'always' }] },
    /* eslint-enable @typescript-eslint/naming-convention */
  ],
  invalid: [
    {
      filename: fixture('test.js'),
      code: "import './a'",
      output: "import './a.js'",
      errors: [error('js', true)],
    },
    {
      filename: fixture('test.js'),
      code: "import './b'",
      output: "import './b.json'",
      errors: [error('json', true)],
    },
    {
      filename: fixture('test.js'),
      code: "import './c'",
      output: "import './c.mjs'",
      errors: [error('mjs', true)],
    },
    {
      filename: fixture('test.js'),
      code: "import './a'",
      output: "import './a.js'",
      options: ['always'],
      errors: [error('js', true)],
    },
    {
      filename: fixture('test.js'),
      code: "import './b'",
      output: "import './b.json'",
      options: ['always'],
      errors: [error('json', true)],
    },
    {
      filename: fixture('test.js'),
      code: "import './c'",
      output: "import './c.mjs'",
      options: ['always'],
      errors: [error('mjs', true)],
    },
    {
      filename: fixture('test.js'),
      code: "import './a.js'",
      output: "import './a'",
      options: ['never'],
      errors: [error('js')],
    },
    {
      filename: fixture('test.js'),
      code: "import './b.json'",
      output: "import './b'",
      options: ['never'],
      errors: [error('json')],
    },
    {
      filename: fixture('test.js'),
      code: "import './c.mjs'",
      output: "import './c'",
      options: ['never'],
      errors: [error('mjs')],
    },
    {
      filename: fixture('test.js'),
      code: "import './a.js'",
      output: "import './a'",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      options: ['always', { '.js': 'never' }],
      errors: [error('js')],
    },
    {
      filename: fixture('test.js'),
      code: "import './b'",
      output: "import './b.json'",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      options: ['always', { '.js': 'never' }],
      errors: [error('json', true)],
    },
    {
      filename: fixture('test.js'),
      code: "import './c'",
      output: "import './c.mjs'",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      options: ['always', { '.js': 'never' }],
      errors: [error('mjs', true)],
    },
    {
      filename: fixture('test.js'),
      code: "import './a.js'",
      output: "import './a'",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      options: ['never', { '.json': 'always' }],
      errors: [error('js')],
    },
    {
      filename: fixture('test.js'),
      code: "import './b'",
      output: "import './b.json'",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      options: ['never', { '.json': 'always' }],
      errors: [error('json', true)],
    },
    {
      filename: fixture('test.js'),
      code: "import './c.mjs'",
      output: "import './c'",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      options: ['never', { '.json': 'always' }],
      errors: [error('mjs')],
    },
    {
      filename: fixture('test.js'),
      code: "import './multi'",
      output: null,
      options: ['always'],
      errors: [error('mjs', true)],
    },
    {
      filename: fixture('test.js'),
      code: "import './multi.cjs'",
      output: null,
      options: ['never'],
      errors: [error('cjs')],
    },

    // import()
    ...(DynamicImportSupported
      ? [
          {
            filename: fixture('test.js'),
            code: "function f() { import('./a') }",
            output: "function f() { import('./a.js') }",
            parserOptions: { ecmaVersion: 2020 as const },
            errors: [{ ...error('js', true), column: 23 }],
          },
          {
            filename: fixture('test.js'),
            code: "function f() { import('./a.js') }",
            output: "function f() { import('./a') }",
            options: ['never'] as const,
            parserOptions: { ecmaVersion: 2020 as const },
            errors: [{ ...error('js'), column: 23 }],
          },
        ]
      : []),
  ],
});

// -----------------------------------------------------------------------------
// TypeScript
// -----------------------------------------------------------------------------
if (gte(TSESLint.ESLint.version ?? TSESLint.Linter.version ?? TSESLint.CLIEngine?.version ?? '0.0.0', '7.28.0')) {
  new TSESLint.RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
    settings: { node: { tryExtensions: ['.mts', '.cts', '.ts', '.json', '.node'] } },
  }).run('file-extension-in-import', rule, {
    valid: [
      { filename: fixture('test.ts', true), code: "import 'eslint'" },
      { filename: fixture('test.ts', true), code: "import '@typescript-eslint/parser'" },
      { filename: fixture('test.ts', true), code: "import '@typescript-eslint\\parser'" },
      { filename: fixture('test.ts', true), code: "import 'punycode/'" },
      { filename: fixture('test.ts', true), code: "import 'xxx'" },
      { filename: fixture('test.ts', true), code: "import './a.ts'" },
      { filename: fixture('test.ts', true), code: "import './b.json'" },
      { filename: fixture('test.ts', true), code: "import './c.mts'" },
      { filename: fixture('test.ts', true), code: "import './a.ts'", options: ['always'] },
      { filename: fixture('test.ts', true), code: "import './b.json'", options: ['always'] },
      { filename: fixture('test.ts', true), code: "import './c.mts'", options: ['always'] },
      { filename: fixture('test.ts', true), code: "import './a'", options: ['never'] },
      { filename: fixture('test.ts', true), code: "import './b'", options: ['never'] },
      { filename: fixture('test.ts', true), code: "import './c'", options: ['never'] },
      /* eslint-disable @typescript-eslint/naming-convention */
      { filename: fixture('test.ts', true), code: "import './a'", options: ['always', { '.ts': 'never' }] },
      { filename: fixture('test.ts', true), code: "import './b.json'", options: ['always', { '.ts': 'never' }] },
      { filename: fixture('test.ts', true), code: "import './c.mts'", options: ['always', { '.ts': 'never' }] },
      { filename: fixture('test.ts', true), code: "import './a'", options: ['never', { '.json': 'always' }] },
      { filename: fixture('test.ts', true), code: "import './b.json'", options: ['never', { '.json': 'always' }] },
      { filename: fixture('test.ts', true), code: "import './c'", options: ['never', { '.json': 'always' }] },
      /* eslint-enable @typescript-eslint/naming-convention */
    ],
    invalid: [
      {
        filename: fixture('test.ts', true),
        code: "import './a'",
        output: "import './a.js'",
        errors: [error('js', true)],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './b'",
        output: "import './b.json'",
        errors: [error('json', true)],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './c'",
        output: "import './c.mjs'",
        errors: [error('mjs', true)],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './a'",
        output: "import './a.js'",
        options: ['always'],
        errors: [error('js', true)],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './b'",
        output: "import './b.json'",
        options: ['always'],
        errors: [error('json', true)],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './c'",
        output: "import './c.mjs'",
        options: ['always'],
        errors: [error('mjs', true)],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './a.ts'",
        output: "import './a'",
        options: ['never'],
        errors: [error('ts')],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './b.json'",
        output: "import './b'",
        options: ['never'],
        errors: [error('json')],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './c.mts'",
        output: "import './c'",
        options: ['never'],
        errors: [error('mts')],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './a.ts'",
        output: "import './a'",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        options: ['always', { '.ts': 'never' }],
        errors: [error('ts')],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './b'",
        output: "import './b.json'",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        options: ['always', { '.ts': 'never' }],
        errors: [error('json', true)],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './c'",
        output: "import './c.mjs'",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        options: ['always', { '.ts': 'never' }],
        errors: [error('mjs', true)],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './a.ts'",
        output: "import './a'",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        options: ['never', { '.json': 'always' }],
        errors: [error('ts')],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './b'",
        output: "import './b.json'",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        options: ['never', { '.json': 'always' }],
        errors: [error('json', true)],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './c.mts'",
        output: "import './c'",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        options: ['never', { '.json': 'always' }],
        errors: [error('mts')],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './multi'",
        output: null,
        options: ['always'],
        errors: [error('mjs', true)],
      },
      {
        filename: fixture('test.ts', true),
        code: "import './multi.cts'",
        output: null,
        options: ['never'],
        errors: [error('cts')],
      },

      // import()
      ...(DynamicImportSupported
        ? [
            {
              filename: fixture('test.ts', true),
              code: "function f() { import('./a') }",
              output: "function f() { import('./a.js') }",
              parserOptions: { ecmaVersion: 2020 as const },
              errors: [{ ...error('js', true), column: 23 }],
            },
            {
              filename: fixture('test.ts', true),
              code: "function f() { import('./a.ts') }",
              output: "function f() { import('./a') }",
              options: ['never'] as const,
              parserOptions: { ecmaVersion: 2020 as const },
              errors: [{ ...error('ts'), column: 23 }],
            },
          ]
        : []),
    ],
  });
}
