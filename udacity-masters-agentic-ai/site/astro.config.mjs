import { defineConfig } from 'astro/config';
import captureInbox from './capture-inbox.mjs';

export default defineConfig({
  // Static output — build produces plain HTML in dist/
  output: 'static',
  // Dev-only capture inbox for the study-notes Chrome extension (see the
  // skill's CAPTURE.md). Registers Vite dev middleware only — never present
  // in the production build.
  integrations: [captureInbox()],
});
