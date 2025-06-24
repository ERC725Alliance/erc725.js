import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/schemas/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    compilerOptions: {
      module: 'esnext',
      moduleResolution: 'node',
      target: 'es2024',
    },
  },
  sourcemap: true,
  clean: true,
  outDir: 'build',
  target: 'es2024',
  platform: 'node',
  shims: true,
  // Bundle JSON files into the output
  noExternal: [/\.json$/],
  loader: {
    '.json': 'json',
  },
  // Handle JSON imports properly
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.json': 'json',
    };
    options.supported = {
      ...options.supported,
      'import-assertions': true,
    };
  },
});