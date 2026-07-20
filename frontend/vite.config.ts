import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { execSync } from 'child_process';
// @ts-expect-error — plain .mjs data/plugin, no type declarations
import { prerenderShells } from './seo/prerenderShells.mjs';

// Capture the current commit hash so error reports and bug reports can be
// tied back to a deployed version. Falls back to "dev" if git is missing.
function gitSha(): string {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); }
  catch { return 'dev'; }
}
const COMMIT = gitSha();
const BUILD_TIME = new Date().toISOString();

export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    // Workbox service worker (replaces the old hand-rolled public/sw.js).
    // injectManifest keeps our custom src/sw.ts (push notification handlers)
    // while the build injects the hashed-asset precache manifest into it.
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: null,   // main.tsx already registers /sw.js manually
      manifest: false,        // public/site.webmanifest is hand-maintained
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,webmanifest}', 'Background_*.webp', 'icons/icon-192.png', 'icons/icon-512.png'],
        globIgnores: ['videos/**', 'cesium/**'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: { enabled: false },
    }),
    // Bakes per-route static HTML with correct SEO <head> + crawlable
    // <noscript> content. Runs last (closeBundle) so build/index.html exists.
    prerenderShells(),
  ],
  base: '/', // критически важно для Vercel
  define: {
    __COMMIT__:     JSON.stringify(COMMIT),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
  },
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
        // Safe manual chunking: React + framer-motion stay together (framer
        // uses React hooks internally — splitting them caused forwardRef errors).
        // i18next and chart.js are React-independent and safe to isolate.
        manualChunks(id) {
          // 3D globe stack — only ever imported by the lazy GlobePage chunk.
          // MUST be matched before the react rule: 'react-globe.gl' would
          // otherwise be swallowed by a loose 'node_modules/react' prefix
          // and drag three.js into the boot bundle of every page.
          if (id.includes('node_modules/three/') ||
              id.includes('node_modules/globe.gl') ||
              id.includes('node_modules/react-globe.gl') ||
              id.includes('node_modules/three-') ||
              id.includes('node_modules/h3-js') ||
              id.includes('node_modules/topojson-client')) {
            return 'vendor-globe';
          }
          // React core — exact package paths (trailing slash) so react-*
          // libraries don't get pulled into the boot chunk by prefix match.
          // framer-motion stays with react: splitting them caused forwardRef
          // errors (framer uses React hooks at module init).
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/framer-motion/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // i18next is pure JS with no React dependency
          if (id.includes('node_modules/i18next') ||
              id.includes('node_modules/react-i18next')) {
            return 'vendor-i18n';
          }
          // chart.js + adapters are large and React-independent
          if (id.includes('node_modules/chart.js') ||
              id.includes('node_modules/react-chartjs-2')) {
            return 'vendor-charts';
          }
          // recharts + echarts are heavy — isolate so ProfilePage lazy-load
          // doesn't pull them into the initial bundle
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/echarts') ||
              id.includes('node_modules/zrender') ||
              id.includes('node_modules/d3-')) {
            return 'vendor-charts-2';
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