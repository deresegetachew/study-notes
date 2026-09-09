#!/usr/bin/env node
// Scaffold a new study-notes module.
//
// Usage:
//   npm run new -- <module-slug>                    # plain markdown module (like udacity-masters-agentic-ai)
//   npm run new -- <module-slug> --site              # + an Astro lesson site (like oreilly-ai-agents), via the study-notes skill
//   npm run new -- <module-slug> --site --capture     # + the dev-only capture inbox / Chrome extension (see CAPTURE.md)
//   npm run new -- <module-slug> --site --title "Human Readable Title"

import { existsSync, mkdirSync, cpSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKILL = join(ROOT, '.claude/skills/study-notes');

const args = process.argv.slice(2);
const slug = args.find(a => !a.startsWith('--'));
const withSite = args.includes('--site');
const titleFlagIdx = args.indexOf('--title');
const title = titleFlagIdx !== -1 ? args[titleFlagIdx + 1] : toTitle(slug);

if (!slug) {
  console.error('Usage: npm run new -- <module-slug> [--site] [--title "Human Title"]');
  process.exit(1);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error(`Slug "${slug}" should be kebab-case, e.g. "stanford-cs224n".`);
  process.exit(1);
}

const moduleDir = join(ROOT, slug);
if (existsSync(moduleDir)) {
  console.error(`${slug}/ already exists.`);
  process.exit(1);
}

function toTitle(s) {
  return (s ?? '').split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ');
}

mkdirSync(moduleDir, { recursive: true });

if (!withSite) {
  writeFileSync(
    join(moduleDir, 'README.md'),
    `# ${title}\n\nMarkdown study notes for ${title}. One \`.md\` file per topic — no fixed\nformat required. Add an Astro lesson site later with:\n\n\`\`\`bash\nnpm run new -- ${slug} --site\n\`\`\`\n\n(after removing this folder first, or scaffold a sibling and merge).\n`
  );
  console.log(`Created ${slug}/ (markdown module). Start writing: ${slug}/<topic>.md`);
  process.exit(0);
}

// --site: bootstrap an Astro lesson site from the study-notes skill's assets.
if (!existsSync(SKILL)) {
  console.error(`Skill assets not found at ${SKILL} — is .claude/skills/study-notes symlinked?`);
  process.exit(1);
}

const siteDir = join(moduleDir, 'site');
mkdirSync(join(siteDir, 'src/components'), { recursive: true });
mkdirSync(join(siteDir, 'src/layouts'), { recursive: true });
mkdirSync(join(siteDir, 'src/styles'), { recursive: true });
mkdirSync(join(siteDir, 'src/data'), { recursive: true });
mkdirSync(join(siteDir, 'src/pages/lessons'), { recursive: true });

cpSync(join(SKILL, 'assets/components'), join(siteDir, 'src/components'), { recursive: true });
cpSync(join(SKILL, 'assets/layouts/LessonLayout.astro'), join(siteDir, 'src/layouts/LessonLayout.astro'));
cpSync(join(SKILL, 'assets/styles/global.css'), join(siteDir, 'src/styles/global.css'));
cpSync(join(SKILL, 'assets/tsconfig.json'), join(siteDir, 'tsconfig.json'));

// The skill's own astro.config.mjs template hardcodes the capture-inbox
// integration (see CAPTURE.md) — only wire it in when --capture is passed,
// otherwise a module without the Chrome extension fails to build.
const withCapture = args.includes('--capture');
if (withCapture) {
  cpSync(join(SKILL, 'assets/astro.config.mjs'), join(siteDir, 'astro.config.mjs'));
  cpSync(join(SKILL, 'assets/integrations/capture-inbox.mjs'), join(siteDir, 'capture-inbox.mjs'));
  cpSync(join(SKILL, 'assets/chrome-extension'), join(moduleDir, 'chrome-extension'), { recursive: true });
} else {
  writeFileSync(
    join(siteDir, 'astro.config.mjs'),
    `import { defineConfig } from 'astro/config';\n\nexport default defineConfig({\n  // Static output — build produces plain HTML in dist/\n  output: 'static',\n  // Subpath deploys (e.g. GitHub Pages) set ASTRO_BASE before building.\n  base: process.env.ASTRO_BASE || '/',\n});\n`
  );
}

writeFileSync(
  join(siteDir, 'src/data/lessons.ts'),
  `export interface LessonEntry {\n  href:  string;\n  num:   string;\n  title: string;\n}\n\n// Ordered list drives LessonLayout's auto prev/next nav — keep in sequence.\nexport const LESSONS: LessonEntry[] = [];\n`
);

const pkgTemplate = JSON.parse(readFileSync(join(SKILL, 'assets/package.json.template'), 'utf8'));
pkgTemplate.name = `${slug}-site`;
writeFileSync(join(siteDir, 'package.json'), JSON.stringify(pkgTemplate, null, 2) + '\n');

writeFileSync(
  join(siteDir, 'src/pages/index.astro'),
  `---\nimport ThemeHead   from '@/components/ThemeHead.astro';\nimport ThemeToggle from '@/components/ThemeToggle.astro';\nimport { LESSONS } from '@/data/lessons';\n\n// lessons.ts stores routes without the deploy subpath — prefix with the\n// configured base so links work under a subpath deploy (e.g. GitHub Pages).\nconst base = import.meta.env.BASE_URL.replace(/\\/$/, '');\n---\n<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <ThemeHead />\n  <title>${title}</title>\n  <link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" />\n</head>\n<body>\n  <article class="lesson-article">\n    <h1>${title}</h1>\n    {LESSONS.length === 0 && <p>No lessons yet.</p>}\n    <ul>\n      {LESSONS.map(l => <li><a href={base + l.href}>{l.num} — {l.title}</a></li>)}\n    </ul>\n  </article>\n  <ThemeToggle />\n</body>\n</html>\n\n<style is:global>\n  @import '../styles/global.css';\n</style>\n`
);

writeFileSync(
  join(siteDir, '.gitignore'),
  withCapture ? 'node_modules/\ndist/\n.astro/\ncaptures/\n' : 'node_modules/\ndist/\n.astro/\n'
);

console.log(`Created ${slug}/site/ (Astro lesson site)${withCapture ? ' + capture inbox (see CAPTURE.md — load chrome-extension/ unpacked)' : ''}.`);
console.log('Next: npm install   # from the study-notes root — the workspace picks it up');
console.log(`Then: npm run dev -w ${slug}/site`);
