# node-roikoren/process-exit-as-throw
> enforce `process.exit()` expressions to count as the same code path as `throw`
> - ⭐️ This rule is included in `plugin:node-roikoren/recommended` preset.

## 📖 Rule Details

```js
function foo(a) {
  if (a) {
    return new Bar();
  } else {
    process.exit(1);
  }
}
```

ESLint does not address `process.exit()` as stop in code path analysis, then [consistent-return] rule will warn the above code.

If you turn this rule on, ESLint comes to address `process.exit()` as throw in code path analysis. So, above code will get expected code path.

This rule itself never warn code.

## 📚 Related Rules

- [consistent-return]
- [no-fallthrough]
- [no-unreachable]

[consistent-return]: http://eslint.org/docs/rules/consistent-return
[no-fallthrough]: http://eslint.org/docs/rules/no-fallthrough
[no-unreachable]: http://eslint.org/docs/rules/no-unreachable

## 🔎 Implementation

- [Rule source](https://github.com/roikoren755/eslint-plugin-node/blob/v2.0.0/src/rules/process-exit-as-throw.ts)
- [Test source](https://github.com/roikoren755/eslint-plugin-node/blob/v2.0.0/tests/src/rules/process-exit-as-throw.ts)
