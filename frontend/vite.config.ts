import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import cesium from 'vite-plugin-cesium';
import path from 'path';

/**
 * vite-plugin-cesium unconditionally injects:
 *   <link rel="stylesheet" href="/cesium/Widgets/widgets.css">
 *   <script src="/cesium/Cesium.js"></script>
 * into index.html — making them render-blocking on EVERY page.
 * CesiumGlobe.tsx already loads these on-demand via a dynamic script/link
 * loader (only when the user switches to the Cesium globe style on /globe).
 * This plugin strips the injected tags from the final HTML so Cesium
 * is never eagerly fetched, saving ~1.7 MB on every page load.
 */
function removeCesiumHtmlInjection(): Plugin {
  return {
    name: 'remove-cesium-html-injection',
    enforce: 'post',
    transformIndexHtml(html) {
      return html
        .replace(/<link[^>]+cesium\/Widgets\/widgets\.css[^>]*>\s*/gi, '')
        .replace(/<script[^>]+cesium\/Cesium\.js[^>]*><\/script>\s*/gi, '');
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    // Copies Cesium static assets to /public/cesium at build time.
    // CesiumGlobe.tsx loads Cesium.js on-demand — only when the user
    // switches to the Cesium globe style on /globe.
    cesium({ rebuildCesium: false }),
    // Must run AFTER cesium() so it can strip the script/link tags it injects.
    removeCesiumHtmlInjection(),
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
        // No manualChunks — let Rollup's default chunking keep React and all
        // vendor libs in a safe load order. Manual splitting was causing
        // "Cannot read properties of undefined (reading 'forwardRef')" because
        // libraries in 'vendor' called React APIs before 'vendor-react' loaded.
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