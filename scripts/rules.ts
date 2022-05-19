import path from 'path';

import type { TSESLint } from '@typescript-eslint/utils';
import glob from 'fast-glob';

const rootDir = path.resolve(__dirname, '../src/rules/');

export interface IRuleInfo {
  filePath: string;
  id: string;
  name: string;
  category: string;
  description: string;
  recommended: boolean;
  deprecated: boolean;
  fixable: boolean;
  replacedBy: string[];
}

export interface ICategoryInfo {
  id: string;
  rules: IRuleInfo[];
}

/**
 * @typedef {Object} CategoryInfo
 * @property {string} id The category ID.
 * @property {IRuleInfo[]} rules The rules which belong to this category.
 */

export const rules = glob
  .sync('**/*.ts', { cwd: rootDir })
  .sort((a, b) => a.localeCompare(b))
  .map<IRuleInfo | null>((filename) => {
    const filePath = path.join(rootDir, filename);
    const name = filename.slice(0, -3);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const content = require(filePath) as { category?: string; default?: TSESLint.RuleModule<string> };

    if (!content.category || !content.default) {
      return null;
    }

    const {
      default: { meta },
      category,
    } = content;

    return Object.assign(
      {
        filePath,
        id: `node-roikoren/${name}`,
        name: name === 'no-deprecated-api/no-deprecated-api' ? 'no-deprecated-api' : name,
        category,
        deprecated: Boolean(meta.deprecated),
        fixable: Boolean(meta.fixable),
        recommended: Boolean(meta.docs?.recommended),
        replacedBy: [],
      },
      meta.docs,
    );
  })
  .filter(Boolean) as IRuleInfo[];

export const categories = ['Possible Errors', 'Best Practices', 'Stylistic Issues'].map<ICategoryInfo>((id) => ({
  id,
  rules: rules.filter((rule) => rule.category === id && !rule.deprecated),
}));
