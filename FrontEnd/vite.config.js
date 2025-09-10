import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,  // Puerto por defecto de Vite
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Backend en puerto 3000
        changeOrigin: true
      }
    }
  }
})
