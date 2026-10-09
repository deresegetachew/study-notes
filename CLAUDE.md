# study-notes

One module per course/source (see `README.md`). Modules with a `site/` are Astro
lesson sites built from the `study-notes` skill (`.claude/skills/study-notes`, symlinked
from the `my-skills` repo).

## Writing or editing lesson pages

- Load the `study-notes` skill first and follow `SKILL.md` + `REFERENCE.md`.
- **Every lesson ends with the four required sections**: checklist, quick-check quiz,
  `DeepDive`, `LessonMindMap`. Older pages may lack them — add them when you touch a page.
- Mark sections with `SourceBadge` in modules that mix sources (e.g. the Udacity
  module: course material vs. own notes). Ask where content came from; don't guess.
- Build the module after editing (`npm run build -- <module>`) to catch Astro parse errors.
- New or changed shared components go in the skill first (`.claude/skills/study-notes/assets/components/`),
  then `npm run sync-components` copies them into every module.
- Long lessons get `<LessonToc />` at the top of `.lesson-content`; `FloatingToc` is already in `LessonLayout`.
- Runnable examples live as notebooks in `<module>/code/` and are shown **whole, once per lesson** with `NotebookView`
  (+ Open in Colab), not as code strings in pages. After editing a notebook, re-run it:
  `code/.venv/bin/python code/run_notebooks.py`. Short non-runnable snippets stay `CodeBlock`.
- Use the Node version in `.nvmrc` (`nvm use`); the notebook renderer needs Node ≥ 22.

## Modules

- `udacity-masters-agentic-ai/` — Udacity Master's (course material, 🎓 Course badges).
  The program has several courses (Agentic AI is course 1): every `LESSONS` entry in
  `site/src/data/lessons.ts` needs a `course` id, and new courses go in `COURSES`.
  The contents page reads badges from the lesson files and lists the
  `llms-from-scratch` deep dives at the bottom (`DEEP_DIVES`) — keep that list in sync.
  Has a capture inbox: check `captures/pending.jsonl` when asked (see the skill's `CAPTURE.md`).
- `llms-from-scratch/` — notes following Raschka's *Build a Large Language Model (From Scratch)*.
- `oreilly-ai-agents/` — has its own `CLAUDE.md` with module-specific rules.

## Don't commit

- `udacity-masters-agentic-ai/excercises/` — course notebooks containing an API key.
