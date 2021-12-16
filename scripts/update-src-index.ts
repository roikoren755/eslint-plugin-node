import { writeFileSync } from 'fs';
import path from 'path';

import { TSESLint } from '@typescript-eslint/experimental-utils';
import camelcase from 'camelcase';

import { rules } from './rules';

const ruleNameToCamelcase = (name: string): string => camelcase(name.replace('/', '-'));

const filePath = path.resolve(__dirname, '../src/index.ts');
const ruleImports = rules
  .map((rule) => `import ${ruleNameToCamelcase(rule.name)} from './rules/${rule.name}';`)
  .join('\n');
const ruleUsages = rules
  .filter((rule) => !rule.deprecated)
  .map((rule) => `'${rule.name}': ${ruleNameToCamelcase(rule.name)},`)
  .join('\n');
const deprecatedRules = rules
  .filter((rule) => rule.deprecated)
  .map((rule) => `'${rule.name}': ${ruleNameToCamelcase(rule.name)},`)
  .join('\n');

const deprecatedRulesUsage =
  deprecatedRules.length > 0
    ? `// Deprecated rules.
    ${deprecatedRules}`
    : '';

const rawContent = `/* DON'T EDIT THIS FILE. This is generated by 'scripts/update-src-index.ts' */
import type { TSESLint } from '@typescript-eslint/experimental-utils';

import recommendedModule from './configs/recommended-module';
import recommendedScript from './configs/recommended-script';
import recommended from './configs/recommended';
${ruleImports}

export = {
  configs: {
    'recommended-module': recommendedModule,
    'recommended-script': recommendedScript,
    get recommended(): TSESLint.Linter.Config {
      return recommended();
    },
  },
  rules: {
    ${ruleUsages}
    ${deprecatedRulesUsage}
  },
}
`;

const run = async (): Promise<void> => {
  writeFileSync(filePath, rawContent);

  await TSESLint.ESLint.outputFixes((await new TSESLint.ESLint({ fix: true }).lintFiles([filePath])) as never);
};

run().catch(console.error);
