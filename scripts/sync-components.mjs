#!/usr/bin/env node
// Copy components from the study-notes skill (the source of truth) into every
// module that has a site/. Modules keep their own copies — this is how a new or
// updated shared component reaches them.
//
// Usage:
//   npm run sync-components                       # copy components a module is missing; report ones that differ
//   npm run sync-components -- LessonToc.astro    # only these files
//   npm run sync-components -- --force            # also overwrite files that differ (check the report first)
//
// Files that differ on purpose per module (e.g. SourceBadge labels) are never
// overwritten without --force, and are listed so you can decide.

import { existsSync, readdirSync, readFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC = join(ROOT, '.claude/skills/study-notes/assets/components');

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((a) => !a.startsWith('--'));

if (!existsSync(SRC)) {
  console.error(`Skill components not found at ${SRC} — is .claude/skills/study-notes symlinked?`);
  process.exit(1);
}

const files = readdirSync(SRC).filter((f) => !f.startsWith('.') && (only.length === 0 || only.includes(f)));
const missing = only.filter((f) => !files.includes(f));
if (missing.length) console.warn(`Not in the skill: ${missing.join(', ')}`);

const modules = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(ROOT, d.name, 'site', 'package.json')))
  .map((d) => d.name)
  .sort();

let differing = 0;
for (const mod of modules) {
  const dest = join(ROOT, mod, 'site/src/components');
  const lines = [];
  for (const f of files) {
    const from = join(SRC, f), to = join(dest, f);
    if (!existsSync(to)) {
      copyFileSync(from, to);
      lines.push(`  + ${f} (added)`);
    } else if (readFileSync(from, 'utf8') !== readFileSync(to, 'utf8')) {
      if (force) { copyFileSync(from, to); lines.push(`  ~ ${f} (overwritten)`); }
      else { differing++; lines.push(`  ! ${f} differs from the skill — kept (use --force to overwrite)`); }
    }
  }
  console.log(`${mod}: ${lines.length ? '\n' + lines.join('\n') : 'up to date'}`);
}
if (differing && !force) console.log('\nDiffering files may be intentional per-module edits; review before using --force.');
