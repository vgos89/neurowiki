import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        ...(process.env.ANALYZE === 'true' ? [visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true })] : []),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
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
                if (id.includes('@google/genai')) return 'genai';
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
