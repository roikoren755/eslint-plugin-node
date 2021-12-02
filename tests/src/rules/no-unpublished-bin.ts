import path from 'path';

import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import rule from '../../../src/rules/no-unpublished-bin';

const error = (name: string): TSESLint.TestCaseError<'ignored'> => ({
  messageId: 'ignored',
  line: 1,
  column: 1,
  data: { name: `${name}.js` },
  type: AST_NODE_TYPES.Program,
});

/**
 * Makes a file path to a fixture.
 * @param {string} name - A name.
 * @returns {string} A file path to a fixture.
 */
const fixture = (name: string): string => path.resolve(__dirname, '../../fixtures/no-unpublished-bin', name);

new TSESLint.RuleTester().run('no-unpublished-bin', rule, {
  valid: [
    { filename: fixture('simple-ok/a.js'), code: "'simple-ok/a.js'" },
    { filename: fixture('multi-ok/a.js'), code: "'multi-ok/a.js'" },
    { filename: fixture('multi-ok/b.js'), code: "'multi-ok/b.js'" },
    { filename: fixture('simple-files/x.js'), code: "'simple-files/x.js'" },
    { filename: fixture('multi-files/x.js'), code: "'multi-files/x.js'" },
    { filename: fixture('simple-files/lib/a.js'), code: "'simple-files/lib/a.js'" },
    { filename: fixture('multi-files/lib/a.js'), code: "'multi-files/lib/a.js'" },
    { filename: fixture('simple-npmignore/x.js'), code: "'simple-npmignore/x.js'" },
    { filename: fixture('multi-npmignore/x.js'), code: "'multi-npmignore/x.js'" },
    { filename: fixture('simple-npmignore/lib/a.js'), code: "'simple-npmignore/lib/a.js'" },
    { filename: fixture('multi-npmignore/lib/a.js'), code: "'multi-npmignore/lib/a.js'" },
    { filename: fixture('issue115/lib/a.js'), code: "'issue115/lib/a.js'" },

    // empty name
    "'stdin'",

    // convertPath option
    {
      filename: fixture('simple-files/a.js'),
      code: "'simple-files/a.js'",
      options: [{ convertPath: [{ include: ['a.js'], replace: ['a.js', 'lib/a.js'] }] }],
    },
    {
      filename: fixture('multi-files/a.js'),
      code: "'multi-files/a.js'",
      options: [{ convertPath: [{ include: ['a.js'], replace: ['a.js', 'lib/a.js'] }] }],
    },
    {
      filename: fixture('simple-npmignore/a.js'),
      code: "'simple-npmignore/a.js'",
      options: [{ convertPath: [{ include: ['a.js'], replace: ['a.js', 'lib/a.js'] }] }],
    },
    {
      filename: fixture('multi-npmignore/a.js'),
      code: "'multi-npmignore/a.js'",
      options: [{ convertPath: [{ include: ['a.js'], replace: ['a.js', 'lib/a.js'] }] }],
    },

    // convertPath shared setting
    {
      filename: fixture('simple-files/a.js'),
      code: "'simple-files/a.js'",
      settings: { node: { convertPath: [{ include: ['a.js'], replace: ['a.js', 'lib/a.js'] }] } },
    },
    {
      filename: fixture('multi-files/a.js'),
      code: "'multi-files/a.js'",
      settings: { node: { convertPath: [{ include: ['a.js'], replace: ['a.js', 'lib/a.js'] }] } },
    },
    {
      filename: fixture('simple-npmignore/a.js'),
      code: "'simple-npmignore/a.js'",
      settings: { node: { convertPath: [{ include: ['a.js'], replace: ['a.js', 'lib/a.js'] }] } },
    },
    {
      filename: fixture('multi-npmignore/a.js'),
      code: "'multi-npmignore/a.js'",
      settings: { node: { convertPath: [{ include: ['a.js'], replace: ['a.js', 'lib/a.js'] }] } },
    },
  ],
  invalid: [
    // files field of `package.json`
    {
      filename: fixture('simple-files/a.js'),
      code: "'simple-files/a.js'",
      errors: [error('a')],
    },
    {
      filename: fixture('multi-files/a.js'),
      code: "'multi-files/a.js'",
      errors: [error('a')],
    },
    {
      filename: fixture('multi-files/b.js'),
      code: "'multi-files/b.js'",
      errors: [error('b')],
    },

    // `.npmignore`
    {
      filename: fixture('simple-npmignore/a.js'),
      code: "'simple-npmignore/a.js'",
      errors: [error('a')],
    },
    {
      filename: fixture('multi-npmignore/a.js'),
      code: "'multi-npmignore/a.js'",
      errors: [error('a')],
    },

    // files field of `package.json` with convertPath
    {
      filename: fixture('simple-files/x.js'),
      code: "'simple-files/x.js'",
      options: [{ convertPath: [{ include: ['x.js'], replace: ['x.js', 'a.js'] }] }],
      errors: [error('a')],
    },
    {
      filename: fixture('multi-files/x.js'),
      code: "'multi-files/x.js'",
      options: [{ convertPath: [{ include: ['x.js'], replace: ['x.js', 'a.js'] }] }],
      errors: [error('a')],
    },
    {
      filename: fixture('multi-files/x.js'),
      code: "'multi-files/x.js'",
      options: [{ convertPath: [{ include: ['x.js'], replace: ['x.js', 'b.js'] }] }],
      errors: [error('b')],
    },

    // `.npmignore` with convertPath
    {
      filename: fixture('simple-npmignore/x.js'),
      code: "'simple-npmignore/x.js'",
      options: [{ convertPath: [{ include: ['x.js'], replace: ['x.js', 'a.js'] }] }],
      errors: [error('a')],
    },
    {
      filename: fixture('multi-npmignore/x.js'),
      code: "'multi-npmignore/x.js'",
      options: [{ convertPath: [{ include: ['x.js'], replace: ['x.js', 'a.js'] }] }],
      errors: [error('a')],
    },

    // files field of `package.json` with convertPath (shared setting)
    {
      filename: fixture('simple-files/x.js'),
      code: "'simple-files/x.js'",
      errors: [error('a')],
      settings: { node: { convertPath: [{ include: ['x.js'], replace: ['x.js', 'a.js'] }] } },
    },
    {
      filename: fixture('multi-files/x.js'),
      code: "'multi-files/x.js'",
      errors: [error('a')],
      settings: { node: { convertPath: [{ include: ['x.js'], replace: ['x.js', 'a.js'] }] } },
    },
    {
      filename: fixture('multi-files/x.js'),
      code: "'multi-files/x.js'",
      errors: [error('b')],
      settings: { node: { convertPath: [{ include: ['x.js'], replace: ['x.js', 'b.js'] }] } },
    },

    // `.npmignore` with convertPath (shared setting)
    {
      filename: fixture('simple-npmignore/x.js'),
      code: "'simple-npmignore/x.js'",
      errors: [error('a')],
      settings: { node: { convertPath: [{ include: ['x.js'], replace: ['x.js', 'a.js'] }] } },
    },
    {
      filename: fixture('multi-npmignore/x.js'),
      code: "'multi-npmignore/x.js'",
      errors: [error('a')],
      settings: { node: { convertPath: [{ include: ['x.js'], replace: ['x.js', 'a.js'] }] } },
    },
  ],
});
