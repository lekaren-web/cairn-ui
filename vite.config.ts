import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// Default config: serves the Vue demo app in dev, builds the Vue library for production.
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'Cairn',
      fileName: 'cairn',
      formats: ['es'],
    },
    rollupOptions: { external: ['vue'] },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
} as import('vite').UserConfig)
