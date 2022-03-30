---
'eslint-plugin-node-roikoren': major
---

chore(deps): update dependency minimatch to v5
* Using `\` as a path separator in `node-roikoren/no-restricted-{import,require}` is no longer supported, as the `minimatch` package we're using no longer supports it. If you are running on a Windows machine and are passing paths to these rules in the options, please make sure to use `/` or some other character as a path separator.
