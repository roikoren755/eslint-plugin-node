/* eslint-disable max-lines */
import type { TSESTree } from '@typescript-eslint/typescript-estree';
import { ASTUtils } from '@typescript-eslint/utils';
import type { TSESLint } from '@typescript-eslint/utils';
import eslintPluginEs from 'eslint-plugin-es-roikoren';
import { Range } from 'semver';

import type { IRawOptions } from '../../util/check-unsupported-builtins';
import { parseOptions } from '../../util/check-unsupported-builtins';
import { createRule } from '../../util/create-rule';
import { getSemverRange } from '../../util/get-semver-range';
import { mergeVisitorsInPlace } from '../../util/merge-visitors-in-place';

interface INode {
  isStrict: boolean;
  node: TSESTree.Node;
}

interface ICase {
  supported?: Range | string;
  messageId: string;
  isStrict?: boolean;
  test?(aCase: INode): boolean;
}

const getOrSet = /^[gs]et$/u;
const features: Record<string, { ruleId: keyof typeof eslintPluginEs['rules']; cases: ICase[] }> = {
  // --------------------------------------------------------------------------
  // ES2015
  // --------------------------------------------------------------------------
  arrowFunctions: { ruleId: 'no-arrow-functions', cases: [{ supported: '4.0.0', messageId: 'no-arrow-functions' }] },
  binaryNumericLiterals: {
    ruleId: 'no-binary-numeric-literals',
    cases: [{ supported: '4.0.0', messageId: 'no-binary-numeric-literals' }],
  },
  blockScopedFunctions: {
    ruleId: 'no-block-scoped-functions',
    cases: [
      { supported: '6.0.0', test: (info) => !info.isStrict, messageId: 'no-block-scoped-functions-sloppy' },
      { supported: '4.0.0', messageId: 'no-block-scoped-functions-strict' },
    ],
  },
  blockScopedVariables: {
    ruleId: 'no-block-scoped-variables',
    cases: [
      { supported: '6.0.0', test: (info) => !info.isStrict, messageId: 'no-block-scoped-variables-sloppy' },
      { supported: '4.0.0', messageId: 'no-block-scoped-variables-strict' },
    ],
  },
  classes: {
    ruleId: 'no-classes',
    cases: [
      { supported: '6.0.0', test: (info) => !info.isStrict, messageId: 'no-classes-sloppy' },
      { supported: '4.0.0', messageId: 'no-classes-strict' },
    ],
  },
  computedProperties: {
    ruleId: 'no-computed-properties',
    cases: [{ supported: '4.0.0', messageId: 'no-computed-properties' }],
  },
  defaultParameters: {
    ruleId: 'no-default-parameters',
    cases: [{ supported: '6.0.0', messageId: 'no-default-parameters' }],
  },
  destructuring: { ruleId: 'no-destructuring', cases: [{ supported: '6.0.0', messageId: 'no-destructuring' }] },
  forOfLoops: { ruleId: 'no-for-of-loops', cases: [{ supported: '0.12.0', messageId: 'no-for-of-loops' }] },
  generators: { ruleId: 'no-generators', cases: [{ supported: '4.0.0', messageId: 'no-generators' }] },
  modules: { ruleId: 'no-modules', cases: [{ supported: '13.2.0', messageId: 'no-modules' }] },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'new.target': { ruleId: 'no-new-target', cases: [{ supported: '5.0.0', messageId: 'no-new-target' }] },
  objectSuperProperties: {
    ruleId: 'no-object-super-properties',
    cases: [{ supported: '4.0.0', messageId: 'no-object-super-properties' }],
  },
  octalNumericLiterals: {
    ruleId: 'no-octal-numeric-literals',
    cases: [{ supported: '4.0.0', messageId: 'no-octal-numeric-literals' }],
  },
  propertyShorthands: {
    ruleId: 'no-property-shorthands',
    cases: [
      {
        supported: '6.0.0',
        test: (info) =>
          'shorthand' in info.node &&
          info.node.shorthand &&
          'name' in info.node.key &&
          getOrSet.test(info.node.key.name),
        messageId: 'no-property-shorthands-getset',
      },
      { supported: '4.0.0', messageId: 'no-property-shorthands' },
    ],
  },
  regexpU: { ruleId: 'no-regexp-u-flag', cases: [{ supported: '6.0.0', messageId: 'no-regexp-u-flag' }] },
  regexpY: { ruleId: 'no-regexp-y-flag', cases: [{ supported: '6.0.0', messageId: 'no-regexp-y-flag' }] },
  restParameters: { ruleId: 'no-rest-parameters', cases: [{ supported: '6.0.0', messageId: 'no-rest-parameters' }] },
  spreadElements: { ruleId: 'no-spread-elements', cases: [{ supported: '5.0.0', messageId: 'no-spread-elements' }] },
  templateLiterals: {
    ruleId: 'no-template-literals',
    cases: [{ supported: '4.0.0', messageId: 'no-template-literals' }],
  },
  unicodeCodePointEscapes: {
    ruleId: 'no-unicode-codepoint-escapes',
    cases: [{ supported: '4.0.0', messageId: 'no-unicode-codepoint-escapes' }],
  },

  // --------------------------------------------------------------------------
  // ES2016
  // --------------------------------------------------------------------------
  exponentialOperators: {
    ruleId: 'no-exponential-operators',
    cases: [{ supported: '7.0.0', messageId: 'no-exponential-operators' }],
  },

  // --------------------------------------------------------------------------
  // ES2017
  // --------------------------------------------------------------------------
  asyncFunctions: { ruleId: 'no-async-functions', cases: [{ supported: '7.6.0', messageId: 'no-async-functions' }] },
  trailingCommasInFunctions: {
    ruleId: 'no-trailing-function-commas',
    cases: [{ supported: '8.0.0', messageId: 'no-trailing-function-commas' }],
  },

  // --------------------------------------------------------------------------
  // ES2018
  // --------------------------------------------------------------------------
  asyncIteration: { ruleId: 'no-async-iteration', cases: [{ supported: '10.0.0', messageId: 'no-async-iteration' }] },
  malformedTemplateLiterals: {
    ruleId: 'no-malformed-template-literals',
    cases: [{ supported: '8.10.0', messageId: 'no-malformed-template-literals' }],
  },
  regexpLookbehind: {
    ruleId: 'no-regexp-lookbehind-assertions',
    cases: [{ supported: '8.10.0', messageId: 'no-regexp-lookbehind-assertions' }],
  },
  regexpNamedCaptureGroups: {
    ruleId: 'no-regexp-named-capture-groups',
    cases: [{ supported: '10.0.0', messageId: 'no-regexp-named-capture-groups' }],
  },
  regexpS: { ruleId: 'no-regexp-s-flag', cases: [{ supported: '8.10.0', messageId: 'no-regexp-s-flag' }] },
  regexpUnicodeProperties: {
    ruleId: 'no-regexp-unicode-property-escapes',
    cases: [{ supported: '10.0.0', messageId: 'no-regexp-unicode-property-escapes' }],
  },
  restSpreadProperties: {
    ruleId: 'no-rest-spread-properties',
    cases: [{ supported: '8.3.0', messageId: 'no-rest-spread-properties' }],
  },

  // --------------------------------------------------------------------------
  // ES2019
  // --------------------------------------------------------------------------
  jsonSuperset: { ruleId: 'no-json-superset', cases: [{ supported: '10.0.0', messageId: 'no-json-superset' }] },
  optionalCatchBinding: {
    ruleId: 'no-optional-catch-binding',
    cases: [{ supported: '10.0.0', messageId: 'no-optional-catch-binding' }],
  },

  // --------------------------------------------------------------------------
  // ES2020
  // --------------------------------------------------------------------------
  bigint: {
    ruleId: 'no-bigint',
    cases: [
      { supported: '10.4.0', test: (info) => info.node.type === 'Literal', messageId: 'no-bigint' },
      {
        test: ({ node }) =>
          node.type === 'Literal' &&
          (node.parent?.type === 'Property' || node.parent?.type === 'MethodDefinition') &&
          !node.parent.computed &&
          node.parent.key === node,
        messageId: 'no-bigint-property-names',
      },
    ],
  },
  dynamicImport: {
    ruleId: 'no-dynamic-import',
    cases: [{ supported: new Range('>=12.17 <13 || >=13.2'), messageId: 'no-dynamic-import' }],
  },
  optionalChaining: {
    ruleId: 'no-optional-chaining',
    cases: [{ supported: '14.0.0', messageId: 'no-optional-chaining' }],
  },
  nullishCoalescingOperators: {
    ruleId: 'no-nullish-coalescing-operators',
    cases: [{ supported: '14.0.0', messageId: 'no-nullish-coalescing-operators' }],
  },

  // --------------------------------------------------------------------------
  // ES2021
  // --------------------------------------------------------------------------
  logicalAssignmentOperators: {
    ruleId: 'no-logical-assignment-operators',
    cases: [{ supported: '15.0.0', messageId: 'no-logical-assignment-operators' }],
  },
  numericSeparators: {
    ruleId: 'no-numeric-separators',
    cases: [{ supported: '12.5.0', messageId: 'no-numeric-separators' }],
  },
};
const keywords = Object.keys(features);

