import { TSESLint } from '@typescript-eslint/utils';

const ES2021Supported = (() => {
  const messages = new TSESLint.Linter().verify('0n', { parserOptions: { ecmaVersion: 2021 } });

  return messages.length === 0;
})();

const ES2020Supported =
  ES2021Supported ||
  (() => {
    const messages = new TSESLint.Linter().verify('0n', { parserOptions: { ecmaVersion: 2020 } });

    return messages.length === 0;
  })();

const getEcmaVersion = (): TSESLint.EcmaVersion => {
  if (ES2021Supported) {
    return 2021;
  }

  return ES2020Supported ? 2020 : 2019;
};

export const ecmaVersion = getEcmaVersion();
