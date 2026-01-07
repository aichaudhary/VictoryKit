import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3025,
    proxy: {
      '/api': {
        target: 'http://localhost:4025',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:4025',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
