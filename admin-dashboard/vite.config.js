import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    fs: {
      // Permite que Vite acceda a archivos fuera de la carpeta 'admin-dashboard'
      // En este caso, sube un nivel para llegar a 'shared-logic'
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      // Esto te permite importar desde shared-logic usando '@shared'
      // Ejemplo: import apiClient from '@shared/apiClient'
      '@shared': resolve(__dirname, '../shared-logic')
    }
  }
})