import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force a single copy of React across all packages (wagmi, appkit, etc.)
    // Without this, nested node_modules can bundle their own React copy which
    // causes "Cannot read properties of undefined (reading 'createContext')".
    dedupe: ['react', 'react-dom', 'wagmi', 'viem', '@wagmi/core'],
    alias: {
      // Stub out @wagmi/core/tempo — removed in @wagmi/core v2.22+ but still
      // referenced by the @wagmi/connectors bundled inside appkit-adapter-wagmi.
      // tempoWallet is unused in this project so a no-op stub is safe.
      '@wagmi/core/tempo': path.resolve(__dirname, './src/stubs/wagmi-core-tempo.js'),
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@store': path.resolve(__dirname, './src/store'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@animations': path.resolve(__dirname, './src/animations'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux':   ['@reduxjs/toolkit', 'react-redux'],
          'vendor-motion':  ['framer-motion'],
          'vendor-charts':  ['recharts'],
          'vendor-wagmi':   ['wagmi', 'viem'],
          'vendor-appkit':  ['@reown/appkit', '@reown/appkit-adapter-wagmi'],
        },
      },
    },
  },
})
