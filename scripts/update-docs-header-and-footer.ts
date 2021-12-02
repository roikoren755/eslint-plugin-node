import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

import { version } from '../package.json';

import { rules } from './rules';
import type { IRuleInfo } from './rules';

const headerPattern = /^#.+\n(?:>.+\n)*\n+/u;
const footerPattern = /\n+## 🔎 Implementation[\s\S]*$/u;
const docsRoot = path.resolve(__dirname, '../docs/rules');

/**
 * Format a list.
 * @param {string[]} xs The list value to format.
 */
const formatList = (xs: string[]): string => {
  switch (xs.length) {
    case 0:
      return '';
    case 1:
      return xs[0];
    case 2:
      return `${xs[0]} and ${xs[1]}`;
    default: {
      const ys = xs.slice(0, -1);
      const last = xs[xs.length - 1];

      return `${ys.join(', ')}, and ${last}`;
    }
  }
};

/**
 * Render the document header of a given rule.
 * @param {IRuleInfo} rule The rule information.
 * @returns {string} The document header.
 */
const renderHeader = (rule: IRuleInfo): string => {
  const lines = [`# ${rule.id}`, `> ${rule.description}`];

  if (rule.recommended) {
    lines.push('> - ⭐️ This rule is included in `plugin:node-roikoren/recommended` preset.');
  }

  if (rule.fixable) {
    lines.push(
      '> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.',
    );
  }

  if (rule.deprecated) {
    const replace = rule.replacedBy.map((ruleId) => `[${ruleId}](./${ruleId.replace('node-roikoren/', '')}.md)`);
    const replaceText = replace.length === 0 ? '' : ` Use ${formatList(replace)} instead.`;

    lines.push(`> - ⛔ This rule has been deprecated.${replaceText}`);
  }

  lines.push('', '');

  return lines.join('\n');
};

/**
 * Render the document header of a given rule.
 * @param {IRuleInfo} rule The rule information.
 * @returns {string} The document header.
 */
const renderFooter = (rule: IRuleInfo): string => {
  const rulePath = `https://github.com/roikoren755/eslint-plugin-node/blob/v${version}/src/rules/${rule.name}.ts`;
  const testPath = `https://github.com/roikoren755/eslint-plugin-node/blob/v${version}/tests/src/rules/${rule.name}.ts`;

  return `\n\n## 🔎 Implementation\n\n- [Rule source](${rulePath})\n- [Test source](${testPath})`;
};

for (const rule of rules) {
  const filePath = path.resolve(docsRoot, `${rule.name}.md`);
  const original = readFileSync(filePath, 'utf8');
  const body = original.replace(headerPattern, '').replace(footerPattern, '');
  const content = `${renderHeader(rule)}${body}${renderFooter(rule)}\n`;

  writeFileSync(filePath, content);
}
