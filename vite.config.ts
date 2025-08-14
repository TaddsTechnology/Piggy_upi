import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      external: [
        // Server-side Node.js modules that shouldn't be bundled
        'express-rate-limit',
        'express-validator',
        'bcryptjs',
        'jsonwebtoken',
        'helmet',
        'cors',
        'multer',
        'sharp',
        'net',
        'fs',
        'path',
        'crypto'
      ]
    }
  },
  define: {
    // Define process.env for browser compatibility
    'process.env': {}
  }
});
