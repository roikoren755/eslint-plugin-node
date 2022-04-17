# node-roikoren/exports-style
> enforce either `module.exports` or `exports`
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

`module.exports` and `exports` are the same instance by default.
But those come to be different if one of them is modified.

```js
module.exports = {
  foo: 1
}

exports.bar = 2
```

In this case, `exports.bar` will be lost since only the instance of `module.exports` will be exported.

## 📖 Rule Details

This rule enforces the export style.

If you use `module.exports`, this rule disallows `exports`.<br>
If you use `exports`, this rule disallows `module.exports`.

You can select it by an option.

### Options

This rule has a string option.

```json
{
  "node-roikoren/exports-style": [
    "error",
    "module.exports" or "exports",
    {
      "allowBatchAssign": false
    }
  ]
}
```

- `"module.exports"` (default) requires `module.exports` and disallows `exports`.
- `"exports"` requires `exports` and disallows `module.exports`.
- `allowBatchAssign` (default is `false`) allows `module.exports = exports = obj` if this is `true`.

#### module.exports

Examples of :-1: **incorrect** code for the `"module.exports"` option:

```js
/*eslint node-roikoren/exports-style: ["error", "module.exports"]*/

exports.foo = 1
exports.bar = 2
```

Examples of :+1: **correct** code for the `"module.exports"` option:

```js
/*eslint node-roikoren/exports-style: ["error", "module.exports"]*/

module.exports = {
  foo: 1,
  bar: 2
}

module.exports.baz = 3
```

#### exports

Examples of :-1: **incorrect** code for the `"exports"` option:

```js
/*eslint node-roikoren/exports-style: ["error", "exports"]*/

module.exports = {
  foo: 1,
  bar: 2
}

module.exports.baz = 3
```

Examples of :+1: **correct** code for the `"exports"` option:

```js
/*eslint node-roikoren/exports-style: ["error", "exports"]*/

exports.foo = 1
exports.bar = 2
```

#### allowBatchAssign

Examples of :+1: **correct** code for the `"exports"` and `{"allowBatchAssign": true}` option:

```js
/*eslint node-roikoren/exports-style: ["error", "exports", {"allowBatchAssign": true}]*/

// Allow `module.exports` in the same assignment expression as `exports`.
module.exports = exports = function foo() {
  // do something.
}

exports.bar = 1
```

## 🔎 Implementation

- [Rule source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.2/src/rules/exports-style.ts)
- [Test source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.2/tests/src/rules/exports-style.ts)
