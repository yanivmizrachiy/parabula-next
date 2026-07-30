/**
 * split-two-variable-systems.mjs
 *
 * מפצל את דפי "מערכת משוואות בשני נעלמים" כך שכל תרגיל מקבל מרחב פתרון אמיתי
 * (CLAUDE.md §4.3 — "שיפור מקבל את הרוחב שהוא צריך": מוסיפים דף, לא מכווצים),
 * ומעדכן מספור מקומי, שרשרת ניווט ומטא־דאטה.
 *
 * הרצה:  node scripts/split-two-variable-systems.mjs [--check]
 * --check נכשל אם הדפים אינם מעודכנים (שער CI), בלי לכתוב דבר.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');
const TOPIC = 'מערכת משוואות בשני נעלמים';
const MAX_CARDS_PER_PAGE = 3;

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const written = [];
const write = (rel, content) => {
  const previous = exists(rel) ? read(rel) : null;
  if (previous === content) return;
  if (checkOnly) throw new Error(`${rel} אינו מעודכן. הריצו: node scripts/split-two-variable-systems.mjs`);
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), content, 'utf8');
  written.push(rel);
};

/** חלוקה מאוזנת: 4→2+2, 5→3+2, 6→3+3 — לעולם לא דף עם שארית זעירה. */
function balancedChunks(items, max) {
  const total = items.length;
  if (total <= max) return [items];
  const groups = Math.ceil(total / max);
  const base = Math.floor(total / groups);
  const extra = total % groups;
  const out = [];
  let cursor = 0;
  for (let i = 0; i < groups; i += 1) {
    const size = base + (i < extra ? 1 : 0);
    out.push(items.slice(cursor, cursor + size));
    cursor += size;
  }
  return out;
}

const pick = (html, re, label) => {
  const m = html.match(re);
  if (!m) throw new Error(`לא נמצא ${label}`);
  return m[1];
};

/** שולף את כל בלוקי section.system-card מתוך דף. */
function extractCards(html) {
  const cards = [];
  const open = '<section class="system-card">';
  let from = 0;
  for (;;) {
    const start = html.indexOf(open, from);
    if (start === -1) break;
    const end = html.indexOf('</section>', start);
    if (end === -1) throw new Error('section.system-card ללא סגירה');
    cards.push(html.slice(start, end + '</section>'.length));
    from = end + 1;
  }
  return cards;
}

const meta = JSON.parse(read('meta/topics.json'));
const topic = meta.topics.find((t) => t.name === TOPIC);
if (!topic) throw new Error(`נושא חסר במטא־דאטה: ${TOPIC}`);

// ── 1. קריאת מצב הדפים הקיימים בסדר הנושא ─────────────────────────────
const source = topic.pages.map((page) => {
  const html = read(page.file);
  return {
    number: page.number,
    file: page.file,
    html,
    cards: extractCards(html),
    title: pick(html, /<h1 class="page-title">([\s\S]*?)<\/h1>/, `כותרת ב-${page.file}`),
    subtitle: (html.match(/<p class="page-subtitle">([\s\S]*?)<\/p>/) || [, ''])[1],
    instruction: (html.match(/<div class="instruction">([\s\S]*?)<\/div>/) || [, ''])[1],
    variant: pick(html, /<main class="a4-page page-\d+ systems2-page([^"]*)"/, `וריאנט ב-${page.file}`).trim(),
    firstPrev: (html.match(/<div class="nav-side"><a class="nav-link" href="([^"]+)">הקודם<\/a><\/div>/) || [, ''])[1],
    lastNext: (html.match(/<div class="nav-side"><a class="nav-link" href="([^"]+)">הבא<\/a><\/div>/) || [, ''])[1],
    topicStrip: pick(html, /<div class="preview-nav-topics"[\s\S]*?>([\s\S]*?)<\/div>/, `רצועת נושאים ב-${page.file}`),
  };
});

const sourceCardTotal = source.reduce((sum, p) => sum + p.cards.length, 0);

// ── 2. תכנון הפריסה החדשה ────────────────────────────────────────────
let nextFreeNumber = Math.max(
  ...fs.readdirSync(root).filter((f) => /^עמוד-\d+\.html$/.test(f)).map((f) => Number(f.match(/\d+/)[0])),
) + 1;

