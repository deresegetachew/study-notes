import { defineConfig } from 'astro/config';

export default defineConfig({
  // Static output — `bun run build` produces plain HTML in dist/
  output: 'static',
  // Subpath deploys (e.g. GitHub Pages) set ASTRO_BASE before building.
  base: process.env.ASTRO_BASE || '/',
});
