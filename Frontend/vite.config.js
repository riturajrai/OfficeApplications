import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['html5-qrcode', 'react-qr-code', 'html-to-image'],
  },
  
})
