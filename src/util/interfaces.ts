import type { TSESLint } from '@typescript-eslint/utils';

import type { ImportTarget } from './import-target';

export type Visitor = (
  context: TSESLint.RuleContext<string, readonly unknown[]>,
  ruleOptions: readonly unknown[],
  options: { includeCore?: boolean; optionIndex?: number },
  callback: (targets: ImportTarget[]) => void,
) => TSESLint.RuleListener;
