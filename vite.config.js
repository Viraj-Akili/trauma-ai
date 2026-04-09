import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: 'localhost',
    proxy: {
      // Any request to /api/... is forwarded to the FastAPI backend
      // This completely avoids CORS — the browser talks to Vite, Vite talks to FastAPI
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
 