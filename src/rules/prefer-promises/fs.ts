import { ASTUtils } from '@typescript-eslint/utils';

import { createRule } from '../../util/create-rule';

const trackMap: ASTUtils.ReferenceTracker.TraceMap<true> = {
  fs: {
    access: { [ASTUtils.ReferenceTracker.CALL]: true },
    copyFile: { [ASTUtils.ReferenceTracker.CALL]: true },
    open: { [ASTUtils.ReferenceTracker.CALL]: true },
    rename: { [ASTUtils.ReferenceTracker.CALL]: true },
    truncate: { [ASTUtils.ReferenceTracker.CALL]: true },
    rmdir: { [ASTUtils.ReferenceTracker.CALL]: true },
    mkdir: { [ASTUtils.ReferenceTracker.CALL]: true },
    readdir: { [ASTUtils.ReferenceTracker.CALL]: true },
    readlink: { [ASTUtils.ReferenceTracker.CALL]: true },
    symlink: { [ASTUtils.ReferenceTracker.CALL]: true },
    lstat: { [ASTUtils.ReferenceTracker.CALL]: true },
    stat: { [ASTUtils.ReferenceTracker.CALL]: true },
    link: { [ASTUtils.ReferenceTracker.CALL]: true },
    unlink: { [ASTUtils.ReferenceTracker.CALL]: true },
    chmod: { [ASTUtils.ReferenceTracker.CALL]: true },
    lchmod: { [ASTUtils.ReferenceTracker.CALL]: true },
    lchown: { [ASTUtils.ReferenceTracker.CALL]: true },
    chown: { [ASTUtils.ReferenceTracker.CALL]: true },
    utimes: { [ASTUtils.ReferenceTracker.CALL]: true },
    realpath: { [ASTUtils.ReferenceTracker.CALL]: true },
    mkdtemp: { [ASTUtils.ReferenceTracker.CALL]: true },
    writeFile: { [ASTUtils.ReferenceTracker.CALL]: true },
    appendFile: { [ASTUtils.ReferenceTracker.CALL]: true },
    readFile: { [ASTUtils.ReferenceTracker.CALL]: true },
  },
};

export const category = 'Stylistic Issues';
export default createRule<[], 'preferPromises'>({
  name: 'prefer-promises/fs',
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce `require("fs").promises`', recommended: false },
    schema: [],
    messages: { preferPromises: "Use 'fs.promises.{{name}}()' instead." },
  },
  defaultOptions: [],
  create(context) {
    return {
      'Program:exit'() {
        const scope = context.getScope();
        const tracker = new ASTUtils.ReferenceTracker(scope, { mode: 'legacy' });
        const references = [...tracker.iterateCjsReferences(trackMap), ...tracker.iterateEsmReferences(trackMap)];

        for (const { node, path } of references) {
          const name = path[path.length - 1];

          context.report({
            node,
            messageId: 'preferPromises',
            data: { name },
          });
        }
      },
    };
  },
});
