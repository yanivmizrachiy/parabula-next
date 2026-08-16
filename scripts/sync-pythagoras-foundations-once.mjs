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

const FOUNDATION_FIRST = 617;
const FOUNDATION_COUNT = 17;
const TOTAL_LOCAL = 40;
const curriculumId = 'g7.geo.pythagoras';
const topicName = 'משפט פיתגורס';

// 1) Canonical CSS contract: every new canonical page links its own page CSS;
// the tiny page CSS delegates to the single topic layer.
for (let i = 0; i < FOUNDATION_COUNT; i += 1) {
  const global = FOUNDATION_FIRST + i;
  const htmlPath = `עמוד-${global}.html`;
  let html = read(htmlPath);
  if (/\sstyle\s*=\s*["']/.test(html)) throw new Error(`${htmlPath}: inline CSS remains`);
  html = replaceOnce(
    html,
    'styles/topics/pythagoras-foundations.css',
    `styles/pages/עמוד-${global}.css`,
    `${htmlPath} stylesheet`,
  );
  write(htmlPath, html);
  write(`styles/pages/עמוד-${global}.css`, '@import url("../topics/pythagoras-foundations.css");\n');
}

// 2) Existing direct Pythagoras pages keep global file identity, but become local 18..40.
const legacyGlobals = [...Array.from({ length: 22 }, (_, i) => 9 + i), 41];
for (let i = 0; i < legacyGlobals.length; i += 1) {
  const global = legacyGlobals[i];
  const local = FOUNDATION_COUNT + i + 1;
  const rel = `עמוד-${global}.html`;
  let html = read(rel);
  const titleRe = /<title>עמוד \d+ — משפט פיתגורס<\/title>/u;
  const navRe = /<div class="nav-meta">משפט פיתגורס — עמוד \d+ \/ 23<\/div>/u;
  const pageRe = /<div class="page-number">\d+<\/div>/u;
  if (!titleRe.test(html) || !navRe.test(html) || !pageRe.test(html)) {
    throw new Error(`${rel}: legacy local-number markers not found`);
  }
  html = html.replace(titleRe, `<title>עמוד ${local} — משפט פיתגורס</title>`);
  html = html.replace(navRe, `<div class="nav-meta">משפט פיתגורס — עמוד ${local} / ${TOTAL_LOCAL}</div>`);
  html = html.replace(pageRe, `<div class="page-number">${local}</div>`);
  if (global === 9) {
    html = replaceOnce(html, 'href="עמוד-530.html">הקודם', 'href="עמוד-633.html">הקודם', 'page 9 previous');
  }
  write(rel, html);
}

// 3) Close the navigation chain from the previous topic into the new first foundation page.
{
  const rel = 'עמוד-530.html';
  let html = read(rel);
  html = replaceOnce(html, 'href="עמוד-9.html">הבא', 'href="עמוד-617.html">הבא', 'page 530 next');
  write(rel, html);
}

// 4) Remove the temporary CSS-only legacy reindex now that source HTML is reindexed canonically.
{
  const rel = 'styles/topics/pythagoras.css';
  let css = read(rel);
  const marker = '\n/* 17 דפי היסוד החדשים קודמים לחומר הוותיק.';
  const at = css.indexOf(marker);
  if (at >= 0) css = `${css.slice(0, at).trimEnd()}\n`;
  write(rel, css);
}

// 5) Register the new pages in the curriculum source map.
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

// 6) Update the sole rules source: explicit Pythagoras exception + topic contract.
{
  const rel = 'CLAUDE.md';
  let rules = read(rel);
  const oldExceptions = '**חריגים מפורשים בלבד:** „גאומטריה ז” במצב „מקור + העשרה” (§4.2), ו„משוואות ריבועיות” במצב „כותרות מקור + מאגר חדש מדורג” (§4.5). אין להסיק מן החריגים הרשאה לנושא אחר.';
  const newExceptions = '**חריגים מפורשים בלבד:** „גאומטריה ז” במצב „מקור + העשרה” (§4.2), „משפט פיתגורס” במצב „יסודות חדשים + רצף קיים” (§4.2א), ו„משוואות ריבועיות” במצב „כותרות מקור + מאגר חדש מדורג” (§4.5). אין להסיק מן החריגים הרשאה לנושא אחר.';
  rules = replaceOnce(rules, oldExceptions, newExceptions, 'rules exception list');

  const insertBefore = '### 4.3 חוזה דיוק ואימות מדיד (הוראת יניב, 2026-07-19)';
  const contract = `### 4.2א חוזה נושא „משפט פיתגורס” (מצב „יסודות חדשים + רצף קיים”)\n\nהוראה מפורשת של יניב (2026-08-16) לנושא זה בלבד:\n\n- **מותר ליצור תוכן יסודות חדש ומדורג** בנושא משפט פיתגורס, כדי שהתלמיד לא יתחיל מחישוב צלע חסרה לפני שליטה במושגים ובכלים המקדימים.\n- **סדר היסודות המחייב:** זווית ישרה → משולש ישר־זווית → ניצבים → יתר → זיהוי ניצבים ויתר גם בסיבוב → חזקה שנייה וריבועי מספרים → שורש ריבועי → משמעות גאומטרית של ריבוע הצלע → גילוי וניסוח משפט פיתגורס → \\(a^2+b^2=c^2\\) → כתיבת משוואה → מציאת יתר → מציאת ניצב → תרגול משולב. מספר הדפים נגזר מאיכות ההוראה ואינו מכסה קשיחה.\n- **17 דפי היסוד הראשונים** הם \\`עמוד-617.html\\`–\\`עמוד-633.html\\`; אחריהם ממשיכים 23 דפי פיתגורס הוותיקים \\`עמוד-9.html\\`–\\`עמוד-30.html\\` ו־\\`עמוד-41.html\\`, שמספרם המקומי הוא 18–40. זהות הקובץ הגלובלית אינה משתנה.\n- **עיצוב ושרטוט:** A4, RTL ו־SVG וקטורי חד ובר־עריכה לפי §3–§4. שכבת היסודות המשותפת היא \\`styles/topics/pythagoras-foundations.css\\`; כל דף קנוני מקשר דרך \\`styles/pages/עמוד-N.css\\`. אין inline CSS.\n- **אין מספור שאלות גלוי ואין תוויות קושי/שלב.** המספר הגלוי היחיד הוא המספר המקומי של העמוד בנושא.\n- **שרשרת הניווט:** הדף שלפני פיתגורס מוביל אל עמוד היסודות הראשון; דף יסודות 17 מוביל אל הדף הוותיק הראשון; משם הרצף הוותיק נמשך ללא שינוי בזהויות הקבצים.\n- **בדיקות:** הרצף, המושגים, ה־footer, ה־RTL, היעדר inline CSS והמעבר ל־23 הדפים הוותיקים נאכפים בבדיקת חוזה ייעודית.\n\n`;
  if (!rules.includes('### 4.2א חוזה נושא „משפט פיתגורס”')) {
    rules = replaceOnce(rules, insertBefore, `${contract}${insertBefore}`, 'insert Pythagoras rules contract');
  }
  write(rel, rules);
}

// 7) Canonical topic metadata: prepend 17 foundations and reindex the 23 legacy direct pages.
{
  const rel = 'meta/topics.json';
  const topics = JSON.parse(read(rel));
  const topic = topics.topics.find((item) => item.name === topicName);
  if (!topic) throw new Error('Pythagoras topic missing from meta/topics.json');
  const legacy = topic.pages.filter((page) => page.number < FOUNDATION_FIRST || page.number >= FOUNDATION_FIRST + FOUNDATION_COUNT);
  if (legacy.length !== 23) throw new Error(`Expected 23 legacy Pythagoras pages, found ${legacy.length}`);

  const foundationPages = Array.from({ length: FOUNDATION_COUNT }, (_, i) => {
    const number = FOUNDATION_FIRST + i;
    const local = i + 1;
    return {
      number,
      file: `עמוד-${number}.html`,
      title: `עמוד ${local} — ${topicName}`,
      h1: topicName,
      topic: topicName,
      previewPath: `/עמוד-${number}.html`,
      siteUrl: `https://yanivmizrachiy.github.io/razpages/עמוד-${number}.html`,
      curriculumId,
    };
  });

  legacy.forEach((page, i) => {
    page.title = `עמוד ${FOUNDATION_COUNT + i + 1} — ${topicName}`;
    page.h1 = topicName;
    page.topic = topicName;
    page.curriculumId = curriculumId;
  });

  topic.pages = [...foundationPages, ...legacy];
  topic.count = topic.pages.length;
  topics.totalPages = topics.topics.reduce((sum, item) => sum + item.pages.length, 0);
  topics.generatedAt = new Date().toISOString();
  write(rel, `${JSON.stringify(topics, null, 2)}\n`);
}

// 8) Rebuild derived curriculum tree and registry from canonical sources.
execFileSync(process.execPath, ['scripts/build-curriculum.mjs'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, ['scripts/generate-pages-registry.mjs'], { cwd: root, stdio: 'inherit' });

console.log('[OK] Pythagoras foundations canonical sync completed.');
