# node-roikoren/no-missing-import
> disallow `import` declarations which import non-existent modules
> - ⭐️ This rule is included in `plugin:node-roikoren/recommended` preset.

This is similar to [no-missing-require](no-missing-require.md), but this rule handles `import` and `export` declarations.

:warning: ECMAScript 2015 (ES6) does not define the lookup logic and Node does not support modules yet. So this rule spec might be changed in future.

## 📖 Rule Details

This rule checks the file paths of `import` and `export` declarations.
If the file paths don't exist, this reports these.

Examples of :-1: **incorrect** code for this rule:

```js
/*eslint node-roikoren/no-missing-import: "error" */

import typoFile from "./typo-file";   /*ERROR: "./typo-file" is not found.*/
import typoModule from "typo-module"; /*ERROR: "typo-module" is not found.*/
```

Examples of :+1: **correct** code for this rule:

```js
/*eslint node-roikoren/no-missing-import: "error" */

import existingFile from "./existing-file";
import existingModule from "existing-module";
```

### Options

```json
{
  "rules": {
    "node-roikoren/no-missing-import": ["error", {
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
    "node-roikoren/no-missing-import": ["error", {
      "allowModules": ["electron"]
    }]
  }
}
```

#### resolvePaths

Adds additional paths to try for when resolving imports.
If a path is relative, it will be resolved from CWD.

Default is `[]`.

#### tryExtensions

When an import path does not exist, this rule checks whether or not any of `path.js`, `path.json`, and `path.node` exists.
`tryExtensions` option is the extension list this rule uses at the time.

Default is `[".js", ".json", ".node"]`.

#### onlyRelativePath

Only warn when files imported by a relative path are missing.

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
    "node-roikoren/no-missing-import": "error"
  }
}
```

## 🔎 Implementation

- [Rule source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.4/src/rules/no-missing-import.ts)
- [Test source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.4/tests/src/rules/no-missing-import.ts)
