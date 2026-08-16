import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');
const topicName = 'מערכת משוואות בשני נעלמים';
const siteBase = 'https://yanivmizrachiy.github.io/razpages/';
const branchPage = 616;
const workbookPages = [609, 601, 602, 603, 604, 605, 606, 607, 608, 610, 611, 612, 613, 614, 615, 616];
const changed = [];

const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = (relative) => fs.existsSync(path.join(root, relative));
const write = (relative, content) => {
  const file = path.join(root, relative);
  const previous = exists(relative) ? read(relative) : null;
  if (previous === content) return;
  if (checkOnly) throw new Error(`${relative} אינו מעודכן. הריצו: node scripts/import-mitsav-systems-reasoning.mjs`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  changed.push(relative);
};
const replaceRequired = (content, pattern, replacement, label) => {
  if (!pattern.test(content)) throw new Error(`לא נמצא עוגן לעדכון: ${label}`);
  pattern.lastIndex = 0;
  return content.replace(pattern, replacement);
};

const pageHtml = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>עמוד 16 — מערכת משוואות בשני נעלמים</title>
    <link rel="stylesheet" href="vendor/fonts/rubik.css" />
    <script>MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']] }, chtml: { fontURL: 'vendor/mathjax/tex-font/chtml/woff2' } };</script>
    <script id="MathJax-script" async src="vendor/mathjax/tex-mml-chtml.js"></script>
    <link rel="stylesheet" href="styles/a4-base.css">
    <link rel="stylesheet" href="styles/pages/עמוד-616.css">
</head>
<body>
    <nav class="preview-nav" aria-label="ניווט בין עמודים">
        <div class="preview-nav-top">
            <div class="nav-side"><a class="nav-link" href="עמוד-615.html">הקודם</a></div>
            <div class="nav-meta">מערכת משוואות בשני נעלמים — עמוד 16 / 16</div>
            <div class="nav-side"><a class="nav-link" href="עמוד-531.html">הבא</a></div>
        </div>
        <div class="preview-nav-topics" aria-label="מעבר בין נושאים">
            <a class="topic-link" href="עמוד-125.html">אלגברה לכיתה ח'</a>
            <a class="topic-link is-active" href="עמוד-609.html" aria-current="page">מערכת משוואות בשני נעלמים</a>
            <a class="topic-link" href="עמוד-320.html">גאומטריה ז</a>
        </div>
    </nav>

    <main class="a4-page page-616 systems2-page systems-reasoning">
        <header class="header-container">
            <div class="title-wrap">
                <h1 class="page-title">מערכת משוואות בשני נעלמים</h1>
                <p class="page-subtitle">חשיבה מתמטית · פתרון יעיל, חישוב יחיד והסקה</p>
            </div>
            <div class="page-number">16</div>
        </header>

        <div class="question-block">
            <div class="instruction">בכל משימה חפשו דרך קצרה ומנומקת. אין חובה למצוא תחילה כל נעלם בנפרד.</div>
            <div class="reasoning-list">
                <section class="reasoning-card reasoning-card-structure">
                    <div class="reasoning-badge">1</div>
                    <div class="reasoning-content">
                        <h2>מוצאים סכום בלי לפתור את כל המערכת</h2>
                        <div class="reasoning-system">$$\\begin{cases} x+2y=16 \\\\ 2x+y=14 \\end{cases}$$</div>
                        <p>חשבו את <span class="math-ltr">\\(x+y\\)</span> בדרך הקצרה ביותר. הסבירו איזו פעולה ביצעתם בשתי המשוואות ומדוע היא מספיקה.</p>
                        <div class="reasoning-answer-grid"><span>הפעולה שביצעתי:</span><span class="reasoning-line"></span><span>לכן ‎\\(x+y\\)‎:</span><span class="reasoning-line"></span></div>
                    </div>
                </section>

                <section class="reasoning-card reasoning-card-one-calc">
                    <div class="reasoning-badge">2</div>
                    <div class="reasoning-content">
                        <h2>מה אפשר לגלות בחישוב אחד?</h2>
                        <p>בחנות ספורט, מחירם של 3 כדורי סל ו־3 מחבטי טניס הוא 285 שקלים. מחירם של 3 כדורי סל ומחבט טניס אחד הוא 175 שקלים.</p>
                        <ol class="reasoning-parts">
                            <li>הגדירו נעלמים וכתבו מערכת מתאימה.</li>
                            <li>כתבו <strong>חישוב אחד בלבד</strong> שממנו אפשר לדעת את מחירם של שני מחבטי טניס. נמקו.</li>
                            <li>מצאו את מחירו של כל פריט ובדקו בשתי המשוואות.</li>
                        </ol>
                        <div class="reasoning-answer-grid"><span>החישוב היחיד:</span><span class="reasoning-line"></span><span>מחירי הפריטים:</span><span class="reasoning-line"></span></div>
                    </div>
                </section>

                <section class="reasoning-card reasoning-card-conditions">
                    <div class="reasoning-badge">3</div>
                    <div class="reasoning-content">
                        <h2>מחירים, תנאים והשוואה</h2>
                        <p>נסמן ב־‎\\(x\\)‎ את מחיר מחברת וב־‎\\(y\\)‎ את מחיר ספר, בשקלים.</p>
                        <ol class="reasoning-parts">
                            <li>ידוע כי 3 ספרים זולים מ־7 מחברות. כתבו אי־שוויון מתאים ותנו זוג מחירים שלמים אפשרי.</li>
                            <li>כעת נתון גם שספר עולה פי 2 ממחברת, ושמחיר 5 ספרים גבוה ב־22 שקלים ממחיר 8 מחברות. כתבו מערכת ומצאו את המחירים.</li>
                            <li>בדקו אם המחירים שמצאתם מקיימים את התנאי הראשון והסבירו.</li>
                        </ol>
                        <div class="reasoning-answer-grid"><span>אי־שוויון:</span><span class="reasoning-line"></span><span>מערכת ופתרון:</span><span class="reasoning-line"></span><span>בדיקת התנאי:</span><span class="reasoning-line"></span></div>
                    </div>
                </section>
            </div>
        </div>

        <footer class="gz-footer">
            <div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div>
            <div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div>
        </footer>
    </main>
</body>
</html>
`;

const pageCss = `@import url('../topics/two-variable-systems.css');\n`;

const contractTest = `import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'עמוד-616.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles/topics/two-variable-systems.css'), 'utf8');
const topics = JSON.parse(fs.readFileSync(path.join(root, 'meta/topics.json'), 'utf8'));
const sync = JSON.parse(fs.readFileSync(path.join(root, 'meta/systems-drive-sync.json'), 'utf8'));

