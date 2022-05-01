# node-roikoren/no-missing-require
> disallow `require()` expressions which import non-existent modules
> - ⭐️ This rule is included in `plugin:node-roikoren/recommended` preset.

Maybe we cannot find typo of import paths until run it, so this rule checks import paths.

```js
// If the file "foo" doesn't exist, this is a runtime error.
const foo = require("./foo");
```

## 📖 Rule Details

This rule checks the file paths of `require()`s, then reports the path of files which don't exist.

Examples of :-1: **incorrect** code for this rule:

```js
/*eslint node-roikoren/no-missing-require: "error" */

var typoFile = require("./typo-file");   /*error "./typo-file" is not found.*/
var typoModule = require("typo-module"); /*error "typo-module" is not found.*/
```

Examples of :+1: **correct** code for this rule:

```js
/*eslint node-roikoren/no-missing-require: "error" */

var existingFile = require("./existing-file");
var existingModule = require("existing-module");

// This rule cannot check for dynamic imports.
var foo = require(FOO_NAME);
```

### Options

```json
{
  "rules": {
    "node-roikoren/no-missing-require": ["error", {
      "allowModules": [],
      "resolvePaths": ["/path/to/a/modules/directory"],
      "tryExtensions": [".js", ".json", ".node"],
      "onlyRelativePath": false
    }]
  }
}
```

#### allowModules

Some platforms have additional embedded modules.
For example, Electron has `electron` module.

We can specify additional embedded modules with this option.
This option is an array of strings as module names.

```json
{
  "rules": {
    "node-roikoren/no-missing-require": ["error", {
      "allowModules": ["electron"]
    }]
  }
}
```

#### resolvePaths

Adds additional paths to try for when resolving a require.
If a path is relative, it will be resolved from CWD.

Default is `[]`

#### tryExtensions

When an import path does not exist, this rule checks whether or not any of `path.js`, `path.json`, and `path.node` exists.
`tryExtensions` option is the extension list this rule uses at the time.

Default is `[".js", ".json", ".node"]`.

#### onlyRelativePath

Only warn when files required by a relative path are missing.

Default is `false`.

### Shared Settings

The following options can be set by [shared settings](http://eslint.org/docs/user-guide/configuring.html#adding-shared-settings).
Several rules have the same option, but we can set this option at once.

- `allowModules`
- `resolvePaths`
- `tryExtensions`
- `onlyRelativePath`

```js
// .eslintrc.js
module.exports = {
  "settings": {
    "node": {
      "allowModules": ["electron"],
      "resolvePaths": [__dirname],
      "tryExtensions": [".js", ".json", ".node"],
      "onlyRelativePath": true
    }
  },
  "rules": {
    "node-roikoren/no-missing-require": "error"
  }
}
```

## 🔎 Implementation

- [Rule source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.3/src/rules/no-missing-require.ts)
- [Test source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.3/tests/src/rules/no-missing-require.ts)
