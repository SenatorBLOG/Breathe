import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert'
import path from 'path';

export default defineConfig({
  plugins: [react(), mkcert()],
  base: '/',
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://breathe-two-plum.vercel.app/api')
  },  
  
  resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Удаляй все с версиями, Vite сам найдёт из node_modules
        // Если нужно, просто '@radix-ui/react-dialog': '@radix-ui/react-dialog', но это бесполезно
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
    css: {
      postcss: './postcss.config.js',
    },
  });