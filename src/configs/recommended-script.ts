import type { TSESLint } from '@typescript-eslint/utils';

import { commonGlobals, commonRules } from './commons';

const recommendedScript: TSESLint.Linter.Config = {
  globals: {
    ...commonGlobals,
    __dirname: 'readonly',
    __filename: 'readonly',
    exports: 'writable',
    module: 'readonly',
    require: 'readonly',
  },
  parserOptions: { ecmaFeatures: { globalReturn: true }, ecmaVersion: 2019, sourceType: 'script' },
  plugins: ['node-roikoren'],
  rules: { ...commonRules, 'node-roikoren/no-unsupported-features/es-syntax': ['error', { ignores: [] }] },
};

export default recommendedScript;
