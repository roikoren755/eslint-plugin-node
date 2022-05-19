/* eslint-disable max-lines */
import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type { TSESLint } from '@typescript-eslint/utils';

import { createRule } from '../util/create-rule';

/**
 * This function is copied from https://github.com/eslint/eslint/blob/2355f8d0de1d6732605420d15ddd4f1eee3c37b6/lib/ast-utils.js#L648-L684
 *
 * @param {TSESTree.Node} node - The node to get.
 * @returns {string|null} The property name if static. Otherwise, null.
 * @private
 */
const getStaticPropertyName = (node: TSESTree.Node): string | null => {
  let prop = {} as TSESTree.Node;

  switch (node.type) {
    case 'Property':
    case 'MethodDefinition':
      prop = node.key;
      break;
    case 'MemberExpression':
      prop = node.property;
      break;
    default:
      break;
  }

  switch (prop.type) {
    case 'Literal':
      return String(prop.value);
    case 'TemplateLiteral':
      if (prop.expressions.length === 0 && prop.quasis.length === 1) {
        return prop.quasis[0].value.cooked;
      }

      break;
    case 'Identifier':
      if (!(node as TSESTree.MemberExpression | TSESTree.MethodDefinition | TSESTree.Property).computed) {
        return prop.name;
      }

      break;
    default:
      break;
  }

  return null;
};

/**
 * Checks whether the given node is assignee or not.
 *
 * @param {TSESTree.Node} node - The node to check.
 * @returns {boolean} `true` if the node is assignee.
 */
const isAssignee = (node: TSESTree.Node): boolean =>
  node.parent?.type === 'AssignmentExpression' && node.parent.left === node;

/**
 * Gets the top assignment expression node if the given node is an assignee.
 *
 * This is used to distinguish 2 assignees belong to the same assignment.
 * If the node is not an assignee, this returns null.
 *
 * @param {TSESTree.Node} leafNode - The node to get.
 * @returns {TSESTree.Node|null} The top assignment expression node, or null.
 */
const getTopAssignment = (leafNode: TSESTree.Node): TSESTree.Node | null => {
  let node = leafNode;

  // Skip MemberExpressions.
  while (node.parent?.type === 'MemberExpression' && node.parent.object === node) {
    node = node.parent;
  }

  // Check assignments.
  if (!isAssignee(node)) {
    return null;
  }

  // Find the top.
  while (node.parent?.type === 'AssignmentExpression') {
    node = node.parent;
  }

  return node;
};

/**
 * Gets top assignment nodes of the given node list.
 *
 * @param {TSESTree.Node[]} nodes - The node list to get.
 * @returns {TSESTree.Node[]} Gotten top assignment nodes.
 */
const createAssignmentList = (nodes: TSESTree.Node[]): TSESTree.Node[] =>
  nodes.map((node) => getTopAssignment(node)).filter(Boolean) as TSESTree.Node[];

/**
 * Gets the reference of `module.exports` from the given scope.
 *
 * @param {TSESLint.Scope.Scope} scope - The scope to get.
 * @returns {TSESTree.MemberExpression[]} Gotten MemberExpression node list.
 */
const getModuleExportsNodes = (scope: TSESLint.Scope.Scope): TSESTree.MemberExpression[] => {
  const variable = scope.set.get('module');

  return variable
    ? (variable.references
        .map((reference) => reference.identifier.parent)
        .filter(
          (node) => node?.type === 'MemberExpression' && getStaticPropertyName(node) === 'exports',
        ) as TSESTree.MemberExpression[])
    : [];
};

/**
 * Gets the reference of `exports` from the given scope.
 *
 * @param {TSESLint.Scope.Scope} scope - The scope to get.
 * @returns {(TSESTree.Identifier | TSESTree.JSXIdentifier)[]} Gotten Identifier node list.
 */
const getExportsNodes = (scope: TSESLint.Scope.Scope): (TSESTree.Identifier | TSESTree.JSXIdentifier)[] => {
  const variable = scope.set.get('exports');

  return variable?.references.map((reference) => reference.identifier) ?? [];
};

const getReplacementForProperty = (
  property: TSESTree.ObjectLiteralElement | TSESTree.Property,
  sourceCode: TSESLint.SourceCode,
): string | null => {
  if (property.type === 'SpreadElement' || property.kind === 'get') {
    // module.exports = { get foo() { ... } }
    // module.exports = { foo }
    // module.exports = { ...foo }
    // We don't have a similarly nice syntax for adding these directly
    // on the exports object. Give up on fixing the whole thing.
    return null;
  }

  let fixedValue = sourceCode.getText(property.value);

  if ('method' in property && property.method) {
    fixedValue = `function${'generator' in property.value && property.value.generator ? '*' : ''} ${fixedValue}`;

    if ('async' in property.value && property.value.async) {
      fixedValue = `async ${fixedValue}`;
    }
  }

  const lines = sourceCode.getCommentsBefore(property).map((comment) => sourceCode.getText(comment as never));

  if (property.key.type === 'Literal' || property.computed) {
    // String or dynamic key:
    // module.exports = { [ ... ]: ... } or { "foo": ... }
    lines.push(`exports[${sourceCode.getText(property.key)}] = ${fixedValue};`);
  } else {
    // Regular identifier:
    // module.exports = { foo: ... }
    lines.push(`exports.${property.key.name} = ${fixedValue};`);
  }

  lines.push(...sourceCode.getCommentsAfter(property).map((comment) => sourceCode.getText(comment as never)));

  return lines.join('\n');
};

