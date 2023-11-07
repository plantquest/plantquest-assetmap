import Path from 'path';

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@plantquest/assetmap': Path.resolve(__dirname, '../..')
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:9100',
    }
  }
})
