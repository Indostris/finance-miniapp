import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/finance-miniapp/',
  assetsInlineLimit: 1024 * 200, // inline all SVGs as base64 — no separate requests
  server: {
    host: true,
    allowedHosts: ['unchangingly-undecorticated-brooklyn.ngrok-free.dev'],
  },
})