const fixModuleExports = (
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
  fixer: TSESLint.RuleFixer,
): TSESLint.RuleFix | null => {
  // Check for module.exports.foo or module.exports.bar reference or assignment
  if (node.parent?.type === 'MemberExpression' && node.parent.object === node) {
    return fixer.replaceText(node, 'exports');
  }

  // Check for a top level module.exports = { ... }
  if (
    node.parent?.type !== 'AssignmentExpression' ||
    node.parent.parent?.type !== 'ExpressionStatement' ||
    node.parent.parent.parent?.type !== 'Program' ||
    node.parent.right.type !== 'ObjectExpression'
  ) {
    return null;
  }

  const statements: string[] = [];
  const { properties } = node.parent.right;

  for (const property of properties) {
    const statement = getReplacementForProperty(property, sourceCode);

    if (statement) {
      statements.push(statement);
    } else {
      // No replacement available, give up on the whole thing

      return null;
    }
  }

  return fixer.replaceText(node.parent, statements.join('\n\n'));
};

export const category = 'Stylistic Issues';
export default createRule<
  [mode: `${'' | 'module.'}exports`, options?: { allowBatchAssign?: boolean }],
  'exportsAccess' | 'exportsAssignment'
>({
  name: 'exports-style',
  meta: {
    type: 'suggestion',
    docs: { description: 'enforce either `module.exports` or `exports`', recommended: false },
    fixable: 'code',
    schema: [
      { enum: ['module.exports', 'exports'] },
      { type: 'object', properties: { allowBatchAssign: { type: 'boolean' } }, additionalProperties: false },
    ],
    messages: {
      exportsAccess: "Unexpected access to '{{bad}}'. Use '{{good}}' instead.",
      exportsAssignment: "Unexpected assignment to 'exports'. Don't modify 'exports' itself.",
    },
  },
  defaultOptions: ['module.exports', {}],
  create(context, appliedOptions) {
    const [mode, options] = appliedOptions;
    const batchAssignAllowed = Boolean(options?.allowBatchAssign);
    const sourceCode = context.getSourceCode();

    /**
     * Gets the location info of reports.
     *
     * exports = foo
     * ^^^^^^^^^
     *
     * module.exports = foo
     * ^^^^^^^^^^^^^^^^
     *
     * @param {TSESTree.Identifier | TSESTree.JSXIdentifier | TSESTree.MemberExpression} node - The node of `exports`/`module.exports`.
     * @returns {TSESTree.SourceLocation} The location info of reports.
     */
    const getLocation = (
      node: TSESTree.Identifier | TSESTree.JSXIdentifier | TSESTree.MemberExpression,
    ): TSESTree.SourceLocation => {
      const token = sourceCode.getTokenAfter(node);

      return { start: node.loc.start, end: token?.loc.end ?? node.loc.start };
    };

    /**
     * Enforces `module.exports`.
     * This warns references of `exports`.
     *
     * @returns {void}
     */
    const enforceModuleExports = (): void => {
      const globalScope = context.getScope();
      const exportsNodes = getExportsNodes(globalScope);
      const assignList = batchAssignAllowed ? createAssignmentList(getModuleExportsNodes(globalScope)) : [];

      exportsNodes.forEach((node) => {
        if (assignList.length > 0 && assignList.includes(getTopAssignment(node) as TSESTree.Node)) {
          return;
        }

        // Report.
        context.report({
          node,
          loc: getLocation(node),
          messageId: 'exportsAccess',
          data: { bad: 'exports', good: 'module.exports' },
        });
      });
    };

    /**
     * Enforces `exports`.
     * This warns references of `module.exports`.
     *
     * @returns {void}
     */
    const enforceExports = (): void => {
      const globalScope = context.getScope();
      const exportsNodes = getExportsNodes(globalScope);
      const moduleExportsNodes = getModuleExportsNodes(globalScope);
      const assignList = batchAssignAllowed ? createAssignmentList(exportsNodes) : [];
      const batchAssignList: TSESTree.Node[] = [];

      moduleExportsNodes.forEach((node) => {
        // Skip if it's a batch assignment.
        if (assignList.length > 0) {
          const found = assignList.indexOf(getTopAssignment(node) as TSESTree.Node);

          if (found !== -1) {
            batchAssignList.push(assignList[found]);
            assignList.splice(found, 1);

            return;
          }
        }

        // Report.
        context.report({
          node,
          loc: getLocation(node),
          messageId: 'exportsAccess',
          data: { bad: 'module.exports', good: 'exports' },
          fix: (fixer) => fixModuleExports(node, sourceCode, fixer),
        });
      });

      // Disallow direct assignment to `exports`.
      exportsNodes.forEach((node) => {
        // Skip if it's not assignee, or if it's a batch assignment.
        if (!isAssignee(node) || batchAssignList.includes(getTopAssignment(node) as TSESTree.Node)) {
          return;
        }

        // Report.
        context.report({ node, loc: getLocation(node), messageId: 'exportsAssignment' });
      });
    };

    return {
      'Program:exit'() {
        switch (mode) {
          case 'module.exports':
            enforceModuleExports();
            break;
          case 'exports':
            enforceExports();
            break;

          // no default
        }
      },
    };
  },
});
