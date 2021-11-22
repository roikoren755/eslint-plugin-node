import type { TSESLint } from '@typescript-eslint/experimental-utils';

import { commonGlobals, commonRules } from './commons';

const recommendedScript: TSESLint.Linter.Config = {
  globals: {
    ...commonGlobals,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __dirname: 'readonly',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __filename: 'readonly',
    exports: 'writable',
    module: 'readonly',
    require: 'readonly',
  },
  parserOptions: { ecmaFeatures: { globalReturn: true }, ecmaVersion: 2019, sourceType: 'script' },
  plugins: ['node-roikoren'],
  rules: { ...commonRules, 'node/no-unsupported-features/es-syntax': ['error', { ignores: [] }] },
};

export default recommendedScript;
