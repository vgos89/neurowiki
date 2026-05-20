/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

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
        // PWA — service worker via Workbox. Caches the static shell + assets
        // for instant subsequent launches; network-first for HTML so updates
        // propagate quickly. Auto-update lifecycle: registered, prompts user
        // unobtrusively on new version.
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: [
            'favicon.png',
            'favicon-16.png',
            'favicon-32.png',
            'apple-touch-icon.png',
            'icon-192.png',
            'icon-512.png',
            'icon-1024.png',
            // og-image.png is intentionally NOT precached. It is consumed by
            // external link-preview renderers (iMessage / Twitter / Slack /
            // LinkedIn / Facebook), never by the in-app surface. Precaching
            // it ballooned the PWA footprint by 3 MB after the 2026-05-19
            // image refresh and also tripped Workbox's 2 MB per-asset
            // default (https://vite-pwa-org.netlify.app/guide/faq.html).
            // Vercel still serves it normally from /og-image.png.
          ],
          manifest: false, // we ship our own /manifest.json — don't let the plugin overwrite it
          workbox: {
            // Cache: HTML network-first (so updates land fast); JS/CSS/images
            // cache-first with short stale-while-revalidate window.
            globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
            // Don't precache the giant trial data chunks — they're route-lazy.
            // Also exclude og-image.png: it's for external link-preview
            // renderers only (iMessage / Twitter / Slack), never consumed
            // in-app, and after the 2026-05-19 Nano Banana refresh it's
            // 3 MB which exceeds Workbox's 2 MB default per-asset cap.
            globIgnores: [
              '**/trialData-*.js',
              '**/TrialPageNew-*.js',
              '**/TrialVisualizations-*.js',
              '**/og-image.png',
            ],
            runtimeCaching: [
              {
                // Google Fonts CSS — stale-while-revalidate
                urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
                handler: 'StaleWhileRevalidate',
                options: { cacheName: 'gfonts-stylesheets' },
              },
              {
                // Google Fonts files — cache-first, long expiry
                urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gfonts-files',
                  expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                },
              },
              {
                // Trial data (lazy chunks) — cache-first, expire after a day
                urlPattern: /\/assets\/(trialData|TrialPageNew|TrialVisualizations)-.*\.js$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'trial-bundles',
                  expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
                },
              },
              {
                // Never cache the API endpoints (transfer relay, feedback, NPI)
                urlPattern: /\/api\//,
                handler: 'NetworkOnly',
              },
            ],
            // Navigation fallback so deep-link refreshes don't 404 offline
            navigateFallback: '/index.html',
            navigateFallbackDenylist: [/^\/api\//],
          },
          devOptions: {
            // Don't register the SW in dev — avoids dev-mode caching weirdness
            enabled: false,
          },
        }),
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
      test: {
        environment: 'node',
        setupFiles: ['./src/__tests__/setup.ts'],
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'html'],
        },
      },
    };
});
