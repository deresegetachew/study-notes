#!/usr/bin/env node
// Runs a module's site script without spelling out `-w <module>/site`.
// Invoked via the root package.json's dev/build/preview scripts, e.g.:
//   npm run dev -- oreilly-ai-agents
// which resolves to: npm run dev -w oreilly-ai-agents/site

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const action = process.env.npm_lifecycle_event; // 'dev' | 'build' | 'preview'
const [slug, ...rest] = process.argv.slice(2);

if (!slug) {
  console.error(`Usage: npm run ${action} -- <module-slug> [extra args]`);
  process.exit(1);
}

const siteDir = join(ROOT, slug, 'site');
if (!existsSync(siteDir)) {
  console.error(`${slug}/site/ not found — does that module have a site? (npm run new -- ${slug} --site)`);
  process.exit(1);
}

const args = ['run', action, '-w', `${slug}/site`, ...(rest.length ? ['--', ...rest] : [])];
const result = spawnSync('npm', args, { stdio: 'inherit' });
process.exit(result.status ?? 1);
