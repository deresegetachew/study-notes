import { defineConfig } from 'astro/config';
import captureInbox from './capture-inbox.mjs';

export default defineConfig({
  // Static output — build produces plain HTML in dist/
  output: 'static',
  // Subpath deploys (e.g. GitHub Pages) set ASTRO_BASE before building.
  base: process.env.ASTRO_BASE || '/',
  // Dev-only capture inbox for the study-notes Chrome extension (see the
  // skill's CAPTURE.md). Registers Vite dev middleware only — never present
  // in the production build.
  integrations: [captureInbox()],
});
