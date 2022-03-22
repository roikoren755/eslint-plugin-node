import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type { TSESLint } from '@typescript-eslint/utils';

/**
 * Dispatch all given functions with a node.
 * @param {function[]} handlers The function list to call.
 * @param {Node} node The AST node to be handled.
 * @returns {void}
 */
const dispatch = (handlers: TSESLint.RuleFunction<TSESTree.Node>[], node: TSESTree.Node): void => {
  for (const h of handlers) {
    h(node);
  }
};

interface IRule extends TSESLint.RuleFunction<TSESTree.Node> {
  _handlers?: TSESLint.RuleFunction<TSESTree.Node>[];
}

/**
 * Merge two visitors.
 * This function modifies `visitor1` directly to merge.
 * @param {Visitor} visitor1 The visitor which is assigned.
 * @param {Visitor} visitor2 The visitor which is assigning.
 * @returns {Visitor} `visitor1`.
 */
export const mergeVisitorsInPlace = (
  visitor1: TSESLint.RuleListener,
  visitor2: TSESLint.RuleListener,
): TSESLint.RuleListener => {
  for (const key of Object.keys(visitor2)) {
    const handler1 = visitor1[key] as IRule;
    const handler2 = visitor2[key] as IRule;

    if (typeof handler1 === 'function') {
      // eslint-disable-next-line no-underscore-dangle
      if (handler1._handlers) {
        // eslint-disable-next-line no-underscore-dangle
        handler1._handlers.push(handler2);
      } else {
        const handlers = [handler1, handler2];

        visitor1[key] = Object.assign(dispatch.bind(null, handlers), { _handlers: handlers });
      }
    } else {
      visitor1[key] = handler2;
    }
  }

  return visitor1;
};
