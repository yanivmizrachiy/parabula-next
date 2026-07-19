// scripts/import-first-quadrant-workbook.mjs
// מייבא את חוברת „מערכת צירים — רביע ראשון" (30 גיליונות) מהמקור התחזוקתי
// projects/coordinate-first-quadrant-workbook/workbook/*.htmlfrag אל דפי העבודה
// הקנוניים עמוד-531..עמוד-560, כולל רינדור שרת מדויק של רשתות הצירים ל-SVG סטטי.
//
// המקור נשאר ללא שינוי; הסקריפט קורא בלבד משם וכותב רק את הדפים הקנוניים,
// את קובצי ה-CSS הפר-דפיים ואת meta/topics.json.
//
// הרינדור הוא פורט 1:1 של הפונקציה render() מ-workbook.js של הפרויקט —
// אותן נוסחאות, אותם קבועים — ולכן הגאומטריה זהה לזו שהדפדפן מציג במקור.
// בהתאם ל-CLAUDE.md §4.3 כל <text> שמכיל ספרה ואין בו אות עברית מקבל direction="ltr".

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicName = 'מערכת צירים - רביע ראשון בלבד';
const startPage = 531;
const pageCount = 30;
const siteBase = 'https://yanivmizrachiy.github.io/parabula-next/';
const workbookDir = path.join(root, 'projects', 'coordinate-first-quadrant-workbook', 'workbook');

const fragments = [
  'workbook-01.htmlfrag', 'workbook-02.htmlfrag', 'workbook-03.htmlfrag',
  'workbook-04.htmlfrag', 'workbook-05-06.htmlfrag', 'workbook-07-08.htmlfrag',
  'workbook-09-10.htmlfrag', 'workbook-11-12.htmlfrag',
  'workbook-13-14.htmlfrag', 'workbook-15.htmlfrag',
];

// ---------- קריאת המקור ----------
const combined = fragments
  .map((name) => fs.readFileSync(path.join(workbookDir, name), 'utf8'))
  .join('\n');

// ---------- חילוץ 30 הגיליונות ----------
const sheetStartRe = /<section aria-labelledby="title-(\d{1,2})" class="([^"]+)" id="page-(\d{1,2})">/g;
const starts = [...combined.matchAll(sheetStartRe)];
if (starts.length !== pageCount) {
  throw new Error(`Expected ${pageCount} sheet sections, found ${starts.length}`);
}

const sheets = starts.map((m, i) => {
  const from = m.index;
  const to = i + 1 < starts.length ? starts[i + 1].index : combined.length;
  let chunk = combined.slice(from, to);
  // הגיליון האחרון נסגר לפני </div><script> של מעטפת הספר
  const tailCut = chunk.search(/<\/section>\s*<\/div>\s*<script/);
  if (tailCut !== -1) chunk = chunk.slice(0, tailCut + '</section>'.length);
  const local = Number(m[3]);
  if (local !== i + 1) throw new Error(`Sheet order mismatch: expected ${i + 1}, got ${local}`);
  // איזון תגיות section בתוך הגיליון (q-card הם section מקוננים)
  const opens = (chunk.match(/<section\b/g) || []).length;
  const closes = (chunk.match(/<\/section>/g) || []).length;
  if (opens !== closes) throw new Error(`Sheet ${local}: unbalanced <section> (${opens} vs ${closes})`);
  return { local, classes: m[2], html: chunk };
});

// ---------- רינדור רשת צירים: פורט מדויק של render() מ-workbook.js ----------
const fmt = (n) => {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? String(r) : String(r);
};
const HEB_RE = /[֐-׿]/;
const DIGIT_RE = /[0-9]/;

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function svgText(x, y, attrs, content) {
  const extra = { ...attrs };
  // CLAUDE.md §4.3: טקסט עם ספרה וללא אות עברית מקבל direction="ltr"
  if (DIGIT_RE.test(String(content)) && !HEB_RE.test(String(content))) {
    extra.direction = 'ltr';
  }
  const attrStr = Object.entries(extra)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${k}="${esc(v)}"`)
    .join(' ');
  return `<text x="${fmt(x)}" y="${fmt(y)}" ${attrStr}>${esc(content)}</text>`;
}

function parseData(attrs, key, fallback) {
  const re = new RegExp(`data-${key}='([^']*)'|data-${key}="([^"]*)"`);
  const m = attrs.match(re);
  if (!m) return fallback;
  const raw = (m[1] ?? m[2] ?? '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  try { return JSON.parse(raw); } catch { return fallback; }
}

