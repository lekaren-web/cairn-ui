import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// Static build of the Vue demo app (index.html), with relative URLs so it can be hosted under any path.
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: { outDir: 'site-dist/vue' },
})
