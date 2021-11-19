import { ASTUtils } from '@typescript-eslint/experimental-utils';

import type { IRawOptions } from '../../util/check-unsupported-builtins';
import { checkUnsupportedBuiltins } from '../../util/check-unsupported-builtins';
import { createRule } from '../../util/create-rule';
import { enumeratePropertyNames } from '../../util/enumerate-property-names';

const modules = {
  assert: {
    strict: {
      [ASTUtils.ReferenceTracker.READ]: { supported: '9.9.0', backported: ['8.13.0'] },
      doesNotReject: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
      rejects: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
    },
    deepStrictEqual: { [ASTUtils.ReferenceTracker.READ]: { supported: '4.0.0' } },
    doesNotReject: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
    notDeepStrictEqual: { [ASTUtils.ReferenceTracker.READ]: { supported: '4.0.0' } },
    rejects: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
    CallTracker: { [ASTUtils.ReferenceTracker.READ]: { experimental: '14.2.0' } },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  async_hooks: {
    [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' },
    createHook: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.1.0' } },
    AsyncLocalStorage: { [ASTUtils.ReferenceTracker.READ]: { supported: '13.10.0', backported: ['12.17.0'] } },
  },
  buffer: {
    Buffer: {
      alloc: { [ASTUtils.ReferenceTracker.READ]: { supported: '4.5.0' } },
      allocUnsafe: { [ASTUtils.ReferenceTracker.READ]: { supported: '4.5.0' } },
      allocUnsafeSlow: { [ASTUtils.ReferenceTracker.READ]: { supported: '4.5.0' } },
      from: { [ASTUtils.ReferenceTracker.READ]: { supported: '4.5.0' } },
    },
    kMaxLength: { [ASTUtils.ReferenceTracker.READ]: { supported: '3.0.0' } },
    transcode: { [ASTUtils.ReferenceTracker.READ]: { supported: '7.1.0' } },
    constants: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.2.0' } },
    Blob: { [ASTUtils.ReferenceTracker.READ]: { experimental: '15.7.0' } },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  child_process: { ChildProcess: { [ASTUtils.ReferenceTracker.READ]: { supported: '2.2.0' } } },
  console: {
    clear: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.3.0', backported: ['6.13.0'] } },
    count: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.3.0', backported: ['6.13.0'] } },
    countReset: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.3.0', backported: ['6.13.0'] } },
    debug: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    dirxml: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    group: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.5.0' } },
    groupCollapsed: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.5.0' } },
    groupEnd: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.5.0' } },
    table: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
    markTimeline: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    profile: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    profileEnd: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    timeLog: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.7.0' } },
    timeStamp: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    timeline: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    timelineEnd: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
  },
  crypto: {
    Certificate: {
      exportChallenge: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.0.0' } },
      exportPublicKey: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.0.0' } },
      verifySpkac: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.0.0' } },
    },
    ECDH: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.8.0', backported: ['6.13.0'] } },
    KeyObject: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.6.0' } },
    createPrivateKey: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.6.0' } },
    createPublicKey: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.6.0' } },
    createSecretKey: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.6.0' } },
    constants: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.3.0' } },
    fips: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.0.0' } },
    generateKeyPair: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.12.0' } },
    generateKeyPairSync: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.12.0' } },
    getCurves: { [ASTUtils.ReferenceTracker.READ]: { supported: '2.3.0' } },
    getFips: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
    privateEncrypt: { [ASTUtils.ReferenceTracker.READ]: { supported: '1.1.0' } },
    publicDecrypt: { [ASTUtils.ReferenceTracker.READ]: { supported: '1.1.0' } },
    randomFillSync: { [ASTUtils.ReferenceTracker.READ]: { supported: '7.10.0', backported: ['6.13.0'] } },
    randomFill: { [ASTUtils.ReferenceTracker.READ]: { supported: '7.10.0', backported: ['6.13.0'] } },
    scrypt: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.5.0' } },
    scryptSync: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.5.0' } },
    setFips: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
    sign: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.0.0' } },
    timingSafeEqual: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.6.0' } },
    verify: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.0.0' } },
  },
  dns: {
    Resolver: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.3.0' } },
    resolvePtr: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.0.0' } },
    promises: {
      [ASTUtils.ReferenceTracker.READ]: { supported: '11.14.0', backported: ['10.17.0'], experimental: '10.6.0' },
    },
  },
  events: {
    EventEmitter: { once: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.13.0', backported: ['10.16.0'] } } },
    once: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.13.0', backported: ['10.16.0'] } },
  },
  fs: {
    Dirent: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.10.0' } },
    copyFile: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.5.0' } },
    copyFileSync: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.5.0' } },
    mkdtemp: { [ASTUtils.ReferenceTracker.READ]: { supported: '5.10.0' } },
    mkdtempSync: { [ASTUtils.ReferenceTracker.READ]: { supported: '5.10.0' } },
    realpath: { native: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.2.0' } } },
    realpathSync: { native: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.2.0' } } },
    promises: {
      [ASTUtils.ReferenceTracker.READ]: { supported: '11.14.0', backported: ['10.17.0'], experimental: '10.1.0' },
    },
    writev: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.9.0' } },
    writevSync: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.9.0' } },
    readv: { [ASTUtils.ReferenceTracker.READ]: { supported: '13.13.0', backported: ['12.17.0'] } },
    readvSync: { [ASTUtils.ReferenceTracker.READ]: { supported: '13.13.0', backported: ['12.17.0'] } },
    lutimes: { [ASTUtils.ReferenceTracker.READ]: { supported: '14.5.0', backported: ['12.19.0'] } },
    lutimesSync: { [ASTUtils.ReferenceTracker.READ]: { supported: '14.5.0', backported: ['12.19.0'] } },
    opendir: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.12.0' } },
    opendirSync: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.12.0' } },
    rm: { [ASTUtils.ReferenceTracker.READ]: { supported: '14.14.0' } },
    rmSync: { [ASTUtils.ReferenceTracker.READ]: { supported: '14.14.0' } },
    read: { [ASTUtils.ReferenceTracker.READ]: { supported: '13.11.0', backported: ['12.17.0'] } },
    readSync: { [ASTUtils.ReferenceTracker.READ]: { supported: '13.11.0', backported: ['12.17.0'] } },
    Dir: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.12.0' } },
    StatWatcher: { [ASTUtils.ReferenceTracker.READ]: { supported: '14.3.0', backported: ['12.20.0'] } },
  },
  'fs/promises': { [ASTUtils.ReferenceTracker.READ]: { supported: '14.0.0' } },
  http2: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.10.0', backported: ['8.13.0'], experimental: '8.4.0' } },
  inspector: { [ASTUtils.ReferenceTracker.READ]: { experimental: '8.0.0' } },
  module: {
    Module: {
      builtinModules: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.3.0', backported: ['6.13.0', '8.10.0'] } },
      createRequireFromPath: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.12.0' } },
      createRequire: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.2.0' } },
      syncBuiltinESMExports: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.12.0' } },
    },
    builtinModules: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.3.0', backported: ['6.13.0', '8.10.0'] } },
    createRequireFromPath: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.12.0' } },
    createRequire: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.2.0' } },
    syncBuiltinESMExports: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.12.0' } },
  },
  os: {
    constants: {
      [ASTUtils.ReferenceTracker.READ]: { supported: '6.3.0' },
      priority: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.10.0' } },
    },
    getPriority: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.10.0' } },
    homedir: { [ASTUtils.ReferenceTracker.READ]: { supported: '2.3.0' } },
    setPriority: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.10.0' } },
    userInfo: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.0.0' } },
  },
  path: { toNamespacedPath: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.0.0' } } },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  perf_hooks: {
    [ASTUtils.ReferenceTracker.READ]: { supported: '8.5.0' },
    monitorEventLoopDelay: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.10.0' } },
  },
  process: {
    allowedNodeEnvironmentFlags: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.10.0' } },
    argv0: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.4.0' } },
    channel: { [ASTUtils.ReferenceTracker.READ]: { supported: '7.1.0' } },
    cpuUsage: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.1.0' } },
    emitWarning: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.0.0' } },
    getegid: { [ASTUtils.ReferenceTracker.READ]: { supported: '2.0.0' } },
    geteuid: { [ASTUtils.ReferenceTracker.READ]: { supported: '2.0.0' } },
    hasUncaughtExceptionCaptureCallback: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.3.0' } },
    hrtime: { bigint: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.7.0' } } },
    ppid: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.2.0', backported: ['6.13.0', '8.10.0'] } },
    release: { [ASTUtils.ReferenceTracker.READ]: { supported: '3.0.0' } },
    report: { [ASTUtils.ReferenceTracker.READ]: { experimental: '11.8.0' } },
    resourceUsage: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.6.0' } },
    setegid: { [ASTUtils.ReferenceTracker.READ]: { supported: '2.0.0' } },
    seteuid: { [ASTUtils.ReferenceTracker.READ]: { supported: '2.0.0' } },
    setUncaughtExceptionCaptureCallback: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.3.0' } },
    stdout: {
      getColorDepth: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.9.0' } },
      hasColor: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.13.0' } },
    },
    stderr: {
      getColorDepth: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.9.0' } },
      hasColor: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.13.0' } },
    },
  },
  stream: {
    Readable: { from: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.3.0', backported: ['10.17.0'] } } },
    finished: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
    pipeline: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  trace_events: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
  url: {
    URL: { [ASTUtils.ReferenceTracker.READ]: { supported: '7.0.0', backported: ['6.13.0'] } },
    URLSearchParams: { [ASTUtils.ReferenceTracker.READ]: { supported: '7.5.0', backported: ['6.13.0'] } },
    domainToASCII: { [ASTUtils.ReferenceTracker.READ]: { supported: '7.4.0' } },
    domainToUnicode: { [ASTUtils.ReferenceTracker.READ]: { supported: '7.4.0' } },
  },
  util: {
    callbackify: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.2.0' } },
    formatWithOptions: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
    getSystemErrorName: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.7.0', backported: ['8.12.0'] } },
    inspect: {
      custom: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.6.0' } },
      defaultOptions: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.4.0' } },
      replDefaults: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.12.0' } },
    },
    isDeepStrictEqual: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.0.0' } },
    promisify: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    TextDecoder: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.9.0', experimental: '8.3.0' } },
    TextEncoder: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.9.0', experimental: '8.3.0' } },
    types: {
      [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' },
      isBoxedPrimitive: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.11.0' } },
    },
  },
  v8: {
    [ASTUtils.ReferenceTracker.READ]: { supported: '1.0.0' },
    DefaultDeserializer: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    DefaultSerializer: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    Deserializer: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    Serializer: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    cachedDataVersionTag: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    deserialize: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    getHeapCodeStatistics: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.8.0' } },
    getHeapSnapshot: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.13.0' } },
    getHeapSpaceStatistics: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.0.0' } },
    serialize: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.0.0' } },
    writeHeapSnapshot: { [ASTUtils.ReferenceTracker.READ]: { supported: '11.13.0' } },
  },
  vm: {
    Module: { [ASTUtils.ReferenceTracker.READ]: { supported: '9.6.0' } },
    compileFunction: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.10.0' } },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  worker_threads: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.11.0', experimental: '10.5.0' } },
};

const globals = {
  Buffer: modules.buffer.Buffer,
  TextDecoder: { ...modules.util.TextDecoder, [ASTUtils.ReferenceTracker.READ]: { supported: '11.0.0' } },
  TextEncoder: { ...modules.util.TextEncoder, [ASTUtils.ReferenceTracker.READ]: { supported: '11.0.0' } },
  URL: { ...modules.url.URL, [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
  URLSearchParams: { ...modules.url.URLSearchParams, [ASTUtils.ReferenceTracker.READ]: { supported: '10.0.0' } },
  console: modules.console,
  process: modules.process,
  queueMicrotask: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.0.0', experimental: '11.0.0' } },
  require: { resolve: { paths: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.9.0' } } } },
};

export const category = 'Possible Errors';
export default createRule<[options: IRawOptions], 'unsupported'>({
  name: 'no-unsupported-features/node-builtins',
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow unsupported Node.js built-in APIs on the specified version',
      recommended: 'error',
    },
    schema: [
      {
        type: 'object',
        properties: {
          version: { type: 'string' },
          ignores: {
            type: 'array',
            items: {
              enum: Array.from(new Set([...enumeratePropertyNames(globals), ...enumeratePropertyNames(modules)])),
            },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unsupported:
        "The '{{name}}' is not supported until Node.js {{supported}}. The configured version range is '{{version}}'.",
    },
  },
  defaultOptions: [{}],
  create(context, options) {
    return {
      'Program:exit'() {
        checkUnsupportedBuiltins(context, options, { modules, globals });
      },
    };
  },
});
