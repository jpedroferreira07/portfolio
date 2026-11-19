import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' + HashRouter: o site funciona em qualquer endereço do GitHub Pages
export default defineConfig({
  base: './',
  plugins: [react()],
})
