import type { TSESLint } from '@typescript-eslint/utils';

import { commonGlobals, commonRules } from './commons';

const recommendedModule: TSESLint.Linter.Config = {
  globals: { ...commonGlobals, __dirname: 'off', __filename: 'off', exports: 'off', module: 'off', require: 'off' },
  parserOptions: { ecmaFeatures: { globalReturn: false }, ecmaVersion: 2019, sourceType: 'module' },
  plugins: ['node-roikoren'],
  rules: { ...commonRules, 'node-roikoren/no-unsupported-features/es-syntax': ['error', { ignores: ['modules'] }] },
};

export default recommendedModule;
