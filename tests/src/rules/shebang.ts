import path from 'path';

import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/shebang';
import type { MessageIds } from '../../../src/rules/shebang';

const error = <T extends MessageIds>(messageId: T): TSESLint.TestCaseError<T> => ({
  messageId,
  line: 1,
  column: 1,
  data: {},
  type: AST_NODE_TYPES.Program,
});

/**
 * Makes a file path to a fixture.
 * @param {string} name - A name.
 * @returns {string} A file path to a fixture.
 */
const fixture = (name: string): string => path.resolve(__dirname, '../../fixtures/shebang', name);

new TSESLint.RuleTester().run('shebang', rule, {
  valid: [
    { filename: fixture('string-bin/bin/test.js'), code: '#!/usr/bin/env node\nhello();' },
    { filename: fixture('string-bin/lib/test.js'), code: 'hello();' },
    { filename: fixture('object-bin/bin/a.js'), code: '#!/usr/bin/env node\nhello();' },
    { filename: fixture('object-bin/bin/b.js'), code: '#!/usr/bin/env node\nhello();' },
    { filename: fixture('object-bin/bin/c.js'), code: 'hello();' },
    { filename: fixture('no-bin-field/lib/test.js'), code: 'hello();' },
    '#!/usr/bin/env node\nhello();',
    'hello();',

    // convertPath
    {
      filename: fixture('string-bin/src/bin/test.js'),
      code: '#!/usr/bin/env node\nhello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
    },
    {
      filename: fixture('string-bin/src/lib/test.js'),
      code: 'hello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
    },
    {
      filename: fixture('object-bin/src/bin/a.js'),
      code: '#!/usr/bin/env node\nhello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
    },
    {
      filename: fixture('object-bin/src/bin/b.js'),
      code: '#!/usr/bin/env node\nhello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
    },
    {
      filename: fixture('object-bin/src/bin/c.js'),
      code: 'hello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
    },
    {
      filename: fixture('no-bin-field/src/lib/test.js'),
      code: 'hello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
    },

    // Should work fine if the filename is relative.
    { filename: 'tests/fixtures/shebang/string-bin/bin/test.js', code: '#!/usr/bin/env node\nhello();' },
    { filename: 'tests/fixtures/shebang/string-bin/lib/test.js', code: 'hello();' },

    // BOM and \r\n
    { filename: fixture('string-bin/lib/test.js'), code: '\uFEFFhello();' },
    { filename: fixture('string-bin/lib/test.js'), code: '\uFEFFhello();\n' },
    { filename: fixture('string-bin/lib/test.js'), code: 'hello();\r\n' },
    { filename: fixture('string-bin/lib/test.js'), code: '\uFEFFhello();\r\n' },

    // blank lines on the top of files.
    { filename: fixture('string-bin/lib/test.js'), code: '\n\n\nhello();' },

    // https://github.com/mysticatea/eslint-plugin-node/issues/51
    { filename: fixture('string-bin/bin/test.js'), code: '#!/usr/bin/env node --harmony\nhello();' },

    // use node resolution
    { filename: fixture('object-bin/bin/index.js'), code: '#!/usr/bin/env node\nhello();' },
  ],
  invalid: [
    {
      filename: fixture('string-bin/bin/test.js'),
      code: 'hello();',
      output: '#!/usr/bin/env node\nhello();',
      errors: [error('shebang')],
    },
    {
      filename: fixture('string-bin/bin/test.js'),
      code: '#!/usr/bin/node\nhello();',
      output: '#!/usr/bin/env node\nhello();',
      errors: [{ ...error('shebang'), line: 2 }],
    },
    {
      filename: fixture('string-bin/lib/test.js'),
      code: '#!/usr/bin/env node\nhello();',
      output: 'hello();',
      errors: [{ ...error('noShebang'), line: 2 }],
    },
    {
      filename: fixture('object-bin/bin/a.js'),
      code: 'hello();',
      output: '#!/usr/bin/env node\nhello();',
      errors: [error('shebang')],
    },
    {
      filename: fixture('object-bin/bin/b.js'),
      code: '#!/usr/bin/node\nhello();',
      output: '#!/usr/bin/env node\nhello();',
      errors: [{ ...error('shebang'), line: 2 }],
    },
    {
      filename: fixture('object-bin/bin/c.js'),
      code: '#!/usr/bin/env node\nhello();',
      output: 'hello();',
      errors: [{ ...error('noShebang'), line: 2 }],
    },
    {
      filename: fixture('no-bin-field/lib/test.js'),
      code: '#!/usr/bin/env node\nhello();',
      output: 'hello();',
      errors: [{ ...error('noShebang'), line: 2 }],
    },

    // convertPath
    {
      filename: fixture('string-bin/src/bin/test.js'),
      code: 'hello();',
      output: '#!/usr/bin/env node\nhello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
      errors: [error('shebang')],
    },
    {
      filename: fixture('string-bin/src/bin/test.js'),
      code: 'hello();',
      output: '#!/usr/bin/env node\nhello();',
      errors: [error('shebang')],
      settings: {
        node: { convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] },
      },
    },
    {
      filename: fixture('string-bin/src/bin/test.js'),
      code: '#!/usr/bin/node\nhello();',
      output: '#!/usr/bin/env node\nhello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
      errors: [{ ...error('shebang'), line: 2 }],
    },
    {
      filename: fixture('string-bin/src/lib/test.js'),
      code: '#!/usr/bin/env node\nhello();',
      output: 'hello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
      errors: [{ ...error('noShebang'), line: 2 }],
    },
    {
      filename: fixture('object-bin/src/bin/a.js'),
      code: 'hello();',
      output: '#!/usr/bin/env node\nhello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
      errors: [error('shebang')],
    },
    {
      filename: fixture('object-bin/src/bin/b.js'),
      code: '#!/usr/bin/node\nhello();',
      output: '#!/usr/bin/env node\nhello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
      errors: [{ ...error('shebang'), line: 2 }],
    },
    {
      filename: fixture('object-bin/src/bin/c.js'),
      code: '#!/usr/bin/env node\nhello();',
      output: 'hello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
      errors: [{ ...error('noShebang'), line: 2 }],
    },
    {
      filename: fixture('no-bin-field/src/lib/test.js'),
      code: '#!/usr/bin/env node\nhello();',
      output: 'hello();',
      options: [{ convertPath: [{ include: ['src/**'], replace: ['^src/(.+)$', '$1'] }] }],
      errors: [{ ...error('noShebang'), line: 2 }],
    },

    // Should work fine if the filename is relative.
    {
      filename: 'tests/fixtures/shebang/string-bin/bin/test.js',
      code: 'hello();',
      output: '#!/usr/bin/env node\nhello();',
      errors: [error('shebang')],
    },
    {
      filename: 'tests/fixtures/shebang/string-bin/lib/test.js',
      code: '#!/usr/bin/env node\nhello();',
      output: 'hello();',
      errors: [{ ...error('noShebang'), line: 2 }],
    },

    // header comments
    {
      filename: fixture('string-bin/bin/test.js'),
      code: '/* header */\nhello();',
      output: '#!/usr/bin/env node\n/* header */\nhello();',
      errors: [{ ...error('shebang'), line: 2 }],
    },

    // BOM and \r\n
    {
      filename: fixture('string-bin/bin/test.js'),
      code: '\uFEFFhello();',
      output: '#!/usr/bin/env node\nhello();',
      errors: [error('shebang')],
    },
    {
      filename: fixture('string-bin/bin/test.js'),
      code: 'hello();\n',
      output: '#!/usr/bin/env node\nhello();\n',
      errors: [error('shebang')],
    },
    {
      filename: fixture('string-bin/bin/test.js'),
      code: 'hello();\r\n',
      output: '#!/usr/bin/env node\nhello();\r\n',
      errors: [error('shebang')],
    },
    {
      filename: fixture('string-bin/bin/test.js'),
      code: '\uFEFFhello();\n',
      output: '#!/usr/bin/env node\nhello();\n',
      errors: [error('shebang')],
    },
    {
      filename: fixture('string-bin/bin/test.js'),
      code: '\uFEFFhello();\r\n',
      output: '#!/usr/bin/env node\nhello();\r\n',
      errors: [error('shebang')],
    },
    {
      filename: fixture('string-bin/bin/test.js'),
      code: '#!/usr/bin/env node\r\nhello();',
      output: '#!/usr/bin/env node\nhello();',
      errors: [{ ...error('cr'), line: 2 }],
    },
    {
      filename: fixture('string-bin/bin/test.js'),
      code: '\uFEFF#!/usr/bin/env node\nhello();',
      output: '#!/usr/bin/env node\nhello();',
      errors: [{ ...error('bom'), line: 2 }],
    },
    {
      filename: fixture('string-bin/bin/test.js'),
      code: '\uFEFF#!/usr/bin/env node\r\nhello();',
      output: '#!/usr/bin/env node\nhello();',
      errors: [
        { ...error('bom'), line: 2 },
        { ...error('cr'), line: 2 },
      ],
    },

    // https://github.com/mysticatea/eslint-plugin-node/issues/51
    {
      filename: fixture('string-bin/lib/test.js'),
      code: '#!/usr/bin/env node --harmony\nhello();',
      output: 'hello();',
      errors: [{ ...error('noShebang'), line: 2 }],
    },

    // use node resolution
    {
      filename: fixture('object-bin/bin/index.js'),
      code: 'hello();',
      output: '#!/usr/bin/env node\nhello();',
      errors: [error('shebang')],
    },
  ],
});
