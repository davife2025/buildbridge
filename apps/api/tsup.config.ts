import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'dist',
  noExternal: ['@buildbridge/stellar'],
  esbuildOptions(options) {
    options.alias = {
      '@buildbridge/stellar': '../../packages/stellar/src/index.ts',
    };
  },
  clean: true,
});