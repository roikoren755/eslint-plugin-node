import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { TSESLint } from '@typescript-eslint/utils';

import rule from '../../../../src/rules/prefer-promises/dns';

const error = ({
  isNew,
  name,
}: {
  isNew?: boolean;
  name: string;
}): TSESLint.TestCaseError<`preferPromises${'' | 'New'}`> => ({
  messageId: `preferPromises${isNew ? 'New' : ''}`,
  line: 1,
  column: 29,
  data: { name },
  type: isNew ? AST_NODE_TYPES.NewExpression : AST_NODE_TYPES.CallExpression,
});

new TSESLint.RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
  globals: { require: 'readonly' },
} as unknown as TSESLint.RuleTesterConfig).run('prefer-promises/dns', rule, {
  valid: [
    "const dns = require('dns'); dns.lookupSync()",
    "const dns = require('dns'); dns.promises.lookup()",
    "const {promises} = require('dns'); promises.lookup()",
    "const {promises: dns} = require('dns'); dns.lookup()",
    "const {promises: {lookup}} = require('dns'); lookup()",
    "import dns from 'dns'; dns.promises.lookup()",
    "import * as dns from 'dns'; dns.promises.lookup()",
    "import {promises} from 'dns'; promises.lookup()",
    "import {promises as dns} from 'dns'; dns.lookup()",
  ],
  invalid: [
    { code: "const dns = require('dns'); dns.lookup()", errors: [error({ name: 'lookup' })] },
    { code: "const {lookup} = require('dns'); lookup()", errors: [{ ...error({ name: 'lookup' }), column: 34 }] },
    { code: "import dns from 'dns'; dns.lookup()", errors: [{ ...error({ name: 'lookup' }), column: 24 }] },
    { code: "import * as dns from 'dns'; dns.lookup()", errors: [error({ name: 'lookup' })] },
    { code: "import {lookup} from 'dns'; lookup()", errors: [error({ name: 'lookup' })] },

    // Other members
    { code: "const dns = require('dns'); dns.lookupService()", errors: [error({ name: 'lookupService' })] },
    {
      code: "const dns = require('dns'); new dns.Resolver()",
      errors: [{ ...error({ isNew: true, name: 'Resolver' }), column: 29 }],
    },
    { code: "const dns = require('dns'); dns.getServers()", errors: [error({ name: 'getServers' })] },
    { code: "const dns = require('dns'); dns.resolve()", errors: [error({ name: 'resolve' })] },
    { code: "const dns = require('dns'); dns.resolve4()", errors: [error({ name: 'resolve4' })] },
    { code: "const dns = require('dns'); dns.resolve6()", errors: [error({ name: 'resolve6' })] },
    { code: "const dns = require('dns'); dns.resolveAny()", errors: [error({ name: 'resolveAny' })] },
    { code: "const dns = require('dns'); dns.resolveCname()", errors: [error({ name: 'resolveCname' })] },
    { code: "const dns = require('dns'); dns.resolveMx()", errors: [error({ name: 'resolveMx' })] },
    { code: "const dns = require('dns'); dns.resolveNaptr()", errors: [error({ name: 'resolveNaptr' })] },
    { code: "const dns = require('dns'); dns.resolveNs()", errors: [error({ name: 'resolveNs' })] },
    { code: "const dns = require('dns'); dns.resolvePtr()", errors: [error({ name: 'resolvePtr' })] },
    { code: "const dns = require('dns'); dns.resolveSoa()", errors: [error({ name: 'resolveSoa' })] },
    { code: "const dns = require('dns'); dns.resolveSrv()", errors: [error({ name: 'resolveSrv' })] },
    { code: "const dns = require('dns'); dns.resolveTxt()", errors: [error({ name: 'resolveTxt' })] },
    { code: "const dns = require('dns'); dns.reverse()", errors: [error({ name: 'reverse' })] },
    { code: "const dns = require('dns'); dns.setServers()", errors: [error({ name: 'setServers' })] },
  ],
});