const plan = [];
for (const page of source) {
  if (page.cards.length === 0) {
    plan.push({ ...page, cards: [], number: page.number, isNew: false });
    continue;
  }
  const chunks = balancedChunks(page.cards, MAX_CARDS_PER_PAGE);
  chunks.forEach((chunk, index) => {
    plan.push({
      ...page,
      cards: chunk,
      number: index === 0 ? page.number : nextFreeNumber++,
      isNew: index !== 0,
      partIndex: index,
      partCount: chunks.length,
    });
  });
}

const plannedCardTotal = plan.reduce((sum, p) => sum + p.cards.length, 0);
if (plannedCardTotal !== sourceCardTotal) {
  throw new Error(`אינווריאנט נשבר: ${sourceCardTotal} תרגילים במקור מול ${plannedCardTotal} בתכנון`);
}
for (const entry of plan) {
  if (entry.cards.length > MAX_CARDS_PER_PAGE) {
    throw new Error(`דף ${entry.number} נושא ${entry.cards.length} תרגילים — מעל המותר`);
  }
}

const totalPages = plan.length;

// ── 3. בניית הדפים ───────────────────────────────────────────────────
const buildPage = (entry, localIndex) => {
  const local = localIndex + 1;
  const prevFile = localIndex === 0 ? source[0].firstPrev : plan[localIndex - 1].file || `עמוד-${plan[localIndex - 1].number}.html`;
  const nextFile = localIndex === totalPages - 1
    ? source.at(-1).lastNext
    : `עמוד-${plan[localIndex + 1].number}.html`;
  const variant = entry.variant ? ` ${entry.variant}` : '';
  const firstFile = `עמוד-${plan[0].number}.html`;
  const strip = entry.topicStrip
    .replace(/href="עמוד-\d+\.html" aria-current="page"/, `href="${firstFile}" aria-current="page"`)
    .trim();

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>עמוד ${local} — ${TOPIC}</title>
    <link rel="stylesheet" href="vendor/fonts/rubik.css" />
    <script>MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']] }, chtml: { fontURL: 'vendor/mathjax/tex-font/chtml/woff2' } };</script>
    <script id="MathJax-script" async src="vendor/mathjax/tex-mml-chtml.js"></script>
    <link rel="stylesheet" href="styles/a4-base.css">
    <link rel="stylesheet" href="styles/pages/עמוד-${entry.number}.css">
</head>
<body>
    <nav class="preview-nav" aria-label="ניווט בין עמודים">
        <div class="preview-nav-top">
            <div class="nav-side"><a class="nav-link" href="${prevFile}">הקודם</a></div>
            <div class="nav-meta">${TOPIC} — עמוד ${local} / ${totalPages}</div>
            <div class="nav-side"><a class="nav-link" href="${nextFile}">הבא</a></div>
        </div>
        <div class="preview-nav-topics" aria-label="מעבר בין נושאים">
            ${strip}
        </div>
    </nav>

    <main class="a4-page page-${entry.number} systems2-page${variant}">
        <header class="header-container">
            <div class="title-wrap">
                <h1 class="page-title">${entry.title}</h1>
                <p class="page-subtitle">${entry.subtitle}</p>
            </div>
            <div class="page-number">${local}</div>
        </header>

        <div class="question-block">
            <div class="instruction">${entry.instruction}</div>
            ${entry.body ? entry.body : `<div class="systems-list">
${entry.cards.join('\n')}
            </div>`}
        </div>

        <footer class="gz-footer">
            <div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div>
            <div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div>
        </footer>
    </main>
</body>
</html>
`;
};

// דפים ללא כרטיסי מערכת (סיפורים/מיון/אתגר/היסק) נשמרים כפי שהם —
// מעודכנים רק במספור המקומי ובשרשרת הניווט, בלי לגעת בתוכן.
const rewriteExistingPage = (entry, localIndex) => {
  const local = localIndex + 1;
  const prevFile = localIndex === 0 ? source[0].firstPrev : `עמוד-${plan[localIndex - 1].number}.html`;
  const nextFile = localIndex === totalPages - 1 ? source.at(-1).lastNext : `עמוד-${plan[localIndex + 1].number}.html`;
  const firstFile = `עמוד-${plan[0].number}.html`;
  let html = entry.html;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>עמוד ${local} — ${TOPIC}</title>`);
  html = html.replace(/<div class="nav-side"><a class="nav-link" href="[^"]*">הקודם<\/a><\/div>/,
    `<div class="nav-side"><a class="nav-link" href="${prevFile}">הקודם</a></div>`);
  html = html.replace(/<div class="nav-side"><a class="nav-link" href="[^"]*">הבא<\/a><\/div>/,
    `<div class="nav-side"><a class="nav-link" href="${nextFile}">הבא</a></div>`);
  html = html.replace(/<div class="nav-meta">[^<]*<\/div>/, `<div class="nav-meta">${TOPIC} — עמוד ${local} / ${totalPages}</div>`);
  html = html.replace(/href="עמוד-\d+\.html" aria-current="page"/, `href="${firstFile}" aria-current="page"`);
  html = html.replace(/<div class="page-number">\d+<\/div>/, `<div class="page-number">${local}</div>`);
  return html;
};

