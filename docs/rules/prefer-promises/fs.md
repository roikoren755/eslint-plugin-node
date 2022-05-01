# node-roikoren/prefer-promises/fs
> enforce `require("fs").promises`

Since Node.js v11.14.0, `require("fs").promises` API has been stable.
Promise API and `async`/`await` syntax will make code more readable than callback API.

## 📖 Rule Details

This rule disallows callback API in favor of promise API.

Examples of :-1: **incorrect** code for this rule:

```js
/*eslint node-roikoren/prefer-promises/fs: [error]*/
const fs = require("fs")

function readData(filePath) {
  fs.readFile(filePath, "utf8", (error, content) => {
    //...
  })
}
```

```js
/*eslint node-roikoren/prefer-promises/fs: [error]*/
import fs from "fs"

function readData(filePath) {
  fs.readFile(filePath, "utf8", (error, content) => {
    //...
  })
}
```

Examples of :+1: **correct** code for this rule:

```js
/*eslint node-roikoren/prefer-promises/fs: [error]*/
const { promises: fs } = require("fs")

async function readData(filePath) {
  const content = await fs.readFile(filePath, "utf8")
  //...
}
```

```js
/*eslint node-roikoren/prefer-promises/fs: [error]*/
import { promises as fs } from "fs"

async function readData(filePath) {
  const content = await fs.readFile(filePath, "utf8")
  //...
}
```

## 🔎 Implementation

- [Rule source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.3/src/rules/prefer-promises/fs.ts)
- [Test source](https://github.com/roikoren755/eslint-plugin-node/blob/v3.0.3/tests/src/rules/prefer-promises/fs.ts)
