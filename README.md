# study-notes

Personal study notes, one module per course/source. Each module is independent —
its own content format, its own tooling (an Astro site, plain markdown, whatever
fits) — wired together at the root only for convenience (install once, run any
module's site by name).

## Modules

- **oreilly-ai-agents/** — O'Reilly AI Agents course. Astro site under `site/`
  (components/theme/AI-tutor sidebar via the `study-notes` skill), plus curriculum
  docs, learning records, and reference material.
- **udacity-masters-agentic-ai/** — Udacity Master's in AI, Agentic AI module.
  Markdown notes for now; can grow its own Astro site later (see below).

## Setup

```bash
npm install   # once, from this root — installs every module's Astro site (npm workspaces)
```

## Run a module's site

```bash
npm run dev     -w oreilly-ai-agents/site
npm run build   -w oreilly-ai-agents/site
npm run preview -w oreilly-ai-agents/site
```

Swap the `-w <module>/site` path for any other module that has a `site/`.

## Add a new module

```bash
npm run new -- <module-slug>                      # plain markdown module, no site
npm run new -- <module-slug> --site                # + an Astro lesson site
npm run new -- <module-slug> --site --capture       # + the capture-inbox Chrome extension (see the skill's CAPTURE.md)
npm run new -- <module-slug> --site --title "Human Readable Title"
```

Scaffolds `<module-slug>/` at the repo root using the `study-notes` skill's
templates. For a `--site` module, run `npm install` again afterward (root-level —
the new workspace member gets picked up automatically), then `npm run dev -w
<module-slug>/site`.

## Skill

`.claude/skills/study-notes` is symlinked here from
[`my-skills`](https://github.com/deresegetachew/my-skills) — bootstraps a new
Astro-based lesson site for any module that wants one; `scripts/new-module.mjs`
drives it for the `npm run new` command above. See the `my-skills` repo for
install instructions if you're setting this up on another machine.
