import type { TSESTree } from '@typescript-eslint/typescript-estree';

import { createRule } from '../util/create-rule';

// This list is generated using:
//     `require("module").builtinModules`
//
// This was last updated using Node v13.8.0.
const BUILTIN_MODULES = new Set([
  '_http_agent',
  '_http_client',
  '_http_common',
  '_http_incoming',
  '_http_outgoing',
  '_http_server',
  '_stream_duplex',
  '_stream_passthrough',
  '_stream_readable',
  '_stream_transform',
  '_stream_wrap',
  '_stream_writable',
  '_tls_common',
  '_tls_wrap',
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'worker_threads',
  'zlib',
]);

const DECL_REQUIRE = 'require';
const DECL_UNINITIALIZED = 'uninitialized';
const DECL_OTHER = 'other';

const REQ_CORE = 'core';
const REQ_FILE = 'file';
const REQ_MODULE = 'module';
const REQ_COMPUTED = 'computed';

/**
 * Determines the type of a declaration statement.
 * @param {boolean} allowCall Should call be allowed.
 * @param {TSESTree.Expression|null} initExpression The init node of the VariableDeclarator.
 * @returns {string} The type of declaration represented by the expression.
 */
const getDeclarationType = (allowCall: boolean, initExpression: TSESTree.Expression | null): string => {
  if (!initExpression) {
    // "var x;"
    return DECL_UNINITIALIZED;
  }

  if (
    initExpression.type === 'CallExpression' &&
    initExpression.callee.type === 'Identifier' &&
    initExpression.callee.name === 'require'
  ) {
    // "var x = require('util');"
    return DECL_REQUIRE;
  }

  if (allowCall && initExpression.type === 'CallExpression' && initExpression.callee.type === 'CallExpression') {
    // "var x = require('diagnose')('sub-module');"
    return getDeclarationType(true, initExpression.callee);
  }

  if (initExpression.type === 'MemberExpression') {
    // "var x = require('glob').Glob;"
    return getDeclarationType(allowCall, initExpression.object);
  }

  // "var x = 42;"
  return DECL_OTHER;
};

/**
 * Determines the type of module that is loaded via require.
 * @param {TSESTree.Node} initExpression The init node of the VariableDeclarator.
 * @returns {string} The module type.
 */
const inferModuleType = (initExpression: TSESTree.CallExpression | TSESTree.MemberExpression | null): string => {
  if (initExpression?.type === 'MemberExpression') {
    // "var x = require('glob').Glob;"
    return inferModuleType(initExpression.object as TSESTree.CallExpression);
  }

  if (!initExpression?.arguments.length) {
    // "var x = require();"
    return REQ_COMPUTED;
  }

  const [arg] = initExpression.arguments;

  if (arg.type !== 'Literal' || typeof arg.value !== 'string') {
    // "var x = require(42);"
    return REQ_COMPUTED;
  }

  if (BUILTIN_MODULES.has(arg.value)) {
    // "var fs = require('fs');"
    return REQ_CORE;
  }

  if (/^\.{0,2}\//u.test(arg.value)) {
    // "var utils = require('./utils');"
    return REQ_FILE;
  }

  // "var async = require('async');"
  return REQ_MODULE;
};

/**
 * Check if the list of variable declarations is mixed, i.e. whether it
 * contains both require and other declarations.
 * @param {boolean} allowCall Should call be allowed.
 * @param {TSESTree.VariableDeclarator[]} declarations The list of VariableDeclarators.
 * @returns {boolean} True if the declarations are mixed, false if not.
 */
const isMixed = (allowCall: boolean, declarations: TSESTree.VariableDeclarator[]): boolean => {
  const contains: Record<string, true> = {};

  for (const declaration of declarations) {
    const type = getDeclarationType(allowCall, declaration.init);

    contains[type] = true;
  }

  return Boolean(contains[DECL_REQUIRE] && (contains[DECL_UNINITIALIZED] || contains[DECL_OTHER]));
};

/**
 * Check if all require declarations in the given list are of the same
 * type.
 * @param {boolean} allowCall Should call be allowed.
 * @param {TSESTree.VariableDeclarator[]} declarations The list of VariableDeclarators.
 * @returns {boolean} True if the declarations are grouped, false if not.
 */
const isGrouped = (allowCall: boolean, declarations: TSESTree.VariableDeclarator[]): boolean => {
  const found: Record<string, true> = {};

  for (const declaration of declarations) {
    if (getDeclarationType(allowCall, declaration.init) === DECL_REQUIRE) {
      found[inferModuleType(declaration.init as TSESTree.CallExpression)] = true;
    }
  }

  return Object.keys(found).length <= 1;
};

export interface IOptions {
  grouping?: boolean;
  allowCall?: boolean;
}

export const category = 'Stylistic Issues';
export default createRule<[options: IOptions], 'noMixCoreModuleFileComputed' | 'noMixRequire'>({
  name: 'no-mixed-requires',
  meta: {
    type: 'suggestion',
    docs: { description: 'disallow `require` calls to be mixed with regular variable declarations', recommended: false },
    schema: [
      {
        type: 'object',
        properties: { grouping: { type: 'boolean' }, allowCall: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
    messages: {
      noMixCoreModuleFileComputed: 'Do not mix core, module, file and computed requires.',
      noMixRequire: "Do not mix 'require' and other declarations.",
    },
  },
  defaultOptions: [{ grouping: false, allowCall: false }],
  create(context, appliedOptions) {
    const [options] = appliedOptions;
    let grouping = false;
    let allowCall = false;

    if (typeof options === 'object') {
      ({ grouping, allowCall } = options as Required<IOptions>);
    }

    return {
      VariableDeclaration(node) {
        if (isMixed(allowCall, node.declarations)) {
          context.report({ node, messageId: 'noMixRequire' });
        } else if (grouping && !isGrouped(allowCall, node.declarations)) {
          context.report({ node, messageId: 'noMixCoreModuleFileComputed' });
        }
      },
    };
  },
});
