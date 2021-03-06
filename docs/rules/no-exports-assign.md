# node-roikoren/no-exports-assign
> disallow the assignment to `exports`
> - ⭐️ This rule is included in `plugin:node-roikoren/recommended` preset.

To assign to `exports` variable would not work as expected.

```js
// This assigned object is not exported.
// You need to use `module.exports = { ... }`.
exports = {
  foo: 1
}
```

## 📖 Rule Details

This rule is aimed at disallowing `exports = {}`, but allows `module.exports = exports = {}` to avoid conflict with [node-roikoren/exports-style](./exports-style.md) rule's `allowBatchAssign` option.

👍 Examples of **correct** code for this rule:

```js
/*eslint node-roikoren/no-exports-assign: error */

module.exports.foo = 1
exports.bar = 2

module.exports = {}

// allows `exports = {}` if along with `module.exports =`
module.exports = exports = {}
exports = module.exports = {}
```

👎 Examples of **incorrect** code for this rule:

```js
/*eslint node-roikoren/no-exports-assign: error */

exports = {}
```

## 🔎 Implementation

- [Rule source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.4/src/rules/no-exports-assign.ts)
- [Test source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.4/tests/src/rules/no-exports-assign.ts)
