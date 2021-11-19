import type { TSESLint } from '@typescript-eslint/experimental-utils';
import type { TSESTree } from '@typescript-eslint/typescript-estree';

import { createRule } from '../util/create-rule';

export const category = 'Possible Errors';
export default createRule<[errorArgument: string], 'expected'>({
  name: 'handle-callback-err',
  meta: {
    type: 'suggestion',
    docs: { description: 'require error handling in callbacks', recommended: false },
    schema: [{ type: 'string' }],
    messages: { expected: 'Expected error to be handled.' },
  },
  defaultOptions: ['err'],
  create(context, options) {
    const [errorArgument] = options;

    /**
     * Checks if the given argument should be interpreted as a regexp pattern.
     * @param {string} stringToCheck The string which should be checked.
     * @returns {boolean} Whether or not the string should be interpreted as a pattern.
     */
    const isPattern = (stringToCheck: string): boolean => {
      const [firstChar] = stringToCheck;

      return firstChar === '^';
    };

    /**
     * Checks if the given name matches the configured error argument.
     * @param {string} name The name which should be compared.
     * @returns {boolean} Whether or not the given name matches the configured error variable name.
     */
    const matchesConfiguredErrorName = (name: string): boolean => {
      if (isPattern(errorArgument)) {
        const regexp = new RegExp(errorArgument, 'u');

        return regexp.test(name);
      }

      return name === errorArgument;
    };

    /**
     * Get the parameters of a given function scope.
     * @param {TSESLint.Scope.Scope} scope The function scope.
     * @returns {TSESLint.Scope.Variable[]} All parameters of the given scope.
     */
    const getParameters = (scope: TSESLint.Scope.Scope): TSESLint.Scope.Variable[] =>
      scope.variables.filter((variable) => variable.defs[0] && variable.defs[0].type === 'Parameter');

    /**
     * Check to see if we're handling the error object properly.
     * @param {TSESTree.ArrowFunctionExpression | TSESTree.FunctionDeclaration | TSESTree.FunctionExpression} node The AST node to check.
     * @returns {void}
     */
    const checkForError = (
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ): void => {
      const scope = context.getScope();
      const parameters = getParameters(scope);
      const [firstParameter] = parameters;

      if (firstParameter && matchesConfiguredErrorName(firstParameter.name) && firstParameter.references.length === 0) {
        context.report({ node, messageId: 'expected' });
      }
    };

    return {
      FunctionDeclaration: checkForError,
      FunctionExpression: checkForError,
      ArrowFunctionExpression: checkForError,
    };
  },
});
