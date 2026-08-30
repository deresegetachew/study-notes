# Lesson Components

How to generate a new lesson page in `site/src/pages/lessons/`.

## File skeleton

```astro
---
import LessonLayout    from '@/layouts/LessonLayout.astro';
import LessonHeader    from '@/components/LessonHeader.astro';
import LessonDiagram   from '@/components/LessonDiagram.astro';
import CodeBlock       from '@/components/CodeBlock.astro';
import LessonCallout   from '@/components/LessonCallout.astro';
import LessonChecklist from '@/components/LessonChecklist.astro';
import LessonQuiz      from '@/components/LessonQuiz.astro';
import DeepDive        from '@/components/DeepDive.astro';
import LessonMindMap   from '@/components/LessonMindMap.astro'; // optional

// Put large code strings here — NOT inline in JSX (Astro brace-count bug)
const myCode = `...`.trim();
---

<LessonLayout title="LN — Title">
  <LessonHeader num="LN" title="Title" subtitle="One-line hook." />

  <div class="lesson-content">
    <!-- sections here -->
  </div>

</LessonLayout>
```

`LessonLayout` only takes a `title` prop — it derives prev/next itself by
looking up the current page in `src/data/lessons.ts` and renders `LessonNav`
at **both** top and bottom automatically. Do not add `LessonNav` manually, and
do not pass `prevHref`/`prevTitle`/`nextHref`/`nextTitle` — `LessonLayout`
doesn't declare those props, so passing them is silently a no-op. Getting nav
right for a new lesson means adding its entry to `lessons.ts` in the right
sequence position, nothing more.

---

## Component reference

### `LessonHeader`
Page header with breadcrumb (Blueprint → Lessons) and deep-dive anchor link.

```astro
<LessonHeader num="L3" title="Tool Design" subtitle="One sentence." />
```

Props: `num` (string), `title` (string), `subtitle?` (string).
Do **not** pass `sourceLabel`/`sourceHref` — removed.

---

### `CodeBlock`
Shiki-highlighted code block with macOS chrome and copy button.

```astro
<CodeBlock lang="typescript" label="my-file.ts" code={myCode} />
```

Props: `lang?` (default `"text"`), `label?` (default = lang), `code` (string).

**Token rule:** If the code string contains deeply nested `{}` objects (e.g. Anthropic tool schemas), define it as a `const` in the frontmatter and reference by name. Inline template literals with 3+ nesting levels of `{}` trigger an Astro brace-counting parser bug.

Supported langs: `javascript`, `typescript`, `bash`, `text`, `json`, and any Shiki-supported language.

---

### `LessonDiagram`
Mermaid diagram, rendered via CDN. Use `classDef` for coloured nodes.

```astro
<LessonDiagram definition={`
flowchart LR
  A["Step A"]:::step --> B["Decision"]:::decision --> C["Done"]:::done

  classDef step     fill:#dbeafe,color:#1e3a8a,stroke:#2563eb,stroke-width:2px
  classDef decision fill:#ede9fe,color:#4c1d95,stroke:#7c3aed,stroke-width:2px
  classDef done     fill:#dcfce7,color:#14532d,stroke:#16a34a,stroke-width:2px
  classDef warn     fill:#fee2e2,color:#7f1d1d,stroke:#dc2626,stroke-width:2px
`} />
```

Props: `definition` (string — raw Mermaid syntax, not HTML-escaped).

---

### `LessonCallout`
Callout box. Four variants:

```astro
<LessonCallout variant="tip"  title="Optional heading"><p>...</p></LessonCallout>
<LessonCallout variant="warn" title="Watch out"><p>...</p></LessonCallout>
<LessonCallout variant="info" title="Context"><p>...</p></LessonCallout>
<LessonCallout variant="key"  title="Key idea"><p>...</p></LessonCallout>
```

Props: `variant` (`tip | warn | info | key`), `title?` (string). Body via `<slot />`.

---

### `LessonChecklist`
Interactive checklist (click to cross off). Items support inline HTML.

```astro
<LessonChecklist
  title="What you built"
  items={[
    'Stateful agent with file-based persistence',
    'Thread trimming — keeps last <code>N</code> turns',
    'Swap-ready storage layer for Postgres/Redis',
  ]}
/>
```

Props: `title?` (string), `items` (string[] — each item may contain HTML tags).

---

### `LessonQuiz`
4-option multiple-choice quiz (click to reveal answer + explanation).

Each question renders a 🦝 button. Clicking it dispatches `ai-sensei:focus` with the question + all options pre-formatted as the chat input. No extra props needed — built-in.

```astro
<LessonQuiz questions={[
  {
    q:       'Question text?',
    options: ['A', 'B', 'C', 'D'],
    answer:  0,        // 0-indexed correct option
    explain: 'Why A is correct.',
  },
]} />
```

