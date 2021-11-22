/* eslint-disable max-lines */
import { ASTUtils } from '@typescript-eslint/experimental-utils';
import type { TSESLint } from '@typescript-eslint/experimental-utils';
import type { TSESTree } from '@typescript-eslint/typescript-estree';
import eslintPluginEs from 'eslint-plugin-es-roikoren';
import type { Range } from 'semver';

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
  supported?: string;
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
  modules: { ruleId: 'no-modules', cases: [{ messageId: 'no-modules' }] },
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
  dynamicImport: { ruleId: 'no-dynamic-import', cases: [{ messageId: 'no-dynamic-import' }] },
  optionalChaining: {
    ruleId: 'no-optional-chaining',
    cases: [{ supported: '14.0.0', messageId: 'no-optional-chaining' }],
  },
  nullishCoalescingOperators: {
    ruleId: 'no-nullish-coalescing-operators',
    cases: [{ supported: '14.0.0', messageId: 'no-nullish-coalescing-operators' }],
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
  const isNotSupportingVersion = (aCase: ICase): boolean =>
    !aCase.supported || options.version.intersects(getSemverRange(`<${aCase.supported}`) as Range);

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
      'no-arrow-functions':
        "Arrow functions are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-binary-numeric-literals':
        "Binary numeric literals are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-block-scoped-functions-strict':
        "Block-scoped functions in strict mode are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-block-scoped-functions-sloppy':
        "Block-scoped functions in non-strict mode are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-block-scoped-variables-strict':
        "Block-scoped variables in strict mode are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-block-scoped-variables-sloppy':
        "Block-scoped variables in non-strict mode are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-classes-strict':
        "Classes in strict mode are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-classes-sloppy':
        "Classes in non-strict mode are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-computed-properties':
        "Computed properties are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-default-parameters':
        "Default parameters are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-destructuring':
        "Destructuring is not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-for-of-loops':
        "'for-of' loops are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-generators':
        "Generator functions are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-modules': 'Import and export declarations are not supported yet.',
      'no-new-target':
        "'new.target' is not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-object-super-properties':
        "'super' in object literals is not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-octal-numeric-literals':
        "Octal numeric literals are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-property-shorthands':
        "Property shorthands are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-property-shorthands-getset':
        "Property shorthands of 'get' and 'set' are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-regexp-u-flag':
        "RegExp 'u' flag is not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-regexp-y-flag':
        "RegExp 'y' flag is not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-rest-parameters':
        "Rest parameters are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-spread-elements':
        "Spread elements are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-template-literals':
        "Template literals are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-unicode-codepoint-escapes':
        "Unicode code point escapes are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",

      // ------------------------------------------------------------------
      // ES2016
      // ------------------------------------------------------------------
      'no-exponential-operators':
        "Exponential operators are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",

      // ------------------------------------------------------------------
      // ES2017
      // ------------------------------------------------------------------
      'no-async-functions':
        "Async functions are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-trailing-function-commas':
        "Trailing commas in function syntax are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",

      // ------------------------------------------------------------------
      // ES2018
      // ------------------------------------------------------------------
      'no-async-iteration':
        "Async iteration is not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-malformed-template-literals':
        "Malformed template literals are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-regexp-lookbehind-assertions':
        "RegExp lookbehind assertions are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-regexp-named-capture-groups':
        "RegExp named capture groups are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-regexp-s-flag':
        "RegExp 's' flag is not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-regexp-unicode-property-escapes':
        "RegExp Unicode property escapes are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-rest-spread-properties':
        "Rest/spread properties are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",

      // ------------------------------------------------------------------
      // ES2019
      // ------------------------------------------------------------------
      'no-json-superset':
        "'\\u{{code}}' in string literals is not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-optional-catch-binding':
        "The omission of 'catch' binding is not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",

      // ------------------------------------------------------------------
      // ES2020
      // ------------------------------------------------------------------
      'no-bigint':
        "Bigint literals are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-bigint-property-names': 'Bigint literal property names are not supported yet.',
      'no-dynamic-import': "'import()' expressions are not supported yet.",
      'no-optional-chaining':
        "Optional chainings are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
      'no-nullish-coalescing-operators':
        "Nullish coalescing operators are not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
    },
  },
  defaultOptions: [{}],
  create(context, options) {
    return defineVisitor(context, parseOptions(context, options));
  },
});
