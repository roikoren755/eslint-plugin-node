# node-roikoren/prefer-global/text-encoder
> enforce either `TextEncoder` or `require("util").TextEncoder`

The `TextEncoder` class of `util` module is defined as a global variable.

```js
console.log(TextEncoder === require("util").TextEncoder) //→ true
```

It will be readable if we use either `TextEncoder` consistently.

## 📖 Rule Details

This rule enforces which `TextEncoder` we should use.

### Options

This rule has a string option.

```json
{
  "node-roikoren/prefer-global/text-encoder": ["error", "always" | "never"]
}
```

- `"always"` (default) ... enforces to use the global variable `TextEncoder` rather than `require("util").TextEncoder`.
- `"never"` ... enforces to use `require("util").TextEncoder` rather than the global variable `TextEncoder`.

#### always

Examples of :-1: **incorrect** code for this rule:

```js
/*eslint node-roikoren/prefer-global/text-encoder: [error]*/

const { TextEncoder } = require("util")
const u = new TextEncoder(s)
```

Examples of :+1: **correct** code for this rule:

```js
/*eslint node-roikoren/prefer-global/text-encoder: [error]*/

const u = new TextEncoder(s)
```

#### never

Examples of :-1: **incorrect** code for the `"never"` option:

```js
/*eslint node-roikoren/prefer-global/text-encoder: [error, never]*/

const u = new TextEncoder(s)
```

Examples of :+1: **correct** code for the `"never"` option:

```js
/*eslint node-roikoren/prefer-global/text-encoder: [error, never]*/

const { TextEncoder } = require("util")
const u = new TextEncoder(s)
```

## 🔎 Implementation

- [Rule source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.1/src/rules/prefer-global/text-encoder.ts)
- [Test source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.1/tests/src/rules/prefer-global/text-encoder.ts)
