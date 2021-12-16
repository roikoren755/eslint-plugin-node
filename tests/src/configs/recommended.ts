import assert from 'assert';
import path from 'path';

import { TSESLint } from '@typescript-eslint/experimental-utils';

const originalCwd = process.cwd();

const getConfiguration = async (): Promise<TSESLint.Linter.Config> => {
  const {
    default: {
      configs: {
        recommended: { plugins, overrides, ...recommended },
      },
    },
  } = await import('../../../src');

  return {
    overrides: overrides?.map(({ plugins: overridePlugins, ...override }) => override),
    ...recommended,
  };
};

describe('node/recommended config', () => {
  describe('in CJS directory', () => {
    const root = path.resolve(__dirname, '../../fixtures/configs/cjs/');

    let engine: TSESLint.ESLint;

    beforeEach(async () => {
      process.chdir(root);
      engine = new TSESLint.ESLint({ baseConfig: await getConfiguration(), useEslintrc: false });
    });

    afterEach(() => {
      process.chdir(originalCwd);
    });

    it('*.js files should be a script.', async () => {
      const { parserOptions } = await engine.calculateConfigForFile(path.join(root, 'test.js'));

      assert.strictEqual(parserOptions?.sourceType, 'script');
    });

    it('*.cjs files should be a script.', async () => {
      const { parserOptions } = await engine.calculateConfigForFile(path.join(root, 'test.cjs'));

      assert.strictEqual(parserOptions?.sourceType, 'script');
    });

    it('*.mjs files should be a module.', async () => {
      const { parserOptions } = await engine.calculateConfigForFile(path.join(root, 'test.mjs'));

      assert.strictEqual(parserOptions?.sourceType, 'module');
    });
  });

  describe('in ESM directory', () => {
    const root = path.resolve(__dirname, '../../fixtures/configs/esm/');

    let engine: TSESLint.ESLint;

    beforeEach(async () => {
      process.chdir(root);
      engine = new TSESLint.ESLint({ baseConfig: await getConfiguration(), useEslintrc: false });
    });

    afterEach(() => {
      process.chdir(originalCwd);
    });

    it('*.js files should be a module.', async () => {
      const { parserOptions } = await engine.calculateConfigForFile(path.join(root, 'test.js'));

      assert.strictEqual(parserOptions?.sourceType, 'module');
    });

    it('*.cjs files should be a script.', async () => {
      const { parserOptions } = await engine.calculateConfigForFile(path.join(root, 'test.cjs'));

      assert.strictEqual(parserOptions?.sourceType, 'script');
    });

    it('*.mjs files should be a module.', async () => {
      const { parserOptions } = await engine.calculateConfigForFile(path.join(root, 'test.mjs'));

      assert.strictEqual(parserOptions?.sourceType, 'module');
    });
  });
});
