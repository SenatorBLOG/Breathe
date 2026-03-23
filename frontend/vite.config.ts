import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import cesium from 'vite-plugin-cesium';
import path from 'path';

export default defineConfig({
  plugins: [react(), mkcert(), cesium()],
  base: '/', // критически важно для Vercel
  build: {
    target: 'esnext',
    outDir: 'build',
    assetsDir: 'assets',
    cssCodeSplit: true,  // разбивает CSS
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
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