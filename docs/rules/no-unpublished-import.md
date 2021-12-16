# node-roikoren/no-unpublished-import
> disallow `import` declarations which import private modules
> - ⭐️ This rule is included in `plugin:node-roikoren/recommended` preset.

This is similar to [no-unpublished-require](no-unpublished-require.md), but this rule handles `import` declarations.

:warning: ECMAScript 2015 (ES6) does not define the lookup logic and Node does not support modules yet. So this rule spec might be changed in future.

## 📖 Rule Details

If a source code file satisfies all of the following conditions, the file is \*published\*.

- `"files"` field of `package.json` includes the file or `"files"` field of `package.json` does not exist.
- `.npmignore` does not include the file.

Then this rule warns `import` declarations in \*published\* files if the `import` declaration imports \*unpublished\* files or the packages of `devDependencies`.

> This intends to prevent "Module Not Found" error after `npm publish`.<br>
> :bulb: If you want to import `devDependencies`, please write `.npmignore` or `"files"` field of `package.json`.

### Options

```json
{
  "rules": {
    "node-roikoren/no-unpublished-import": ["error", {
      "allowModules": [],
      "convertPath": [],
      "tryExtensions": [".js", ".json", ".node"]
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
    "node-roikoren/no-unpublished-import": ["error", {
      "allowModules": ["electron"]
    }]
  }
}
```

#### convertPath

If we use transpilers (e.g. Babel), perhaps the file path to a source code is never published.
`convertPath` option tells to the rule, it needs to convert file paths.

For example:

```json
{
  "rules": {
    "node-roikoren/no-unpublished-import": ["error", {
      "convertPath": [
        {
          "include": ["src/**/*.js"],
          "exclude": ["**/*.spec.js"],
          "replace": ["^src/(.+)$", "lib/$1"]
        }
      ]
    }]
  }
}
```

In this style, this option has the following shape as the same expression as above: `{include: [<targetFiles>], replace: [<fromRegExp>, <toString>]}`.
In addition, we can specify glob patterns to exclude files.

#### tryExtensions

When an import path does not exist, this rule checks whether or not any of `path.js`, `path.json`, and `path.node` exists.
`tryExtensions` option is the extension list this rule uses at the time.

Default is `[".js", ".json", ".node"]`.

### Shared Settings

The following options can be set by [shared settings](http://eslint.org/docs/user-guide/configuring.html#adding-shared-settings).
Several rules have the same option, but we can set this option at once.

- `allowModules`
- `convertPath`
- `tryExtensions`

For Example:

```json
{
  "settings": {
    "node": {
      "allowModules": ["electron"],
      "convertPath": [{
        "include": ["src/**/*.jsx"],
        "replace": ["^src/(.+?)\\.jsx$", "lib/$1.js"]
      }],
      "tryExtensions": [".js", ".jsx", ".json"]
    }
  },
  "rules": {
    "node-roikoren/no-unpublished-import": "error"
  }
}
```

## 🔎 Implementation

- [Rule source](https://github.com/roikoren755/eslint-plugin-node/blob/v2.0.0/src/rules/no-unpublished-import.ts)
- [Test source](https://github.com/roikoren755/eslint-plugin-node/blob/v2.0.0/tests/src/rules/no-unpublished-import.ts)
