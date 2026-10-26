import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// Web Component build: SFCs compiled with `customElement: true` so <style> blocks
// are injected into each shadow root. Vue is bundled in, so the output is a single
// <script type="module"> any server-rendered page can load.
export default defineConfig({
  plugins: [vue({ customElement: true })],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'dist-wc',
    lib: {
      entry: fileURLToPath(new URL('./src/wc.ts', import.meta.url)),
      fileName: () => 'cairn-wc.js',
      formats: ['es'],
    },
  },
})
