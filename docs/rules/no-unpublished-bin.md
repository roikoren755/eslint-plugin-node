# node-roikoren/no-unpublished-bin
> disallow `bin` files that npm ignores
> - ⭐️ This rule is included in `plugin:node-roikoren/recommended` preset.

We can publish CLI commands by `npm`. It uses `bin` field of `package.json`.

```json
{
  "name": "command-name",
  "bin": "bin/index.js"
}
```

At this time, if `npm` ignores the file, your package will fail to install.

## 📖 Rule Details

If `npm` ignores the files in `bin` field, this rule warns the files.

- If `files` field does not includes the files in `bin` field.
- If `.npmignore` file includes the files in `bin` field.

### Options

```json
{
  "rules": {
    "node-roikoren/no-unpublished-bin": ["error", {
      "convertPath": []
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
    "node-roikoren/no-unpublished-bin": ["error", {
      "convertPath": [
        {
          "include": ["src/bin/**/*.js"],
          "exclude": ["**/*.spec.js"],
          "replace": ["^src/(.+)$", "$1"]
        }
      ]
    }]
  }
}
```

In this style, this option has the following shape as the same expression as above: `{include: [<targetFiles>], replace: [<fromRegExp>, <toString>]}`.
In addition, we can specify glob patterns to exclude files.


### Shared Settings

The following options can be set by [shared settings](http://eslint.org/docs/user-guide/configuring.html#adding-shared-settings).
Several rules have the same option, but we can set this option at once.

- `convertPath`

For Example:

```json
{
  "settings": {
    "node": {
      "convertPath": [{
        "include": ["src/bin/**/*.js"],
        "replace": ["^src/bin/(.+)$", "bin/$1"]
      }]
    }
  },
  "rules": {
    "node-roikoren/no-unpublished-bin": "error"
  }
}
```

## 🔎 Implementation

- [Rule source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.0/src/rules/no-unpublished-bin.ts)
- [Test source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.0/tests/src/rules/no-unpublished-bin.ts)
