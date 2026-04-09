import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    react(),
    // Generate .gz pre-compressed copies of all assets ≥ 1 KB
    compression({ algorithm: 'gzip', exclude: /\.(png|jpg|jpeg|gif|webp|ico)$/ }),
    // Generate .br (brotli) copies for modern clients
    compression({ algorithm: 'brotliCompress', exclude: /\.(png|jpg|jpeg|gif|webp|ico)$/ }),
  ],
  base: '/finance-miniapp/',
  assetsInlineLimit: 1024 * 200, // inline all SVGs as base64 — no separate requests
  build: {
    rollupOptions: {
      output: {
        // Split vendor chunks so they cache independently
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
