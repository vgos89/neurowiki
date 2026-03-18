import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: parseInt(process.env.PORT || '3000'),
        host: '0.0.0.0',
        proxy: {
          '/api/npi': {
            target: 'https://npiregistry.cms.hhs.gov',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/npi/, '/api/'),
          },
        },
      },
      plugins: [
        react(),
        tailwindcss(),
        ...(process.env.ANALYZE === 'true' ? [visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true })] : []),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        minify: true,
        sourcemap: false,
        target: 'es2020',
        cssMinify: true,
        reportCompressedSize: true,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              if (id.includes('node_modules')) {
                if (id.includes('react-router-dom') || id.includes('react-dom') || (id.includes('/react/') && !id.includes('react-markdown'))) return 'react-vendor';
                if (id.includes('lucide-react')) return 'lucide';
              }
            },
          },
        },
      },
      esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },
    };
});
