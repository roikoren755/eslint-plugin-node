import type { TSESLint } from '@typescript-eslint/experimental-utils';

import { getPackageJson } from '../util/get-package-json';

import moduleConfig from './recommended-module';
import scriptConfig from './recommended-script';

export default (): TSESLint.Linter.Config => {
  const packageJson = getPackageJson();
  const isModule = packageJson?.type === 'module';

  return {
    ...(isModule ? moduleConfig : scriptConfig),
    overrides: [
      { files: ['*.cjs', '.*.cjs'], ...scriptConfig },
      { files: ['*.mjs', '.*.mjs'], ...moduleConfig },
    ],
  };
};