test('page 616 is the canonical sixteenth systems page', () => {
  assert.ok(html.includes('עמוד 16 / 16'));
  assert.ok(html.includes('href="עמוד-615.html">הקודם'));
  assert.ok(html.includes('href="עמוד-531.html">הבא'));
  const topic = topics.topics.find((entry) => entry.name === 'מערכת משוואות בשני נעלמים');
  assert.equal(topic.count, 16);
  assert.equal(topic.pages.at(-1)?.number, 616);
  assert.equal(topic.pages.at(-1)?.curriculumId, 'g8.alg.systems.substitution');
});

test('page 616 preserves three distinct reasoning moves', () => {
  assert.equal((html.match(/<section class="reasoning-card/g) ?? []).length, 3);
  assert.ok(html.includes('אין חובה למצוא תחילה כל נעלם בנפרד'));
  assert.ok(html.includes('חישוב אחד בלבד'));
  assert.ok(html.includes('כתבו אי־שוויון מתאים'));
  assert.ok(html.includes('reasoning-card-structure'));
  assert.ok(html.includes('reasoning-card-one-calc'));
  assert.ok(html.includes('reasoning-card-conditions'));
});

test('reasoning layout remains print-readable', () => {
  assert.ok(css.includes('.systems2-page.systems-reasoning .reasoning-card'));
  assert.ok(css.includes('font-size: 14px'));
  assert.ok(css.includes('break-inside: avoid'));
});

test('Drive provenance maps new and duplicate-only sources', () => {
  const mitsav = sync.sources.find((source) => source.role === 'mitsav-2025-reasoning-applications');
  assert.equal(mitsav?.canonicalDriveId, '1SSym_YW1EaafAYqy4KuNw66KwkLxldFk');
  assert.deepEqual(mitsav?.importedToPages, [616]);
  const intersection = sync.sources.find((source) => source.role === 'linear-functions-intersection-worksheet');
  assert.deepEqual(intersection?.importedToPages, []);
  assert.deepEqual(intersection?.mappedWithoutDuplication?.existingCoverage, [190, 191, 192, 193, 194, 195]);
});

test('the importer is idempotent in check mode', () => {
  execFileSync(process.execPath, ['scripts/import-mitsav-systems-reasoning.mjs', '--check'], { cwd: root, stdio: 'pipe' });
});
`;

write('עמוד-616.html', pageHtml);
write('styles/pages/עמוד-616.css', pageCss);
write('tests/contracts/two-variable-systems-page-616.test.mjs', contractTest);

for (let index = 0; index < workbookPages.length - 1; index += 1) {
  const number = workbookPages[index];
  const local = index + 1;
  const relative = `עמוד-${number}.html`;
  let html = read(relative);
  html = html.replace(
    new RegExp(`מערכת משוואות בשני נעלמים — עמוד ${local} / (?:15|16)`),
    `מערכת משוואות בשני נעלמים — עמוד ${local} / 16`,
  );
  if (number === 615) {
    html = html.replace('href="עמוד-531.html">הבא', 'href="עמוד-616.html">הבא');
  }
  write(relative, html);
}

let page531 = read('עמוד-531.html');
page531 = page531.replace('href="עמוד-615.html">הקודם', 'href="עמוד-616.html">הקודם');
write('עמוד-531.html', page531);

let firstQuadrantImporter = read('scripts/import-first-quadrant-workbook.mjs');
firstQuadrantImporter = firstQuadrantImporter
  .replace('אחרי "מספרים מכוונים" (עמוד-573)', 'אחרי "מערכת משוואות בשני נעלמים" (עמוד-616)')
  .replace("const chainPrev = 'עמוד-573.html';", "const chainPrev = 'עמוד-616.html';");
write('scripts/import-first-quadrant-workbook.mjs', firstQuadrantImporter);

const cssMarkerStart = '/* BEGIN systems reasoning page 616 */';
const cssMarkerEnd = '/* END systems reasoning page 616 */';
const reasoningCss = `${cssMarkerStart}
.systems2-page.systems-reasoning { padding-top: 9mm; padding-bottom: 8mm; }
.systems2-page.systems-reasoning .question-block { gap: 7px; }
.systems2-page.systems-reasoning .instruction { min-height: 34px; font-size: 14.5px; }
.systems2-page.systems-reasoning .reasoning-list { display: grid; grid-template-columns: 1fr; gap: 8px; flex: 1 1 auto; min-height: 0; }
.systems2-page.systems-reasoning .reasoning-card { display: grid; grid-template-columns: 34px 1fr; gap: 10px; padding: 10px 12px; border: 1px solid var(--systems-border); border-radius: 9px; background: #fff; break-inside: avoid; }
.systems2-page.systems-reasoning .reasoning-card-structure { border-right: 4px solid #2563eb; }
.systems2-page.systems-reasoning .reasoning-card-one-calc { border-right: 4px solid #0f766e; }
.systems2-page.systems-reasoning .reasoning-card-conditions { border-right: 4px solid #7c3aed; }
.systems2-page.systems-reasoning .reasoning-badge { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: 1px solid #94a3b8; border-radius: 50%; color: #0f172a; font-size: 15px; font-weight: 700; }
.systems2-page.systems-reasoning .reasoning-content { min-width: 0; }
.systems2-page.systems-reasoning .reasoning-content h2 { margin: 0 0 4px; color: #17213a; font-size: 16px; line-height: 1.25; }
.systems2-page.systems-reasoning .reasoning-content p { margin: 0 0 5px; color: #111827; font-size: 14px; line-height: 1.4; }
.systems2-page.systems-reasoning .reasoning-system { direction: ltr; text-align: center; font-size: 17px; }
.systems2-page.systems-reasoning .reasoning-system mjx-container[display="true"] { margin: 0.1em 0 !important; }
.systems2-page.systems-reasoning .reasoning-parts { margin: 4px 0 5px; padding-right: 22px; color: #111827; font-size: 13.5px; line-height: 1.38; }
.systems2-page.systems-reasoning .reasoning-parts li { margin-bottom: 2px; }
.systems2-page.systems-reasoning .reasoning-answer-grid { display: grid; grid-template-columns: 122px 1fr; gap: 3px 8px; align-items: end; color: #334155; font-size: 11.5px; }
.systems2-page.systems-reasoning .reasoning-line { height: 17px; border-bottom: 1px solid var(--systems-line); }
${cssMarkerEnd}`;
let topicCss = read('styles/topics/two-variable-systems.css');
const markerPattern = new RegExp(`${cssMarkerStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${cssMarkerEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
if (markerPattern.test(topicCss)) topicCss = topicCss.replace(markerPattern, reasoningCss);
else topicCss = `${topicCss.trimEnd()}\n\n${reasoningCss}\n`;
write('styles/topics/two-variable-systems.css', topicCss);

let curriculumMap = read('scripts/curriculum-map.mjs');
curriculumMap = curriculumMap.replace(
  "'g8.alg.systems.substitution': ['601-612', '614-615'],",
  "'g8.alg.systems.substitution': ['601-612', '614-616'],",
);
if (!curriculumMap.includes("'g8.alg.systems.substitution': ['601-612', '614-616'],")) {
  throw new Error('לא ניתן לעדכן את שיוך עמוד 616 בתכנית הלימודים');
}
write('scripts/curriculum-map.mjs', curriculumMap);

const topicsPath = 'meta/topics.json';
const topics = JSON.parse(read(topicsPath));
const topic = topics.topics.find((entry) => entry.name === topicName);
if (!topic) throw new Error(`הנושא לא נמצא ב-topics.json: ${topicName}`);
const pageMeta = {
  number: branchPage,
  file: 'עמוד-616.html',
  title: 'עמוד 16 — מערכת משוואות בשני נעלמים',
  h1: 'מערכת משוואות בשני נעלמים',
  topic: topicName,
  previewPath: '/עמוד-616.html',
  siteUrl: `${siteBase}עמוד-616.html`,
  curriculumId: 'g8.alg.systems.substitution',
};
const existingIndex = topic.pages.findIndex((page) => page.number === branchPage);
if (existingIndex === -1) topic.pages.push(pageMeta);
else topic.pages[existingIndex] = pageMeta;
topic.pages = workbookPages.map((number) => {
  const page = topic.pages.find((candidate) => candidate.number === number);
  if (!page) throw new Error(`חסר עמוד ${number} ברישום הנושא`);
  return page;
});
topic.count = topic.pages.length;
topics.totalPages = Math.max(topics.totalPages ?? 0, branchPage);
const previousTopics = read(topicsPath);
let serializedTopics = `${JSON.stringify(topics, null, 2)}\n`;
if (serializedTopics !== previousTopics && !checkOnly) {
  topics.generatedAt = new Date().toISOString();
  serializedTopics = `${JSON.stringify(topics, null, 2)}\n`;
}
write(topicsPath, serializedTopics);

const syncPath = 'meta/systems-drive-sync.json';
const sync = JSON.parse(read(syncPath));
if (!sync.repositoryPages.includes(branchPage)) sync.repositoryPages.push(branchPage);
sync.repositoryPages = workbookPages;
const upsertSource = (source) => {
  const index = sync.sources.findIndex((candidate) => candidate.role === source.role);
  if (index === -1) sync.sources.push(source);
  else sync.sources[index] = source;
};
upsertSource({
  role: 'mitsav-2025-reasoning-applications',
  canonicalDriveId: '1SSym_YW1EaafAYqy4KuNw66KwkLxldFk',
  importedToPages: [616],
  transformation: 'Three original adaptations preserve the assessed reasoning moves: deriving x+y without solving both variables first, isolating a two-item price by one subtraction, and combining price conditions with an inequality and verification.',
});
upsertSource({
  role: 'linear-functions-intersection-worksheet',
  canonicalDriveId: '1PR7kPVcdWqzJtSmV4ly5Qo2ZpWpmxm4J',
  importedToPages: [],
  mappedWithoutDuplication: { existingCoverage: [190, 191, 192, 193, 194, 195] },
  reason: 'Its graph reading, equation-to-graph matching, line construction from point and slope, graphing, intersection and comparison tasks are already covered by pages 190-195.',
});
const previousSync = read(syncPath);
let serializedSync = `${JSON.stringify(sync, null, 2)}\n`;
if (serializedSync !== previousSync && !checkOnly) {
  sync.generatedAt = new Date().toISOString();
  serializedSync = `${JSON.stringify(sync, null, 2)}\n`;
}
write(syncPath, serializedSync);

if (!checkOnly) {
  execFileSync(process.execPath, ['scripts/build-curriculum.mjs'], { cwd: root, stdio: 'inherit' });
  execFileSync(process.execPath, ['scripts/generate-pages-registry.mjs'], { cwd: root, stdio: 'inherit' });
} else {
  const pages = JSON.parse(read('meta/pages.json'));
  const registryPage = pages.pages.find((page) => page.number === 616);
  if (!registryPage || registryPage.topic !== topicName) throw new Error('עמוד 616 חסר או לא משויך ב-meta/pages.json');
  execFileSync(process.execPath, ['scripts/build-curriculum.mjs', '--check'], { cwd: root, stdio: 'pipe' });
}

console.log(`[OK] ${checkOnly ? 'בדיקה' : 'ייבוא'} עמוד 616 הושלמ${checkOnly ? 'ה' : 'ה'}${changed.length ? ` — ${changed.length} קבצים עודכנו` : ' — ללא שינוי'}`);
