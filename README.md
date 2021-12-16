# eslint-plugin-node-roikoren

[![Test Status](https://github.com/roikoren755/eslint-plugin-node/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/roikoren755/eslint-plugin-node/actions/workflows/ci.yml?query=branch%3Amain)
[![codecov](https://codecov.io/gh/roikoren755/eslint-plugin-node/branch/main/graph/badge.svg?token=RF5L5KQQN6)](https://codecov.io/gh/roikoren755/eslint-plugin-node)

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=roikoren755_eslint-plugin-node&metric=bugs)](https://sonarcloud.io/dashboard?id=roikoren755_eslint-plugin-node)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=roikoren755_eslint-plugin-node&metric=code_smells)](https://sonarcloud.io/dashboard?id=roikoren755_eslint-plugin-node)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=roikoren755_eslint-plugin-node&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=roikoren755_eslint-plugin-node)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=roikoren755_eslint-plugin-node&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=roikoren755_eslint-plugin-node)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=roikoren755_eslint-plugin-node&metric=security_rating)](https://sonarcloud.io/dashboard?id=roikoren755_eslint-plugin-node)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=roikoren755_eslint-plugin-node&metric=sqale_index)](https://sonarcloud.io/dashboard?id=roikoren755_eslint-plugin-node)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=roikoren755_eslint-plugin-node&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=roikoren755_eslint-plugin-node)

[![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/roikoren755/eslint-plugin-node)](https://app.snyk.io/org/roikoren755/project/64ddaa3b-1afa-4efe-838a-889659efafbf)

[![npm](https://img.shields.io/npm/v/eslint-plugin-node-roikoren)](https://www.npmjs.com/package/eslint-plugin-node-roikoren)
[![NPM](https://img.shields.io/npm/l/eslint-plugin-node-roikoren)](https://www.npmjs.com/package/eslint-plugin-node-roikoren)
[![npm](https://img.shields.io/npm/dm/eslint-plugin-node-roikoren)](https://www.npmjs.com/package/eslint-plugin-node-roikoren)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/eslint-plugin-node-roikoren)](https://www.npmjs.com/package/eslint-plugin-node-roikoren)

[![GitHub issues](https://img.shields.io/github/issues-raw/roikoren755/eslint-plugin-node)](https://www.github.com/roikoren755/eslint-plugin-node)
[![GitHub pull requests](https://img.shields.io/github/issues-pr-raw/roikoren755/eslint-plugin-node)](https://www.github.com/roikoren755/eslint-plugin-node)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/roikoren755/eslint-plugin-node)](https://www.github.com/roikoren755/eslint-plugin-node)
[![Lines of code](https://img.shields.io/tokei/lines/github/roikoren755/eslint-plugin-node)](https://www.github.com/roikoren755/eslint-plugin-node)
[![GitHub top language](https://img.shields.io/github/languages/top/roikoren755/eslint-plugin-node)](https://www.github.com/roikoren755/eslint-plugin-node)

A re implementation of `eslint-plugin-node` in TypeScript.

## Disclaimer
First off, I would like to deeply thank [@mistycatea](https://github.com/mysticatea) and everyone else involved in the original `eslint-plugin-node`. None of this would have been possible without them, and all credit should go to them.

This package is an attempt to migrate `eslint-plugin-node` to be written in TypeScript, and to use the great [`@typescript-eslint`](https://github.com/typescript-eslint) repository for plugin development.

Below is taken verbatim from [`eslint-plugin-node`](https://github.com/mysticatea/eslint-plugin-node), and will be updated as needed.

## 💿 Install & Usage

Use [npm](https://www.npmjs.com/) or a compatible tool.

```console
npm install --save-dev eslint eslint-plugin-node-roikoren

yarn add -D eslint eslint-plugin-node-roikoren
```
**IMPORTANT**

If you installed `eslint` globally, you should install this plugin in the same way.

**Requirements**
- Node.js `12.22.0` or newer.
- ESLint `5.16.0` or newer.

**Note:** It recommends a use of [the "engines" field of package.json](https://docs.npmjs.com/files/package.json#engines). The "engines" field is used by `node/no-unsupported-features/*` rules.

**.eslintrc.json** (An example)

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:node-roikoren/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2020
  },
  "rules": {
    "node-roikoren/exports-style": ["error", "module.exports"],
    "node-roikoren/file-extension-in-import": ["error", "always"],
    "node-roikoren/prefer-global/buffer": ["error", "always"],
    "node-roikoren/prefer-global/console": ["error", "always"],
    "node-roikoren/prefer-global/process": ["error", "always"],
    "node-roikoren/prefer-global/url-search-params": ["error", "always"],
    "node-roikoren/prefer-global/url": ["error", "always"],
    "node-roikoren/prefer-promises/dns": "error",
    "node-roikoren/prefer-promises/fs": "error"
  }
}
```

**package.json** (An example)

```json
{
  "name": "your-module",
  "version": "1.0.0",
  "type": "commonjs",
  "engines": {
    "node": ">=8.10.0"
  }
}
```

## 📖 Rules

- ⭐️ - the mark of recommended rules.
- ✒️ - the mark of fixable rules.

<!--RULES_TABLE_START-->
### Possible Errors

| Rule ID | Description |    |
|:--------|:------------|:--:|
| [node-roikoren/handle-callback-err](./docs/rules/handle-callback-err.md) | require error handling in callbacks |  |
| [node-roikoren/no-callback-literal](./docs/rules/no-callback-literal.md) | enforce Node.js-style error-first callback pattern is followed |  |
| [node-roikoren/no-exports-assign](./docs/rules/no-exports-assign.md) | disallow the assignment to `exports` | ⭐️ |
| [node-roikoren/no-extraneous-import](./docs/rules/no-extraneous-import.md) | disallow `import` declarations which import extraneous modules | ⭐️ |
| [node-roikoren/no-extraneous-require](./docs/rules/no-extraneous-require.md) | disallow `require()` expressions which import extraneous modules | ⭐️ |
| [node-roikoren/no-missing-import](./docs/rules/no-missing-import.md) | disallow `import` declarations which import non-existent modules | ⭐️ |
| [node-roikoren/no-missing-require](./docs/rules/no-missing-require.md) | disallow `require()` expressions which import non-existent modules | ⭐️ |
| [node-roikoren/no-new-require](./docs/rules/no-new-require.md) | disallow `new` operators with calls to `require` |  |
| [node-roikoren/no-path-concat](./docs/rules/no-path-concat.md) | disallow string concatenation with `__dirname` and `__filename` |  |
| [node-roikoren/no-process-exit](./docs/rules/no-process-exit.md) | disallow the use of `process.exit()` |  |
| [node-roikoren/no-unpublished-bin](./docs/rules/no-unpublished-bin.md) | disallow `bin` files that npm ignores | ⭐️ |
| [node-roikoren/no-unpublished-import](./docs/rules/no-unpublished-import.md) | disallow `import` declarations which import private modules | ⭐️ |
| [node-roikoren/no-unpublished-require](./docs/rules/no-unpublished-require.md) | disallow `require()` expressions which import private modules | ⭐️ |
| [node-roikoren/no-unsupported-features/es-builtins](./docs/rules/no-unsupported-features/es-builtins.md) | disallow unsupported ECMAScript built-ins on the specified version | ⭐️ |
| [node-roikoren/no-unsupported-features/es-syntax](./docs/rules/no-unsupported-features/es-syntax.md) | disallow unsupported ECMAScript syntax on the specified version | ⭐️ |
| [node-roikoren/no-unsupported-features/node-builtins](./docs/rules/no-unsupported-features/node-builtins.md) | disallow unsupported Node.js built-in APIs on the specified version | ⭐️ |
| [node-roikoren/process-exit-as-throw](./docs/rules/process-exit-as-throw.md) | enforce `process.exit()` expressions to count as the same code path as `throw` | ⭐️ |
| [node-roikoren/shebang](./docs/rules/shebang.md) | enforce correct usage of shebang | ⭐️✒️ |

### Best Practices

| Rule ID | Description |    |
|:--------|:------------|:--:|
| [node-roikoren/no-deprecated-api/no-deprecated-api](./docs/rules/no-deprecated-api.md) | disallow deprecated APIs | ⭐️ |

### Stylistic Issues

| Rule ID | Description |    |
|:--------|:------------|:--:|
| [node-roikoren/callback-return](./docs/rules/callback-return.md) | require `return` statements after callbacks |  |
| [node-roikoren/exports-style](./docs/rules/exports-style.md) | enforce either `module.exports` or `exports` | ✒️ |
| [node-roikoren/file-extension-in-import](./docs/rules/file-extension-in-import.md) | enforce the style of file extensions in `import` declarations | ✒️ |
| [node-roikoren/global-require](./docs/rules/global-require.md) | require `require()` calls to be placed at top-level module scope |  |
| [node-roikoren/no-mixed-requires](./docs/rules/no-mixed-requires.md) | disallow `require` calls to be mixed with regular variable declarations |  |
| [node-roikoren/no-process-env](./docs/rules/no-process-env.md) | disallow the use of `process.env` |  |
| [node-roikoren/no-restricted-import](./docs/rules/no-restricted-import.md) | disallow specified modules when loaded by `import` declarations |  |
| [node-roikoren/no-restricted-require](./docs/rules/no-restricted-require.md) | disallow specified modules when loaded by `require` |  |
| [node-roikoren/no-sync](./docs/rules/no-sync.md) | disallow synchronous methods |  |
| [node-roikoren/prefer-global/buffer](./docs/rules/prefer-global/buffer.md) | enforce either `Buffer` or `require("buffer").Buffer` |  |
| [node-roikoren/prefer-global/console](./docs/rules/prefer-global/console.md) | enforce either `console` or `require("console")` |  |
| [node-roikoren/prefer-global/process](./docs/rules/prefer-global/process.md) | enforce either `process` or `require("process")` |  |
| [node-roikoren/prefer-global/text-decoder](./docs/rules/prefer-global/text-decoder.md) | enforce either `TextDecoder` or `require("util").TextDecoder` |  |
| [node-roikoren/prefer-global/text-encoder](./docs/rules/prefer-global/text-encoder.md) | enforce either `TextEncoder` or `require("util").TextEncoder` |  |
| [node-roikoren/prefer-global/url-search-params](./docs/rules/prefer-global/url-search-params.md) | enforce either `URLSearchParams` or `require("url").URLSearchParams` |  |
| [node-roikoren/prefer-global/url](./docs/rules/prefer-global/url.md) | enforce either `URL` or `require("url").URL` |  |
| [node-roikoren/prefer-promises/dns](./docs/rules/prefer-promises/dns.md) | enforce `require("dns").promises` |  |
| [node-roikoren/prefer-promises/fs](./docs/rules/prefer-promises/fs.md) | enforce `require("fs").promises` |  |

<!--RULES_TABLE_END-->

## 🔧 Configs

This plugin provides three configs:

- `plugin:node-roikoren/recommended` considers both CommonJS and ES Modules. If [`"type":"module"` field](https://medium.com/@nodejs/announcing-a-new-experimental-modules-1be8d2d6c2ff#b023) existed in package.json then it considers files as ES Modules. Otherwise it considers files as CommonJS. In addition, it considers `*.mjs` files as ES Modules and `*.cjs` files as CommonJS.
- `plugin:node-roikoren/recommended-module` considers all files as ES Modules.
- `plugin:node-roikoren/recommended-script` considers all files as CommonJS.

Those preset config:

- enable [no-process-exit](http://eslint.org/docs/rules/no-process-exit) rule because [the official document](https://nodejs.org/api/process.html#process_process_exit_code) does not recommend a use of `process.exit()`.
- enable plugin rules which are given :star: in the above table.
- add `{ ecmaVersion : 2019}` etc. into `parserOptions`.
- add proper globals into `globals`.
- add this plugin into `plugins`.

## 👫 FAQ

- Q: The `no-missing-import` / `no-missing-require` rules don't work with nested folders in SublimeLinter-eslint
- A: See [context.getFilename() in rule returns relative path](https://github.com/roadhump/SublimeLinter-eslint#contextgetfilename-in-rule-returns-relative-path) in the SublimeLinter-eslint FAQ.

## 🚥 Semantic Versioning Policy

`eslint-plugin-node-roikoren` follows [semantic versioning](http://semver.org/) and [ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy).

- Patch release (intended to not break your lint build)
  - A bug fix in a rule that results in it reporting fewer errors.
  - Improvements to documentation.
  - Non-user-facing changes such as refactoring code, adding, deleting, or modifying tests, and increasing test coverage.
  - Re-releasing after a failed release (i.e., publishing a release that doesn't work for anyone).
- Minor release (might break your lint build)
  - A bug fix in a rule that results in it reporting more errors.
  - A new rule is created.
  - A new option to an existing rule is created.
  - An existing rule is deprecated.
- Major release (likely to break your lint build)
  - A support for old Node version is dropped.
  - A support for old ESLint version is dropped.
  - An existing rule is changed in it reporting more errors.
  - An existing rule is removed.
  - An existing option of a rule is removed.
  - An existing config is updated.

## 📰 Changelog

- [GitHub Releases](https://github.com/roikoren755/eslint-plugin-node/releases)

## ❤️ Contributing

Contributions are welcome!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.
- `npm run coverage` shows the coverage result of `npm test` command.
- `npm run clean` removes the coverage result of `npm test` command.

