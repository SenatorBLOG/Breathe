import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import cesium from 'vite-plugin-cesium';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    // vite-plugin-cesium copies Cesium static assets to /public/cesium.
    // We do NOT inject a global <script> tag — CesiumGlobe.tsx loads
    // Cesium.js on-demand via a dynamic script loader so it only downloads
    // on the /globe route.
    cesium({ rebuildCesium: false }),
  ],
  base: '/', // критически важно для Vercel
  build: {
    target: 'esnext',
    outDir: 'build',
    assetsDir: 'assets',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Split vendor libraries into separate chunks so browsers can cache
        // them independently and the entry chunk stays small
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion'))  return 'vendor-framer';
            if (id.includes('react-router'))   return 'vendor-router';
            if (id.includes('react-oauth'))    return 'vendor-oauth';
            if (id.includes('@radix-ui'))      return 'vendor-radix';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            return 'vendor';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      protocol: 'ws',
      host:     'localhost',
      port:     3000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
});