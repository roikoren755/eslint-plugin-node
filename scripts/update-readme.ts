import fs from 'fs';
import path from 'path';

import { categories, rules } from './rules';
import type { ICategoryInfo, IRuleInfo } from './rules';

/**
 * Render a given rule as a table row.
 * @param {IRuleInfo} rule The rule information.
 * @returns {string} The table row.
 */
const renderRule = (rule: IRuleInfo): string => {
  const mark = `${rule.recommended ? '⭐️' : ''}${rule.fixable ? '✒️' : ''}`;
  const link = `[${rule.id}](./docs/rules/${rule.name}.md)`;

  return `| ${link} | ${rule.description} | ${mark} |`;
};

/**
 * Render a given rule as a table row.
 * @param {IRuleInfo} rule The rule information.
 * @returns {string} The table row.
 */
const renderDeprecatedRule = (rule: IRuleInfo): string => {
  const link = `[${rule.id}](./docs/rules/${rule.name}.md)`;
  const replacedBy = rule.replacedBy
    .map((nameRaw) => {
      const name = nameRaw.replace(/^node-roikoren[/]/u, '');

      return `[node-roikoren/${name}](./docs/rules/${name}.md)`;
    })
    .join(' and ');

  return `| ${link} | ${replacedBy || '(nothing)'} |`;
};

/**
 * Render a given category as a section.
 * @param {ICategoryInfo} category The rule information.
 * @returns {string} The section.
 */
const renderCategory = (category: ICategoryInfo): string => `### ${category.id}

| Rule ID | Description |    |
|:--------|:------------|:--:|
${category.rules.map((rule) => renderRule(rule)).join('\n')}
`;

const filePath = path.resolve(__dirname, '../README.md');
const content = `${categories.map((category) => renderCategory(category)).join('\n')}
### Deprecated rules

These rules have been deprecated in accordance with the [deprecation policy](https://eslint.org/docs/user-guide/rule-deprecation), and replaced by newer rules:

| Rule ID | Replaced by |
|:--------|:------------|
${rules
  .filter((rule) => rule.deprecated)
  .map((rule) => renderDeprecatedRule(rule))
  .join('\n')}
`;

fs.writeFileSync(
  filePath,
  fs
    .readFileSync(filePath, 'utf8')
    .replace(
      /<!--RULES_TABLE_START-->[\s\S]*<!--RULES_TABLE_END-->/u,
      `<!--RULES_TABLE_START-->\n${content}\n<!--RULES_TABLE_END-->`,
    ),
);