/**
 * Find the scope that a given node belongs to.
 * @param {TSESLint.Scope.Scope} initialScope The initial scope to find.
 * @param {TSESTree.Node} node The AST node.
 * @returns {TSESLint.Scope.Scope} The scope that the node belongs to.
 */
const normalizeScope = (initialScope: TSESLint.Scope.Scope, node: TSESTree.Node): TSESLint.Scope.Scope => {
  let scope = ASTUtils.getInnermostScope(initialScope, node);

  while (scope?.block === node && scope.upper) {
    scope = scope.upper;
  }

  return scope;
};

/**
 * Define the visitor object as merging the rules of eslint-plugin-es-roikoren.
 * @param {TSESLint.RuleContext<string, readonly unknown[]>} context The rule context.
 * @param {ReturnType<typeof parseOptions>} options The options.
 * @returns {object} The defined visitor.
 */
const defineVisitor = (
  context: TSESLint.RuleContext<string, readonly unknown[]>,
  options: ReturnType<typeof parseOptions>,
): TSESLint.RuleListener => {
  const testInfoPrototype = {
    get isStrict(): boolean {
      return normalizeScope(context.getScope(), this.node).isStrict;
    },
  } as INode;

  /**
   * Check whether a given case object is full-supported on the configured node version.
   * @param {{supported:string}} aCase The case object to check.
   * @returns {boolean} `true` if it's supporting.
   */
  const isNotSupportingVersion = (aCase: ICase): boolean => {
    if (!aCase.supported) {
      return true;
    }

    if (typeof aCase.supported === 'string') {
      return options.version.intersects(getSemverRange(`<${aCase.supported}`) as Range);
    }

    return !options.version.intersects(aCase.supported);
  };

  /**
   * Define the predicate function to check whether a given case object is supported on the configured node version.
   * @param {Node} node The node which is reported.
   * @returns {function(aCase:{supported:string}):boolean} The predicate function.
   */
  const isNotSupportingOn =
    (node: TSESTree.Node): typeof isNotSupportingVersion =>
    (aCase) =>
      // @ts-expect-error - proto does exist, really
      isNotSupportingVersion(aCase) && (!aCase.test || aCase.test({ node, __proto__: testInfoPrototype })); // eslint-disable-line @typescript-eslint/naming-convention

  return (
    keywords
      // Omit full-supported features and ignored features by options
      // because this rule never reports those.
      .filter(
        (keyword) =>
          !options.ignores.has(keyword) && features[keyword].cases.some((aCase) => isNotSupportingVersion(aCase)),
      )
      // Merge remaining features with overriding `context.report()`.
      .reduce<TSESLint.RuleListener>((visitor, keyword) => {
        const { ruleId, cases } = features[keyword];
        const rule = eslintPluginEs.rules[ruleId];
        const thisContext = {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          __proto__: context,

          // Override `context.report()` then:
          // - ignore if it's supported.
          // - override reporting messages.
          report({ fix, ...descriptor }: TSESLint.ReportDescriptor<string>) {
            // Set additional information.
            if (descriptor.data) {
              // @ts-expect-error - don't worry about it
              descriptor.data.version = options.version.raw;
            } else {
              descriptor.data = { version: options.version.raw };
            }

            // Test and report.
            const { node } = descriptor as TSESLint.ReportDescriptor<string> & { node: TSESTree.Node };
            const hitCase = cases.find(isNotSupportingOn(node));

            if (hitCase) {
              descriptor.messageId = hitCase.messageId;
              // @ts-expect-error - don't worry about it
              descriptor.data.supported = hitCase.supported;
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
              super.report(descriptor);
            }
          },
        };

        return mergeVisitorsInPlace(visitor, rule.create(thisContext as never));
      }, {})
  );
};

