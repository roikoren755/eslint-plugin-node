import type { TSESLint } from '@typescript-eslint/experimental-utils';

import { commonGlobals, commonRules } from './commons';

const config: TSESLint.Linter.Config = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  globals: { ...commonGlobals, __dirname: 'off', __filename: 'off', exports: 'off', module: 'off', require: 'off' },
  parserOptions: { ecmaFeatures: { globalReturn: false }, ecmaVersion: 2019, sourceType: 'module' },
  plugins: ['node-roikoren'],
  rules: { ...commonRules, 'node-roikoren/no-unsupported-features/es-syntax': ['error', { ignores: ['modules'] }] },
};

export default config;
