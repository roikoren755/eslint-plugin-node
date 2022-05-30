import { TSESLint } from '@typescript-eslint/utils';

const ES2021Supported = (() => {
  const messages = new TSESLint.Linter().verify('0n', { parserOptions: { ecmaVersion: 2021 } });

  return messages.length === 0;
})();

const getEcmaVersion = (): TSESLint.EcmaVersion => (ES2021Supported ? 2021 : 2020);

export const ecmaVersion = getEcmaVersion();
