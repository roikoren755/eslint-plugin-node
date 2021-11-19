import { TSESLint } from '@typescript-eslint/experimental-utils';

export const ES2020Supported = (() => {
  const messages = new TSESLint.Linter().verify('0n', { parserOptions: { ecmaVersion: 2020 } });

  return messages.length === 0;
})();

export const ecmaVersion = ES2020Supported ? 2020 : 2019;
