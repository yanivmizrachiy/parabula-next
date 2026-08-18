import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicName = 'יחס';
const startPage = 272;
const pageCount = 48;
const endPage = startPage + pageCount - 1;
const siteBase = 'https://yanivmizrachiy.github.io/razpages/';
const writeMode = process.argv.includes('--write');
const semanticExporterPath = path.join(root, 'scripts', 'export-ratio-workbook-live.mjs');

if (writeMode && fs.existsSync(semanticExporterPath)) {
  throw new Error('Legacy ratio PNG import write is disabled. Use scripts/export-ratio-workbook-live.mjs --write after semantic preflight instead.');
}

function normalizeText(content) {
  return content.endsWith('\n') ? content : `${content}\n`;
}

function existingText(rel) {
  const target = path.join(root, rel);
  return fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
}

function pageHtml(globalPage, localPage, previousGlobalPage, nextGlobalPage) {
  const previous = previousGlobalPage
    ? `<a class="nav-link" href="עמוד-${previousGlobalPage}.html">הקודם</a>`
    : '<span class="nav-link is-disabled" aria-disabled="true">הקודם</span>';
  const next = nextGlobalPage
    ? `<a class="nav-link" href="עמוד-${nextGlobalPage}.html">הבא</a>`
    : '<span class="nav-link is-disabled" aria-disabled="true">הבא</span>';
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
      <div class="nav-side">${previous}</div>
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
</html>`;
}

const topicsPath = path.join(root, 'meta', 'topics.json');
const topicsDocument = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
const topicList = Array.isArray(topicsDocument.topics) ? topicsDocument.topics : [];
const priorRatioIndex = topicList.findIndex((topic) => topic.name === topicName);

if (priorRatioIndex < 0) {
  throw new Error(`Topic ${topicName} does not exist in meta/topics.json; refusing to guess its position.`);
}

const priorRatio = topicList[priorRatioIndex];
const previousTopic = topicList[priorRatioIndex - 1];
const nextTopic = topicList[priorRatioIndex + 1];
const previousTopicPages = previousTopic?.pages || [];
const nextTopicPages = nextTopic?.pages || [];
const previousBookPage = previousTopicPages.at(-1)?.number ?? null;
const nextBookPage = nextTopicPages[0]?.number ?? null;

const expectedImagePaths = Array.from({ length: pageCount }, (_, index) =>
  `assets/ratio/page-${String(index + 1).padStart(3, '0')}.png`,
);
const missingImages = expectedImagePaths.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missingImages.length > 0) {
  throw new Error(`Missing rendered ratio images:\n${missingImages.join('\n')}`);
}

const generatedFiles = new Map();
const pages = [];
for (let localPage = 1; localPage <= pageCount; localPage += 1) {
  const globalPage = startPage + localPage - 1;
  const previousGlobalPage = localPage > 1 ? globalPage - 1 : previousBookPage;
  const nextGlobalPage = localPage < pageCount ? globalPage + 1 : nextBookPage;

  generatedFiles.set(
    `עמוד-${globalPage}.html`,
    normalizeText(pageHtml(globalPage, localPage, previousGlobalPage, nextGlobalPage)),
  );
  generatedFiles.set(
    `styles/pages/עמוד-${globalPage}.css`,
    '@import url("./ratio-import.css");\n',
  );
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

generatedFiles.set('styles/pages/ratio-import.css', normalizeText(`
.ratio-import-page {
  position: relative;
  padding: 0;
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
  flex: 1 1 auto;
  min-block-size: 0;
  block-size: auto;
  object-fit: contain;
  background: #fff;
}

.ratio-import-page > .gz-footer {
  padding-inline: 10mm;
  padding-bottom: 3mm;
}

@media print {
  .ratio-import-page {
    margin: 0;
    box-shadow: none;
    border: 0;
  }

  .ratio-import-image {
    inline-size: 100%;
    block-size: auto;
  }
}
`));

const updatedTopics = structuredClone(topicsDocument);
updatedTopics.topics[priorRatioIndex] = { name: topicName, count: pageCount, pages };
updatedTopics.totalPages = updatedTopics.topics.reduce(
  (sum, topic) => sum + (topic.pages || []).length,
  0,
);
if (writeMode) {
  updatedTopics.generatedAt = new Date().toISOString();
}
generatedFiles.set('meta/topics.json', `${JSON.stringify(updatedTopics, null, 2)}\n`);

const staleFiles = [];
for (const page of priorRatio.pages || []) {
  if (!Number.isInteger(page.number)) continue;
  if (page.number >= startPage && page.number <= endPage) continue;
  staleFiles.push(`עמוד-${page.number}.html`, `styles/pages/עמוד-${page.number}.css`);
}

const changes = [];
for (const [rel, content] of generatedFiles) {
  const current = existingText(rel);
  if (current !== content) {
    changes.push({ type: current === null ? 'create' : 'update', rel, content });
  }
}
for (const rel of staleFiles) {
  if (fs.existsSync(path.join(root, rel))) {
    changes.push({ type: 'delete', rel });
  }
}

console.log(`Ratio import preflight: ${pageCount} pages (${startPage}-${endPage}).`);
console.log(`Book neighbors: previous=${previousBookPage ?? 'none'}, next=${nextBookPage ?? 'none'}.`);
console.log(`Planned changes: ${changes.length}.`);
for (const change of changes) {
  console.log(`- ${change.type}: ${change.rel}`);
}

if (!writeMode) {
  console.log('Read-only preflight complete. Re-run with --write only after explicit approval.');
  process.exit(0);
}

for (const change of changes.filter((item) => item.type !== 'delete')) {
  const target = path.join(root, change.rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.tmp-ratio-import`;
  fs.writeFileSync(temporary, change.content, 'utf8');
  fs.renameSync(temporary, target);
}
for (const change of changes.filter((item) => item.type === 'delete')) {
  fs.rmSync(path.join(root, change.rel), { force: true });
}

console.log(`Imported topic ${topicName}: ${pageCount} pages (${startPage}-${endPage}); ${changes.length} changes written.`);
