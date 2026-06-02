import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'                                        // Thêm
import { fileURLToPath } from 'node:url'                            // Thêm

const __dirname = path.dirname(fileURLToPath(import.meta.url))      // Thêm


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {                                                        // Thêm
    alias: {                                                        // Thêm
      '@': path.resolve(__dirname, './src'),                        // Thêm
      '@components': path.resolve(__dirname, './src/components')    // Thêm
    },                                                              // Thêm
  },
})
