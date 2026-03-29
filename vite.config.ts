import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving assets from the monorepo workspace root so that
      // file-type templates and their assets located outside uverify-ui
      // can be served during development.
      allow: [path.resolve(__dirname, '..')],
    },
  },
}));
