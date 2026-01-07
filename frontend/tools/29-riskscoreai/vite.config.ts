import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3029,
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4029',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: 'ws://localhost:6029',
        ws: true,
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 3029,
    host: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['lucide-react'],
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },

  define: {
    'import.meta.env.VITE_APP_NAME': JSON.stringify('RiskScoreAI'),
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:4029'),
    'import.meta.env.VITE_WS_URL': JSON.stringify('ws://localhost:6029'),
    'import.meta.env.VITE_ML_URL': JSON.stringify('http://localhost:8029'),
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'lucide-react', 'date-fns'],
  },
});
