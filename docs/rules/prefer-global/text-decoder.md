# node-roikoren/prefer-global/text-decoder
> enforce either `TextDecoder` or `require("util").TextDecoder`

The `TextDecoder` class of `util` module is defined as a global variable.

```js
console.log(TextDecoder === require("util").TextDecoder) //→ true
```

It will be readable if we use either `TextDecoder` consistently.

## 📖 Rule Details

This rule enforces which `TextDecoder` we should use.

### Options

This rule has a string option.

```json
{
  "node-roikoren/prefer-global/text-decoder": ["error", "always" | "never"]
}
```

- `"always"` (default) ... enforces to use the global variable `TextDecoder` rather than `require("util").TextDecoder`.
- `"never"` ... enforces to use `require("util").TextDecoder` rather than the global variable `TextDecoder`.

#### always

Examples of :-1: **incorrect** code for this rule:

```js
/*eslint node-roikoren/prefer-global/text-decoder: [error]*/

const { TextDecoder } = require("util")
const u = new TextDecoder(s)
```

Examples of :+1: **correct** code for this rule:

```js
/*eslint node-roikoren/prefer-global/text-decoder: [error]*/

const u = new TextDecoder(s)
```

#### never

Examples of :-1: **incorrect** code for the `"never"` option:

```js
/*eslint node-roikoren/prefer-global/text-decoder: [error, never]*/

const u = new TextDecoder(s)
```

Examples of :+1: **correct** code for the `"never"` option:

```js
/*eslint node-roikoren/prefer-global/text-decoder: [error, never]*/

const { TextDecoder } = require("util")
const u = new TextDecoder(s)
```

## 🔎 Implementation

- [Rule source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.4/src/rules/prefer-global/text-decoder.ts)
- [Test source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.4/tests/src/rules/prefer-global/text-decoder.ts)
