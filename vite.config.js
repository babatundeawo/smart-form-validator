import { defineConfig } from 'vite';

export default defineConfig({
  // Configure development server options
  server: {
    port: 3000,
    open: true
  },
  // Ensure relative asset paths in output bundle
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  }
});
