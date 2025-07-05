import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['**/*.ts'],
  format: ['esm'],
  outDir: 'dist',
  clean: true,
  dts: false,
  splitting: false,
  sourcemap: true,
  target: 'es2022',
  skipNodeModulesBundle: true,
});
