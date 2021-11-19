import { ASTUtils } from '@typescript-eslint/experimental-utils';

import { createRule } from '../../util/create-rule';

const trackMap: ASTUtils.ReferenceTracker.TraceMap<true> = {
  dns: {
    lookup: { [ASTUtils.ReferenceTracker.CALL]: true },
    lookupService: { [ASTUtils.ReferenceTracker.CALL]: true },
    Resolver: { [ASTUtils.ReferenceTracker.CONSTRUCT]: true },
    getServers: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolve: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolve4: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolve6: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolveAny: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolveCname: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolveMx: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolveNaptr: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolveNs: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolvePtr: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolveSoa: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolveSrv: { [ASTUtils.ReferenceTracker.CALL]: true },
    resolveTxt: { [ASTUtils.ReferenceTracker.CALL]: true },
    reverse: { [ASTUtils.ReferenceTracker.CALL]: true },
    setServers: { [ASTUtils.ReferenceTracker.CALL]: true },
  },
};

export const category = 'Stylistic Issues';
export default createRule<[], `preferPromises${'' | 'New'}`>({
  name: 'prefer-promises/dns',
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce `require("dns").promises`', recommended: false },
    schema: [],
    messages: {
      preferPromises: "Use 'dns.promises.{{name}}()' instead.",
      preferPromisesNew: "Use 'new dns.promises.{{name}}()' instead.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      'Program:exit'() {
        const tracker = new ASTUtils.ReferenceTracker(context.getScope(), { mode: 'legacy' });

        for (const { node, path } of [
          ...tracker.iterateCjsReferences(trackMap),
          ...tracker.iterateEsmReferences(trackMap),
        ]) {
          const name = path[path.length - 1];
          const isClass = name[0] === name[0].toUpperCase();

          context.report({ node, messageId: isClass ? 'preferPromisesNew' : 'preferPromises', data: { name } });
        }
      },
    };
  },
});
