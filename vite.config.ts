import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Precache the built app shell/assets for offline use.
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'TodoApp',
        short_name: 'TodoApp',
        description: 'Organize your todos with categories, tags, and smart lists.',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Precache the app shell (JS/CSS/HTML/images) emitted by the build.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Serve index.html for navigations when offline (SPA fallback).
        navigateFallback: '/index.html',
        // Do NOT cache API responses: auth + freshness must stay network-driven.
        navigateFallbackDenylist: [/^\/api/],
      },
      // Keep the SW out of the dev server so it never interferes with HMR/tests.
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
