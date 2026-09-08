import { defineConfig } from 'vite'

// Single-page app: one entry, client-side router handles /work/:slug.
// `appType: 'mpa'` off — we want SPA fallback for deep links in dev/preview.
export default defineConfig({
  build: {
    target: 'esnext',
  },
})
