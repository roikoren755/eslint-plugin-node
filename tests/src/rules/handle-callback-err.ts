import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

import rule from '../../../src/rules/handle-callback-err';

const error = (declaration?: boolean): TSESLint.TestCaseError<'expected'> => ({
  messageId: 'expected',
  line: 1,
  data: {},
  type: declaration ? AST_NODE_TYPES.FunctionDeclaration : AST_NODE_TYPES.FunctionExpression,
});
const arrowError = { messageId: 'expected' as const, line: 1, data: {}, type: AST_NODE_TYPES.ArrowFunctionExpression };

new TSESLint.RuleTester().run('handle-callback-err', rule, {
  valid: [
    'function test(error) {}',
    'function test(err) {console.log(err);}',
    "function test(err, data) {if(err){ data = 'ERROR';}}",
    'var test = function(err) {console.log(err);};',
    'var test = function(err) {if(err){/* do nothing */}};',
    'var test = function(err) {if(!err){doSomethingHere();}else{};}',
    'var test = function(err, data) {if(!err) { good(); } else { bad(); }}',
    'try { } catch(err) {}',
    'getData(function(err, data) {if (err) {}getMoreDataWith(data, function(err, moreData) {if (err) {}getEvenMoreDataWith(moreData, function(err, allOfTheThings) {if (err) {}});});});',
    'var test = function(err) {if(! err){doSomethingHere();}};',
    'function test(err, data) {if (data) {doSomething(function(err) {console.error(err);});} else if (err) {console.log(err);}}',
    'function handler(err, data) {if (data) {doSomethingWith(data);} else if (err) {console.log(err);}}',
    'function handler(err) {logThisAction(function(err) {if (err) {}}); console.log(err);}',
    'function userHandler(err) {process.nextTick(function() {if (err) {}})}',
    'function help() { function userHandler(err) {function tester() { err; process.nextTick(function() { err; }); } } }',
    "function help(done) { var err = new Error('error'); done(); }",
    { code: 'var test = err => err;', parserOptions: { ecmaVersion: 6 } },
    { code: 'var test = err => !err;', parserOptions: { ecmaVersion: 6 } },
    { code: 'var test = err => err.message;', parserOptions: { ecmaVersion: 6 } },
    { code: 'var test = function(error) {if(error){/* do nothing */}};', options: ['error'] },
    {
      code: 'var test = (error) => {if(error){/* do nothing */}};',
      options: ['error'],
      parserOptions: { ecmaVersion: 6 },
    },
    { code: 'var test = function(error) {if(! error){doSomethingHere();}};', options: ['error'] },
    { code: 'var test = function(err) { console.log(err); };', options: ['^(err|error)$'] },
    { code: 'var test = function(error) { console.log(error); };', options: ['^(err|error)$'] },
    { code: 'var test = function(anyError) { console.log(anyError); };', options: ['^.+Error$'] },
    { code: 'var test = function(any_error) { console.log(anyError); };', options: ['^.+Error$'] },
    { code: 'var test = function(any_error) { console.log(any_error); };', options: ['^.+(e|E)rror$'] },
  ],
  invalid: [
    { code: 'function test(err) {}', errors: [{ ...error(true), column: 1 }] },
    { code: 'function test(err, data) {}', errors: [{ ...error(true), column: 1 }] },
    { code: 'function test(err) {errorLookingWord();}', errors: [{ ...error(true), column: 1 }] },
    { code: 'function test(err) {try{} catch(err) {}}', errors: [{ ...error(true), column: 1 }] },
    {
      code: 'function test(err, callback) { foo(function(err, callback) {}); }',
      errors: [
        { ...error(true), column: 1 },
        { ...error(), column: 36 },
      ],
    },
    { code: 'var test = (err) => {};', parserOptions: { ecmaVersion: 6 }, errors: [{ ...arrowError, column: 12 }] },
    { code: 'var test = function(err) {};', errors: [{ ...error(), column: 12 }] },
    { code: 'var test = function test(err, data) {};', errors: [{ ...error(), column: 12 }] },
    { code: 'var test = function test(err) {/* if(err){} */};', errors: [{ ...error(), column: 12 }] },
    {
      code: 'function test(err) {doSomethingHere(function(err){console.log(err);})}',
      errors: [{ ...error(true), column: 1 }],
    },
    { code: 'function test(error) {}', options: ['error'], errors: [{ ...error(true), column: 1 }] },
    {
      code: 'getData(function(err, data) {getMoreDataWith(data, function(err, moreData) {if (err) {}getEvenMoreDataWith(moreData, function(err, allOfTheThings) {if (err) {}});}); });',
      errors: [{ ...error(), column: 9 }],
    },
    {
      code: 'getData(function(err, data) {getMoreDataWith(data, function(err, moreData) {getEvenMoreDataWith(moreData, function(err, allOfTheThings) {if (err) {}});}); });',
      errors: [
        { ...error(), column: 9 },
        { ...error(), column: 52 },
      ],
    },
    {
      code: 'function userHandler(err) {logThisAction(function(err) {if (err) { console.log(err); } })}',
      errors: [{ ...error(true), column: 1 }],
    },
    {
      code: 'function help() { function userHandler(err) {function tester(err) { err; process.nextTick(function() { err; }); } } }',
      errors: [{ ...error(true), column: 19 }],
    },
    {
      code: 'var test = function(anyError) { console.log(otherError); };',
      options: ['^.+Error$'],
      errors: [{ ...error(), column: 12 }],
    },
    { code: 'var test = function(anyError) { };', options: ['^.+Error$'], errors: [{ ...error(), column: 12 }] },
    {
      code: 'var test = function(err) { console.log(error); };',
      options: ['^(err|error)$'],
      errors: [{ ...error(), column: 12 }],
    },
  ],
});
