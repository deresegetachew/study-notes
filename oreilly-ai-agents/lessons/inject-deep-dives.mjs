/**
 * Reads DEEP_DIVES from AI_Agents_Study_Hub.html, injects the relevant
 * section into each lesson file, then generates a TOC page.
 *
 * Run: node lessons/inject-deep-dives.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT   = join(dirname(fileURLToPath(import.meta.url)), '..');
const LESSON = join(ROOT, 'lessons');

// ── 1. Extract DEEP_DIVES from the study hub ──────────────────────────────────

const hub = readFileSync(join(ROOT, 'AI_Agents_Study_Hub.html'), 'utf8');
const ddMatch = hub.match(/var DEEP_DIVES = (\{[\s\S]*?\});\s*\n/);
if (!ddMatch) { console.error('DEEP_DIVES not found'); process.exit(1); }
const DD = JSON.parse(ddMatch[1]);

// ── 2. Map lesson files → deep dive keys ─────────────────────────────────────

const LESSON_MAP = [
  {
    file: '0001-what-is-an-ai-agent.html',
    title: 'What is an AI Agent?',
    keys: ['l1_1.1', 'l1_1.2'],
    subtitle: 'Core components, agent vs chain, prompt engineering tensions',
  },
  {
    file: '0002-your-first-agent-in-nodejs.html',
    title: 'Your First Agent in Node.js',
    keys: ['l2_2.5', 'l2_2.6'],
    subtitle: 'Custom ReAct loop, termination, loop control',
  },
  {
    file: '0003-tool-design-and-structured-output.html',
    title: 'Tool Design & Structured Output',
    keys: ['l1_1.6', 'l2_2.2', 'l2_2.3'],
    subtitle: 'Tool granularity, structured schemas, error handling strategy',
  },
  {
    file: '0004-memory-and-conversation-state.html',
    title: 'Memory & Conversation State',
    keys: ['l1_1.8', 'l2_2.11'],
    subtitle: 'Memory freshness vs. retrieval, stateful vs. stateless',
  },
  {
    file: '0005-building-a-nestjs-agent-service.html',
    title: 'Building a NestJS Agent Service',
    keys: ['l2_2.1', 'l2_2.9'],
    subtitle: 'Production readiness, observability, debugging at scale',
  },
  {
    file: '0006-multi-agent-systems.html',
    title: 'Multi-Agent Systems',
    keys: ['l1_1.9'],
    subtitle: 'Supervisor complexity, isolation, coordination overhead',
  },
  {
    file: '0007-capstone-project.html',
    title: 'Capstone: SupportDesk Agent API',
    keys: ['l1_1.4', 'l1_1.11', 'l2_2.17'],
    subtitle: 'Autonomy levels, security, measuring agent quality',
  },
];

// ── 3. HTML renderer for a deep dive section ──────────────────────────────────

function renderDeepDive(keys) {
  const sections = keys.map(k => DD[k]).filter(Boolean);
  if (!sections.length) return '';

  const allTensions   = sections.flatMap(s => s.tensions   || []);
  const allQuestions  = sections.flatMap(s => s.questions  || []);
  const allPitfalls   = sections.flatMap(s => s.pitfalls   || []);

  let h = '';

  // Tensions
  if (allTensions.length) {
    h += '<div class="dd-block">\n';
    h += '<div class="dd-block-title">&#9889; Engineering tensions</div>\n';
    allTensions.forEach(([label, body]) => {
      h += `<div class="dd-tension"><span class="dd-tension-label">${label}</span><span class="dd-tension-sep">—</span><span class="dd-tension-body">${body}</span></div>\n`;
    });
    h += '</div>\n';
  }

  // Questions
  if (allQuestions.length) {
    h += '<div class="dd-block">\n';
    h += '<div class="dd-block-title">&#128172; Staff-level questions</div>\n';
    allQuestions.forEach((qobj, i) => {
      const q    = typeof qobj === 'string' ? qobj : qobj.q;
      const hint = typeof qobj === 'object' ? (qobj.hint   || '') : '';
      const ans  = typeof qobj === 'object' ? (qobj.answer || '') : '';
      const id   = `ddq-${keys.join('-')}-${i}`;
      h += `<div class="dd-q">\n`;
      h += `<div class="dd-q-num">Q${i + 1}</div>\n`;
      h += `<div class="dd-q-body">\n`;
      h += `<div class="dd-q-text">${q}</div>\n`;
      if (hint) h += `<div class="dd-hint"><strong>Steer:</strong> ${hint}</div>\n`;
      if (ans) {
        h += `<div class="dd-ans-wrap">\n`;
        h += `<button class="dd-ans-btn" onclick="toggleAns('${id}')">&#9654; Show answer</button>\n`;
        h += `<div class="dd-ans" id="${id}" style="display:none">${ans}</div>\n`;
        h += `</div>\n`;
      }
      h += `</div>\n</div>\n`;
    });
    h += '</div>\n';
  }

  // Pitfalls
  if (allPitfalls.length) {
    h += '<div class="dd-block">\n';
    h += '<div class="dd-block-title">&#128308; Production pitfalls</div>\n';
    allPitfalls.forEach(([title, body]) => {
      h += `<div class="dd-pitfall"><span class="dd-pitfall-title">${title}</span><span class="dd-pitfall-body">${body}</span></div>\n`;
    });
    h += '</div>\n';
  }

  return h;
}

const DD_CSS = `
/* ── Deep Dive ───────────────────────────────────────────────── */
.dd-wrap {
  border: 1px solid #e5e5e0;
  border-radius: 8px;
  margin: 2.5rem 0;
  overflow: hidden;
}
.dd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  background: #1a1a2e;
  cursor: pointer;
  user-select: none;
  gap: 1rem;
}
.dd-header:hover { background: #1e1e38; }
.dd-header-left { display: flex; flex-direction: column; gap: 0.15rem; }
.dd-label {
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 700;
  color: #a5b4fc;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.dd-sub { font-size: 0.78rem; color: #6c7086; }
.dd-chevron { color: #6c7086; font-size: 1.1rem; transition: transform .2s; }
.dd-wrap.open .dd-chevron { transform: rotate(90deg); }
.dd-body { display: none; padding: 1.25rem 1.5rem; background: #fafaf8; }
.dd-wrap.open .dd-body { display: block; }
.dd-block { margin-bottom: 1.75rem; }
.dd-block:last-child { margin-bottom: 0; }
.dd-block-title {
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #555;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #e5e5e0;
}
.dd-tension {
  display: grid;
  grid-template-columns: 210px 1.5rem 1fr;
  gap: 0.25rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid #f0f0ec;
  font-size: 0.88rem;
  line-height: 1.6;
  align-items: baseline;
}
.dd-tension:last-child { border-bottom: none; }
.dd-tension-label { font-weight: bold; color: #1a1a1a; }
.dd-tension-sep { color: #aaa; text-align: center; }
.dd-tension-body { color: #555; }
.dd-q {
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  gap: 0.75rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid #f0f0ec;
}
.dd-q:last-child { border-bottom: none; }
.dd-q-num {
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  color: #a5b4fc;
  background: #1a1a2e;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.6rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}
.dd-q-text { font-size: 0.9rem; font-weight: bold; color: #1a1a1a; margin-bottom: 0.35rem; line-height: 1.5; }
.dd-hint { font-size: 0.82rem; color: #555; margin-bottom: 0.5rem; font-style: italic; }
.dd-hint strong { font-style: normal; color: #2563eb; }
.dd-ans-btn {
  font-size: 0.8rem;
  font-family: monospace;
  background: none;
  border: 1px solid #e5e5e0;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  color: #555;
  margin-bottom: 0.5rem;
}
.dd-ans-btn:hover { background: #f0f4ff; color: #2563eb; border-color: #93c5fd; }
.dd-ans {
  font-size: 0.88rem;
  line-height: 1.7;
  color: #333;
  background: #eff6ff;
  border-left: 3px solid #2563eb;
  padding: 0.75rem 1rem;
  border-radius: 0 4px 4px 0;
}
.dd-pitfall {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 0.75rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid #f0f0ec;
  font-size: 0.88rem;
  line-height: 1.6;
  align-items: baseline;
}
.dd-pitfall:last-child { border-bottom: none; }
.dd-pitfall-title { font-weight: bold; color: #dc2626; }
.dd-pitfall-body { color: #555; }
@media (max-width: 640px) {
  .dd-tension, .dd-pitfall { grid-template-columns: 1fr; }
  .dd-tension-sep { display: none; }
}
`;

const DD_JS = `
function toggleDD(id) {
  const w = document.getElementById('dd-' + id);
  if (w) w.classList.toggle('open');
}
function toggleAns(id) {
  const el = document.getElementById(id);
  const btn = el?.previousElementSibling;
  if (!el) return;
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  if (btn) btn.textContent = open ? '▶ Show answer' : '▼ Hide answer';
}
`;

// ── 4. Inject into each lesson file ───────────────────────────────────────────

for (const lesson of LESSON_MAP) {
  const filePath = join(LESSON, lesson.file);
  let src = readFileSync(filePath, 'utf8');

  // Skip if already injected
  if (src.includes('dd-wrap')) {
    console.log(`SKIP (already has deep dive): ${lesson.file}`);
    continue;
  }

  const innerHtml = renderDeepDive(lesson.keys);
  if (!innerHtml) { console.log(`SKIP (no data): ${lesson.file}`); continue; }

  const ddHtml = `
  <!-- ── DEEP DIVE ─────────────────────────────────────────────────────────── -->
  <div class="dd-wrap" id="dd-${lesson.keys[0]}">
    <div class="dd-header" onclick="toggleDD('${lesson.keys[0]}')">
      <div class="dd-header-left">
        <span class="dd-label">&#9650; Senior &amp; Staff Deep Dive</span>
        <span class="dd-sub">Engineering tensions &bull; staff-level questions with answers &bull; production pitfalls</span>
      </div>
      <span class="dd-chevron">&#9654;</span>
    </div>
    <div class="dd-body">
      ${innerHtml}
    </div>
  </div>`;

  // Inject CSS into <style> block
  src = src.replace('</style>', DD_CSS + '\n</style>');

  // Inject deep dive before the lesson nav footer
  src = src.replace(
    /<div class="lesson-nav">/,
    ddHtml + '\n\n  <div class="lesson-nav">'
  );

  // Inject JS before </body>
  src = src.replace('</body>', `<script>\n${DD_JS}\n</script>\n</body>`);

  writeFileSync(filePath, src);
  console.log(`DONE: ${lesson.file}`);
}

// ── 5. Generate TOC ───────────────────────────────────────────────────────────

const tocHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Agents — Table of Contents</title>
  <style>
    :root {
      --ink:#1a1a1a; --muted:#555; --accent:#2563eb; --bg:#fafaf8;
      --border:#e5e5e0; --card:#ffffff; --code-bg:#1a1a2e;
    }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:"Georgia",serif; background:var(--bg); color:var(--ink); line-height:1.75; font-size:17px; padding:3rem 1.5rem 6rem; }
    article { max-width:700px; margin:0 auto; }
    header { border-bottom:2px solid var(--ink); padding-bottom:1.5rem; margin-bottom:2.5rem; }
    .meta { font-family:monospace; font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; margin-bottom:.5rem; }
    h1 { font-size:2.25rem; font-weight:normal; line-height:1.2; }
    .subtitle { color:var(--muted); font-size:0.95rem; margin-top:.5rem; }
    .mission-box { background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:1rem 1.25rem; margin:1.5rem 0 2rem; font-size:0.9rem; }
    .mission-box strong { display:block; margin-bottom:.25rem; font-family:monospace; font-size:.78rem; text-transform:uppercase; letter-spacing:.06em; color:#2563eb; }
    .lesson-list { display:flex; flex-direction:column; gap:0; }
    .lesson-row {
      display:grid;
      grid-template-columns: 3rem 1fr auto;
      gap:1.25rem;
      align-items:start;
      padding:1.25rem 0;
      border-bottom:1px solid var(--border);
      text-decoration:none;
      color:inherit;
      transition:background .12s;
      border-radius:4px;
    }
    .lesson-row:hover { background:#f0f4ff; }
    .lesson-row:last-child { border-bottom:none; }
    .ln { font-family:monospace; font-size:0.78rem; font-weight:700; color:#a5b4fc; background:var(--code-bg); border-radius:5px; width:2.5rem; height:2.5rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:.15rem; }
    .lesson-body {}
    .lesson-title { font-size:1.05rem; font-weight:bold; color:var(--ink); margin-bottom:.2rem; }
    .lesson-desc { font-size:.88rem; color:var(--muted); line-height:1.55; margin-bottom:.4rem; }
    .lesson-tags { display:flex; flex-wrap:wrap; gap:.35rem; }
    .tag { font-family:monospace; font-size:.72rem; background:#f0f0ec; border:1px solid var(--border); border-radius:20px; padding:.1rem .55rem; color:var(--muted); }
    .dd-badge { font-family:monospace; font-size:.72rem; background:rgba(165,180,252,.15); border:1px solid rgba(165,180,252,.4); border-radius:20px; padding:.1rem .55rem; color:#7c6ff7; white-space:nowrap; flex-shrink:0; margin-top:.15rem; }
    h2 { font-size:1rem; font-weight:bold; margin:2.5rem 0 .75rem; text-transform:uppercase; letter-spacing:.04em; font-family:monospace; color:var(--muted); }
    .ref-list { list-style:none; padding:0; }
    .ref-list li { padding:.4rem 0; border-bottom:1px solid var(--border); font-size:.9rem; }
    .ref-list li:last-child { border-bottom:none; }
    .ref-list a { color:var(--accent); }
    .ref-list .ref-note { color:var(--muted); font-size:.82rem; }
    footer { margin-top:3rem; padding-top:1.5rem; border-top:1px solid var(--border); font-size:.85rem; color:var(--muted); }
  </style>
</head>
<body>
<article>
  <header>
    <div class="meta">AI Agents · NestJS · Node.js · 2-week curriculum</div>
    <h1>Table of Contents</h1>
    <p class="subtitle">7 lessons from core concepts to a production-shaped multi-agent API.</p>
  </header>

  <div class="mission-box">
    <strong>Mission</strong>
    Build real, working AI agents in Node.js/NestJS to ground practical experience, open new
    career opportunities, and upgrade the quality of solutions delivered as a full stack engineer.
    Each lesson ends with working code you ran yourself.
  </div>

  <div class="lesson-list">
${LESSON_MAP.map((l, i) => {
  const num = String(i + 1).padStart(2, '0');
  const ddCount = l.keys.reduce((n, k) => {
    const d = DD[k];
    return n + (d?.tensions?.length || 0) + (d?.questions?.length || 0) + (d?.pitfalls?.length || 0);
  }, 0);
  const tensions = l.keys.flatMap(k => DD[k]?.tensions || []).map(t => t[0]).slice(0, 3);
  return `    <a class="lesson-row" href="./${l.file}">
      <div class="ln">L${i + 1}</div>
      <div class="lesson-body">
        <div class="lesson-title">${l.title}</div>
        <div class="lesson-desc">${l.subtitle}</div>
        <div class="lesson-tags">
          ${tensions.map(t => `<span class="tag">${t}</span>`).join('\n          ')}
        </div>
      </div>
      <span class="dd-badge">&#9650; ${ddCount} deep dive items</span>
    </a>`;
}).join('\n')}
  </div>

  <h2>Reference documents</h2>
  <ul class="ref-list">
    <li>
      <a href="../reference/" target="_blank">Reference sheets</a>
      <span class="ref-note"> — cheat sheets and quick-reference cards built during the course</span>
    </li>
    <li>
      <a href="../MISSION.md" target="_blank">MISSION.md</a>
      <span class="ref-note"> — your learning goal, constraints, and success criteria</span>
    </li>
    <li>
      <a href="../RESOURCES.md" target="_blank">RESOURCES.md</a>
      <span class="ref-note"> — curated knowledge sources and communities</span>
    </li>
    <li>
      <a href="../learning-records/" target="_blank">Learning records</a>
      <span class="ref-note"> — key insights captured across sessions (ADR-style)</span>
    </li>
    <li>
      <a href="../AI_Agents_Study_Hub.html" target="_blank">AI Agents Study Hub</a>
      <span class="ref-note"> — full course material browser with quizzes and senior/staff deep dives</span>
    </li>
  </ul>

  <h2>Course materials</h2>
  <ul class="ref-list">
    <li>
      <a href="../resources/AI_Agents_Course_Slides/AI_Agents_Slides_Level1.pdf" target="_blank">Level 1 slides</a>
      <span class="ref-note"> — agents, components, reasoning, task decomposition</span>
    </li>
    <li>
      <a href="../resources/AI_Agents_Course_Slides/AI_Agents_Slides_Level2.pdf" target="_blank">Level 2 slides</a>
      <span class="ref-note"> — tools, structured output, agent loop, LangGraph basics</span>
    </li>
    <li>
      <a href="../resources/AI_Agents_Course_Slides/AI_Agents_Slides_Level3.pdf" target="_blank">Level 3 slides</a>
      <span class="ref-note"> — memory, RAG, human-in-loop, reflection, deployment</span>
    </li>
    <li>
      <a href="../resources/AI_Agents_Course_Slides/AI_Agents_Slides_Level4.pdf" target="_blank">Level 4 slides</a>
      <span class="ref-note"> — multi-agent, parallel execution, error handling, cost optimisation</span>
    </li>
  </ul>

  <footer>
    Built with the /teach skill · Claude Code ·
    Start: 2026-06-14 · Target: 2026-06-28
  </footer>
</article>
</body>
</html>`;

writeFileSync(join(LESSON, 'index.html'), tocHtml);
console.log('DONE: index.html (TOC)');
console.log('\nAll done. Open lessons/index.html to see the TOC.');
