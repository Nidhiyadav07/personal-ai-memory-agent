import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const api = 'http://localhost:8000'

export default defineConfig(({ command }) => ({
  // FastAPI serves the built app at /ui/
  base: command === 'build' ? '/ui/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': api,
      '/chat': api,
      '/sessions': api,
      '/documents': api,
    },
  },
}))
