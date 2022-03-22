import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-sync';

const error = {
  messageId: 'noSync' as const,
  line: 1,
  column: 11,
  data: { propertyName: 'fooSync' },
  type: AST_NODE_TYPES.MemberExpression,
};

new TSESLint.RuleTester().run('no-sync', rule, {
  valid: [
    'var foo = fs.foo.foo();',
    { code: 'var foo = fs.fooSync;', options: [{ allowAtRootLevel: true }] },
    { code: 'if (true) {fs.fooSync();}', options: [{ allowAtRootLevel: true }] },
  ],
  invalid: [
    { code: 'var foo = fs.fooSync();', errors: [error] },
    { code: 'var foo = fs.fooSync();', options: [{ allowAtRootLevel: false }], errors: [error] },
    { code: 'if (true) {fs.fooSync();}', errors: [{ ...error, column: 12 }] },
    { code: 'var foo = fs.fooSync;', errors: [error] },
    { code: 'function someFunction() {fs.fooSync();}', errors: [{ ...error, column: 26 }] },
    {
      code: 'function someFunction() {fs.fooSync();}',
      options: [{ allowAtRootLevel: true }],
      errors: [{ ...error, column: 26 }],
    },
    {
      code: 'var a = function someFunction() {fs.fooSync();}',
      options: [{ allowAtRootLevel: true }],
      errors: [{ ...error, column: 34 }],
    },
  ],
});
