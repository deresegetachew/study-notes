/* ─── Lesson Web Components ──────────────────────────────────────────────────
   All custom elements. Script must load at END of body so HTML is fully parsed.
   Usage: see ~/.claude/skills/write-lesson/README.md
   ──────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function uid() { return Math.random().toString(36).slice(2, 8); }

  // ── <lesson-header> ──────────────────────────────────────────────────────
  // Attrs: num, title, subtitle, source-label, source-href
  class LessonHeader extends HTMLElement {
    connectedCallback() {
      const num      = this.getAttribute('num') || '';
      const title    = this.getAttribute('title') || '';
      const subtitle = this.getAttribute('subtitle') || '';
      const srcLabel = this.getAttribute('source-label') || '';
      const srcHref  = this.getAttribute('source-href') || '';
      const source   = srcLabel
        ? `<p class="lesson-source">Primary source: <a href="${esc(srcHref)}" target="_blank" rel="noopener">${esc(srcLabel)}</a></p>`
        : '';
      this.innerHTML = `
        <div class="lesson-breadcrumb">
          <a href="./index.html">Lessons</a>
          <a href="./blueprint.html">Blueprint</a>
        </div>
        <div class="lesson-num">${esc(num)}</div>
        <h1>${esc(title)}</h1>
        ${subtitle ? `<p class="lesson-subtitle">${esc(subtitle)}</p>` : ''}
        ${source}`;
    }
  }
  customElements.define('lesson-header', LessonHeader);

  // ── <lesson-nav> ─────────────────────────────────────────────────────────
  // Attrs: prev-href, prev-title, next-href, next-title
  class LessonNav extends HTMLElement {
    connectedCallback() {
      const ph = this.getAttribute('prev-href') || '';
      const pt = this.getAttribute('prev-title') || '';
      const nh = this.getAttribute('next-href') || '';
      const nt = this.getAttribute('next-title') || '';
      const prev = ph ? `<a href="${esc(ph)}">&#8592; ${esc(pt)}</a>` : '<span></span>';
      const next = nh ? `<a href="${esc(nh)}">${esc(nt)} &#8594;</a>` : '<span></span>';
      this.innerHTML = `${prev}${next}
        <p class="lesson-footer-note">Questions? Ask your teacher agent.</p>`;
    }
  }
  customElements.define('lesson-nav', LessonNav);

  // ── <code-block> ─────────────────────────────────────────────────────────
  // Attrs: lang, label
  // Content: raw code (text only — component handles escaping)
  class CodeBlock extends HTMLElement {
    connectedCallback() {
      const lang  = this.getAttribute('lang') || '';
      const label = this.getAttribute('label') || lang;
      const code  = this.textContent; // capture before innerHTML reset
      const id    = 'cb-' + uid();
      this.innerHTML = `
        <div class="code-label">
          <div class="dots">
            <div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div>
          </div>
          <span>${esc(label)}</span>
          <button class="copy-btn" data-id="${id}">copy</button>
        </div>
        <pre id="${id}"><code>${esc(code.trim())}</code></pre>`;
      this.querySelector('.copy-btn').addEventListener('click', function () {
        const pre  = document.getElementById(this.dataset.id);
        const self = this;
        (navigator.clipboard
          ? navigator.clipboard.writeText(pre.textContent)
          : Promise.reject()
        ).catch(() => {
          const t = document.createElement('textarea');
          t.value = pre.textContent;
          document.body.appendChild(t); t.select(); document.execCommand('copy');
          document.body.removeChild(t);
        }).finally(() => {
          self.textContent = 'copied!';
          setTimeout(() => { self.textContent = 'copy'; }, 1500);
        });
      });
    }
  }
  customElements.define('code-block', CodeBlock);

  // ── <lesson-callout> ─────────────────────────────────────────────────────
  // Attrs: variant (tip | warn | info | key), title (optional)
  // Content: HTML
  class LessonCallout extends HTMLElement {
    connectedCallback() {
      const variant = this.getAttribute('variant') || 'info';
      const title   = this.getAttribute('title') || '';
      const icons   = { tip: '💡', warn: '⚠️', info: 'ℹ️', key: '🔑' };
      const icon    = icons[variant] || icons.info;
      const inner   = this.innerHTML;
      const head    = title ? `<strong>${esc(title)}</strong> ` : '';
      this.className = `callout callout-${esc(variant)}`;
      this.innerHTML = `${icon} ${head}${inner}`;
    }
  }
  customElements.define('lesson-callout', LessonCallout);

  // ── <lesson-diagram> ─────────────────────────────────────────────────────
  // Content: Mermaid diagram definition (text)
  // Requires: mermaid.js loaded before this script
  class LessonDiagram extends HTMLElement {
    connectedCallback() {
      const definition = this.textContent.trim();
      const div = document.createElement('div');
      div.className = 'mermaid';
      div.textContent = definition;          // textContent avoids HTML-escaping issues
      this.textContent = '';
      this.appendChild(div);
      if (window.mermaid) {
        mermaid.run({ nodes: [div] });
      }
    }
  }
  customElements.define('lesson-diagram', LessonDiagram);

  // ── <lesson-checklist> ───────────────────────────────────────────────────
  // Attrs: title (optional)
  // Children: plain <li> elements (can contain inline HTML)
  class LessonChecklist extends HTMLElement {
    connectedCallback() {
      const title = this.getAttribute('title') || '';
      const items = [...this.querySelectorAll('li')].map(li => li.innerHTML);
      const head  = title ? `<p class="checklist-title">${esc(title)}</p>` : '';
      const rows  = items.map(item => `
        <li class="checklist-item">
          <span class="check-box" role="checkbox" aria-checked="false" tabindex="0">☐</span>
          <span>${item}</span>
        </li>`).join('');
      this.innerHTML = `${head}<ol class="checklist">${rows}</ol>`;
      this.querySelectorAll('.checklist-item').forEach(item => {
        const box = item.querySelector('.check-box');
        const toggle = () => {
          const on = item.classList.toggle('checked');
          box.textContent = on ? '☑' : '☐';
          box.setAttribute('aria-checked', String(on));
        };
        box.addEventListener('click', toggle);
        item.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
      });
    }
  }
  customElements.define('lesson-checklist', LessonChecklist);

  // ── <lesson-quiz> ────────────────────────────────────────────────────────
  // Children: one or more <quiz-item> elements, each containing:
  //   <quiz-q>        — question text
  //   <quiz-option [correct]> — answer option (boolean attr marks correct)
  //   <quiz-explain>  — shown after answering
  class LessonQuiz extends HTMLElement {
    connectedCallback() {
      const items = [...this.querySelectorAll('quiz-item')];
      const html  = items.map((item, qi) => {
        const q       = item.querySelector('quiz-q')?.textContent?.trim() || '';
        const explain = item.querySelector('quiz-explain')?.innerHTML?.trim() || '';
        const opts    = [...item.querySelectorAll('quiz-option')].map((opt, oi) => {
          const correct = opt.hasAttribute('correct');
          return `<div class="quiz-opt" data-qi="${qi}" data-correct="${correct}" tabindex="0" role="option">
            <span class="quiz-opt-letter">${'ABCD'[oi]}</span>
            <span>${esc(opt.textContent.trim())}</span>
          </div>`;
        }).join('');
        return `<div class="quiz-question" data-qi="${qi}">
          <p class="quiz-q"><span class="quiz-num">${qi + 1}</span>${esc(q)}</p>
          <div class="quiz-opts">${opts}</div>
          <div class="quiz-explain hidden">${explain}</div>
        </div>`;
      }).join('');
      this.innerHTML = html;
      this.querySelectorAll('.quiz-opt').forEach(opt => {
        const attempt = () => {
          const wrap = this.querySelector(`.quiz-question[data-qi="${opt.dataset.qi}"]`);
          if (!wrap || wrap.classList.contains('answered')) return;
          wrap.classList.add('answered');
          wrap.querySelectorAll('.quiz-opt').forEach(o => {
            if (o.dataset.correct === 'true') o.classList.add('correct');
          });
          if (opt.dataset.correct !== 'true') opt.classList.add('wrong');
          wrap.querySelector('.quiz-explain')?.classList.remove('hidden');
        };
        opt.addEventListener('click', attempt);
        opt.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); attempt(); }
        });
      });
    }
  }
  customElements.define('lesson-quiz', LessonQuiz);

  // ── <deep-dive> ──────────────────────────────────────────────────────────
  // Attrs: sources (display label)
  // Children:
  //   <dd-tension a="..." b="...">       — one tension pair
  //   <dd-question hint="...">           — question; contains text + <dd-answer>
  //     <dd-answer>HTML answer</dd-answer>
  //   <dd-pitfall>text</dd-pitfall>      — one production pitfall
  class DeepDive extends HTMLElement {
    connectedCallback() {
      const sources = this.getAttribute('sources') || '';

      const tensions = [...this.querySelectorAll('dd-tension')].map(t => `
        <div class="dd-tension">
          <span class="dd-a">${esc(t.getAttribute('a') || '')}</span>
          <span class="dd-vs">vs.</span>
          <span class="dd-b">${esc(t.getAttribute('b') || '')}</span>
        </div>`).join('');

      const questions = [...this.querySelectorAll('dd-question')].map((q, i) => {
        const clone  = q.cloneNode(true);
        const answer = clone.querySelector('dd-answer');
        const ansHtml = answer ? answer.innerHTML : '';
        if (answer) answer.remove();
        const qText = clone.textContent.trim();
        const hint  = q.getAttribute('hint') || '';
        return `<div class="dd-q-block">
          <p class="dd-q-text"><strong>${i + 1}.</strong> ${esc(qText)}</p>
          ${hint ? `<p class="dd-hint"><em>Steer:</em> ${esc(hint)}</p>` : ''}
          <details class="dd-answer">
            <summary>Show answer</summary>
            <div class="dd-answer-body">${ansHtml}</div>
          </details>
        </div>`;
      }).join('');

      const pitfalls = [...this.querySelectorAll('dd-pitfall')].map(p =>
        `<li>${p.innerHTML}</li>`).join('');

      const srcBadge = sources
        ? `<span class="dd-sources">${esc(sources)}</span>`
        : '';

      this.innerHTML = `
        <div class="dd-header" role="button" tabindex="0">
          <span class="dd-icon">▲</span>
          <span class="dd-title">Senior &amp; Staff Deep Dive</span>
          <span class="dd-subtitle">Tensions · Hard questions · Pitfalls</span>
          ${srcBadge}
        </div>
        <div class="dd-body">
          ${tensions  ? `<h3 class="dd-section-label">Engineering Tensions</h3><div class="dd-tensions">${tensions}</div>` : ''}
          ${questions ? `<h3 class="dd-section-label">Staff-Level Questions</h3><div class="dd-questions">${questions}</div>` : ''}
          ${pitfalls  ? `<h3 class="dd-section-label">Production Pitfalls</h3><ul class="dd-pitfalls">${pitfalls}</ul>` : ''}
        </div>`;

      const hdr = this.querySelector('.dd-header');
      const toggle = () => this.classList.toggle('dd-open');
      hdr.addEventListener('click', toggle);
      hdr.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    }
  }
  customElements.define('deep-dive', DeepDive);

})();
