// scripts/build-linear-function-pages.mjs
// בונה את דפי הנושא "פונקציה קווית" (כיתה ח) ומסנכרן אותם ל-meta/topics.json.
//
// סדר תתי־הנושאים נגזר מתוכנית הלימודים הרשמית — כיתה ח, סבב 1, תחום אלגברי,
// "פונקציה קווית, אי-שוויון" (20 שעות), לפי עשרת הדגשים שבעמוד 53 של התוכנית.
//
// הסקריפט הוא renderer: התוכן מגיע מ-scripts/data/linear-function-worksheets.mjs
// ומקורו בחומרי המקור שסיפק יניב ובדוגמאות תוכנית הלימודים. הוא אינו מחולל שאלות.
//
// הרצה:  node scripts/build-linear-function-pages.mjs [--dry]

import fs from 'node:fs';
import path from 'node:path';
import { buildPage } from './lib/linear-page.mjs';
import { TOPIC_ORDER, FIRST_NEW_FILE } from './data/linear-function-worksheets.mjs';

const root = process.cwd();
const dry = process.argv.includes('--dry');
const TOPIC = 'פונקציה קווית';

/* ---------- 1. הקצאת מספרי קבצים ומספור מקומי ---------- */
let nextFile = FIRST_NEW_FILE;
const seq = TOPIC_ORDER.map((entry, i) => {
  const fileNumber = entry.kind === 'existing' ? entry.file : nextFile++;
  return { ...entry, fileNumber, localNumber: i + 1 };
});
const total = seq.length;

/* ---------- 1ב. שכני הנושא בסדר הקריאה הגלובלי ---------- */
// הנושא יושב באמצע הספר; בלי חיבור לשכנים "הקודם" של הדף הראשון ו"הבא" של
// האחרון היו מושבתים, והקורא היה נעצר בגבול הנושא.
const metaPre = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
const topicIdx = metaPre.topics.findIndex((t) => t.name === TOPIC);
const beforeTopic = metaPre.topics[topicIdx - 1];
const afterTopic = metaPre.topics[topicIdx + 1];
const neighbourPrev = beforeTopic?.pages?.at(-1)?.file ?? null;
const neighbourNext = afterTopic?.pages?.[0]?.file ?? null;

/* ---------- 2. כתיבת הדפים ---------- */
const written = [];
for (let i = 0; i < seq.length; i++) {
  const e = seq[i];
  const prevFile = i > 0 ? `עמוד-${seq[i - 1].fileNumber}.html` : neighbourPrev;
  const nextF = i < seq.length - 1 ? `עמוד-${seq[i + 1].fileNumber}.html` : neighbourNext;
  const htmlPath = path.join(root, `עמוד-${e.fileNumber}.html`);

  if (e.kind === 'existing') {
    // דף קיים: מעדכנים רק את שכבת הניווט והכותרת — התוכן המתמטי לא נגרע ולא משתנה (§8).
    let html = fs.readFileSync(htmlPath, 'utf8');
    const before = { svg: (html.match(/<svg/g) || []).length, div: (html.match(/<div/g) || []).length };

    html = html.replace(/<title>[^<]*<\/title>/, `<title>עמוד ${e.localNumber} — ${TOPIC}</title>`);
    html = html.replace(/<div class="nav-meta">[^<]*<\/div>/,
      `<div class="nav-meta">${TOPIC} — עמוד ${e.localNumber} / ${total}</div>`);
    html = html.replace(/<div class="nav-side">\s*(?:<a class="nav-link" href="[^"]*">הקודם<\/a>|<span class="nav-link is-disabled" aria-disabled="true">הקודם<\/span>)\s*<\/div>/,
      `<div class="nav-side">${prevFile ? `<a class="nav-link" href="${prevFile}">הקודם</a>` : '<span class="nav-link is-disabled" aria-disabled="true">הקודם</span>'}</div>`);
    html = html.replace(/<div class="nav-side">\s*(?:<a class="nav-link" href="[^"]*">הבא<\/a>|<span class="nav-link is-disabled" aria-disabled="true">הבא<\/span>)\s*<\/div>/,
      `<div class="nav-side">${nextF ? `<a class="nav-link" href="${nextF}">הבא</a>` : '<span class="nav-link is-disabled" aria-disabled="true">הבא</span>'}</div>`);

    const after = { svg: (html.match(/<svg/g) || []).length, div: (html.match(/<div/g) || []).length };
    if (after.svg !== before.svg || after.div !== before.div) {
      throw new Error(`אינווריאנט מבני נשבר בעמוד-${e.fileNumber}: svg ${before.svg}->${after.svg}, div ${before.div}->${after.div}`);
    }
    if (!dry) fs.writeFileSync(htmlPath, html, 'utf8');
    written.push({ ...e, mode: 'updated' });
    continue;
  }

  const html = buildPage({
    fileNumber: e.fileNumber,
    localNumber: e.localNumber,
    topicTotal: total,
    prevFile,
    nextFile: nextF,
    subtitle: e.subtitle,
    blocks: e.blocks(),
  });
  if (!dry) {
    fs.writeFileSync(htmlPath, html, 'utf8');
    fs.writeFileSync(path.join(root, 'styles', 'pages', `עמוד-${e.fileNumber}.css`),
      `@import url('../topics/linear-function.css');\n`, 'utf8');
  }
  written.push({ ...e, mode: 'created' });
}

