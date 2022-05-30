import { symlinkSync, unlinkSync } from 'fs';
import path from 'path';

import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-extraneous-import';

const error = {
  messageId: 'extraneous' as const,
  line: 1,
  column: 17,
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

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
} as unknown as TSESLint.RuleTesterConfig).run('no-extraneous-import', rule, {
  valid: [
    { filename: fixture('dependencies/a.js'), code: "import bbb from './bbb'" },
    { filename: fixture('dependencies/a.js'), code: "import aaa from 'aaa'" },
    { filename: fixture('dependencies/a.js'), code: "import bbb from 'aaa/bbb'" },
    { filename: fixture('dependencies/a.js'), code: "import aaa from '@bbb/aaa'" },
    { filename: fixture('dependencies/a.js'), code: "import bbb from '@bbb/aaa/bbb'" },
    { filename: fixture('devDependencies/a.js'), code: "import aaa from 'aaa'" },
    { filename: fixture('peerDependencies/a.js'), code: "import aaa from 'aaa'" },
    { filename: fixture('optionalDependencies/a.js'), code: "import aaa from 'aaa'" },
    { filename: fixture('yarnWorkspaces/a.js'), code: "import aaa from 'aaa'" },
    { filename: fixture('yarnWorkspaces/b.js'), code: "import bbb from 'bbb'" },
    { filename: fixture('yarnWorkspaces/c.js'), code: "import ccc from 'ccc'" },

    // don't ignore dependencies in the workspaced package.json
    { filename: fixture('dependencies/a.js'), code: "import aaa from 'aaa'", options: [{ yarnWorkspaces: true }] },

    // missing packages are warned by no-missing-import
    { filename: fixture('dependencies/a.js'), code: "import ccc from 'ccc'" },

    // yarnWorkspaces
    { filename: fixture('yarnWorkspaces/a.js'), code: "import aaa from 'aaa'", options: [{ yarnWorkspaces: true }] },
    { filename: fixture('yarnWorkspaces/b.js'), code: "import bbb from 'bbb'", options: [{ yarnWorkspaces: true }] },
    { filename: fixture('yarnWorkspaces/c.js'), code: "import ccc from 'ccc'", options: [{ yarnWorkspaces: true }] },
    { filename: fixture('yarnWorkspaces/aaa/c.js'), code: "import ccc from 'ccc'", options: [{ yarnWorkspaces: true }] },
    { filename: fixture('yarnWorkspaces/bbb/c.js'), code: "import ccc from 'ccc'", options: [{ yarnWorkspaces: true }] },
  ],
  invalid: [
    { filename: fixture('dependencies/a.js'), code: "import bbb from 'bbb'", errors: [error] },
    { filename: fixture('devDependencies/a.js'), code: "import bbb from 'bbb'", errors: [error] },
    { filename: fixture('peerDependencies/a.js'), code: "import bbb from 'bbb'", errors: [error] },
    { filename: fixture('optionalDependencies/a.js'), code: "import bbb from 'bbb'", errors: [error] },

    // import()
    {
      filename: fixture('dependencies/a.js'),
      code: "function f() { import('bbb') }",
      errors: [{ ...error, column: 23 }],
    },
  ],
});

unlinkSync(fixture('yarnWorkspaces/node_modules/aaa'));
unlinkSync(fixture('yarnWorkspaces/node_modules/bbb'));
