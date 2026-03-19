import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm'],
  outDir: 'dist',
  clean: true,
  dts: false,
  splitting: false,
  sourcemap: true,
  target: 'es2022',
  external: [
    '@meshsdk/core',
    '@meshsdk/core-csl',
    '@meshsdk/core-cst',
    '@meshsdk/hydra',
    'express',
    'socket.io',
    'dotenv'
  ],
});
