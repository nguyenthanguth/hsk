import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  },
  assetsInclude: ['**/*.wasm'],
  build: {
    // Keep the initial controller chunk cacheable and prevent the large
    // learning corpus from being duplicated into every future entry point.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('\\src\\data\\') || id.includes('/src/data/')) return 'learning-data';
          if (id.includes('\\src\\modules\\') || id.includes('/src/modules/')) return 'learning-services';
          return undefined;
        }
      }
    }
  }
});
