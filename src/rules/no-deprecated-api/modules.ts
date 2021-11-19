/* eslint-disable max-lines */
import { ASTUtils } from '@typescript-eslint/experimental-utils';

import type { DeprecatedMap } from '../../util/enumerate-property-names';

export const modules: DeprecatedMap = {
  _linklist: { [ASTUtils.ReferenceTracker.READ]: { since: '5.0.0' } },

  // eslint-disable-next-line @typescript-eslint/naming-convention
  _stream_wrap: { [ASTUtils.ReferenceTracker.READ]: { since: '12.0.0' } },

  // eslint-disable-next-line @typescript-eslint/naming-convention
  async_hooks: {
    currentId: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '8.2.0',
        replacedBy: [{ name: "'async_hooks.executionAsyncId()'", supported: '8.1.0' }],
      },
    },
    triggerId: { [ASTUtils.ReferenceTracker.READ]: { since: '8.2.0', replacedBy: "'async_hooks.triggerAsyncId()'" } },
  },
  buffer: {
    Buffer: {
      [ASTUtils.ReferenceTracker.CONSTRUCT]: {
        since: '6.0.0',
        replacedBy: [
          { name: "'buffer.Buffer.alloc()'", supported: '5.10.0' },
          { name: "'buffer.Buffer.from()'", supported: '5.10.0' },
        ],
      },
      [ASTUtils.ReferenceTracker.CALL]: {
        since: '6.0.0',
        replacedBy: [
          { name: "'buffer.Buffer.alloc()'", supported: '5.10.0' },
          { name: "'buffer.Buffer.from()'", supported: '5.10.0' },
        ],
      },
    },
    SlowBuffer: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '6.0.0',
        replacedBy: [{ name: "'buffer.Buffer.allocUnsafeSlow()'", supported: '5.12.0' }],
      },
    },
  },
  constants: { [ASTUtils.ReferenceTracker.READ]: { since: '6.3.0', replacedBy: "'constants' property of each module" } },
  crypto: {
    _toBuf: { [ASTUtils.ReferenceTracker.READ]: { since: '11.0.0' } },
    Credentials: { [ASTUtils.ReferenceTracker.READ]: { since: '0.12.0', replacedBy: "'tls.SecureContext'" } },
    DEFAULT_ENCODING: { [ASTUtils.ReferenceTracker.READ]: { since: '10.0.0' } },
    createCipher: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '10.0.0',
        replacedBy: [{ name: "'crypto.createCipheriv()'", supported: '0.1.94' }],
      },
    },
    createCredentials: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '0.12.0',
        replacedBy: [{ name: "'tls.createSecureContext()'", supported: '0.11.13' }],
      },
    },
    createDecipher: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '10.0.0',
        replacedBy: [{ name: "'crypto.createDecipheriv()'", supported: '0.1.94' }],
      },
    },
    fips: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '10.0.0',
        replacedBy: [{ name: "'crypto.getFips()' and 'crypto.setFips()'", supported: '10.0.0' }],
      },
    },
    prng: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '11.0.0',
        replacedBy: [{ name: "'crypto.randomBytes()'", supported: '0.5.8' }],
      },
    },
    pseudoRandomBytes: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '11.0.0',
        replacedBy: [{ name: "'crypto.randomBytes()'", supported: '0.5.8' }],
      },
    },
    rng: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '11.0.0',
        replacedBy: [{ name: "'crypto.randomBytes()'", supported: '0.5.8' }],
      },
    },
  },
  domain: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
  events: {
    EventEmitter: {
      listenerCount: {
        [ASTUtils.ReferenceTracker.READ]: {
          since: '4.0.0',
          replacedBy: [{ name: "'events.EventEmitter#listenerCount()'", supported: '3.2.0' }],
        },
      },
    },
    listenerCount: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '4.0.0',
        replacedBy: [{ name: "'events.EventEmitter#listenerCount()'", supported: '3.2.0' }],
      },
    },
  },
  freelist: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
  fs: {
    SyncWriteStream: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    exists: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '4.0.0',
        replacedBy: [
          { name: "'fs.stat()'", supported: '0.0.2' },
          { name: "'fs.access()'", supported: '0.11.15' },
        ],
      },
    },
    lchmod: { [ASTUtils.ReferenceTracker.READ]: { since: '0.4.0' } },
    lchmodSync: { [ASTUtils.ReferenceTracker.READ]: { since: '0.4.0' } },
  },
  http: {
    createClient: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '0.10.0',
        replacedBy: [{ name: "'http.request()'", supported: '0.3.6' }],
      },
    },
  },
  module: {
    Module: {
      createRequireFromPath: {
        [ASTUtils.ReferenceTracker.READ]: {
          since: '12.2.0',
          replacedBy: [{ name: "'module.createRequire()'", supported: '12.2.0' }],
        },
      },
      requireRepl: { [ASTUtils.ReferenceTracker.READ]: { since: '6.0.0', replacedBy: '\'require("repl")\'' } },
      _debug: { [ASTUtils.ReferenceTracker.READ]: { since: '9.0.0' } },
    },
    createRequireFromPath: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '12.2.0',
        replacedBy: [{ name: "'module.createRequire()'", supported: '12.2.0' }],
      },
    },
    requireRepl: { [ASTUtils.ReferenceTracker.READ]: { since: '6.0.0', replacedBy: '\'require("repl")\'' } },
    _debug: { [ASTUtils.ReferenceTracker.READ]: { since: '9.0.0' } },
  },
  net: { _setSimultaneousAccepts: { [ASTUtils.ReferenceTracker.READ]: { since: '12.0.0' } } },
  os: {
    getNetworkInterfaces: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '0.6.0',
        replacedBy: [{ name: "'os.networkInterfaces()'", supported: '0.6.0' }],
      },
    },
    tmpDir: {
      [ASTUtils.ReferenceTracker.READ]: { since: '7.0.0', replacedBy: [{ name: "'os.tmpdir()'", supported: '0.9.9' }] },
    },
  },
  path: {
    _makeLong: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '9.0.0',
        replacedBy: [{ name: "'path.toNamespacedPath()'", supported: '9.0.0' }],
      },
    },
  },
  process: {
    EventEmitter: { [ASTUtils.ReferenceTracker.READ]: { since: '0.6.0', replacedBy: '\'require("events")\'' } },
    assert: { [ASTUtils.ReferenceTracker.READ]: { since: '10.0.0', replacedBy: '\'require("assert")\'' } },
    binding: { [ASTUtils.ReferenceTracker.READ]: { since: '10.9.0' } },
    env: {
      NODE_REPL_HISTORY_FILE: {
        [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0', replacedBy: "'NODE_REPL_HISTORY'" },
      },
    },
    report: {
      triggerReport: {
        [ASTUtils.ReferenceTracker.READ]: { since: '11.12.0', replacedBy: "'process.report.writeReport()'" },
      },
    },
  },
  punycode: {
    [ASTUtils.ReferenceTracker.READ]: { since: '7.0.0', replacedBy: "'https://www.npmjs.com/package/punycode'" },
  },
  readline: {
    codePointAt: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    getStringWidth: { [ASTUtils.ReferenceTracker.READ]: { since: '6.0.0' } },
    isFullWidthCodePoint: { [ASTUtils.ReferenceTracker.READ]: { since: '6.0.0' } },
    stripVTControlCharacters: { [ASTUtils.ReferenceTracker.READ]: { since: '6.0.0' } },
  },
  // safe-buffer.Buffer function/constructror is just a re-export of buffer.Buffer
  // and should be deprecated likewise.
  'safe-buffer': {
    Buffer: {
      [ASTUtils.ReferenceTracker.CONSTRUCT]: {
        since: '6.0.0',
        replacedBy: [
          { name: "'buffer.Buffer.alloc()'", supported: '5.10.0' },
          { name: "'buffer.Buffer.from()'", supported: '5.10.0' },
        ],
      },
      [ASTUtils.ReferenceTracker.CALL]: {
        since: '6.0.0',
        replacedBy: [
          { name: "'buffer.Buffer.alloc()'", supported: '5.10.0' },
          { name: "'buffer.Buffer.from()'", supported: '5.10.0' },
        ],
      },
    },
    SlowBuffer: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '6.0.0',
        replacedBy: [{ name: "'buffer.Buffer.allocUnsafeSlow()'", supported: '5.12.0' }],
      },
    },
  },
  sys: { [ASTUtils.ReferenceTracker.READ]: { since: '0.3.0', replacedBy: "'util' module" } },
  timers: {
    enroll: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '10.0.0',
        replacedBy: [
          { name: "'setTimeout()'", supported: '0.0.1' },
          { name: "'setInterval()'", supported: '0.0.1' },
        ],
      },
    },
    unenroll: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '10.0.0',
        replacedBy: [
          { name: "'clearTimeout()'", supported: '0.0.1' },
          { name: "'clearInterval()'", supported: '0.0.1' },
        ],
      },
    },
  },
  tls: {
    CleartextStream: { [ASTUtils.ReferenceTracker.READ]: { since: '0.10.0' } },
    CryptoStream: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '0.12.0',
        replacedBy: [{ name: "'tls.TLSSocket'", supported: '0.11.4' }],
      },
    },
    SecurePair: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '6.0.0',
        replacedBy: [{ name: "'tls.TLSSocket'", supported: '0.11.4' }],
      },
    },
    convertNPNProtocols: { [ASTUtils.ReferenceTracker.READ]: { since: '10.0.0' } },
    createSecurePair: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '6.0.0',
        replacedBy: [{ name: "'tls.TLSSocket'", supported: '0.11.4' }],
      },
    },
    parseCertString: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '8.6.0',
        replacedBy: [{ name: "'querystring.parse()'", supported: '0.1.25' }],
      },
    },
  },
  tty: {
    setRawMode: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '0.10.0',
        replacedBy: "'tty.ReadStream#setRawMode()' (e.g. 'process.stdin.setRawMode()')",
      },
    },
  },
  url: {
    parse: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '11.0.0',
        replacedBy: [{ name: "'url.URL' constructor", supported: '6.13.0' }],
      },
    },
    resolve: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '11.0.0',
        replacedBy: [{ name: "'url.URL' constructor", supported: '6.13.0' }],
      },
    },
  },
  util: {
    debug: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '0.12.0',
        replacedBy: [{ name: "'console.error()'", supported: '0.1.100' }],
      },
    },
    error: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '0.12.0',
        replacedBy: [{ name: "'console.error()'", supported: '0.1.100' }],
      },
    },
    isArray: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '4.0.0',
        replacedBy: [{ name: "'Array.isArray()'", supported: '0.1.100' }],
      },
    },
    isBoolean: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isBuffer: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '4.0.0',
        replacedBy: [{ name: "'Buffer.isBuffer()'", supported: '0.1.101' }],
      },
    },
    isDate: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isError: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isFunction: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isNull: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isNullOrUndefined: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isNumber: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isObject: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isPrimitive: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isRegExp: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isString: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isSymbol: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    isUndefined: { [ASTUtils.ReferenceTracker.READ]: { since: '4.0.0' } },
    log: { [ASTUtils.ReferenceTracker.READ]: { since: '6.0.0', replacedBy: 'a third party module' } },
    print: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '0.12.0',
        replacedBy: [{ name: "'console.log()'", supported: '0.1.100' }],
      },
    },
    pump: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '0.10.0',
        replacedBy: [{ name: "'stream.Readable#pipe()'", supported: '0.9.4' }],
      },
    },
    puts: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '0.12.0',
        replacedBy: [{ name: "'console.log()'", supported: '0.1.100' }],
      },
    },
    _extend: {
      [ASTUtils.ReferenceTracker.READ]: {
        since: '6.0.0',
        replacedBy: [{ name: "'Object.assign()'", supported: '4.0.0' }],
      },
    },
  },
  vm: { runInDebugContext: { [ASTUtils.ReferenceTracker.READ]: { since: '8.0.0' } } },
};
