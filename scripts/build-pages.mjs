#!/usr/bin/env node
// Builds every module that has a site/ into a combined static site for
// GitHub Pages: each module at /<module-slug>/, plus a generated landing
// page at the root linking to them. Used by .github/workflows/deploy-pages.yml
// and safe to run locally for a full preview (`node scripts/build-pages.mjs`).

import { existsSync, mkdirSync, cpSync, rmSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, '_site');

// The GitHub Pages project-site prefix — https://<owner>.github.io/<repo>/.
// Override with PAGES_REPO_BASE if the repo is ever renamed or this runs
// somewhere other than the standard project-site URL.
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const REPO_BASE = process.env.PAGES_REPO_BASE || `/${pkg.name}`;

const moduleSlugs = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(ROOT, d.name, 'site', 'package.json')))
  .map((d) => d.name)
  .sort();

if (moduleSlugs.length === 0) {
  console.error('No modules with a site/ found — nothing to build.');
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
// Stops GitHub Pages' Jekyll processor from ignoring Astro's _astro/ asset dirs.
writeFileSync(join(OUT, '.nojekyll'), '');

const modules = [];

for (const slug of moduleSlugs) {
  const base = `${REPO_BASE}/${slug}`;
  console.log(`\n=== Building ${slug} (base: ${base}) ===`);

  const result = spawnSync('npm', ['run', 'build', '-w', `${slug}/site`], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ASTRO_BASE: base },
  });
  if (result.status !== 0) {
    console.error(`Build failed for ${slug}`);
    process.exit(result.status ?? 1);
  }

  const distDir = join(ROOT, slug, 'site', 'dist');
  const destDir = join(OUT, slug);
  cpSync(distDir, destDir, { recursive: true });

  const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf8');
  const titleMatch = indexHtml.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : prettify(slug);
  modules.push({ slug, title });
}

writeFileSync(join(OUT, 'index.html'), landingPage(modules, REPO_BASE));
console.log(`\n=== Assembled ${modules.length} module(s) into ${OUT} ===`);
modules.forEach((m) => console.log(`  - ${m.title}  →  ${REPO_BASE}/${m.slug}/`));

function prettify(slug) {
  return slug.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');
}

function landingPage(modules, base) {
  const items = modules
    .map((m) => `        <li><a href="${base}/${m.slug}/">${escapeHtml(m.title)}</a></li>`)
    .join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light dark" />
<title>Study Notes</title>
<script>
  (function(){
    var saved = localStorage.getItem('ai-theme');
    var osDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && osDark)) document.documentElement.classList.add('dark');
  })();
</script>
<style>
  :root { --ink:#1a1a1a; --muted:#666; --bg:#fafaf8; --bg2:#f5f5f2; --border:#e5e5e0; --accent:#2563eb; }
  :root.dark { --ink:#e4e4e0; --muted:#888; --bg:#141414; --bg2:#1e1e1e; --border:#2e2e2e; --accent:#5b8ef5; }
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, serif;
    background: var(--bg); color: var(--ink);
    max-width: 640px; margin: 0 auto; padding: 4rem 1.5rem 6rem;
    line-height: 1.7;
  }
  h1 { font-size: 1.7rem; margin-bottom: .4rem; }
  p.sub { color: var(--muted); margin-bottom: 2.2rem; }
  ul { list-style: none; padding: 0; margin: 0; }
  li { border-top: 1px solid var(--border); }
  li:last-child { border-bottom: 1px solid var(--border); }
  a {
    display: block; padding: 1rem .25rem;
    color: var(--ink); text-decoration: none; font-size: 1.05rem;
  }
  a:hover { color: var(--accent); }
</style>
</head>
<body>
  <h1>Study Notes</h1>
  <p class="sub">Personal study notes, one module per course.</p>
  <ul>
${items}
  </ul>
</body>
</html>
`;
}

function escapeHtml(str) {
  return str.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
