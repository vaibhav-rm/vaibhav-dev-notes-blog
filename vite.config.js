import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Split the heavy, rarely-changing libraries out of the app chunk so a copy
    // change does not invalidate ~1MB of vendor cache.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@tinymce') || id.includes('tinymce')) return 'editor'
          if (id.includes('@mui') || id.includes('@emotion') || id.includes('@headlessui')) {
            return 'ui'
          }
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('react-syntax-highlighter') || id.includes('refractor') || id.includes('highlight.js')) {
            return 'highlight'
          }
          // React and its DOM renderer must stay in the same chunk; splitting them
          // initialises React after a consumer has already read from it.
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
