import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import cesium from 'vite-plugin-cesium';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    cesium(),
    // Make Cesium non-render-blocking: defer the JS, load CSS async
    {
      name: 'defer-cesium',
      transformIndexHtml: {
        order: 'post',
        handler(html: string) {
          return html
            // Add defer to Cesium.js script tag
            .replace(
              /<script src="\/cesium\/Cesium\.js"><\/script>/,
              '<script defer src="/cesium/Cesium.js"></script>',
            )
            // Load widgets.css without blocking render (media print trick)
            .replace(
              /<link rel="stylesheet" href="\/cesium\/Widgets\/widgets\.css">/,
              '<link rel="stylesheet" media="print" onload="this.media=\'all\'" href="/cesium/Widgets/widgets.css"><noscript><link rel="stylesheet" href="/cesium/Widgets/widgets.css"></noscript>',
            );
        },
      },
    },
  ],
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