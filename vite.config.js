import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Strip all console.log / debugger calls from production builds
    // so client data and internal flow are never exposed in DevTools
    minify: 'esbuild',
    sourcemap: false, // Never ship source maps to production
    rollupOptions: {
      output: {
        // Randomise chunk names — makes enumeration harder
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
        // Split heavy vendors into cacheable chunks (better LCP / Core Web Vitals)
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
  esbuild: {
    // Drop console.* and debugger in production
    drop: ['console', 'debugger'],
  },
})
