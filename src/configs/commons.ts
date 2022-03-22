import type { TSESLint } from '@typescript-eslint/utils';

export const commonGlobals: NonNullable<TSESLint.Linter.Config['globals']> = {
  // ECMAScript
  ArrayBuffer: 'readonly',
  Atomics: 'readonly',
  BigInt: 'readonly',
  BigInt64Array: 'readonly',
  BigUint64Array: 'readonly',
  DataView: 'readonly',
  Float32Array: 'readonly',
  Float64Array: 'readonly',
  Int16Array: 'readonly',
  Int32Array: 'readonly',
  Int8Array: 'readonly',
  Map: 'readonly',
  Promise: 'readonly',
  Proxy: 'readonly',
  Reflect: 'readonly',
  Set: 'readonly',
  SharedArrayBuffer: 'readonly',
  Symbol: 'readonly',
  Uint16Array: 'readonly',
  Uint32Array: 'readonly',
  Uint8Array: 'readonly',
  Uint8ClampedArray: 'readonly',
  WeakMap: 'readonly',
  WeakSet: 'readonly',

  // ECMAScript (experimental)
  globalThis: 'readonly',

  // ECMA-402
  Intl: 'readonly',

  // Web Standard
  TextDecoder: 'readonly',
  TextEncoder: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  WebAssembly: 'readonly',
  clearInterval: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  queueMicrotask: 'readonly',
  setInterval: 'readonly',
  setTimeout: 'readonly',

  // Node.js
  Buffer: 'readonly',
  GLOBAL: 'readonly',
  clearImmediate: 'readonly',
  global: 'readonly',
  process: 'readonly',
  root: 'readonly',
  setImmediate: 'readonly',
};

export const commonRules: NonNullable<TSESLint.Linter.Config['rules']> = {
  'node-roikoren/no-deprecated-api': 'error',
  'node-roikoren/no-extraneous-import': 'error',
  'node-roikoren/no-extraneous-require': 'error',
  'node-roikoren/no-exports-assign': 'error',
  'node-roikoren/no-missing-import': 'error',
  'node-roikoren/no-missing-require': 'error',
  'node-roikoren/no-process-exit': 'error',
  'node-roikoren/no-unpublished-bin': 'error',
  'node-roikoren/no-unpublished-import': 'error',
  'node-roikoren/no-unpublished-require': 'error',
  'node-roikoren/no-unsupported-features/es-builtins': 'error',
  'node-roikoren/no-unsupported-features/es-syntax': 'error',
  'node-roikoren/no-unsupported-features/node-builtins': 'error',
  'node-roikoren/process-exit-as-throw': 'error',
  'node-roikoren/shebang': 'error',
};
