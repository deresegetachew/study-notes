# study-notes

Personal study notes, one module per course/source. Each module is independent —
its own content format, its own tooling (an Astro site, plain markdown, whatever
fits) — wired together at the root only for convenience (install once, run any
module's site by name).

## Modules

- **llms-from-scratch/** — How LLMs work under the hood (tokens, embeddings,
  attention, layers, generation), following Sebastian Raschka's *Build a Large
  Language Model (From Scratch)*. Astro site under `site/`.

- **oreilly-ai-agents/** — O'Reilly AI Agents course. Astro site under `site/`
  (components/theme/AI-tutor sidebar via the `study-notes` skill), plus curriculum
  docs, learning records, and reference material.
- **udacity-masters-agentic-ai/** — Udacity Master's in AI, Agentic AI module.
  Astro site under `site/` (same `study-notes` skill template as above), plus
  the original per-topic markdown Q&A notes at the module root — not yet
  migrated into lesson pages.

## Setup

```bash
npm install   # once, from this root — installs every module's Astro site (npm workspaces)
```

## Run a module's site

```bash
npm run dev     -- oreilly-ai-agents
npm run build   -- oreilly-ai-agents
npm run preview -- oreilly-ai-agents
```

Swap the module slug for any other module that has a `site/`. (Equivalent to
`npm run dev -w oreilly-ai-agents/site`, if you'd rather use npm's own workspace
flag directly.)

## Add a new module

```bash
npm run new -- <module-slug>                      # plain markdown module, no site
npm run new -- <module-slug> --site                # + an Astro lesson site
npm run new -- <module-slug> --site --capture       # + the capture-inbox Chrome extension (see the skill's CAPTURE.md)
npm run new -- <module-slug> --site --title "Human Readable Title"
```

Scaffolds `<module-slug>/` at the repo root using the `study-notes` skill's
templates. For a `--site` module, run `npm install` again afterward (root-level —
the new workspace member gets picked up automatically), then `npm run dev --
<module-slug>`.

## Node version

The repo pins Node in `.nvmrc` (CI reads the same file):

```bash
nvm use        # or: nvm install
```

## Runnable code (notebooks)

Modules can keep runnable examples as Jupyter notebooks in `<module>/code/`. Lessons show
them with `NotebookView` (with real outputs) and link to Colab with `OpenInColab`. See
`udacity-masters-agentic-ai/code/README.md` for running them and setting an LLM key.

## Shared components

Each module's site keeps its **own copy** of the lesson components; the
`study-notes` skill's `assets/components/` is the source of truth they were copied
from. After adding or changing a component in the skill, push it into every module
(modules with a `code/` folder also get the shared `llm.py` and `run_notebooks.py`):

```bash
npm run sync-components                      # add missing components; report ones that differ
npm run sync-components -- LessonToc.astro   # just these files
npm run sync-components -- --force          # also overwrite differing files (check the report first)
```

Some differences are intentional (e.g. `SourceBadge` labels per module), so the
script never overwrites without `--force`.

## Skill

`.claude/skills/study-notes` is symlinked here from
[`my-skills`](https://github.com/deresegetachew/my-skills) — bootstraps a new
Astro-based lesson site for any module that wants one; `scripts/new-module.mjs`
drives it for the `npm run new` command above. See the `my-skills` repo for
install instructions if you're setting this up on another machine.
