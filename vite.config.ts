/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'SAMPLE_DATA.csv'],
      manifest: {
        name: 'Music Selector',
        short_name: 'Music Selector',
        description: 'Review and curate your YouTube Music liked songs with a Tinder-style swipe interface',
        theme_color: '#0f172a',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
        shortcuts: [
          { name: 'Swipe Review', url: '/#/swipe', description: 'Continue reviewing songs' },
          { name: 'Library', url: '/#/library', description: 'Browse your song library' },
        ],
        screenshots: [
          { src: 'screenshot-wide.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
          { src: 'screenshot-narrow.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/lh3\.googleusercontent\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'thumbnail-cache',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/i\.ytimg\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'ytimg-cache',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: '/',
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
