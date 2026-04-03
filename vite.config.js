import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/finance-miniapp/',
  server: {
    host: true,
    allowedHosts: ['unchangingly-undecorticated-brooklyn.ngrok-free.dev']
  }
})