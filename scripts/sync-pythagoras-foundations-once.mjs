import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, text) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, text, 'utf8');
};
const replaceOnce = (text, needle, replacement, label) => {
  if (!text.includes(needle)) throw new Error(`Missing expected marker: ${label}`);
  return text.replace(needle, replacement);
};

const FIRST = 617;
const COUNT = 17;
const TOTAL = 40;
const TOPIC = 'משפט פיתגורס';
const CURRICULUM_ID = 'g7.geo.pythagoras';

// Every canonical foundation page gets its own page CSS, delegating to one topic layer.
for (let i = 0; i < COUNT; i += 1) {
  const number = FIRST + i;
  const rel = `עמוד-${number}.html`;
  let html = read(rel);
  if (/\sstyle\s*=\s*["']/.test(html)) throw new Error(`${rel}: inline CSS remains`);
  html = replaceOnce(
    html,
    'styles/topics/pythagoras-foundations.css',
    `styles/pages/עמוד-${number}.css`,
    `${rel} stylesheet`,
  );
  write(rel, html);
  write(`styles/pages/עמוד-${number}.css`, '@import url("../topics/pythagoras-foundations.css");\n');
}

// Reindex the 23 existing direct Pythagoras pages to local 18..40 without renaming files.
const legacyGlobals = [...Array.from({ length: 22 }, (_, i) => 9 + i), 41];
for (let i = 0; i < legacyGlobals.length; i += 1) {
  const global = legacyGlobals[i];
  const local = COUNT + i + 1;
  const rel = `עמוד-${global}.html`;
  let html = read(rel);
  const titleRe = /<title>עמוד \d+ — משפט פיתגורס<\/title>/u;
  const navRe = /<div class="nav-meta">משפט פיתגורס — עמוד \d+ \/ 23<\/div>/u;
  const pageRe = /<div class="page-number">\d+<\/div>/u;
  if (!titleRe.test(html) || !navRe.test(html) || !pageRe.test(html)) {
    throw new Error(`${rel}: legacy local-number markers not found`);
  }
  html = html.replace(titleRe, `<title>עמוד ${local} — משפט פיתגורס</title>`);
  html = html.replace(navRe, `<div class="nav-meta">משפט פיתגורס — עמוד ${local} / ${TOTAL}</div>`);
  html = html.replace(pageRe, `<div class="page-number">${local}</div>`);
  if (global === 9) {
    html = replaceOnce(html, 'href="עמוד-530.html">הקודם', 'href="עמוד-633.html">הקודם', 'page 9 previous');
  }
  write(rel, html);
}

// Close the edge from the previous topic into foundations page 1.
{
  const rel = 'עמוד-530.html';
  let html = read(rel);
  html = replaceOnce(html, 'href="עמוד-9.html">הבא', 'href="עמוד-617.html">הבא', 'page 530 next');
  write(rel, html);
}

// Remove the temporary CSS-only reindex after canonical HTML is reindexed.
{
  const rel = 'styles/topics/pythagoras.css';
  let css = read(rel);
  const marker = '\n/* 17 דפי היסוד החדשים קודמים לחומר הוותיק.';
  const at = css.indexOf(marker);
  if (at >= 0) css = `${css.slice(0, at).trimEnd()}\n`;
  write(rel, css);
}

// Register foundations in the canonical curriculum source map.
{
  const rel = 'scripts/curriculum-map.mjs';
  let source = read(rel);
  source = replaceOnce(
    source,
    "'g7.geo.pythagoras': ['9-30', 41, '375-380'],",
    "'g7.geo.pythagoras': ['617-633', '9-30', 41, '375-380'],",
    'Pythagoras curriculum assignment',
  );
  write(rel, source);
}

// Update the sole rules source with the explicit user-authorized Pythagoras exception.
{
  const rel = 'CLAUDE.md';
  let rules = read(rel);
  const oldExceptions = '**חריגים מפורשים בלבד:** „גאומטריה ז” במצב „מקור + העשרה” (§4.2), ו„משוואות ריבועיות” במצב „כותרות מקור + מאגר חדש מדורג” (§4.5). אין להסיק מן החריגים הרשאה לנושא אחר.';
  const newExceptions = '**חריגים מפורשים בלבד:** „גאומטריה ז” במצב „מקור + העשרה” (§4.2), „משפט פיתגורס” במצב „יסודות חדשים + רצף קיים” (§4.2א), ו„משוואות ריבועיות” במצב „כותרות מקור + מאגר חדש מדורג” (§4.5). אין להסיק מן החריגים הרשאה לנושא אחר.';
  rules = replaceOnce(rules, oldExceptions, newExceptions, 'rules exception list');

  const insertBefore = '### 4.3 חוזה דיוק ואימות מדיד (הוראת יניב, 2026-07-19)';
  const contract = [
    '### 4.2א חוזה נושא „משפט פיתגורס” (מצב „יסודות חדשים + רצף קיים”)',
    '',
    'הוראה מפורשת של יניב (2026-08-16) לנושא זה בלבד:',
    '',
    '- **מותר ליצור תוכן יסודות חדש ומדורג** בנושא משפט פיתגורס, כדי שהתלמיד לא יתחיל מחישוב צלע חסרה לפני שליטה במושגים ובכלים המקדימים.',
    '- **סדר היסודות המחייב:** זווית ישרה → משולש ישר־זווית → ניצבים → יתר → זיהוי ניצבים ויתר גם בסיבוב → חזקה שנייה וריבועי מספרים → שורש ריבועי → משמעות גאומטרית של ריבוע הצלע → גילוי וניסוח משפט פיתגורס → \\(a^2+b^2=c^2\\) → כתיבת משוואה → מציאת יתר → מציאת ניצב → תרגול משולב. מספר הדפים נגזר מאיכות ההוראה ואינו מכסה קשיחה.',
    '- **17 דפי היסוד הראשונים** הם עמוד-617.html עד עמוד-633.html; אחריהם ממשיכים 23 דפי פיתגורס הוותיקים עמוד-9.html עד עמוד-30.html ועמוד-41.html, שמספרם המקומי הוא 18–40. זהות הקובץ הגלובלית אינה משתנה.',
    '- **עיצוב ושרטוט:** A4, RTL ו־SVG וקטורי חד ובר־עריכה לפי §3–§4. שכבת היסודות המשותפת היא styles/topics/pythagoras-foundations.css; כל דף קנוני מקשר דרך styles/pages/עמוד-N.css. אין inline CSS.',
    '- **אין מספור שאלות גלוי ואין תוויות קושי/שלב.** המספר הגלוי היחיד הוא המספר המקומי של העמוד בנושא.',
    '- **שרשרת הניווט:** הדף שלפני פיתגורס מוביל אל עמוד היסודות הראשון; דף יסודות 17 מוביל אל הדף הוותיק הראשון; משם הרצף הוותיק נמשך ללא שינוי בזהויות הקבצים.',
    '- **בדיקות:** הרצף, המושגים, ה־footer, ה־RTL, היעדר inline CSS והמעבר ל־23 הדפים הוותיקים נאכפים בבדיקת חוזה ייעודית.',
    '',
    '',
  ].join('\n');
  if (!rules.includes('### 4.2א חוזה נושא „משפט פיתגורס”')) {
    rules = replaceOnce(rules, insertBefore, `${contract}${insertBefore}`, 'insert Pythagoras rules contract');
  }
  write(rel, rules);
}

// Canonical topic metadata: prepend 17 foundations and reindex 23 legacy pages.
{
  const rel = 'meta/topics.json';
  const topics = JSON.parse(read(rel));
  const topic = topics.topics.find((item) => item.name === TOPIC);
  if (!topic) throw new Error('Pythagoras topic missing from meta/topics.json');
  const legacy = topic.pages.filter((page) => page.number < FIRST || page.number >= FIRST + COUNT);
  if (legacy.length !== 23) throw new Error(`Expected 23 legacy Pythagoras pages, found ${legacy.length}`);

  const foundations = Array.from({ length: COUNT }, (_, i) => {
    const number = FIRST + i;
    const local = i + 1;
    return {
      number,
      file: `עמוד-${number}.html`,
      title: `עמוד ${local} — ${TOPIC}`,
      h1: TOPIC,
      topic: TOPIC,
      previewPath: `/עמוד-${number}.html`,
      siteUrl: `https://yanivmizrachiy.github.io/razpages/עמוד-${number}.html`,
      curriculumId: CURRICULUM_ID,
    };
  });

  legacy.forEach((page, i) => {
    page.title = `עמוד ${COUNT + i + 1} — ${TOPIC}`;
    page.h1 = TOPIC;
    page.topic = TOPIC;
    page.curriculumId = CURRICULUM_ID;
  });

  topic.pages = [...foundations, ...legacy];
  topic.count = topic.pages.length;
  topics.totalPages = topics.topics.reduce((sum, item) => sum + item.pages.length, 0);
  topics.generatedAt = new Date().toISOString();
  write(rel, `${JSON.stringify(topics, null, 2)}\n`);
}

// Rebuild derived curriculum tree and page registry from canonical sources.
execFileSync(process.execPath, ['scripts/build-curriculum.mjs'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, ['scripts/generate-pages-registry.mjs'], { cwd: root, stdio: 'inherit' });

console.log('[OK] Pythagoras foundations canonical sync completed.');
