import path from 'path';
import { ASTUtils } from '@typescript-eslint/experimental-utils';
import type { TSESLint } from '@typescript-eslint/experimental-utils';
import type { TSESTree } from '@typescript-eslint/typescript-estree';

import { createRule } from '../util/create-rule';

/**
 * Get the first char of the specified template element.
 * @param {TSESTree.TemplateLiteral} node The `TemplateLiteral` node to get.
 * @param {number} i The number of template elements to get first char.
 * @param {Set<TSESTree.Node>} sepNodes The nodes of `path.sep`.
 * @param {TSESLint.Scope.Scope} globalScope The global scope object.
 * @param {string[]} outNextChars The array to collect chars.
 * @returns {void}
 */
const collectFirstCharsOfTemplateElement = (
  node: TSESTree.TemplateLiteral,
  i: number,
  sepNodes: Set<TSESTree.Node>,
  globalScope: TSESLint.Scope.Scope,
  outNextChars: string[],
): void => {
  const element = node.quasis[i].value.cooked;

  if (!element && element !== '') {
    return;
  }

  if (element !== '') {
    outNextChars.push(element[0]);

    return;
  }

  if (node.expressions.length > i) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    collectFirstChars(node.expressions[i], sepNodes, globalScope, outNextChars);
  }
};

/**
 * Get the first char of a given node.
 * @param {TemplateLiteral} node The `TemplateLiteral` node to get.
 * @param {Set<TSESLint.Node>} sepNodes The nodes of `path.sep`.
 * @param {TSESLint.Scope.Scope} globalScope The global scope object.
 * @param {string[]} outNextChars The array to collect chars.
 * @returns {void}
 */
const collectFirstChars = (
  node: TSESTree.Expression | TSESTree.PrivateIdentifier,
  sepNodes: Set<TSESTree.Node>,
  globalScope: TSESLint.Scope.Scope,
  outNextChars: string[],
): void => {
  switch (node.type) {
    case 'AssignmentExpression':
      collectFirstChars(node.right, sepNodes, globalScope, outNextChars);
      break;
    case 'BinaryExpression':
      collectFirstChars(node.left, sepNodes, globalScope, outNextChars);
      break;
    case 'ConditionalExpression':
      collectFirstChars(node.consequent, sepNodes, globalScope, outNextChars);
      collectFirstChars(node.alternate, sepNodes, globalScope, outNextChars);
      break;
    case 'LogicalExpression':
      collectFirstChars(node.left, sepNodes, globalScope, outNextChars);
      collectFirstChars(node.right, sepNodes, globalScope, outNextChars);
      break;
    case 'SequenceExpression':
      collectFirstChars(node.expressions[node.expressions.length - 1], sepNodes, globalScope, outNextChars);
      break;
    case 'TemplateLiteral':
      collectFirstCharsOfTemplateElement(node, 0, sepNodes, globalScope, outNextChars);
      break;
    case 'Identifier':
    case 'MemberExpression':
      if (sepNodes.has(node)) {
        outNextChars.push(path.sep);
        break;
      }
    // fallthrough
    default: {
      const str = ASTUtils.getStringIfConstant(node, globalScope);

      if (str) {
        outNextChars.push(str[0]);
      }
    }
  }
};

/**
 * Check if a char is a path separator or not.
 * @param {string} c The char to check.
 * @returns {boolean} `true` if the char is a path separator.
 */
const isPathSeparator = (c: string): boolean => c === '/' || c === path.sep;

/**
 * Check if the given Identifier node is followed by string concatenation with a
 * path separator.
 * @param {TSESTree.Identifier} node The `__dirname` or `__filename` node to check.
 * @param {Set<TSESTree.Node>} sepNodes The nodes of `path.sep`.
 * @param {TSESLint.Scope.Scope} globalScope The global scope object.
 * @returns {boolean} `true` if the given Identifier node is followed by string
 * concatenation with a path separator.
 */
const isConcat = (
  node: TSESTree.Identifier,
  sepNodes: Set<TSESTree.Node>,
  globalScope: TSESLint.Scope.Scope,
): boolean => {
  const { parent } = node;
  const nextChars: string[] = [];

  if (parent?.type === 'BinaryExpression' && parent.operator === '+' && parent.left === node) {
    collectFirstChars(parent.right, sepNodes, globalScope, /* out */ nextChars);
  } else if (parent?.type === 'TemplateLiteral') {
    collectFirstCharsOfTemplateElement(
      parent,
      parent.expressions.indexOf(node) + 1,
      sepNodes,
      globalScope,
      /* out */ nextChars,
    );
  }

  return nextChars.some((char) => isPathSeparator(char));
};

export const category = 'Possible Errors';
export default createRule<[], 'usePathFunctions'>({
  name: 'no-path-concat',
  meta: {
    type: 'suggestion',
    docs: { description: 'disallow string concatenation with `__dirname` and `__filename`', recommended: false },
    schema: [],
    messages: { usePathFunctions: 'Use path.join() or path.resolve() instead of string concatenation.' },
  },
  defaultOptions: [],
  create(context) {
    return {
      'Program:exit'() {
        const globalScope = context.getScope();
        const tracker = new ASTUtils.ReferenceTracker(globalScope);
        const sepNodes = new Set<TSESTree.Node>();

        // Collect `path.sep` references
        for (const { node } of tracker.iterateCjsReferences({
          path: { sep: { [ASTUtils.ReferenceTracker.READ]: true } },
        })) {
          sepNodes.add(node);
        }

        for (const { node } of tracker.iterateEsmReferences({
          path: { sep: { [ASTUtils.ReferenceTracker.READ]: true } },
        })) {
          sepNodes.add(node);
        }

        // Verify `__dirname` and `__filename`
        for (const { node } of tracker.iterateGlobalReferences({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          __dirname: { [ASTUtils.ReferenceTracker.READ]: true },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          __filename: { [ASTUtils.ReferenceTracker.READ]: true },
        })) {
          if (isConcat(node as TSESTree.Identifier, sepNodes, globalScope)) {
            context.report({ node: node.parent as TSESTree.Node, messageId: 'usePathFunctions' });
          }
        }
      },
    };
  },
});
