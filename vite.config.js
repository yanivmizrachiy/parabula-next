import { defineConfig } from 'vite'

export default defineConfig({
  base: '/razpages/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})