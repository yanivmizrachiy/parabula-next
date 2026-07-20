import fs from 'node:fs';
import path from 'node:path';

const allowLegacyRasterImport = process.argv.includes('--allow-raster-baseline');
if (!allowLegacyRasterImport) {
  throw new Error([
    'Legacy ratio raster import is disabled because it overwrites canonical live HTML pages.',
    'Use `npm run ratio:export` to generate editable canonical pages.',
    'For an intentional historical baseline rebuild only, rerun this script with --allow-raster-baseline.',
  ].join(' '));
}

const root = process.cwd();
const topicName = 'יחס';
const startPage = 272;
const pageCount = 48;
const endPage = startPage + pageCount - 1;
const siteBase = 'https://yanivmizrachiy.github.io/parabula-next/';

function writeText(rel, content) {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function pageHtml(globalPage, localPage) {
  const prev = localPage > 1
    ? `<a class="nav-link" href="עמוד-${globalPage - 1}.html">הקודם</a>`
    : `<span class="nav-link is-disabled" aria-disabled="true">הקודם</span>`;
  const next = localPage < pageCount
    ? `<a class="nav-link" href="עמוד-${globalPage + 1}.html">הבא</a>`
    : `<span class="nav-link is-disabled" aria-disabled="true">הבא</span>`;
  const image = `assets/ratio/page-${String(localPage).padStart(3, '0')}.png`;

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>עמוד ${localPage} — יחס</title>
  <link rel="stylesheet" href="vendor/fonts/rubik.css">
  <link rel="stylesheet" href="styles/a4-base.css">
  <link rel="stylesheet" href="styles/pages/עמוד-${globalPage}.css">
</head>
<body>
  <nav class="preview-nav" aria-label="ניווט בין עמודי יחס">
    <div class="preview-nav-top">
      <div class="nav-side">${prev}</div>
      <div class="nav-meta">יחס — עמוד ${localPage} / ${pageCount}</div>
      <div class="nav-side">${next}</div>
    </div>
    <div class="preview-nav-topics" aria-label="נושא הדף">
      <a class="topic-link is-active" href="עמוד-${startPage}.html" aria-current="page">יחס</a>
    </div>
  </nav>

  <main class="a4-page page-${globalPage} ratio-import-page">
    <h1 class="ratio-source-title">יחס</h1>
    <img class="ratio-import-image" src="${image}" alt="דף עבודה בנושא יחס — עמוד ${localPage}" width="1588" height="2246" decoding="sync">
    <footer class="gz-footer">
      <div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div>
      <div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div>
    </footer>
  </main>
</body>
</html>
`;
}

const topicsPath = path.join(root, 'meta', 'topics.json');
const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
const priorRatio = (topics.topics || []).find((topic) => topic.name === topicName);
if (priorRatio) {
  for (const page of priorRatio.pages || []) {
    if (Number.isInteger(page.number)) {
      fs.rmSync(path.join(root, `עמוד-${page.number}.html`), { force: true });
      fs.rmSync(path.join(root, 'styles', 'pages', `עמוד-${page.number}.css`), { force: true });
    }
  }
}

topics.topics = (topics.topics || []).filter((topic) => topic.name !== topicName);

const pages = [];
for (let localPage = 1; localPage <= pageCount; localPage += 1) {
  const globalPage = startPage + localPage - 1;
  const imagePath = path.join(root, 'assets', 'ratio', `page-${String(localPage).padStart(3, '0')}.png`);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Missing rendered ratio page image: ${path.relative(root, imagePath)}`);
  }

  writeText(`עמוד-${globalPage}.html`, pageHtml(globalPage, localPage));
  writeText(`styles/pages/עמוד-${globalPage}.css`, '@import url("./ratio-import.css");\n');
  pages.push({
    number: globalPage,
    file: `עמוד-${globalPage}.html`,
    title: `עמוד ${localPage} — ${topicName}`,
    h1: topicName,
    topic: topicName,
    previewPath: `/עמוד-${globalPage}.html`,
    siteUrl: `${siteBase}עמוד-${globalPage}.html`,
  });
}

writeText('styles/pages/ratio-import.css', `
.ratio-import-page {
  position: relative;
  padding: 0;
  overflow: hidden;
  background: #fff;
}

.ratio-source-title {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.ratio-import-image {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  object-fit: contain;
  background: #fff;
}

@media print {
  .ratio-import-page {
    margin: 0;
    box-shadow: none;
    border: 0;
  }

  .ratio-import-image {
    inline-size: 210mm;
    block-size: 297mm;
  }
}
`);

topics.topics.push({ name: topicName, count: pageCount, pages });
topics.generatedAt = new Date().toISOString();
topics.totalPages = topics.topics.reduce((sum, topic) => sum + (topic.pages || []).length, 0);
writeText('meta/topics.json', `${JSON.stringify(topics, null, 2)}\n`);

writeText('sources/lovable/ratio-workbook/PARABULA-INTEGRATION.md', `# שילוב חוברת יחס ב-Parabula Next

המקור המלא של פרויקט Lovable נשמר בתיקייה זו לצורך עריכה עתידית.

- מקור פעיל: רכיבי React/TypeScript בתוך \`src/\`.
- רשימת 48 הדפים: \`src/data/worksheetPages.tsx\`.
- דפי התוכן: \`src/components/worksheet/pages/Chapter*Pages.tsx\`.
- עיצוב המקור: \`src/index.css\`.
- עותקי התצוגה באתר: \`assets/ratio/page-001.png\` עד \`page-048.png\`.
- דפי Parabula הקנוניים: \`עמוד-${startPage}.html\` עד \`עמוד-${endPage}.html\`.

לאחר שינוי במקור יש להריץ מחדש את תהליך הייבוא כדי לרנדר את 48 הדפים מחדש. כל כללי העבודה המחייבים נמצאים בקובץ \`CLAUDE.md\` בשורש הריפו.
`);

console.log(`Imported legacy raster topic ${topicName}: ${pageCount} pages (${startPage}-${endPage}).`);
