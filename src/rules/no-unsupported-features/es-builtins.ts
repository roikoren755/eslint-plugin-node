import { ASTUtils } from '@typescript-eslint/experimental-utils';

import { checkUnsupportedBuiltins } from '../../util/check-unsupported-builtins';
import type { IRawOptions, SupportMap } from '../../util/check-unsupported-builtins';
import { createRule } from '../../util/create-rule';
import { enumeratePropertyNames } from '../../util/enumerate-property-names';

const trackMap: { globals: SupportMap } = {
  globals: {
    Array: {
      from: { [ASTUtils.ReferenceTracker.READ]: { supported: '4.0.0' } },
      of: { [ASTUtils.ReferenceTracker.READ]: { supported: '4.0.0' } },
    },
    BigInt: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.4.0' } },
    Map: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
    Math: {
      acosh: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      asinh: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      atanh: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      cbrt: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      clz32: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      cosh: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      expm1: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      fround: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      hypot: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      imul: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      log10: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      log1p: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      log2: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      sign: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      sinh: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      tanh: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      trunc: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
    },
    Number: {
      EPSILON: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      isFinite: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
      isInteger: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      isNaN: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
      isSafeInteger: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      MAX_SAFE_INTEGER: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      MIN_SAFE_INTEGER: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      parseFloat: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      parseInt: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
    },
    Object: {
      assign: { [ASTUtils.ReferenceTracker.READ]: { supported: '4.0.0' } },
      fromEntries: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.0.0' } },
      getOwnPropertySymbols: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      is: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
      setPrototypeOf: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
      values: { [ASTUtils.ReferenceTracker.READ]: { supported: '7.0.0' } },
      entries: { [ASTUtils.ReferenceTracker.READ]: { supported: '7.0.0' } },
      getOwnPropertyDescriptors: { [ASTUtils.ReferenceTracker.READ]: { supported: '7.0.0' } },
    },
    Promise: {
      [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' },
      allSettled: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.9.0' } },
    },
    Proxy: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.0.0' } },
    Reflect: { [ASTUtils.ReferenceTracker.READ]: { supported: '6.0.0' } },
    Set: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
    String: {
      fromCodePoint: { [ASTUtils.ReferenceTracker.READ]: { supported: '4.0.0' } },
      raw: { [ASTUtils.ReferenceTracker.READ]: { supported: '4.0.0' } },
    },
    Symbol: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
    Int8Array: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
    Uint8Array: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
    Uint8ClampedArray: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
    Int16Array: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
    Uint16Array: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
    Int32Array: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
    Uint32Array: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
    BigInt64Array: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.4.0' } },
    BigUint64Array: { [ASTUtils.ReferenceTracker.READ]: { supported: '10.4.0' } },
    Float32Array: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
    Float64Array: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
    DataView: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.10.0' } },
    WeakMap: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
    WeakSet: { [ASTUtils.ReferenceTracker.READ]: { supported: '0.12.0' } },
    Atomics: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.10.0' } },
    SharedArrayBuffer: { [ASTUtils.ReferenceTracker.READ]: { supported: '8.10.0' } },
    globalThis: { [ASTUtils.ReferenceTracker.READ]: { supported: '12.0.0' } },
  },
};

export const category = 'Possible Errors';
export default createRule<[options: IRawOptions], 'unsupported'>({
  name: 'no-unsupported-features/es-builtins',
  meta: {
    type: 'problem',
    docs: { description: 'disallow unsupported ECMAScript built-ins on the specified version', recommended: 'error' },
    schema: [
      {
        type: 'object',
        properties: {
          version: { type: 'string' },
          ignores: {
            type: 'array',
            items: { enum: Array.from(enumeratePropertyNames(trackMap.globals)) },
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
        checkUnsupportedBuiltins(context, options, trackMap);
      },
    };
  },
});