plan.forEach((entry, index) => {
  const file = `עמוד-${entry.number}.html`;
  entry.file = file;
  const html = entry.cards.length ? buildPage(entry, index) : rewriteExistingPage(entry, index);

  // אינווריאנט מבני לפני כתיבה (§4.3)
  const cardCount = (html.match(/<section class="system-card">/g) || []).length;
  if (cardCount !== entry.cards.length) {
    throw new Error(`${file}: נכתבו ${cardCount} כרטיסים במקום ${entry.cards.length}`);
  }
  if (!html.includes('gz-footer') || !html.includes('מדריך מחוזי חט"ב בעיר ירושלים')) {
    throw new Error(`${file}: קרדיט הכותרת התחתונה חסר`);
  }
  write(file, html);
  if (!exists(`styles/pages/עמוד-${entry.number}.css`)) {
    write(`styles/pages/עמוד-${entry.number}.css`, `@import url('../topics/two-variable-systems.css');\n`);
  }
});

// ── 4. מטא־דאטה ──────────────────────────────────────────────────────
const siteBase = meta.siteUrl?.endsWith('/') ? meta.siteUrl : `${meta.siteUrl || ''}/`;
topic.pages = plan.map((entry, index) => {
  const existing = topic.pages.find((p) => p.number === entry.number) || {};
  return {
    ...existing,
    number: entry.number,
    file: entry.file,
    title: `עמוד ${index + 1} — ${TOPIC}`,
    h1: entry.title,
    topic: TOPIC,
    previewPath: `/${entry.file}`,
    siteUrl: `${siteBase}${entry.file}`,
    curriculumId: existing.curriculumId || 'g8.alg.systems.substitution',
  };
});
topic.count = topic.pages.length;
meta.totalPages = meta.topics.reduce((sum, t) => sum + t.pages.length, 0);
write('meta/topics.json', `${JSON.stringify(meta, null, 2)}\n`);

// ── 5. שיוך בתכנית הלימודים ───────────────────────────────────────────
const mapFile = 'scripts/curriculum-map.mjs';
let mapSource = read(mapFile);
const newNumbers = plan.filter((e) => e.isNew).map((e) => e.number);
if (newNumbers.length) {
  const anchor = /'g8\.alg\.systems\.substitution':\s*\[([^\]]*)\]/;
  const match = mapSource.match(anchor);
  if (!match) throw new Error('לא נמצא שיוך g8.alg.systems.substitution');
  const additions = newNumbers.map((n) => String(n)).join(', ');
  if (!newNumbers.every((n) => match[1].includes(String(n)))) {
    mapSource = mapSource.replace(anchor, `'g8.alg.systems.substitution': [${match[1].trim()}, ${additions}]`);
    write(mapFile, mapSource);
  }
}

console.log(JSON.stringify({
  topicPagesBefore: source.length,
  topicPagesAfter: totalPages,
  exercises: sourceCardTotal,
  newPages: newNumbers,
  maxCardsPerPage: MAX_CARDS_PER_PAGE,
  written: written.length,
}, null, 1));
