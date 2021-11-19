import { ASTUtils } from '@typescript-eslint/experimental-utils';

import type { DeprecatedMap } from '../../util/enumerate-property-names';
import { modules } from './modules';

export const globals: DeprecatedMap = {
  Buffer: {
    [ASTUtils.ReferenceTracker.CONSTRUCT]: {
      since: '6.0.0',
      replacedBy: [
        { name: "'Buffer.alloc()'", supported: '5.10.0' },
        { name: "'Buffer.from()'", supported: '5.10.0' },
      ],
    },
    [ASTUtils.ReferenceTracker.CALL]: {
      since: '6.0.0',
      replacedBy: [
        { name: "'Buffer.alloc()'", supported: '5.10.0' },
        { name: "'Buffer.from()'", supported: '5.10.0' },
      ],
    },
  },
  COUNTER_NET_SERVER_CONNECTION: { [ASTUtils.ReferenceTracker.READ]: { since: '11.0.0' } },
  COUNTER_NET_SERVER_CONNECTION_CLOSE: { [ASTUtils.ReferenceTracker.READ]: { since: '11.0.0' } },
  COUNTER_HTTP_SERVER_REQUEST: { [ASTUtils.ReferenceTracker.READ]: { since: '11.0.0' } },
  COUNTER_HTTP_SERVER_RESPONSE: { [ASTUtils.ReferenceTracker.READ]: { since: '11.0.0' } },
  COUNTER_HTTP_CLIENT_REQUEST: { [ASTUtils.ReferenceTracker.READ]: { since: '11.0.0' } },
  COUNTER_HTTP_CLIENT_RESPONSE: { [ASTUtils.ReferenceTracker.READ]: { since: '11.0.0' } },
  GLOBAL: {
    [ASTUtils.ReferenceTracker.READ]: { since: '6.0.0', replacedBy: [{ name: "'global'", supported: '0.1.27' }] },
  },
  Intl: { v8BreakIterator: { [ASTUtils.ReferenceTracker.READ]: { since: '7.0.0' } } },
  require: {
    extensions: { [ASTUtils.ReferenceTracker.READ]: { since: '0.12.0', replacedBy: 'compiling them ahead of time' } },
  },
  root: {
    [ASTUtils.ReferenceTracker.READ]: { since: '6.0.0', replacedBy: [{ name: "'global'", supported: '0.1.27' }] },
  },
  process: modules.process,
};
