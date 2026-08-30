## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — `CONTEXT.md` + `docs/adr/` at root. See `docs/agents/domain.md`.

### Lesson components

Astro component system for generating study lesson pages in `site/`. See `docs/agents/lesson-components.md`.

**Style rule (enforced):** Before writing any new CSS, exhaust existing global styles and components first — `<h2/h3 class="lesson-heading">`, `<p>/<ul>`, `<div class="lesson-table">`, `LessonCallout`, `LessonDiagram`, `CodeBlock`. Never use inline `style=` attributes. Only add a `<style>` block when existing classes genuinely cannot achieve the layout. See the **Style exhaustion rule** section in `docs/agents/lesson-components.md`.

### AI Tutor (Rocket 🦝)

Gemini-powered chat sidebar embedded in every lesson page. See `docs/agents/ai-tutor.md`.

**Rules:**
- `AiTutor`, `ThemeHead`, `ThemeToggle` are already wired into `LessonLayout` — do **not** add them again to lesson pages.
- Any **new standalone page** (its own `<html>/<head>`, not using `LessonLayout`) must include `<ThemeHead />` in `<head>` and `<ThemeToggle />` before `</body>`.
- API key and config live in `localStorage` only — no server, no env vars.
- Custom event `ai-sensei:focus` (with `{ detail: { text } }`) dispatched from any component opens the panel and pre-fills the input. Use this to add AI shortcuts to new components.
- Never use `hidden` attribute on the modal — use `.is-open` CSS class (specificity bug: ID selector beats `[hidden]`). See `docs/agents/ai-tutor.md`.

### Theme system

Dark/light mode via `.dark` class on `<html>`, persisted to `localStorage('ai-theme')`.

- `ThemeHead.astro` — anti-FOUC init script, goes in `<head>`.
- `ThemeToggle.astro` — moon/sun button, goes before `</body>`.
- Both are already included via `LessonLayout`. Add to any new standalone page.
- CSS dark overrides use `:root.dark .selector` pattern in `global.css`. Never add `@media (prefers-color-scheme: dark)` — JS class is the single source of truth.
