import { ESLintUtils } from '@typescript-eslint/experimental-utils';

export const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/roikoren755/eslint-plugin-node/docs/rules/${name}.md`,
);
