import path from 'path';

import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-restricted-require';
import type { RestrictionDefinition } from '../../../src/util/check-restricted';

const error = (name: string, replace?: string): TSESLint.TestCaseError<'restricted'> => ({
  messageId: 'restricted',
  line: 1,
  column: 9,
  data: { name, customMessage: replace ? ` Please use '${replace}' module instead.` : '' },
  type: AST_NODE_TYPES.Literal,
});

new TSESLint.RuleTester({ globals: { require: 'readonly' } } as unknown as TSESLint.RuleTesterConfig).run(
  'no-restricted-require',
  rule,
  {
    valid: [
      { code: 'require("fs")', options: [['crypto']] },
      { code: 'require("path")', options: [['crypto', 'stream', 'os']] },
      'require("fs ")',
      { code: 'require(2)', options: [['crypto']] },
      { code: 'require(foo)', options: [['crypto']] },
      { code: "bar('crypto');", options: [['crypto']] },
      { code: 'require("foo/bar");', options: [['foo']] },
      { code: 'require("foo/bar");', options: [[{ name: ['foo', 'bar'] }]] },
      { code: 'require("foo/bar");', options: [[{ name: ['foo/c*'] }]] },
      { code: 'require("foo/bar");', options: [[{ name: ['foo'] }, { name: ['foo/c*'] }]] },
      { code: 'require("foo/bar");', options: [[{ name: ['foo'] }, { name: ['foo/*', '!foo/bar'] }]] },
      { code: 'require("os ")', options: [['fs', 'crypto ', 'stream', 'os']] },
      { code: 'require("./foo")', options: [['foo']] },
      { code: 'require("foo")', options: [['./foo']] },
      { code: 'require("foo/bar");', options: [[{ name: '@foo/bar' }]] },
      {
        filename: path.resolve(__dirname, 'lib/sub/test.js'),
        code: 'require("../foo");',
        options: [[{ name: path.resolve(__dirname, 'foo') }]],
      },
    ],
    invalid: [
      { code: 'require("fs")', options: [['fs']], errors: [error('fs')] },
      { code: 'require("foo/bar");', options: [['foo/bar']], errors: [error('foo/bar')] },
      { code: 'require("foo/bar");', options: [[{ name: ['foo/bar'] }]], errors: [error('foo/bar')] },
      { code: 'require("foo/bar");', options: [[{ name: ['foo/*'] }]], errors: [error('foo/bar')] },
      { code: 'require("foo/bar");', options: [[{ name: ['foo/*'] }, { name: ['foo'] }]], errors: [error('foo/bar')] },
      {
        code: 'require("foo/bar");',
        options: [[{ name: ['foo/*', '!foo/baz'] }, { name: ['foo'] }]],
        errors: [error('foo/bar')],
      },
      {
        code: 'require("foo");',
        options: [[{ name: 'foo', message: "Please use 'bar' module instead." }]],
        errors: [error('foo', 'bar')],
      },
      {
        code: 'require("bar");',
        options: [['foo', { name: 'bar', message: "Please use 'baz' module instead." }, 'baz']],
        errors: [error('bar', 'baz')],
      },
      { code: 'require("@foo/bar");', options: [[{ name: '@foo/*' }]], errors: [error('@foo/bar')] },
      { code: 'require("./foo/bar");', options: [[{ name: './foo/*' }]], errors: [error('./foo/bar')] },
      ...(process.platform.includes('win')
        ? []
        : [
            {
              filename: path.resolve(__dirname, 'lib/test.js'),
              code: 'require("../foo");',
              options: [[{ name: path.resolve(__dirname, 'foo') }]] as readonly [restrictions: RestrictionDefinition[]],
              errors: [error('../foo')],
            },
            {
              filename: path.resolve(__dirname, 'lib/sub/test.js'),
              code: 'require("../../foo");',
              options: [[{ name: path.resolve(__dirname, 'foo') }]] as readonly [restrictions: RestrictionDefinition[]],
              errors: [error('../../foo')],
            },
          ]),
      {
        filename: path.resolve(__dirname, 'lib/test.js'),
        code: 'require("../foo");',
        options: [[{ name: path.resolve(__dirname, 'foo') }]],
        errors: [error('../foo')],
      },
      {
        filename: path.resolve(__dirname, 'lib/sub/test.js'),
        code: 'require("../../foo");',
        options: [[{ name: path.resolve(__dirname, 'foo') }]],
        errors: [error('../../foo')],
      },
    ],
  },
);