Props: `questions` (array). Each question: `q`, `options` (4 strings), `answer` (0–3), `explain`.

**Token rule:** Do not include `{}` in the `q` string — Astro parser misreads braces in JSX string attributes. Rephrase to avoid curly braces in question text.

---

### `DeepDive`
Collapsible senior/staff section. Renders tensions, questions with reveal, and pitfalls.

Each `DeepDive` renders a 🦝 button in its `<summary>` bar. Clicking it dispatches `ai-sensei:focus` with the section's tensions, questions, and pitfalls pre-formatted as the chat input. No extra props needed — built-in.

```astro
<DeepDive
  sources="l1_1.9"
  tensions={[
    { a: 'Supervisor clarity', b: 'Bottleneck risk' },
  ]}
  questions={[
    {
      q:      'Hard open-ended question?',
      hint:   'Steering prompt for the reader.',
      answer: '<p>HTML answer string. Use &#123; &#125; for curly braces.</p>',
    },
  ]}
  pitfalls={[
    'One-line pitfall description.',
  ]}
/>
```

Props: `sources?` (string), `tensions?` (`{a,b}[]`), `questions?` (`{q, hint?, answer}[]`), `pitfalls?` (string[]).

**Token rule:** `answer` is an HTML string rendered via `set:html`. Use `&#123;` / `&#125;` for `{` / `}` and `&lt;` / `&gt;` for angle brackets inside answers.

**JSX curly-brace rule (applies everywhere in the template, not just DeepDive):** Any `{...}` inside JSX — even inside `<code>`, `<li>`, `<p>` — is parsed as a JavaScript expression. To display a literal curly brace, always use `&#123;` for `{` and `&#125;` for `}`. This applies to inline text like `<code>&#123; key, value &#125;</code>` and to HTML strings passed as props.

---

### `LessonMindMap`
Modal mind-map overlay rendered from a markdown outline, via `markmap-autoloader`
(CDN, already wired into `LessonLayout.astro` — no per-lesson setup needed).
Injects a "◈ mind map" trigger button into the breadcrumb on mount. Used in
nearly every lesson in this module — a good default to include.

```astro
const mindMap = `
# Tool Design & Structured Output
## Why It Matters
### LLM sees only name, description, schema
## Input Schema
### Per-property descriptions
`.trim();
```
```astro
<LessonMindMap content={mindMap} />
```

Props: `content` (string — markdown hierarchy; **first line must be `# Title`**,
then `##`/`###` for nested levels). Define as a frontmatter `const`. Place the
call anywhere in the template (commonly right before `</LessonLayout>`) — it
renders as a fixed overlay, not inline content.

---

## Page structure conventions

- One `<h2 class="lesson-heading">` per major section.
- `<h3 class="lesson-heading">` for sub-sections.
- Use `<p>`, `<ul>`, `<ol>` for prose — no raw `<div>` wrappers for text.
- `<div class="lesson-table"><table>…</table></div>` for comparison tables.
- For lesson-specific layout (grids, cards) that don't fit existing components: add a `<style>` block at the bottom of the file with scoped classes. Do **not** use inline `style=` attributes.
- The only acceptable inline `style=` uses are for **dynamic values from data** (e.g. `style={`width:${pct}%`}`).

## Style exhaustion rule — MUST follow before writing any new CSS

Before adding any new class or `<style>` block, exhaust these existing options **in order**:

1. **Headings:** `<h2 class="lesson-heading">` / `<h3 class="lesson-heading">` — never use `<h4>` with inline styles.
2. **Prose:** `<p>`, `<ul>`, `<ol>`, `<strong>`, `<em>`, `<code>` — cover almost all text content.
3. **Tables:** `<div class="lesson-table"><table>` — use for any comparison or multi-column data.
4. **Components:** `LessonCallout`, `LessonDiagram`, `CodeBlock`, `LessonChecklist`, `LessonQuiz`, `DeepDive`, `LessonMindMap`.
5. **Global classes from `global.css`:** `lesson-content`, `callout-*`, `lesson-diagram`, `lesson-table`, etc.

Only if none of the above achieves the layout should you add a new scoped `<style>` block. When you do:
- Add to the **bottom** of the file.
- Use descriptive class names prefixed by the lesson number (e.g. `.l25-phase-def`, not `.phase-def`).
- **Never** write inline `style=` attributes for anything that could be a class.
- Check if the new style is reusable across lessons — if so, add it to `global.css` instead of the file's `<style>` block.

## Navigation

See the file-skeleton note above — `LessonLayout` derives prev/next itself
from `src/data/lessons.ts`, no props to pass.

## Page URL → file naming

`/lessons/000N-slug` → `src/pages/lessons/000N-slug.astro`, and add a matching
entry to `src/data/lessons.ts`'s `LESSONS` array in sequence order — that file
is the source of truth for lesson order, not this doc (which would only go
stale if kept in sync by hand).
