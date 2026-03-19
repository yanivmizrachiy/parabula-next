import { defineConfig } from 'vite'

export default defineConfig({
  base: '/parabula-next/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})