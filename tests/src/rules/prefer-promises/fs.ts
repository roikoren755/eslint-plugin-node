import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../../src/rules/prefer-promises/fs';

const error = (name: string): TSESLint.TestCaseError<'preferPromises'> => ({
  messageId: 'preferPromises',
  line: 1,
  column: 27,
  data: { name },
  type: AST_NODE_TYPES.CallExpression,
});

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
  globals: { require: 'readonly' },
} as unknown as TSESLint.RuleTesterConfig).run('prefer-promises/fs', rule, {
  valid: [
    "const fs = require('fs'); fs.createReadStream()",
    "const fs = require('fs'); fs.accessSync()",
    "const fs = require('fs'); fs.promises.access()",
    "const {promises} = require('fs'); promises.access()",
    "const {promises: fs} = require('fs'); fs.access()",
    "const {promises: {access}} = require('fs'); access()",
    "import fs from 'fs'; fs.promises.access()",
    "import * as fs from 'fs'; fs.promises.access()",
    "import {promises} from 'fs'; promises.access()",
    "import {promises as fs} from 'fs'; fs.access()",
  ],
  invalid: [
    { code: "const fs = require('fs'); fs.access()", errors: [error('access')] },
    { code: "const {access} = require('fs'); access()", errors: [{ ...error('access'), column: 33 }] },
    { code: "import fs from 'fs'; fs.access()", errors: [{ ...error('access'), column: 22 }] },
    { code: "import * as fs from 'fs'; fs.access()", errors: [error('access')] },
    { code: "import {access} from 'fs'; access()", errors: [{ ...error('access'), column: 28 }] },

    // Other members
    { code: "const fs = require('fs'); fs.copyFile()", errors: [error('copyFile')] },
    { code: "const fs = require('fs'); fs.open()", errors: [error('open')] },
    { code: "const fs = require('fs'); fs.rename()", errors: [error('rename')] },
    { code: "const fs = require('fs'); fs.truncate()", errors: [error('truncate')] },
    { code: "const fs = require('fs'); fs.rmdir()", errors: [error('rmdir')] },
    { code: "const fs = require('fs'); fs.mkdir()", errors: [error('mkdir')] },
    { code: "const fs = require('fs'); fs.readdir()", errors: [error('readdir')] },
    { code: "const fs = require('fs'); fs.readlink()", errors: [error('readlink')] },
    { code: "const fs = require('fs'); fs.symlink()", errors: [error('symlink')] },
    { code: "const fs = require('fs'); fs.lstat()", errors: [error('lstat')] },
    { code: "const fs = require('fs'); fs.stat()", errors: [error('stat')] },
    { code: "const fs = require('fs'); fs.link()", errors: [error('link')] },
    { code: "const fs = require('fs'); fs.unlink()", errors: [error('unlink')] },
    { code: "const fs = require('fs'); fs.chmod()", errors: [error('chmod')] },
    { code: "const fs = require('fs'); fs.lchmod()", errors: [error('lchmod')] },
    { code: "const fs = require('fs'); fs.lchown()", errors: [error('lchown')] },
    { code: "const fs = require('fs'); fs.chown()", errors: [error('chown')] },
    { code: "const fs = require('fs'); fs.utimes()", errors: [error('utimes')] },
    { code: "const fs = require('fs'); fs.realpath()", errors: [error('realpath')] },
    { code: "const fs = require('fs'); fs.mkdtemp()", errors: [error('mkdtemp')] },
    { code: "const fs = require('fs'); fs.writeFile()", errors: [error('writeFile')] },
    { code: "const fs = require('fs'); fs.appendFile()", errors: [error('appendFile')] },
    { code: "const fs = require('fs'); fs.readFile()", errors: [error('readFile')] },
  ],
});
