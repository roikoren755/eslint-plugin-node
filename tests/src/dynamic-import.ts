import { TSESLint } from '@typescript-eslint/utils';

export const DynamicImportSupported = (() => {
  const messages = new TSESLint.Linter().verify('import(s)', { parserOptions: { ecmaVersion: 2020 } });

  return messages.length === 0;
})();
