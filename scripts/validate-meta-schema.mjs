// scripts/validate-meta-schema.mjs
// בודק שכל ה-meta (פגס ונושאים) תקין לפני build
// הרצה: node scripts/validate-meta-schema.mjs

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let errors = 0;
let warnings = 0;

function fail(msg) {
  console.error(`  [FAIL] ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  [WARN] ${msg}`);
  warnings++;
}

function ok(msg) {
  console.log(`  [OK]   ${msg}`);
}

console.log('\n=== validate-meta-schema: בדיקת איכות meta ===\n');

// --- בדוק topics.json ---
console.log('1) בדיקת meta/topics.json');
const topicsPath = path.join(root, 'meta', 'topics.json');
if (!fs.existsSync(topicsPath)) {
  fail('meta/topics.json לא קיים!');
} else {
  const raw = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
  if (!raw.topics || !Array.isArray(raw.topics)) {
    fail('topics.json: חסר שדה topics[]');
  } else {
    ok(`topics.json: ${raw.topics.length} נושאים, ${raw.totalPages} דפים`);
    for (const topic of raw.topics) {
      if (!topic.name) fail(`נושא חסר name: ${JSON.stringify(topic).slice(0,60)}`);
      if (!topic.pages || topic.pages.length === 0) warn(`נושא ${topic.name}: אין דפים`);
    }
    // בדוק שאין כפילויות במספרי דפים
    const allNums = raw.topics.flatMap(t => (t.pages || []).map(p => p.number));
    const dupes = allNums.filter((n, i) => allNums.indexOf(n) !== i);
    if (dupes.length > 0) fail(`כפילויות ב-topics.json: דפים ${dupes.join(', ')}`);
    else ok('אין כפילויות במספרי דפים');
  }
}

// --- בדוק pages.json ---
console.log('\n2) בדיקת meta/pages.json');
const pagesPath = path.join(root, 'meta', 'pages.json');
if (!fs.existsSync(pagesPath)) {
  fail('meta/pages.json לא קיים! הרץ: node scripts/generate-pages-registry.mjs');
} else {
  const raw = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'));
  if (!raw.pages || raw.pages.length === 0) {
    fail('meta/pages.json ריק! הרץ: node scripts/generate-pages-registry.mjs');
  } else {
    ok(`pages.json: ${raw.pages.length} דפים, נושאים: ${(raw.topics||[]).join(', ')}`);

    for (const p of raw.pages) {
      // בדוק שדה חובה
      if (!p.number) fail(`דף חסר number: ${JSON.stringify(p).slice(0,60)}`);
      if (!p.file)   fail(`דף ${p.number}: חסר file`);
      if (!p.topic)  fail(`דף ${p.number}: חסר topic`);
      if (!p.status) fail(`דף ${p.number}: חסר status`);
      // בדוק שה-HTML קיים
      if (p.file && !fs.existsSync(path.join(root, p.file))) {
        fail(`דף ${p.number}: HTML לא קיים: ${p.file}`);
      }
      // אזהרה שה-CSS חסר
      if (!p.cssFile) warn(`דף ${p.number}: חסר CSS file`);
      // אזהרה נושא לא ידוע
      if (p.topic === '\u05dc\u05d0 \u05d9\u05d3\u05d5\u05e2') warn(`דף ${p.number}: נושא לא ידוע ב-topics.json`);
    }
  }
}

// --- בדוק HTML קיימים בשורש ---
console.log('\n3) בדיקת קבצי HTML בשורש');
const htmlFiles = fs.readdirSync(root).filter(f => /^\u05e2\u05de\u05d5\u05d3-\d+\.html$/.test(f));
ok(`נמצאו ${htmlFiles.length} קבצי HTML בשורש`);
if (htmlFiles.length === 0) fail('אין קבצי HTML!');

// --- בדוק styles/a4-base.css ---
console.log('\n4) בדיקת styles/a4-base.css');
if (!fs.existsSync(path.join(root, 'styles', 'a4-base.css'))) {
  fail('styles/a4-base.css לא קיים!');
} else {
  ok('styles/a4-base.css קיים');
}

// --- סיכום ---
console.log('\n=== סיכום ===');
if (errors > 0) {
  console.error(`\n[FAIL] ${errors} שגיאות, ${warnings} אזהרות`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`\n[PASS] 0 שגיאות, ${warnings} אזהרות — בדוק את ה-WARN`);
  process.exit(0);
} else {
  console.log('\n[SUCCESS] כל ה-meta תקין לחלוטין!');
  process.exit(0);
}
