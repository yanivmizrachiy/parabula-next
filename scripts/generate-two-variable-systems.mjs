/**
 * generate-two-variable-systems.mjs
 *
 * מפיק את חוברת "מערכת משוואות בשני נעלמים" מ-
 * sources/two-variable-systems/workbook-data.mjs, עם פריסה נגזרת-כתיבה
 * (CLAUDE.md §4.6): תרגילים קלים 6 בעמוד בשני טורים, כבדים פחות בעמוד.
 * כל מערכת נפתרת ומאומתת (פתרון יחיד) בזמן הבנייה.
 *
 * הדפים המיוחדים (סיפורים/מיון/אתגר/היסק) נשמרים בתוכנם ורק מתמספרים
 * ומחוברים מחדש לשרשרת. הרצה: node scripts/generate-two-variable-systems.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { SECTIONS, TOPIC, SUBTITLE } from '../sources/two-variable-systems/workbook-data.mjs';
import { solveSystem } from './lib/linear-system-solver.mjs';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const changed = [];
const write = (rel, content) => {
  const prev = exists(rel) ? read(rel) : null;
  if (prev === content) return;
  if (checkOnly) throw new Error(`${rel} אינו מעודכן. הריצו: node scripts/generate-two-variable-systems.mjs`);
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), content, 'utf8');
  changed.push(rel);
};
const remove = (rel) => {
  if (!exists(rel)) return;
  if (checkOnly) throw new Error(`${rel} אמור להימחק. הריצו: node scripts/generate-two-variable-systems.mjs`);
  fs.rmSync(path.join(root, rel));
  changed.push(`- ${rel}`);
};

const CAPACITY = { light: 6, medium: 4, wide: 3, heavy: 2 };

// ── 1. אימות כל מערכת ופיצול לעמודים ─────────────────────────────────
const systemPages = [];
for (const section of SECTIONS) {
  const cap = CAPACITY[section.layout];
  if (!cap) throw new Error(`layout לא ידוע: ${section.layout}`);
  section.systems.forEach((latex) => {
    const result = solveSystem(latex);
    const kind = result.kind || result.type;
    if (kind !== 'unique') throw new Error(`מערכת ללא פתרון יחיד (${kind}): ${latex}`);
  });
  for (let i = 0; i < section.systems.length; i += cap) {
    systemPages.push({
      instruction: section.instruction,
      layout: section.layout,
      columns: section.layout === 'light' ? 2 : 1,
      systems: section.systems.slice(i, i + cap),
    });
  }
}

// ── 2. הקצאת קבצים ───────────────────────────────────────────────────
// 609 נשאר עמוד הכניסה (רצועות נושא בכל הספר מצביעות אליו) → עמוד מקומי 1.
const SYSTEM_FILES = [609, 601, 602, 603, 604, 605, 606, 607, 608, 610];
const SPECIAL_FILES = [611, 613, 614, 615, 616];
const RETIRED = [612, 617, 618, 619, 620, 621, 622, 623];

if (systemPages.length !== SYSTEM_FILES.length) {
  throw new Error(`הפריסה יצרה ${systemPages.length} דפי מערכת, מוקצים ${SYSTEM_FILES.length}`);
}

// גבולות השרשרת (קודם של הראשון, הבא של האחרון) — נשמרים מהמצב הקיים
const entryHtml = read('עמוד-609.html');
const boundaryPrev = (entryHtml.match(/<a class="nav-link" href="([^"]+)">הקודם<\/a>/) || [, 'עמוד-608.html'])[1];
const lastSpecialHtml = read(`עמוד-${SPECIAL_FILES.at(-1)}.html`);
const boundaryNext = (lastSpecialHtml.match(/<a class="nav-link" href="([^"]+)">הבא<\/a>/) || [, 'עמוד-531.html'])[1];
const topicStrip = (entryHtml.match(/<div class="preview-nav-topics"[\s\S]*?>([\s\S]*?)<\/div>/) || [, ''])[1].trim();

const ORDER = [...SYSTEM_FILES, ...SPECIAL_FILES];
const fileOf = (index) => `עמוד-${ORDER[index]}.html`;
const total = ORDER.length;

const navBlock = (index) => {
  const prev = index === 0 ? boundaryPrev : fileOf(index - 1);
  const next = index === total - 1 ? boundaryNext : fileOf(index + 1);
  const strip = topicStrip.replace(/href="עמוד-\d+\.html" aria-current="page"/, 'href="עמוד-609.html" aria-current="page"');
  return `    <nav class="preview-nav" aria-label="ניווט בין עמודים">
        <div class="preview-nav-top">
            <div class="nav-side"><a class="nav-link" href="${prev}">הקודם</a></div>
            <div class="nav-meta">${TOPIC} — עמוד ${index + 1} / ${total}</div>
            <div class="nav-side"><a class="nav-link" href="${next}">הבא</a></div>
        </div>
        <div class="preview-nav-topics" aria-label="מעבר בין נושאים">
            ${strip}
        </div>
    </nav>`;
};

const FOOTER = `        <footer class="gz-footer">
            <div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div>
            <div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div>
        </footer>`;

// ── 3. בניית דפי המערכת ──────────────────────────────────────────────
systemPages.forEach((page, index) => {
  const num = ORDER[index];
  const local = index + 1;
  const twoCol = page.columns === 2 ? ' systems-two-col' : '';
  const cards = page.systems.map((latex) => `                <section class="system-card">
                    <div class="system-math">$$${latex}$$</div>
                    <div class="work-lines" aria-label="מקום לכתיבת דרך הפתרון"></div>
                    <div class="final-answer">
                        <span>תשובה סופית:</span>
                        <span class="answer-pair" aria-label="זוג סדור">
                            <span>(</span><span class="answer-box" aria-hidden="true"></span><span>,</span><span class="answer-box" aria-hidden="true"></span><span>)</span>
                        </span>
                    </div>
                </section>`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>עמוד ${local} — ${TOPIC}</title>
    <link rel="stylesheet" href="vendor/fonts/rubik.css" />
    <script>MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']] }, chtml: { fontURL: 'vendor/mathjax/tex-font/chtml/woff2' } };</script>
    <script id="MathJax-script" async src="vendor/mathjax/tex-mml-chtml.js"></script>
    <link rel="stylesheet" href="styles/a4-base.css">
    <link rel="stylesheet" href="styles/pages/עמוד-${num}.css">
</head>
<body>
${navBlock(index)}

    <main class="a4-page page-${num} systems2-page${twoCol}">
        <header class="header-container">
            <div class="title-wrap">
                <h1 class="page-title">${TOPIC}</h1>
                <p class="page-subtitle">${SUBTITLE}</p>
            </div>
            <div class="page-number">${local}</div>
        </header>

        <div class="question-block">
            <div class="instruction">${page.instruction}</div>
            <div class="systems-list">
${cards}
            </div>
        </div>

${FOOTER}
    </main>
</body>
</html>
`;

  const cardCount = (html.match(/<section class="system-card">/g) || []).length;
  if (cardCount !== page.systems.length) throw new Error(`${fileOf(index)}: ${cardCount} כרטיסים במקום ${page.systems.length}`);
  if (!html.includes('gz-footer') || !html.includes('מדריך מחוזי חט"ב בעיר ירושלים')) throw new Error(`${fileOf(index)}: קרדיט חסר`);
  write(fileOf(index), html);
  if (!exists(`styles/pages/עמוד-${num}.css`)) write(`styles/pages/עמוד-${num}.css`, `@import url('../topics/two-variable-systems.css');\n`);
});

// ── 4. שימור הדפים המיוחדים (תוכן נשמר, ניווט ומספור מתעדכנים) ────────
SPECIAL_FILES.forEach((num, offset) => {
  const index = SYSTEM_FILES.length + offset;
  const local = index + 1;
  let html = read(`עמוד-${num}.html`);
  const main = (html.match(/<main class="a4-page[\s\S]*?<\/main>/) || [null])[0];
  if (!main) throw new Error(`עמוד-${num}.html ללא <main>`);
  const patchedMain = main
    .replace(/<div class="nav-meta">[\s\S]*?<\/div>/, '')
    .replace(/<div class="page-number">\d+<\/div>/, `<div class="page-number">${local}</div>`);
  const head = html.slice(0, html.indexOf('<body>'));
  const patchedHead = head.replace(/<title>[^<]*<\/title>/, `<title>עמוד ${local} — ${TOPIC}</title>`);
  html = `${patchedHead}<body>
${navBlock(index)}

${patchedMain}
</body>
</html>
`;
  write(`עמוד-${num}.html`, html);
});

// ── 5. מחיקת הדפים העודפים ──────────────────────────────────────────
for (const num of RETIRED) {
  remove(`עמוד-${num}.html`);
  remove(`styles/pages/עמוד-${num}.css`);
}

// ── 6. מטא־דאטה ──────────────────────────────────────────────────────
const meta = JSON.parse(read('meta/topics.json'));
const topic = meta.topics.find((t) => t.name === TOPIC);
const siteBase = meta.siteUrl?.endsWith('/') ? meta.siteUrl : `${meta.siteUrl || ''}/`;
topic.pages = ORDER.map((num, index) => {
  const existing = topic.pages.find((p) => p.number === num) || {};
  const isSpecial = SPECIAL_FILES.includes(num);
  const h1 = isSpecial
    ? (read(`עמוד-${num}.html`).match(/<h1 class="page-title">([\s\S]*?)<\/h1>/) || [, TOPIC])[1]
    : TOPIC;
  return {
    ...existing,
    number: num,
    file: `עמוד-${num}.html`,
    title: `עמוד ${index + 1} — ${TOPIC}`,
    h1,
    topic: TOPIC,
    previewPath: `/עמוד-${num}.html`,
    siteUrl: `${siteBase}עמוד-${num}.html`,
    curriculumId: existing.curriculumId || 'g8.alg.systems.substitution',
  };
});
topic.count = topic.pages.length;
meta.totalPages = meta.topics.reduce((sum, t) => sum + t.pages.length, 0);
write('meta/topics.json', `${JSON.stringify(meta, null, 2)}\n`);

// ── 7. שיוך בתכנית הלימודים ───────────────────────────────────────────
const mapFile = 'scripts/curriculum-map.mjs';
let mapSource = read(mapFile);
const subst = /'g8\.alg\.systems\.substitution':\s*\[[^\]]*\]/;
if (!subst.test(mapSource)) throw new Error('לא נמצא שיוך substitution');
const substPages = ORDER.filter((n) => n !== 613); // 613 מיון — נשאר תחת graphic
mapSource = mapSource.replace(subst, `'g8.alg.systems.substitution': [${substPages.join(', ')}]`);
write(mapFile, mapSource);

console.log(JSON.stringify({
  systemPages: systemPages.length,
  specialPages: SPECIAL_FILES.length,
  totalTopicPages: total,
  totalSystems: systemPages.reduce((s, p) => s + p.systems.length, 0),
  retired: RETIRED,
  changed: changed.length,
}, null, 1));
