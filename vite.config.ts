import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    port: 3000,
    headers: {
      'Cache-Control': 'no-store',
    },
    sourcemapIgnoreList: (sourcePath) => {
      return sourcePath.includes('node_modules') || sourcePath.includes('anonymous');
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Serve files from the data directory
  build: {
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        sourcemapIgnoreList: (relativeSourcePath, sourcemapPath) => {
          return relativeSourcePath.includes('node_modules') || 
                 relativeSourcePath.includes('anonymous');
        },
      },
    },
  },
}); 