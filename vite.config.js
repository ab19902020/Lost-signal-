import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Lost-signal-/',
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    sourcemap: false
  }
});
