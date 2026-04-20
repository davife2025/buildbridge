import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'dist',
  noExternal: ['@buildbridge/stellar'],
  skipNodeModulesBundle: false,
  clean: true,
});