/* ---------- 3. סנכרון meta/topics.json ---------- */
const tp = path.join(root, 'meta', 'topics.json');
const meta = JSON.parse(fs.readFileSync(tp, 'utf8'));
const topic = meta.topics.find((t) => t.name === TOPIC);
if (!topic) throw new Error(`הנושא "${TOPIC}" לא נמצא ב-topics.json`);

const otherPages = meta.topics.filter((t) => t.name !== TOPIC).reduce((n, t) => n + t.pages.length, 0);

// שיוך תכנית הלימודים נקבע ב-scripts/build-curriculum.mjs. בלי שימור מפורש
// כאן, כל בנייה הייתה מוחקת אותו ומפילה את validate:schema ו-validate:curriculum.
const prevCurriculumId = new Map(topic.pages.map((p) => [p.file, p.curriculumId]));

topic.pages = seq.map((e) => {
  const file = `עמוד-${e.fileNumber}.html`;
  const page = {
    number: e.fileNumber,
    file,
    title: `עמוד ${e.localNumber} — ${TOPIC}`,
    h1: TOPIC,
    topic: TOPIC,
    previewPath: `/${file}`,
    siteUrl: `https://yanivmizrachiy.github.io/parabula-next/${file}`,
  };
  const cid = prevCurriculumId.get(file);
  if (cid) page.curriculumId = cid;
  return page;
});
topic.count = topic.pages.length;
meta.totalPages = otherPages + topic.count;

// --- אינווריאנטים לפני כתיבה ---
const files = meta.topics.flatMap((t) => t.pages.map((p) => p.file));
if (new Set(files).size !== files.length) throw new Error('נמצא קובץ כפול ב-topics.json');
if (!dry) {
  for (const p of topic.pages) {
    if (!fs.existsSync(path.join(root, p.file))) throw new Error(`חסר קובץ ${p.file}`);
  }
}
const localNums = topic.pages.map((p) => Number(p.title.match(/עמוד (\d+)/)[1]));
if (localNums.some((n, i) => n !== i + 1)) throw new Error('המספור המקומי אינו רציף');

if (!dry) fs.writeFileSync(tp, JSON.stringify(meta, null, 2) + '\n', 'utf8');

/* ---------- 4. דוח ---------- */
const created = written.filter((w) => w.mode === 'created').length;
const updated = written.filter((w) => w.mode === 'updated').length;
console.log(`\n[${dry ? 'DRY' : 'OK'}] נושא "${TOPIC}" — ${total} דפים (${created} חדשים, ${updated} קיימים עודכנו)`);
let lastSub = null;
for (const w of written) {
  if (w.chapter !== lastSub) { console.log(`\n  ── ${w.chapter}`); lastSub = w.chapter; }
  console.log(`     עמוד ${String(w.localNumber).padStart(2)} → עמוד-${w.fileNumber}.html  ${w.mode === 'created' ? '' : '(קיים)'}`);
}
console.log(`\n  סה״כ דפים בריפו: ${meta.totalPages}`);
