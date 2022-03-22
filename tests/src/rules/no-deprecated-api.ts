/* eslint-disable max-lines */
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-deprecated-api';

interface IErrorOptions {
  name: string;
  version: string;
  module?: true;
  replace?: string;
  type?: AST_NODE_TYPES;
}

const error = ({ name, version, type, replace, module }: IErrorOptions): TSESLint.TestCaseError<'deprecated'> => ({
  messageId: 'deprecated',
  line: 1,
  column: 1,
  data: { name: `'${name}'${module ? ' module' : ''}`, version, replace: replace ? `. Use ${replace} instead` : '' },
  type: type ?? AST_NODE_TYPES.AssignmentExpression,
});

new TSESLint.RuleTester().run('no-deprecated-api', rule, {
  valid: [
    { code: "require('buffer').Buffer", env: { node: true } },
    { code: "foo(require('buffer').Buffer)", env: { node: true } },
    { code: "new (require('another-buffer').Buffer)()", env: { node: true } },
    { code: "var http = require('http'); http.request()", env: { node: true } },
    { code: "var {request} = require('http'); request()", env: { node: true, es6: true } },
    { code: "(s ? require('https') : require('http')).request()", env: { node: true } },
    { code: 'require(HTTP).createClient', env: { node: true } },
    {
      code: "import {Buffer} from 'another-buffer'; new Buffer()",
      parserOptions: { sourceType: 'module' },
      env: { es6: true },
    },
    { code: "import {request} from 'http'; request()", parserOptions: { sourceType: 'module' }, env: { es6: true } },

    // On Node v6.8.0, fs.existsSync revived.
    { code: "require('fs').existsSync;", env: { node: true } },

    // use third parties.
    { code: "require('domain/');", env: { node: true } },
    { code: "import domain from 'domain/';", parserOptions: { sourceType: 'module' }, env: { es6: true } },

    // https://github.com/mysticatea/eslint-plugin-node/issues/55
    { code: "undefinedVar = require('fs')", env: { node: true } },

    // ignore options
    {
      code: "new (require('buffer').Buffer)()",
      options: [{ ignoreModuleItems: ['new buffer.Buffer()'] }],
      env: { node: true },
    },
    { code: "require('buffer').Buffer()", options: [{ ignoreModuleItems: ['buffer.Buffer()'] }], env: { node: true } },
    { code: "require('domain');", options: [{ ignoreModuleItems: ['domain'] }], env: { node: true } },
    {
      code: "require('events').EventEmitter.listenerCount;",
      options: [{ ignoreModuleItems: ['events.EventEmitter.listenerCount'] }],
      env: { node: true },
    },
    {
      code: "require('events').listenerCount;",
      options: [{ ignoreModuleItems: ['events.listenerCount'] }],
      env: { node: true },
    },
    { code: 'new Buffer;', options: [{ ignoreGlobalItems: ['new Buffer()'] }], env: { node: true } },
    { code: 'Buffer();', options: [{ ignoreGlobalItems: ['Buffer()'] }], env: { node: true } },
    { code: 'Intl.v8BreakIterator;', options: [{ ignoreGlobalItems: ['Intl.v8BreakIterator'] }], env: { node: true } },
    {
      code: 'let {env: {NODE_REPL_HISTORY_FILE}} = process;',
      options: [{ ignoreGlobalItems: ['process.env.NODE_REPL_HISTORY_FILE'] }],
      env: { node: true, es6: true },
    },

    // https://github.com/mysticatea/eslint-plugin-node/issues/65
    { code: 'require("domain/")', env: { node: true } },

    // https://github.com/mysticatea/eslint-plugin-node/issues/87
    { code: 'let fs = fs || require("fs")', env: { node: true, es6: true } },
  ],
  invalid: [
    // ----------------------------------------------------------------------
    // Modules
    // ----------------------------------------------------------------------
    {
      code: "new (require('buffer').Buffer)()",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'new buffer.Buffer()',
          version: '6.0.0',
          replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
          type: AST_NODE_TYPES.NewExpression,
        }),
      ],
    },
    {
      code: "require('buffer').Buffer()",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'buffer.Buffer()',
          version: '6.0.0',
          replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
          type: AST_NODE_TYPES.CallExpression,
        }),
      ],
    },
    {
      code: "var b = require('buffer'); new b.Buffer()",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 28,
        },
      ],
    },
    {
      code: "var b = require('buffer'); new b['Buffer']()",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 28,
        },
      ],
    },
    {
      code: "var b = require('buffer'); new b[`Buffer`]()",
      options: [{ version: '6.0.0' }],
      env: { node: true, es6: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 28,
        },
      ],
    },
    {
      code: "var b = require('buffer').Buffer; new b()",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 35,
        },
      ],
    },
    {
      code: "var b; new ((b = require('buffer')).Buffer)(); new b.Buffer()",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 8,
        },
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 48,
        },
      ],
    },
    {
      code: "var {Buffer: b} = require('buffer'); new b()",
      options: [{ version: '6.0.0' }],
      env: { node: true, es6: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 38,
        },
      ],
    },
    {
      code: "var {['Buffer']: b = null} = require('buffer'); new b()",
      options: [{ version: '6.0.0' }],
      env: { node: true, es6: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 49,
        },
      ],
    },
    {
      code: "var {'Buffer': b = null} = require('buffer'); new b()",
      options: [{ version: '6.0.0' }],
      env: { node: true, es6: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 47,
        },
      ],
    },
    {
      code: "var {Buffer: b = require('buffer').Buffer} = {}; new b()",
      options: [{ version: '6.0.0' }],
      env: { node: true, es6: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 50,
        },
      ],
    },
    {
      code: "require('buffer').SlowBuffer",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'buffer.SlowBuffer',
          version: '6.0.0',
          replace: "'buffer.Buffer.allocUnsafeSlow()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "var b = require('buffer'); b.SlowBuffer",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        {
          ...error({
            name: 'buffer.SlowBuffer',
            version: '6.0.0',
            replace: "'buffer.Buffer.allocUnsafeSlow()'",
            type: AST_NODE_TYPES.MemberExpression,
          }),
          column: 28,
        },
      ],
    },
    {
      code: "var {SlowBuffer: b} = require('buffer');",
      options: [{ version: '6.0.0' }],
      env: { node: true, es6: true },
      errors: [
        {
          ...error({
            name: 'buffer.SlowBuffer',
            version: '6.0.0',
            replace: "'buffer.Buffer.allocUnsafeSlow()'",
            type: AST_NODE_TYPES.Property,
          }),
          column: 6,
        },
      ],
    },

    // ----------------------------------------------------------------------
    {
      code: "require('_linklist');",
      options: [{ version: '5.0.0' }],
      env: { node: true },
      errors: [error({ name: '_linklist', module: true, version: '5.0.0', type: AST_NODE_TYPES.CallExpression })],
    },
    {
      code: "require('async_hooks').currentId;",
      options: [{ version: '8.2.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'async_hooks.currentId',
          version: '8.2.0',
          replace: "'async_hooks.executionAsyncId()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('async_hooks').triggerId;",
      options: [{ version: '8.2.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'async_hooks.triggerId',
          version: '8.2.0',
          replace: "'async_hooks.triggerAsyncId()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('constants');",
      options: [{ version: '6.3.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'constants',
          module: true,
          version: '6.3.0',
          replace: "'constants' property of each module",
          type: AST_NODE_TYPES.CallExpression,
        }),
      ],
    },
    {
      code: "require('crypto').Credentials;",
      options: [{ version: '0.12.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'crypto.Credentials',
          version: '0.12.0',
          replace: "'tls.SecureContext'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('crypto').createCredentials;",
      options: [{ version: '0.12.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'crypto.createCredentials',
          version: '0.12.0',
          replace: "'tls.createSecureContext()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('domain');",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'domain', module: true, version: '4.0.0', type: AST_NODE_TYPES.CallExpression })],
    },
    {
      code: "require('events').EventEmitter.listenerCount;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'events.EventEmitter.listenerCount',
          version: '4.0.0',
          replace: "'events.EventEmitter#listenerCount()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('events').listenerCount;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'events.listenerCount',
          version: '4.0.0',
          replace: "'events.EventEmitter#listenerCount()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('freelist');",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'freelist', module: true, version: '4.0.0', type: AST_NODE_TYPES.CallExpression })],
    },
    {
      code: "require('fs').SyncWriteStream;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'fs.SyncWriteStream', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('fs').exists;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'fs.exists',
          version: '4.0.0',
          replace: "'fs.stat()' or 'fs.access()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('fs').lchmod;",
      options: [{ version: '0.4.0' }],
      env: { node: true },
      errors: [error({ name: 'fs.lchmod', version: '0.4.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('fs').lchmodSync;",
      options: [{ version: '0.4.0' }],
      env: { node: true },
      errors: [error({ name: 'fs.lchmodSync', version: '0.4.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('http').createClient;",
      options: [{ version: '0.10.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'http.createClient',
          version: '0.10.0',
          replace: "'http.request()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('module').requireRepl;",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'module.requireRepl',
          version: '6.0.0',
          replace: '\'require("repl")\'',
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('module').Module.requireRepl;",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'module.Module.requireRepl',
          version: '6.0.0',
          replace: '\'require("repl")\'',
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('module')._debug;",
      options: [{ version: '9.0.0' }],
      env: { node: true },
      errors: [error({ name: 'module._debug', version: '9.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('module').Module._debug;",
      options: [{ version: '9.0.0' }],
      env: { node: true },
      errors: [error({ name: 'module.Module._debug', version: '9.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('os').getNetworkInterfaces;",
      options: [{ version: '0.6.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'os.getNetworkInterfaces',
          version: '0.6.0',
          replace: "'os.networkInterfaces()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('os').tmpDir;",
      options: [{ version: '7.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'os.tmpDir',
          version: '7.0.0',
          replace: "'os.tmpdir()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('path')._makeLong;",
      options: [{ version: '9.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'path._makeLong',
          version: '9.0.0',
          replace: "'path.toNamespacedPath()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('punycode');",
      options: [{ version: '7.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'punycode',
          module: true,
          version: '7.0.0',
          replace: "'https://www.npmjs.com/package/punycode'",
          type: AST_NODE_TYPES.CallExpression,
        }),
      ],
    },
    {
      code: "require('readline').codePointAt;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'readline.codePointAt', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('readline').getStringWidth;",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [error({ name: 'readline.getStringWidth', version: '6.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('readline').isFullWidthCodePoint;",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({ name: 'readline.isFullWidthCodePoint', version: '6.0.0', type: AST_NODE_TYPES.MemberExpression }),
      ],
    },
    {
      code: "require('readline').stripVTControlCharacters;",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({ name: 'readline.stripVTControlCharacters', version: '6.0.0', type: AST_NODE_TYPES.MemberExpression }),
      ],
    },
    {
      code: "require('sys');",
      options: [{ version: '0.3.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'sys',
          module: true,
          version: '0.3.0',
          replace: "'util' module",
          type: AST_NODE_TYPES.CallExpression,
        }),
      ],
    },
    {
      code: "require('tls').CleartextStream;",
      options: [{ version: '0.10.0' }],
      env: { node: true },
      errors: [error({ name: 'tls.CleartextStream', version: '0.10.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('tls').CryptoStream;",
      options: [{ version: '0.12.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'tls.CryptoStream',
          version: '0.12.0',
          replace: "'tls.TLSSocket'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('tls').SecurePair;",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'tls.SecurePair',
          version: '6.0.0',
          replace: "'tls.TLSSocket'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('tls').createSecurePair;",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'tls.createSecurePair',
          version: '6.0.0',
          replace: "'tls.TLSSocket'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('tls').parseCertString;",
      options: [{ version: '8.6.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'tls.parseCertString',
          version: '8.6.0',
          replace: "'querystring.parse()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('tty').setRawMode;",
      options: [{ version: '0.10.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'tty.setRawMode',
          version: '0.10.0',
          replace: "'tty.ReadStream#setRawMode()' (e.g. 'process.stdin.setRawMode()')",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('util').debug;",
      options: [{ version: '0.12.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'util.debug',
          version: '0.12.0',
          replace: "'console.error()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('util').error;",
      options: [{ version: '0.12.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'util.error',
          version: '0.12.0',
          replace: "'console.error()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('util').isArray;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'util.isArray',
          version: '4.0.0',
          replace: "'Array.isArray()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('util').isBoolean;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isBoolean', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isBuffer;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'util.isBuffer',
          version: '4.0.0',
          replace: "'Buffer.isBuffer()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('util').isDate;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isDate', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isError;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isError', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isFunction;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isFunction', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isNull;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isNull', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isNullOrUndefined;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isNullOrUndefined', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isNumber;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isNumber', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isObject;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isObject', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isPrimitive;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isPrimitive', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isRegExp;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isRegExp', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isString;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isString', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isSymbol;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isSymbol', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').isUndefined;",
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [error({ name: 'util.isUndefined', version: '4.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: "require('util').log;",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'util.log',
          version: '6.0.0',
          replace: 'a third party module',
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('util').print;",
      options: [{ version: '0.12.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'util.print',
          version: '0.12.0',
          replace: "'console.log()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('util').pump;",
      options: [{ version: '0.10.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'util.pump',
          version: '0.10.0',
          replace: "'stream.Readable#pipe()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('util').puts;",
      options: [{ version: '0.12.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'util.puts',
          version: '0.12.0',
          replace: "'console.log()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('util')._extend;",
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'util._extend',
          version: '6.0.0',
          replace: "'Object.assign()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: "require('vm').runInDebugContext;",
      options: [{ version: '8.0.0' }],
      env: { node: true },
      errors: [error({ name: 'vm.runInDebugContext', version: '8.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },

    // ES2015 Modules
    {
      code: "import b from 'buffer'; new b.Buffer()",
      options: [{ version: '6.0.0' }],
      parserOptions: { sourceType: 'module' },
      env: { es6: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 25,
        },
      ],
    },
    {
      code: "import * as b from 'buffer'; new b.Buffer()",
      options: [{ version: '6.0.0' }],
      parserOptions: { sourceType: 'module' },
      env: { es6: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 30,
        },
      ],
    },
    {
      code: "import * as b from 'buffer'; new b.default.Buffer()",
      options: [{ version: '6.0.0' }],
      parserOptions: { sourceType: 'module' },
      env: { es6: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 30,
        },
      ],
    },
    {
      code: "import {Buffer as b} from 'buffer'; new b()",
      options: [{ version: '6.0.0' }],
      parserOptions: { sourceType: 'module' },
      env: { es6: true },
      errors: [
        {
          ...error({
            name: 'new buffer.Buffer()',
            version: '6.0.0',
            replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
            type: AST_NODE_TYPES.NewExpression,
          }),
          column: 37,
        },
      ],
    },
    {
      code: "import b from 'buffer'; b.SlowBuffer",
      options: [{ version: '6.0.0' }],
      parserOptions: { sourceType: 'module' },
      env: { es6: true },
      errors: [
        {
          ...error({
            name: 'buffer.SlowBuffer',
            version: '6.0.0',
            replace: "'buffer.Buffer.allocUnsafeSlow()'",
            type: AST_NODE_TYPES.MemberExpression,
          }),
          column: 25,
        },
      ],
    },
    {
      code: "import * as b from 'buffer'; b.SlowBuffer",
      options: [{ version: '6.0.0' }],
      parserOptions: { sourceType: 'module' },
      env: { es6: true },
      errors: [
        {
          ...error({
            name: 'buffer.SlowBuffer',
            version: '6.0.0',
            replace: "'buffer.Buffer.allocUnsafeSlow()'",
            type: AST_NODE_TYPES.MemberExpression,
          }),
          column: 30,
        },
      ],
    },
    {
      code: "import * as b from 'buffer'; b.default.SlowBuffer",
      options: [{ version: '6.0.0' }],
      parserOptions: { sourceType: 'module' },
      env: { es6: true },
      errors: [
        {
          ...error({
            name: 'buffer.SlowBuffer',
            version: '6.0.0',
            replace: "'buffer.Buffer.allocUnsafeSlow()'",
            type: AST_NODE_TYPES.MemberExpression,
          }),
          column: 30,
        },
      ],
    },
    {
      code: "import {SlowBuffer as b} from 'buffer';",
      options: [{ version: '6.0.0' }],
      parserOptions: { sourceType: 'module' },
      env: { es6: true },
      errors: [
        {
          ...error({
            name: 'buffer.SlowBuffer',
            version: '6.0.0',
            replace: "'buffer.Buffer.allocUnsafeSlow()'",
            type: AST_NODE_TYPES.ImportSpecifier,
          }),
          column: 9,
        },
      ],
    },
    {
      code: "import domain from 'domain';",
      options: [{ version: '4.0.0' }],
      parserOptions: { sourceType: 'module' },
      env: { es6: true },
      errors: [error({ name: 'domain', module: true, version: '4.0.0', type: AST_NODE_TYPES.ImportDeclaration })],
    },

    {
      code: "new (require('buffer').Buffer)()",
      options: [
        { ignoreModuleItems: ['buffer.Buffer()'], ignoreGlobalItems: ['Buffer()', 'new Buffer()'], version: '6.0.0' },
      ],
      env: { node: true },
      errors: [
        error({
          name: 'new buffer.Buffer()',
          version: '6.0.0',
          replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
          type: AST_NODE_TYPES.NewExpression,
        }),
      ],
    },
    {
      code: "require('buffer').Buffer()",
      options: [
        {
          ignoreModuleItems: ['new buffer.Buffer()'],
          ignoreGlobalItems: ['Buffer()', 'new Buffer()'],
          version: '6.0.0',
        },
      ],
      env: { node: true },
      errors: [
        error({
          name: 'buffer.Buffer()',
          version: '6.0.0',
          replace: "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
          type: AST_NODE_TYPES.CallExpression,
        }),
      ],
    },
    {
      code: "require('module').createRequireFromPath()",
      options: [{ version: '12.0.0' }],
      env: { node: true },
      errors: [
        error({ name: 'module.createRequireFromPath', version: '12.2.0', type: AST_NODE_TYPES.MemberExpression }),
      ],
    },
    {
      code: "require('module').createRequireFromPath()",
      options: [{ version: '12.2.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'module.createRequireFromPath',
          version: '12.2.0',
          replace: "'module.createRequire()'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },

    // ----------------------------------------------------------------------
    // Global Variables
    // ----------------------------------------------------------------------
    {
      code: 'new Buffer;',
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'new Buffer()',
          version: '6.0.0',
          replace: "'Buffer.alloc()' or 'Buffer.from()'",
          type: AST_NODE_TYPES.NewExpression,
        }),
      ],
    },
    {
      code: 'Buffer();',
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'Buffer()',
          version: '6.0.0',
          replace: "'Buffer.alloc()' or 'Buffer.from()'",
          type: AST_NODE_TYPES.CallExpression,
        }),
      ],
    },
    {
      code: 'GLOBAL; /*globals GLOBAL*/',
      options: [{ version: '6.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'GLOBAL',
          version: '6.0.0',
          replace: "'global'",
          type: AST_NODE_TYPES.Identifier,
        }),
      ],
    },
    {
      code: 'Intl.v8BreakIterator;',
      options: [{ version: '7.0.0' }],
      env: { node: true },
      errors: [error({ name: 'Intl.v8BreakIterator', version: '7.0.0', type: AST_NODE_TYPES.MemberExpression })],
    },
    {
      code: 'require.extensions;',
      options: [{ version: '0.12.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'require.extensions',
          version: '0.12.0',
          replace: 'compiling them ahead of time',
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: 'root;',
      options: [{ version: '6.0.0' }],
      globals: { root: 'readonly' },
      env: { node: true },
      errors: [error({ name: 'root', version: '6.0.0', replace: "'global'", type: AST_NODE_TYPES.Identifier })],
    },
    {
      code: 'process.EventEmitter;',
      options: [{ version: '0.6.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'process.EventEmitter',
          version: '0.6.0',
          replace: '\'require("events")\'',
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: 'process.env.NODE_REPL_HISTORY_FILE;',
      options: [{ version: '4.0.0' }],
      env: { node: true },
      errors: [
        error({
          name: 'process.env.NODE_REPL_HISTORY_FILE',
          version: '4.0.0',
          replace: "'NODE_REPL_HISTORY'",
          type: AST_NODE_TYPES.MemberExpression,
        }),
      ],
    },
    {
      code: 'let {env: {NODE_REPL_HISTORY_FILE}} = process;',
      options: [{ version: '4.0.0' }],
      env: { node: true, es6: true },
      errors: [
        {
          ...error({
            name: 'process.env.NODE_REPL_HISTORY_FILE',
            version: '4.0.0',
            replace: "'NODE_REPL_HISTORY'",
            type: AST_NODE_TYPES.Property,
          }),
          column: 12,
        },
      ],
    },

    {
      code: 'new Buffer()',
      options: [
        {
          ignoreModuleItems: ['buffer.Buffer()', 'new buffer.Buffer()'],
          ignoreGlobalItems: ['Buffer()'],
          version: '6.0.0',
        },
      ],
      env: { node: true },
      errors: [
        error({
          name: 'new Buffer()',
          version: '6.0.0',
          replace: "'Buffer.alloc()' or 'Buffer.from()'",
          type: AST_NODE_TYPES.NewExpression,
        }),
      ],
    },
    {
      code: 'Buffer()',
      options: [
        {
          ignoreModuleItems: ['buffer.Buffer()', 'new buffer.Buffer()'],
          ignoreGlobalItems: ['new Buffer()'],
          version: '6.0.0',
        },
      ],
      env: { node: true },
      errors: [
        error({
          name: 'Buffer()',
          version: '6.0.0',
          replace: "'Buffer.alloc()' or 'Buffer.from()'",
          type: AST_NODE_TYPES.CallExpression,
        }),
      ],
    },
  ],
});