const getMessage = (name: string, singular?: boolean, notSupported?: boolean): string =>
  `${name} ${singular ? 'is' : 'are'} not supported ${
    notSupported ? 'yet' : "until Node.js {{supported}}. The configured version range is '{{version}}'."
  }`;

export const category = 'Possible Errors';
export default createRule<[options: IRawOptions], string>({
  name: 'no-unsupported-features/es-syntax',
  meta: {
    type: 'problem',
    docs: { description: 'disallow unsupported ECMAScript syntax on the specified version', recommended: 'error' },
    schema: [
      {
        type: 'object',
        properties: {
          version: { type: 'string' },
          ignores: { type: 'array', items: { enum: Object.keys(features) }, uniqueItems: true },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      // ------------------------------------------------------------------
      // ES2015
      // ------------------------------------------------------------------
      /* eslint-disable @typescript-eslint/naming-convention */
      'no-arrow-functions': getMessage('Arrow functions'),
      'no-binary-numeric-literals': getMessage('Binary numeric literals'),
      'no-block-scoped-functions-strict': getMessage('Block-scoped functions in strict mode'),
      'no-block-scoped-functions-sloppy': getMessage('Block-scoped functions in non-strict mode'),
      'no-block-scoped-variables-strict': getMessage('Block-scoped variables in strict mode'),
      'no-block-scoped-variables-sloppy': getMessage('Block-scoped variables in non-strict mode'),
      'no-classes-strict': getMessage('Classes in strict mode'),
      'no-classes-sloppy': getMessage('Classes in non-strict mode'),
      'no-computed-properties': getMessage('Computed properties'),
      'no-default-parameters': getMessage('Default parameters'),
      'no-destructuring': getMessage('Destructuring', true),
      'no-for-of-loops': getMessage("'for-of' loops"),
      'no-generators': getMessage('Generator functions'),
      'no-modules': getMessage('Import and export declarations', false),
      'no-new-target': getMessage("'new.target'", true),
      'no-object-super-properties': getMessage("'super' in object literals", true),
      'no-octal-numeric-literals': getMessage('Octal numeric literals'),
      'no-property-shorthands': getMessage('Property shorthands'),
      'no-property-shorthands-getset': getMessage("Property shorthands of 'get' and 'set'"),
      'no-regexp-u-flag': getMessage("RegExp 'u' flag", true),
      'no-regexp-y-flag': getMessage("RegExp 'y' flag", true),
      'no-rest-parameters': getMessage('Rest parameters'),
      'no-spread-elements': getMessage('Spread elements'),
      'no-template-literals': getMessage('Template literals'),
      'no-unicode-codepoint-escapes': getMessage('Unicode code point escapes'),

      // ------------------------------------------------------------------
      // ES2016
      // ------------------------------------------------------------------
      'no-exponential-operators': getMessage('Exponential operators'),

      // ------------------------------------------------------------------
      // ES2017
      // ------------------------------------------------------------------
      'no-async-functions': getMessage('Async functions'),
      'no-trailing-function-commas': getMessage('Trailing commas in function syntax'),

      // ------------------------------------------------------------------
      // ES2018
      // ------------------------------------------------------------------
      'no-async-iteration': getMessage('Async iteration', true),
      'no-malformed-template-literals': getMessage('Malformed template literals'),
      'no-regexp-lookbehind-assertions': getMessage('RegExp lookbehind assertions'),
      'no-regexp-named-capture-groups': getMessage('RegExp named capture groups'),
      'no-regexp-s-flag': getMessage("RegExp 's' flag", true),
      'no-regexp-unicode-property-escapes': getMessage('RegExp Unicode property escapes'),
      'no-rest-spread-properties': getMessage('Rest/spread properties'),

      // ------------------------------------------------------------------
      // ES2019
      // ------------------------------------------------------------------
      'no-json-superset': getMessage("'\\u{{code}}' in string literals", true),
      'no-optional-catch-binding': getMessage("The omission of 'catch' binding", true),

      // ------------------------------------------------------------------
      // ES2020
      // ------------------------------------------------------------------
      'no-bigint': getMessage('Bigint literals'),
      'no-bigint-property-names': getMessage('Bigint literal property names', false, true),
      'no-dynamic-import': getMessage("'import()' expressions"),
      'no-optional-chaining': getMessage('Optional chainings'),
      'no-nullish-coalescing-operators': getMessage('Nullish coalescing operators'),

      // ------------------------------------------------------------------
      // ES2021
      // ------------------------------------------------------------------
      'no-logical-assignment-operators': getMessage('Logical assignment operators'),
      'no-numeric-separators': getMessage('Numeric separators'),
      /* eslint-enable @typescript-eslint/naming-convention */
    },
  },
  defaultOptions: [{}],
  create(context, options) {
    return defineVisitor(context, parseOptions(context, options));
  },
});