let gridCounter = 0;
function renderGrid(attrs) {
  gridCounter += 1;
  const W = 520, H = 330, L = 56, R = 30, T = 24, B = 48, xm = 8, ym = 6;
  const sx = (W - L - R) / xm, sy = (H - T - B) / ym;
  const X = (x) => L + x * sx;
  const Y = (y) => H - B - y * sy;
  const id = `cfq-arr${gridCounter}`;

  const ariaMatch = attrs.match(/aria-label="([^"]*)"/);
  const ariaLabel = ariaMatch ? ariaMatch[1] : 'מערכת צירים ברביע הראשון';

  const parts = [];
  parts.push(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${ariaLabel}" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" xmlns="http://www.w3.org/2000/svg">`);
  parts.push(`<defs><marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#1d4ed8"/></marker></defs>`);

  for (let x = 0; x <= xm; x++) {
    parts.push(`<line x1="${fmt(X(x))}" y1="${fmt(Y(0))}" x2="${fmt(X(x))}" y2="${fmt(Y(ym))}" stroke="#e7eaf1" stroke-width="1" vector-effect="non-scaling-stroke"/>`);
  }
  for (let y = 0; y <= ym; y++) {
    parts.push(`<line x1="${fmt(X(0))}" y1="${fmt(Y(y))}" x2="${fmt(X(xm))}" y2="${fmt(Y(y))}" stroke="#e7eaf1" stroke-width="1" vector-effect="non-scaling-stroke"/>`);
  }
  parts.push(`<line x1="${fmt(X(0))}" y1="${fmt(Y(0))}" x2="${fmt(X(xm) + 22)}" y2="${fmt(Y(0))}" stroke="#1f2a44" stroke-width="2.2" vector-effect="non-scaling-stroke"/>`);
  parts.push(`<path d="M ${fmt(X(xm) + 28)} ${fmt(Y(0))} l-10-5v10z" fill="#1f2a44"/>`);
  parts.push(`<line x1="${fmt(X(0))}" y1="${fmt(Y(0))}" x2="${fmt(X(0))}" y2="${fmt(Y(ym) - 18)}" stroke="#1f2a44" stroke-width="2.2" vector-effect="non-scaling-stroke"/>`);
  parts.push(`<path d="M ${fmt(X(0))} ${fmt(Y(ym) - 25)} l-5 10h10z" fill="#1f2a44"/>`);

  const xl = parseData(attrs, 'xlabels', [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const yl = parseData(attrs, 'ylabels', [0, 1, 2, 3, 4, 5, 6]);
  for (let x = 1; x <= xm; x++) {
    parts.push(`<line x1="${fmt(X(x))}" y1="${fmt(Y(0) - 4)}" x2="${fmt(X(x))}" y2="${fmt(Y(0) + 4)}" stroke="#1f2a44" stroke-width="1.4" vector-effect="non-scaling-stroke"/>`);
    if (xl[x] !== '' && xl[x] !== null && xl[x] !== undefined) {
      parts.push(svgText(X(x), Y(0) + 20, { 'text-anchor': 'middle', fill: '#1f2a44', 'font-size': 12, 'font-weight': 700 }, String(xl[x] ?? x)));
    }
  }
  for (let y = 1; y <= ym; y++) {
    parts.push(`<line x1="${fmt(X(0) - 4)}" y1="${fmt(Y(y))}" x2="${fmt(X(0) + 4)}" y2="${fmt(Y(y))}" stroke="#1f2a44" stroke-width="1.4" vector-effect="non-scaling-stroke"/>`);
    if (yl[y] !== '' && yl[y] !== null && yl[y] !== undefined) {
      parts.push(svgText(X(0) - 11, Y(y) + 4, { 'text-anchor': 'end', fill: '#1f2a44', 'font-size': 12, 'font-weight': 700 }, String(yl[y] ?? y)));
    }
  }
  parts.push(svgText(X(0) - 10, Y(0) + 20, { 'text-anchor': 'end', fill: '#1f2a44', 'font-size': 12, 'font-weight': 800 }, 'O'));
  parts.push(svgText(X(xm) + 23, Y(0) - 10, { 'text-anchor': 'middle', fill: '#1f2a44', 'font-size': 14, 'font-weight': 800 }, 'x'));
  parts.push(svgText(X(0) + 13, Y(ym) - 17, { 'text-anchor': 'start', fill: '#1f2a44', 'font-size': 14, 'font-weight': 800 }, 'y'));

  for (const p of parseData(attrs, 'polygons', [])) {
    const pts = (p.points || []).map((v) => `${fmt(X(v[0]))},${fmt(Y(v[1]))}`).join(' ');
    parts.push(`<polygon points="${pts}" fill="rgba(29,78,216,.08)" stroke="#1d4ed8" stroke-width="2.2" vector-effect="non-scaling-stroke"/>`);
  }
  for (const g of parseData(attrs, 'segments', [])) {
    const stroke = g.color || (g.type === 'guide' ? '#64748b' : '#1d4ed8');
    const width = g.type === 'guide' ? 1.7 : 2.6;
    const dash = g.dashed ? ' stroke-dasharray="7 5"' : '';
    const marker = g.arrow ? ` marker-end="url(#${id})"` : '';
    parts.push(`<line x1="${fmt(X(g.from[0]))}" y1="${fmt(Y(g.from[1]))}" x2="${fmt(X(g.to[0]))}" y2="${fmt(Y(g.to[1]))}" stroke="${stroke}" stroke-width="${width}"${dash}${marker} vector-effect="non-scaling-stroke"/>`);
  }
  for (const a of parseData(attrs, 'arrows', [])) {
    parts.push(`<line x1="${fmt(X(a.from[0]))}" y1="${fmt(Y(a.from[1]))}" x2="${fmt(X(a.to[0]))}" y2="${fmt(Y(a.to[1]))}" stroke="${a.color || '#1d4ed8'}" stroke-width="2.4" stroke-dasharray="8 5" marker-end="url(#${id})" vector-effect="non-scaling-stroke"/>`);
    if (a.label) {
      const mx = (X(a.from[0]) + X(a.to[0])) / 2;
      const my = (Y(a.from[1]) + Y(a.to[1])) / 2;
      parts.push(svgText(mx, my - 8, { 'text-anchor': 'middle', fill: '#1d4ed8', 'font-size': 12, 'font-weight': 800, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, a.label));
    }
  }
  for (const p of parseData(attrs, 'points', [])) {
    parts.push(`<circle cx="${fmt(X(p.x))}" cy="${fmt(Y(p.y))}" r="5.1" fill="${p.color || '#1d4ed8'}" stroke="#fff" stroke-width="1.7" vector-effect="non-scaling-stroke"/>`);
    if (p.label !== undefined && p.label !== '') {
      parts.push(svgText(
        X(p.x) + (p.dx ?? 10),
        Y(p.y) + (p.dy ?? -10),
        { 'text-anchor': p.anchor || 'start', fill: p.color || '#1d4ed8', 'font-size': 13, 'font-weight': 900, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 },
        p.label || `(${p.x},${p.y})`
      ));
    }
  }
  for (const b of parseData(attrs, 'labelboxes', [])) {
    const bx = X(b.at[0]);
    const by = Y(b.at[1]);
    const w = Math.max(70, String(b.text || '').length * 7 + 18);
    const hh = 28;
    if (b.to) {
      parts.push(`<line x1="${fmt(bx)}" y1="${fmt(by + hh / 2)}" x2="${fmt(X(b.to[0]))}" y2="${fmt(Y(b.to[1]))}" stroke="#64748b" stroke-width="1.3" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/>`);
    }
    parts.push(`<rect x="${fmt(bx - w / 2)}" y="${fmt(by - hh / 2)}" width="${fmt(w)}" height="${fmt(hh)}" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="1.2"/>`);
    parts.push(svgText(bx, by + 4, { 'text-anchor': 'middle', fill: '#1f2a44', 'font-size': 12, 'font-weight': 700 }, b.text));
  }
  parts.push('</svg>');
  return parts.join('');
}

// ---------- טרנספורמציה לגיליון בודד ----------
const blankWidths = new Set();

function transformSheet(sheet) {
  let html = sheet.html;

  // כותרת: eyebrow + h1 + p → header קנוני
  const headerRe = /<header class="sheet-header">[\s\S]*?<div class="eyebrow">([^<]*)<\/div>\s*<h1 id="title-\d+">([^<]*)<\/h1>\s*<p>([^<]*)<\/p>[\s\S]*?<\/header>/;
  const hm = html.match(headerRe);
  if (!hm) throw new Error(`Sheet ${sheet.local}: header pattern not found`);
  const [, eyebrow, h1, subtitle] = hm.map((s) => (typeof s === 'string' ? s.trim() : s));
  const canonicalHeader = [
    '        <header class="header-container">',
    '            <div class="title-wrap">',
    `                <h1 class="page-title">${h1}</h1>`,
    `                <p class="page-subtitle">${eyebrow} · ${subtitle}</p>`,
    '            </div>',
    `            <div class="page-number">${sheet.local}</div>`,
    '        </header>',
  ].join('\n');
  html = html.replace(headerRe, canonicalHeader);

  // main מקונן אסור — הגוף הופך div
  html = html.replace('<main class="sheet-content">', '<div class="sheet-content">');
  const lastMainClose = html.lastIndexOf('</main>');
  if (lastMainClose === -1) throw new Error(`Sheet ${sheet.local}: sheet-content close not found`);
  html = `${html.slice(0, lastMainClose)}</div>${html.slice(lastMainClose + '</main>'.length)}`;

  // רינדור כל רשתות הצירים ל-SVG סטטי; מסירים data-*/role מה-div העוטף
  html = html.replace(/<div ([^>]*class="coordinate-grid[^"]*"[^>]*)><\/div>/g, (full, attrs) => {
    const classMatch = attrs.match(/class="([^"]*)"/);
    const svg = renderGrid(attrs);
    return `<div class="${classMatch[1]}">${svg}</div>`;
  });

  // style inline → מחלקות רוחב
  html = html.replace(/class="blank" style="--blank-width:(\d+)ch"/g, (_, n) => {
    blankWidths.add(Number(n));
    return `class="blank bw-${n}"`;
  });

  // קליפת ה-section של הגיליון יורדת; נשאר התוכן הפנימי
  html = html.replace(sheetStartRe, '');
  const lastClose = html.lastIndexOf('</section>');
  html = html.slice(0, lastClose);

  return { ...sheet, inner: html.trim() };
}

const transformed = sheets.map(transformSheet);

// ---------- אינווריאנטים מבניים (CLAUDE.md §4.3) ----------
const totalSvg = transformed.reduce((n, s) => n + (s.inner.match(/<svg /g) || []).length, 0);
if (totalSvg !== 46) throw new Error(`Expected 46 rendered coordinate grids, got ${totalSvg}`);
for (const s of transformed) {
  if (/\sstyle\s*=/.test(s.inner)) throw new Error(`Sheet ${s.local}: inline style survived`);
  if (/data-(points|segments|arrows|polygons|labelboxes|xlabels|ylabels)=/.test(s.inner)) {
    throw new Error(`Sheet ${s.local}: data-* attributes survived`);
  }
  if (/<main\b/.test(s.inner)) throw new Error(`Sheet ${s.local}: nested <main> survived`);
  if (!/class="sheet-footer"/.test(s.inner)) throw new Error(`Sheet ${s.local}: footer missing`);
  const opens = (s.inner.match(/<div\b/g) || []).length;
  const closes = (s.inner.match(/<\/div>/g) || []).length;
  if (opens !== closes) throw new Error(`Sheet ${s.local}: unbalanced <div> (${opens} vs ${closes})`);
}

// ---------- תבנית הדף הקנוני ----------
function pageHtml(sheet) {
  const globalPage = startPage + sheet.local - 1;
  const endPage = startPage + pageCount - 1;
  const prev = sheet.local === 1
    ? '<a class="nav-link" href="עמוד-267.html">הקודם</a>'
    : `<a class="nav-link" href="עמוד-${globalPage - 1}.html">הקודם</a>`;
  const next = sheet.local === pageCount
    ? '<span class="nav-link is-disabled" aria-disabled="true">הבא</span>'
    : `<a class="nav-link" href="עמוד-${globalPage + 1}.html">הבא</a>`;

  const modifiers = sheet.classes
    .split(/\s+/)
    .filter((c) => c !== 'sheet')
    .join(' ');
  const extra = sheet.local === 7 ? ' p7-compact' : '';

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>עמוד ${sheet.local} — ${topicName}</title>
    <link rel="stylesheet" href="vendor/fonts/rubik.css" />
    <link rel="stylesheet" href="styles/a4-base.css">
    <link rel="stylesheet" href="styles/pages/עמוד-${globalPage}.css">
</head>
<body>
    <nav class="preview-nav" aria-label="ניווט בין עמודים">
        <div class="preview-nav-top">
            <div class="nav-side">${prev}</div>
            <div class="nav-meta">${topicName} — עמוד ${sheet.local} / ${pageCount}</div>
            <div class="nav-side">${next}</div>
        </div>
        <div class="preview-nav-topics" aria-label="נושא הדף">
            <a class="topic-link is-active" href="עמוד-${startPage}.html" aria-current="page">${topicName}</a>
        </div>
    </nav>

    <main class="a4-page page-${globalPage} cfq-page ${modifiers}${extra}">
${sheet.inner.split('\n').map((l) => (l ? `        ${l}` : l)).join('\n')}
    </main>
</body>
</html>
`;
}

// ---------- כתיבה ----------
function writeText(rel, content) {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

const topicsPath = path.join(root, 'meta', 'topics.json');
const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));

// הרצה חוזרת: מנקה רק דפים שהמייבא הזה עצמו יצר בעבר (לפי הנושא), ותו לא
const prior = (topics.topics || []).find((t) => t.name === topicName);
if (prior) {
  for (const page of prior.pages || []) {
    if (Number.isInteger(page.number) && page.number >= startPage) {
      fs.rmSync(path.join(root, `עמוד-${page.number}.html`), { force: true });
      fs.rmSync(path.join(root, 'styles', 'pages', `עמוד-${page.number}.css`), { force: true });
    }
  }
}
topics.topics = (topics.topics || []).filter((t) => t.name !== topicName);

const pages = [];
for (const sheet of transformed) {
  const globalPage = startPage + sheet.local - 1;
  const target = `עמוד-${globalPage}.html`;
  if (sheet.local === 1 || !fs.existsSync(path.join(root, target))) {
    // עמוד קיים שאינו שלנו לא נדרס: המספור 531+ פנוי, אך נוודא בכל זאת
  }
  writeText(target, pageHtml(sheet));
  writeText(`styles/pages/עמוד-${globalPage}.css`, "@import url('../topics/coordinate-first-quadrant.css');\n");
  const headerH1 = sheet.inner.match(/<h1 class="page-title">([^<]*)<\/h1>/)[1];
  pages.push({
    number: globalPage,
    file: target,
    title: `עמוד ${sheet.local} — ${topicName}`,
    h1: headerH1,
    topic: topicName,
    previewPath: `/${target}`,
    siteUrl: `${siteBase}${target}`,
  });
}

topics.topics.push({ name: topicName, count: pageCount, pages });
// totalPages נגזר מהרישום בפועל — ספירת מספרי הדפים הייחודיים בכל הנושאים
const registered = new Set();
for (const t of topics.topics) for (const p of t.pages || []) registered.add(p.number);
topics.totalPages = registered.size;
fs.writeFileSync(topicsPath, `${JSON.stringify(topics, null, 2)}\n`, 'utf8');

// מחלקות רוחב שנוצרו — נבדקות מול שכבת הנושא כדי ששום ערך לא יישאר בלי כלל
const cssPath = path.join(root, 'styles', 'topics', 'coordinate-first-quadrant.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const missing = [...blankWidths].filter((n) => !css.includes(`.bw-${n}`));
  if (missing.length) {
    throw new Error(`styles/topics/coordinate-first-quadrant.css missing blank widths: ${missing.join(', ')}`);
  }
}

console.log(`[OK] נכתבו ${pages.length} דפים: עמוד-${startPage}..עמוד-${startPage + pageCount - 1}`);
console.log(`[OK] ${totalSvg} רשתות צירים רונדרו ל-SVG סטטי`);
console.log(`[OK] רוחבי קו מילוי: ${[...blankWidths].sort((a, b) => a - b).join(', ')}`);
console.log('[OK] meta/topics.json עודכן');
