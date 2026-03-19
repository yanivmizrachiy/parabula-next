import { defineConfig } from 'vite';

export default defineConfig({
  base: '/parabula-next/',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: false,
    watch: {
      usePolling: true
    },
    hmr: {
      port: 5173,
      clientPort: 5173
    }
  }
});