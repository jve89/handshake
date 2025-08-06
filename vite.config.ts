import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'src/client',
  build: {
    outDir: '../../../dist/client',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true, // enables access from network
    allowedHosts: ['.gitpod.io'], // allow any Gitpod domain
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
