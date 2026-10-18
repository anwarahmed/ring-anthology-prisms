import { defineConfig } from 'vite';

// base './' lets the same build run from GitHub Pages or any folder.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
});
