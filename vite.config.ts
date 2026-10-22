import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5288 },
  preview: { port: 5289 },
  build: { outDir: 'dist', target: 'es2022' },
});
