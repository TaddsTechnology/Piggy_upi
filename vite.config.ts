import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { analyzer } from "vite-bundle-analyzer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'analyze' && analyzer()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Code splitting configuration
    rollupOptions: {
      external: [
        // Exclude Node.js modules from browser bundle
        'express-rate-limit',
        'express-validator',
        'bcryptjs',
        'jsonwebtoken',
        'helmet',
        'cors',
        'multer',
        'sharp'
      ],
      output: {
        manualChunks: {
          // Vendor chunk for large dependencies
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          'chart-vendor': ['recharts'],
          'query-vendor': ['@tanstack/react-query'],
          'table-vendor': ['@tanstack/react-table'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    },
    // Optimize build size
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Source maps for debugging
    sourcemap: mode === 'development',
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'recharts'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  // Define global variables
  define: {
    __DEV__: mode === 'development',
    __PROD__: mode === 'production',
  }
}));
