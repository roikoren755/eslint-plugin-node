import fs from 'fs';
import path from 'path';
import { TSESLint } from '@typescript-eslint/experimental-utils';

const logger = console;

// main
const run = async (ruleId: string): Promise<void> => {
  if (!ruleId) {
    logger.error('Usage: yarn new <RuleID>');
    process.exitCode = 1;

    return;
  }

  if (!/^[\w-]+$/u.test(ruleId)) {
    logger.error("Invalid RuleID '%s'.", ruleId);
    process.exitCode = 1;

    return;
  }

  const ruleFile = path.resolve(__dirname, `../lib/rules/${ruleId}.ts`);
  const testFile = path.resolve(__dirname, `../tests/lib/rules/${ruleId}.ts`);
  const docFile = path.resolve(__dirname, `../docs/rules/${ruleId}.md`);

  fs.writeFileSync(
    ruleFile,
    `import { createRule } from '../util/create-rule';

export default createRule({
  name: '${ruleId}',
  meta: {
    type: 'problem',
    docs: { description: '', recommended: false },
    schema: [],
    messages: {},
  },
  defaultOptions: [],
  create(context) {
    return {},
  },
});
`,
  );
  fs.writeFileSync(
    testFile,
    `import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import rule from '../../../src/rules/${ruleId}';

const error = { messageId: 'forbidden' as const, line: 1, column: 1, type: AST_NODE_TYPES.MemberExpression, data: {} };

new TSESLint.RuleTester().run('${ruleId}', rule, {
  valid: [],
  invalid: [],
});
`,
  );
  fs.writeFileSync(
    docFile,
    `#  (node-roikoren/${ruleId})

(TODO: Why this rule is useful.)

## 📖 Rule Details

(TODO: How this rule will report code.)

👍 Examples of **correct** code for this rule:

\`\`\`js
/*eslint node-roikoren/${ruleId}: error */
\`\`\`

👎 Examples of **incorrect** code for this rule:

\`\`\`js
/*eslint node-roikoren/${ruleId}: error */
\`\`\`

## ⚙ Options

\`\`\`json
{
  "node-roikoren/${ruleId}": ["error", ...]
}
\`\`\`
`,
  );

  await TSESLint.ESLint.outputFixes((await new TSESLint.ESLint({ fix: true }).lintFiles([ruleFile, testFile])) as never);
};

run(process.argv[2]).catch(console.error);
