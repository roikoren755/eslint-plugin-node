import { symlinkSync, unlinkSync } from 'fs';
import path from 'path';

import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-extraneous-require';

const error = {
  messageId: 'extraneous' as const,
  line: 1,
  column: 9,
  data: { moduleName: 'bbb' },
  type: AST_NODE_TYPES.Literal,
};

/**
 * Makes a file path to a fixture.
 * @param {string} name - A name.
 * @returns {string} A file path to a fixture.
 */
const fixture = (name: string): string => path.resolve(__dirname, '../../fixtures/no-extraneous', name);

// We need to simulate `yarn workspaces` by creating symlinks inside `node_modules`
symlinkSync(fixture('yarnWorkspaces/aaa'), fixture('yarnWorkspaces/node_modules/aaa'));
symlinkSync(fixture('yarnWorkspaces/bbb'), fixture('yarnWorkspaces/node_modules/bbb'));

new TSESLint.RuleTester({ env: { node: true } } as unknown as TSESLint.RuleTesterConfig).run(
  'no-extraneous-require',
  rule,
  {
    valid: [
      { filename: fixture('dependencies/a.js'), code: "$.require('bbb')" },
      { filename: fixture('dependencies/a.js'), code: "require('./bbb')" },
      { filename: fixture('dependencies/a.js'), code: 'require(bbb)' },
      { filename: fixture('dependencies/a.js'), code: "require('aaa')" },
      { filename: fixture('dependencies/a.js'), code: "require('aaa/bbb')" },
      { filename: fixture('dependencies/a.js'), code: "require('@bbb/aaa')" },
      { filename: fixture('dependencies/a.js'), code: "require('@bbb/aaa/bbb')" },
      { filename: fixture('devDependencies/a.js'), code: "require('aaa')" },
      { filename: fixture('peerDependencies/a.js'), code: "require('aaa')" },
      { filename: fixture('optionalDependencies/a.js'), code: "require('aaa')" },
      { filename: fixture('yarnWorkspaces/a.js'), code: "require('aaa')" },

      // don't ignore dependencies in the workspaced package.json
      { filename: fixture('dependencies/a.js'), code: "require('aaa')", options: [{ yarnWorkspaces: true }] },

      // missing packages are warned by no-missing-require
      { filename: fixture('dependencies/a.js'), code: "require('ccc')" },

      // yarnWorkspaces
      { filename: fixture('yarnWorkspaces/a.js'), code: "require('aaa')", options: [{ yarnWorkspaces: true }] },
      { filename: fixture('yarnWorkspaces/b.js'), code: "require('bbb')", options: [{ yarnWorkspaces: true }] },
      { filename: fixture('yarnWorkspaces/c.js'), code: "require('ccc')", options: [{ yarnWorkspaces: true }] },
      { filename: fixture('yarnWorkspaces/aaa/c.js'), code: "require('ccc')", options: [{ yarnWorkspaces: true }] },
      { filename: fixture('yarnWorkspaces/bbb/c.js'), code: "require('ccc')", options: [{ yarnWorkspaces: true }] },
    ],
    invalid: [
      { filename: fixture('dependencies/a.js'), code: "require('bbb')", errors: [error] },
      { filename: fixture('devDependencies/a.js'), code: "require('bbb')", errors: [error] },
      { filename: fixture('peerDependencies/a.js'), code: "require('bbb')", errors: [error] },
      { filename: fixture('optionalDependencies/a.js'), code: "require('bbb')", errors: [error] },
      {
        filename: fixture('dependencies/a.js'),
        code: "require('b'+'bb')",
        errors: [{ ...error, type: AST_NODE_TYPES.BinaryExpression }],
      },
    ],
  },
);

unlinkSync(fixture('yarnWorkspaces/node_modules/aaa'));
unlinkSync(fixture('yarnWorkspaces/node_modules/bbb'));
