import assert from 'assert';

import { TSESLint } from '@typescript-eslint/experimental-utils';

import rule, { supported } from '../../../src/rules/process-exit-as-throw';

describe('process-exit-as-throw', () => {
  let linter: TSESLint.Linter;

  beforeEach(() => {
    linter = new TSESLint.Linter();

    linter.defineRule('process-exit-as-throw', rule);
  });
  (supported ? it : xit)("should get unreachable error after 'process.exit()'.", () => {
    const code = ['foo();', 'process.exit(1);', 'bar();'].join('\n');

    const messages = linter.verify(code, { rules: { 'no-unreachable': 'error', 'process-exit-as-throw': 'error' } });

    assert.strictEqual(messages.length, 1);
    assert.strictEqual(messages[0].message, 'Unreachable code.');
    assert.strictEqual(messages[0].line, 3);
  });
  (supported ? it : xit)("should get no unreachable error after 'process.exit()' if this rule is turned off.", () => {
    const code = ['foo();', 'process.exit(1);', 'bar();'].join('\n');

    const messages = linter.verify(code, { rules: { 'no-unreachable': 'error', 'process-exit-as-throw': 'off' } });

    assert.strictEqual(messages.length, 0);
  });
  (supported ? it : xit)("should get no consistent-return error after 'process.exit()'.", () => {
    const code = [
      'function foo() {',
      '    if (a) {',
      '        return 1;',
      '    } else {',
      '        process.exit(1);',
      '    }',
      '}',
    ].join('\n');

    const messages = linter.verify(code, { rules: { 'consistent-return': 'error', 'process-exit-as-throw': 'error' } });

    assert.strictEqual(messages.length, 0);
  });
});
