#!/usr/bin/env node
/**
 * validate-equations-live.mjs
 *
 * Canonical validator for the non-quadratic equations topic (משוואות) AFTER the
 * 2026-06 rebuild that converted every source page of משוואות.pdf into a live
 * HTML + MathJax A4 worksheet (no SVG/PDF-image wrappers, no separate preview
 * app, no per-exercise numbering).
 *
 * It supersedes the legacy "equations app / SVG-wrapper / pilot / editable /
 * easy-edit overlay" validators, which described a design that no longer exists.
 *
 * What it checks (strictly, never a rubber stamp):
 *   - meta/topics.json: exact topic משוואות, distinct from משוואות ריבועיות,
 *     54 contiguous topic-local pages, page 1 == עמוד-95.html.
 *   - meta/equations-master-map.json is consistent and lists 54 pages.
 *   - Every LIVE page (52) matches the locked live design:
 *       RTL, a4-base + page CSS linked, no inline CSS, v2 wrapper
 *       (main.a4-page.page-N.equations-page), correct page badge + nav-meta,
 *       live MathJax (\(...\), never $...$), provenance attributes, the
 *       problem-block / problem-equation / solution-space card structure,
 *       and NO img.pdf-page as central content.
 *   - Page CSS is scoped to .page-N and never overrides global header/title/page.
 *   - Logical 53–54 remain the known EXTRA_UNVERIFIED set (no PDF source page) and
 *     are reported, not converted or invented.
 *
 * Read-only. Never invents or edits content. Exit non-zero on any failure.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const TOPIC = 'משוואות';
const EXCLUDED = 'משוואות ריבועיות';
const TOTAL = 54;
const EXTRA_UNVERIFIED = new Set([53, 54]); // no source PDF page

const failures = [];
const notes = [];
const fail = (m) => failures.push(m);
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));

// ---- master map -----------------------------------------------------------
if (!exists('meta/equations-master-map.json')) {
  fail('Missing meta/equations-master-map.json (run scripts/audit-equations-master-map.mjs).');
}
const map = exists('meta/equations-master-map.json')
  ? JSON.parse(read('meta/equations-master-map.json'))
  : { pages: [] };

if (map.total !== TOTAL) fail(`master-map total must be ${TOTAL}, got ${map.total}`);
const livePages = map.pages.filter((p) => p.status === 'LIVE');
const wrapPages = map.pages.filter((p) => p.status === 'WRAP');

// ---- metadata -------------------------------------------------------------
const meta = JSON.parse(read('meta/topics.json'));
const topic = (meta.topics || []).find((t) => t.name === TOPIC);
const quad = (meta.topics || []).find((t) => t.name === EXCLUDED);
if (!topic) fail(`meta/topics.json missing exact topic ${TOPIC}`);
if (topic && quad && topic === quad) fail(`${TOPIC} and ${EXCLUDED} must be distinct topics`);
if (topic) {
  const pages = topic.pages || [];
  if (pages.length !== TOTAL) fail(`Expected ${TOTAL} ${TOPIC} pages, got ${pages.length}`);
  if (topic.count != null && topic.count !== pages.length) fail('topic.count must match pages array length');
  if (!pages.every((p) => p.topic === TOPIC)) fail(`Every ${TOPIC} page must carry topic=${TOPIC}`);
  const localIndex = (p) => {
    const m = String(p.title || '').match(/עמוד\s+(\d+)/);
    return m ? Number(m[1]) : Number(p.number || 0);
  };
  const seen = new Set();
  for (const p of pages) {
    const i = localIndex(p);
    if (!(Number.isInteger(i) && i >= 1 && i <= TOTAL)) fail(`Invalid topic-local index for ${p.file}: ${i}`);
    if (seen.has(i)) fail(`Duplicate topic-local index ${i}`);
    seen.add(i);
  }
  for (let i = 1; i <= TOTAL; i++) if (!seen.has(i)) fail(`Missing topic-local page index ${i}`);
  const first = pages.slice().sort((a, b) => localIndex(a) - localIndex(b))[0];
  if (first && first.file !== 'עמוד-95.html') fail(`Topic-local page 1 must be עמוד-95.html, got ${first?.file}`);
}

// ---- per-page live design -------------------------------------------------
function validateLive(p) {
  const html = `${p.file}`;
  const cssRel = `styles/pages/עמוד-${p.fileNum}.css`;
  const cls = `page-${p.fileNum}`;
  const where = `${p.file} (logical ${p.logical})`;

  if (!exists(html)) return fail(`Missing live page: ${html}`);
  if (!exists(cssRel)) return fail(`Missing page CSS: ${cssRel}`);

  const h = read(html);
  const css = read(cssRel);

  // shell / RTL / no inline CSS
  if (!h.includes('dir="rtl"')) fail(`${where}: must preserve RTL.`);
  if (/<style\b/i.test(h)) fail(`${where}: must not contain <style> blocks.`);
  if (/\sstyle\s*=/.test(h)) fail(`${where}: must not contain style attributes.`);
  if (!h.includes('href="styles/a4-base.css"')) fail(`${where}: must link styles/a4-base.css.`);
  if (!h.includes(`href="${cssRel}"`)) fail(`${where}: must link its page CSS ${cssRel}.`);

  // v2 wrapper + numbering
  if (!h.includes(`main class="a4-page ${cls} equations-page"`)) fail(`${where}: must use main.a4-page.${cls}.equations-page.`);
  if (!h.includes(`<div class="page-number">${p.logical}</div>`)) fail(`${where}: page badge must be ${p.logical}.`);
  if (!h.includes(`<div class="nav-meta">${TOPIC} — עמוד ${p.logical} / ${TOTAL}</div>`)) fail(`${where}: nav-meta must read "${TOPIC} — עמוד ${p.logical} / ${TOTAL}".`);
  if (h.includes(EXCLUDED)) fail(`${where}: must not reference ${EXCLUDED}.`);

  // live MathJax delimiters only
  if (!h.includes('\\(')) fail(`${where}: must contain live MathJax \\(...\\) equations.`);
  if (h.includes('$')) fail(`${where}: must not use $...$ MathJax delimiters.`);

  // live card structure (replaces the retired pdf-wrap/pdf-page design)
  for (const marker of ['class="eq-body"', 'class="eq-grid"', 'class="problem-block"', 'class="problem-equation"', 'class="solution-space"']) {
    if (!h.includes(marker)) fail(`${where}: live design must contain ${marker}.`);
  }
  if (/<img[^>]*class="pdf-page"/.test(h)) fail(`${where}: must not use img.pdf-page as central content.`);

  // provenance (mandatory, non-visual)
  if (!h.includes(`data-source="${TOPIC}.pdf"`)) fail(`${where}: must carry data-source="${TOPIC}.pdf".`);
  if (!h.includes(`data-source-page="${p.logical}"`)) fail(`${where}: must carry data-source-page="${p.logical}".`);
  if (!/data-source-line="\d+"/.test(h)) fail(`${where}: each card must carry data-source-line.`);

  // page CSS scoping
  if (/<style\b/i.test(css)) fail(`${cssRel}: must not contain HTML style blocks.`);
  if (!css.includes(`.${cls}`)) fail(`${cssRel}: must scope to .${cls}.`);
  if (/^\.header-container\s*\{/m.test(css)) fail(`${cssRel}: forbidden global .header-container override.`);
  if (/^\.page-title\s*\{/m.test(css)) fail(`${cssRel}: forbidden global .page-title override.`);
  if (/^\.page-number\s*\{/m.test(css)) fail(`${cssRel}: forbidden global .page-number override.`);
  if (/^body\s*,\s*html\s*,\s*\.a4-page\s*\{/m.test(css)) fail(`${cssRel}: forbidden global body/html/.a4-page override.`);
}

for (const p of livePages) validateLive(p);

// ---- EXTRA_UNVERIFIED (logical 53-54, no PDF source) ----------------------
const wrapLogicals = wrapPages.map((p) => p.logical).sort((a, b) => a - b);
for (const l of wrapLogicals) {
  if (!EXTRA_UNVERIFIED.has(l)) fail(`Unexpected non-LIVE page at logical ${l}; only 53-54 may remain EXTRA_UNVERIFIED.`);
}
for (const l of EXTRA_UNVERIFIED) {
  if (!wrapLogicals.includes(l)) notes.push(`logical ${l} is no longer WRAP (now converted) — update EXTRA_UNVERIFIED set if intended.`);
}

// ---- report ---------------------------------------------------------------
notes.push(`LIVE pages validated: ${livePages.length}`);
notes.push(`EXTRA_UNVERIFIED (no PDF source): ${wrapLogicals.join(', ') || 'none'}`);

if (failures.length) {
  console.error('VALIDATE_EQUATIONS_LIVE_FAILED');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log('VALIDATE_EQUATIONS_LIVE_OK');
for (const n of notes) console.log(`- ${n}`);
console.log('design=live HTML + MathJax (no SVG/PDF-image, no separate app, no per-exercise numbering)');
console.log('quadratic_equations_touched=0');
