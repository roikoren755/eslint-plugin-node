import type { EventEmitter } from 'events';
import path from 'path';
import type { TSESTree } from '@typescript-eslint/typescript-estree';

import { createRule } from '../util/create-rule';

/**
 * Imports a specific module.
 * @param {...string[]} moduleNames - module names to import.
 * @returns {object|null} The imported object, or null.
 */
const safeRequire = <T>(...moduleNames: string[]): T | null => {
  for (const moduleName of moduleNames) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(moduleName) as T;
    } catch {
      // Ignore.
    }
  }

  return null;
};

interface ICodePathAnalyzer {
  prototype: { leaveNode(node: TSESTree.Node): void };
  codePath: unknown;
  currentNode: TSESTree.Node | null;
  emitter: EventEmitter;
  original: { leaveNode(node: TSESTree.Node): void };
}

interface ISegment {
  reachable: boolean;
}

interface ICodePathSegment {
  markUsed(segment: ISegment): void;
}

interface ICodePath {
  getState(codePath: unknown): {
    currentSegments: (ISegment | null)[];
    headSegments: (ISegment | null)[];
    makeThrow(): void;
  };
}

const CodePathAnalyzer = safeRequire<ICodePathAnalyzer>(
  path.join(require.resolve('eslint'), '..', 'linter', 'code-path-analysis', 'code-path-analyzer'),
  'eslint/lib/linter/code-path-analysis/code-path-analyzer',
  'eslint/lib/code-path-analysis/code-path-analyzer',
);
const CodePathSegment = safeRequire<ICodePathSegment>(
  path.join(require.resolve('eslint'), '..', 'linter', 'code-path-analysis', 'code-path-segment'),
  'eslint/lib/linter/code-path-analysis/code-path-segment',
  'eslint/lib/code-path-analysis/code-path-segment',
);
const CodePath = safeRequire<ICodePath>(
  path.join(require.resolve('eslint'), '..', 'linter', 'code-path-analysis', 'code-path'),
  'eslint/lib/linter/code-path-analysis/code-path',
  'eslint/lib/code-path-analysis/code-path',
);

// eslint-disable-next-line @typescript-eslint/unbound-method
const originalLeaveNode = CodePathAnalyzer?.prototype.leaveNode as ICodePathAnalyzer['prototype']['leaveNode'];

/**
 * Copied from https://github.com/eslint/eslint/blob/16fad5880bb70e9dddbeab8ed0f425ae51f5841f/lib/code-path-analysis/code-path-analyzer.js#L137
 *
 * @param {ICodePathAnalyzer} analyzer - The instance.
 * @param {TSESTree.Node} node - The current AST node.
 * @returns {void}
 */
const forwardCurrentToHead = (analyzer: ICodePathAnalyzer, node: TSESTree.Node): void => {
  const state = CodePath?.getState(analyzer.codePath) ?? { currentSegments: [], headSegments: [] };
  const { currentSegments, headSegments } = state;
  const end = Math.max(currentSegments.length, headSegments.length);
  let i = 0;
  let currentSegment: ISegment | null = null;
  let headSegment: ISegment | null = null;

  // Fires leaving events.
  for (; i < end; ++i) {
    currentSegment = currentSegments[i];
    headSegment = headSegments[i];

    if (currentSegment !== headSegment && currentSegment?.reachable) {
      analyzer.emitter.emit('onCodePathSegmentEnd', currentSegment, node);
    }
  }

  // Update state.
  state.currentSegments = headSegments;

  // Fires entering events.
  for (i = 0; i < end; ++i) {
    currentSegment = currentSegments[i];
    headSegment = headSegments[i];

    if (currentSegment !== headSegment && headSegment) {
      CodePathSegment?.markUsed(headSegment);

      if (headSegment.reachable) {
        analyzer.emitter.emit('onCodePathSegmentStart', headSegment, node);
      }
    }
  }
};

/**
 * Checks whether a given node is `process.exit()` or not.
 *
 * @param {TSESTree.Node} node - A node to check.
 * @returns {boolean} `true` if the node is `process.exit()`.
 */
const isProcessExit = (node: TSESTree.Node): boolean =>
  node.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name === 'process' &&
  node.callee.property.type === 'Identifier' &&
  node.callee.property.name === 'exit';

/**
 * The function to override `CodePathAnalyzer.prototype.leaveNode` in order to
 * address `process.exit()` as throw.
 *
 * @this ICodePathAnalyzer
 * @param {TSESTree.Node} node - A node to be left.
 * @returns {void}
 */
function overrideLeaveNode(this: ICodePathAnalyzer, node: TSESTree.Node): void {
  if (isProcessExit(node)) {
    this.currentNode = node;

    forwardCurrentToHead(this, node);
    CodePath?.getState(this.codePath).makeThrow();

    this.original.leaveNode(node);
    this.currentNode = null;
  } else {
    originalLeaveNode?.call(this, node);
  }
}

export const supported = !!CodePathAnalyzer;
export const category = 'Possible Errors';
export default createRule<[], 'none'>({
  name: 'process-exit-as-throw',
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce `process.exit()` expressions to count as the same code path as `throw`',
      recommended: 'error',
    },
    schema: [],
    messages: { none: '' },
  },
  defaultOptions: [],
  create() {
    return CodePathAnalyzer
      ? {
          Program: function installProcessExitAsThrow() {
            CodePathAnalyzer.prototype.leaveNode = overrideLeaveNode;
          },
          'Program:exit': function restoreProcessExitAsThrow() {
            CodePathAnalyzer.prototype.leaveNode = originalLeaveNode;
          },
        }
      : {};
  },
});
