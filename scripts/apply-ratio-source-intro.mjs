import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicName = 'יחס';
const sourceMarker = 'data-ratio-source-intro="tanami-krispin"';
const sourceCredit1 = 'הקובץ נכתב ע״י ד״ר יחיאל תנעמי ואיילת קריספין';
const sourceCredit2 = 'איילת קריספין — מתכללת את תחום המתמטיקה בעל יסודי בעיר ירושלים ובמחוז ירושלים';
const sourceCredit3 = 'מדריכה מחוזית למתמטיקה על יסודי מחוז ירושלים · דוקטורנטית בחינוך מתמטי באוניברסיטה העברית';
const siteBase = 'https://yanivmizrachiy.github.io/razpages/';

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function write(rel, content) {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
}

function replaceOnce(content, from, to, label) {
  if (!content.includes(from)) {
    throw new Error(`Cannot apply ${label}: anchor not found.`);
  }
  return content.replace(from, to);
}

function pageExists(number) {
  return fs.existsSync(path.join(root, `עמוד-${number}.html`));
}

function ratioIntroHtml({ pageNumber, previousPage, nextPage, totalPages }) {
  const previous = previousPage
    ? `<a class="nav-link" href="עמוד-${previousPage}.html">הקודם</a>`
    : '<span class="nav-link is-disabled" aria-disabled="true">הקודם</span>';
  const next = nextPage
    ? `<a class="nav-link" href="עמוד-${nextPage}.html">הבא</a>`
    : '<span class="nav-link is-disabled" aria-disabled="true">הבא</span>';

  const circle = (kind) => `<span class="ratio-dot ${kind}" aria-hidden="true"></span>`;
  const row = (label, kinds) => `
          <tr>
            <th scope="row">${label}</th>
            <td><div class="ratio-string" aria-label="מחרוזת עיגולים">${kinds.map(circle).join('')}</div></td>
            <td>
              <div class="ratio-answer-template" aria-label="מקום לכתיבת היחס בין שחורים לאדומים">
                ${circle('black')}<span>:</span>${circle('red')}<span>=</span><span class="ratio-blank"></span><span>:</span><span class="ratio-blank"></span>
              </div>
            </td>
          </tr>`;

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>עמוד 1 — יחס</title>
  <link rel="stylesheet" href="vendor/fonts/rubik.css">
  <link rel="stylesheet" href="styles/a4-base.css">
  <link rel="stylesheet" href="styles/pages/עמוד-${pageNumber}.css">
</head>
<body>
  <nav class="preview-nav" aria-label="ניווט בין עמודי יחס">
    <div class="preview-nav-top">
      <div class="nav-side">${previous}</div>
      <div class="nav-meta">יחס — עמוד 1 / ${totalPages}</div>
      <div class="nav-side">${next}</div>
    </div>
    <div class="preview-nav-topics" aria-label="נושא הדף">
      <a class="topic-link is-active" href="עמוד-${pageNumber}.html" aria-current="page">יחס</a>
    </div>
  </nav>

  <main class="a4-page page-${pageNumber} ratio-source-intro-page" ${sourceMarker}>
    <header class="ratio-intro-header">
      <div>
        <h1 class="ratio-intro-title">יחס</h1>
      </div>
      <div class="page-number" aria-label="עמוד 1">1</div>
    </header>

    <div class="ratio-intro-body">
      <section class="ratio-summary" aria-labelledby="ratio-summary-title">
        <h2 id="ratio-summary-title">סיכום: <strong>יחס</strong></h2>
        <ul>
          <li><strong class="ratio-red-text">יחס</strong> הוא מנה בין שני מספרים חיוביים.</li>
          <li>את היחס ניתן לייצג באמצעות מילים או בכתיב מתמטי.</li>
          <li>דוגמה לייצוג מילולי: היחס בין <strong class="ratio-red-text">3</strong> ל־<strong class="ratio-blue-text">5</strong>.</li>
          <li>יחס בכתיב מילולי כותבים וקוראים מימין לשמאל.</li>
          <li>
            דוגמה לייצוג בכתיב מתמטי:
            <span class="ratio-math-example" dir="ltr"><strong class="ratio-red-text">3</strong> : <strong class="ratio-blue-text">5</strong></span>
            או
            <span class="ratio-fraction" dir="ltr" aria-label="שלוש חלקי חמש"><span>3</span><span>5</span></span>.
          </li>
          <li>יחס בכתיב מתמטי כותבים וקוראים משמאל לימין.</li>
          <li>כאשר מתרגמים יחס מייצוג מילולי לייצוג מתמטי, יש להקפיד על מקום האיברים.</li>
          <li>יחס הוא דרך להשוואה בין שני גדלים או כמויות.</li>
        </ul>
      </section>

      <section class="ratio-strings-task" aria-labelledby="ratio-strings-title">
        <div class="ratio-task-title-row">
          <span class="ratio-task-bullet" aria-hidden="true"></span>
          <h2 id="ratio-strings-title">כתבו את היחס בין מספר העיגולים השחורים לאדומים במחרוזות הבאות:</h2>
        </div>

        <table class="ratio-strings-table">
          <tbody>
            ${row('א', ['black','red','red','black','red','red','black','red','red'])}
            ${row('ב', ['black','red','red','red','black','red','red','red','black','red','red','red'])}
            ${row('ג', ['black','black','red','red','red','black','black','red','red','red','black','black','red','red','red'])}
            ${row('ד', ['black','black','red','red','black','black','red','red','black','black','red','red'])}
            ${row('ה', ['black','black','red','red','red','red'])}
            <tr>
              <th scope="row">ו</th>
              <td class="ratio-draw-prompt">שרטטו עיגולים כרצונכם כך שהיחס בין העיגולים השחורים לאדומים יהיה כמו בסעיף ב.</td>
              <td>
                <div class="ratio-answer-template" aria-label="מקום לכתיבת היחס בין שחורים לאדומים">
                  ${circle('black')}<span>:</span>${circle('red')}<span>=</span><span class="ratio-blank"></span><span>:</span><span class="ratio-blank"></span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <footer class="gz-footer ratio-source-credit">
      <div class="f1">${sourceCredit1}</div>
      <div class="f2">${sourceCredit2}</div>
      <div class="f3">${sourceCredit3}</div>
    </footer>
  </main>
</body>
</html>`;
}

const introCss = String.raw`
.ratio-source-intro-page {
  padding: 9mm 16mm 6mm;
  color: #111827;
}

.ratio-intro-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 5px;
  border-bottom: 2px solid #1d4ed8;
}

.ratio-intro-title {
  color: #1d4ed8;
  font-size: 28px;
  font-weight: 700;
}

.ratio-intro-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6mm;
  padding-top: 5mm;
}

.ratio-summary {
  border-bottom: 1px solid #111827;
  padding-bottom: 5mm;
}

.ratio-summary h2 {
  font-size: 23px;
  margin-bottom: 4mm;
}

.ratio-summary h2 strong,
.ratio-red-text {
  color: #ef1b23;
}

.ratio-blue-text {
  color: #08a8de;
}

.ratio-summary ul {
  padding-right: 6mm;
  display: grid;
  gap: 2.2mm;
  font-size: 15px;
  line-height: 1.45;
}

.ratio-math-example {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin-inline: 4px;
  font-size: 18px;
  font-weight: 700;
}

.ratio-fraction {
  display: inline-grid;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  justify-items: center;
  vertical-align: middle;
  margin-inline: 5px;
  font-size: 14px;
  line-height: 1.05;
}

.ratio-fraction span:first-child {
  border-bottom: 1px solid #111827;
  padding-inline: 4px;
  padding-bottom: 1px;
}

.ratio-fraction span:last-child {
  padding-inline: 4px;
  padding-top: 1px;
}

.ratio-task-title-row {
  display: flex;
  align-items: flex-start;
  gap: 3mm;
  margin-bottom: 3mm;
}

.ratio-task-bullet {
  width: 8px;
  height: 8px;
  margin-top: 7px;
  border-radius: 50%;
  background: #111827;
  flex: 0 0 auto;
}

.ratio-task-title-row h2 {
  font-size: 15.5px;
  font-weight: 500;
  line-height: 1.4;
}

.ratio-strings-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  border: 1px solid #111827;
}

.ratio-strings-table th,
.ratio-strings-table td {
  border: 1px solid #111827;
  min-height: 14mm;
  padding: 3mm 2.5mm;
  vertical-align: middle;
}

.ratio-strings-table th {
  width: 8mm;
  font-size: 14px;
  font-weight: 500;
}

.ratio-strings-table td:nth-child(2) {
  width: auto;
}

.ratio-strings-table td:nth-child(3) {
  width: 47mm;
}

.ratio-string {
  direction: ltr;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1.2mm;
  min-height: 7mm;
}

.ratio-dot {
  display: inline-block;
  width: 5.8mm;
  height: 5.8mm;
  border-radius: 50%;
  border: 0.35mm solid #111827;
  flex: 0 0 auto;
}

.ratio-dot.black {
  background: #020617;
}

.ratio-dot.red {
  background: #ff171f;
}

.ratio-answer-template {
  direction: ltr;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5mm;
  font-size: 17px;
  font-weight: 700;
  white-space: nowrap;
}

.ratio-answer-template .ratio-dot {
  width: 5mm;
  height: 5mm;
}

.ratio-blank {
  display: inline-block;
  width: 10mm;
  height: 6mm;
  border-bottom: 1.2px solid #111827;
}

.ratio-draw-prompt {
  font-size: 13px;
  line-height: 1.4;
  text-align: right;
}

.ratio-source-intro-page > .ratio-source-credit {
  padding-top: 2mm;
  margin-top: 2mm;
  border-top: 1px solid #1d4ed8;
}

.ratio-source-intro-page > .ratio-source-credit .f1 {
  font-size: 9.8px;
  font-weight: 600;
}

.ratio-source-intro-page > .ratio-source-credit .f2,
.ratio-source-intro-page > .ratio-source-credit .f3 {
  font-size: 8.6px;
  color: #475569;
  line-height: 1.25;
}
`;

let topics = JSON.parse(read('meta/topics.json'));
const topicIndex = topics.topics.findIndex((topic) => topic.name === topicName);
if (topicIndex < 0) throw new Error('Ratio topic not found in meta/topics.json.');
const ratioTopic = topics.topics[topicIndex];
const previousTopic = topics.topics[topicIndex - 1] ?? null;
const previousBookPage = previousTopic?.pages?.at(-1)?.number ?? null;
const originalFirstRatioPage = ratioTopic.pages?.[0]?.number;
if (!originalFirstRatioPage) throw new Error('Ratio topic has no existing pages.');

let introPage = (ratioTopic.pages || []).find((page) => {
  const rel = page.file || `עמוד-${page.number}.html`;
  return pageExists(page.number) && read(rel).includes(sourceMarker);
})?.number ?? null;

if (!introPage) {
  const pageNumbers = fs.readdirSync(root)
    .map((name) => /^עמוד-(\d+)\.html$/.exec(name))
    .filter(Boolean)
    .map((match) => Number(match[1]));
  introPage = Math.max(...pageNumbers) + 1;
}

const totalRatioPages = (ratioTopic.pages || []).some((page) => page.number === introPage)
  ? ratioTopic.pages.length
  : ratioTopic.pages.length + 1;

write(
  `עמוד-${introPage}.html`,
  ratioIntroHtml({
    pageNumber: introPage,
    previousPage: previousBookPage,
    nextPage: originalFirstRatioPage,
    totalPages: totalRatioPages,
  }),
);
write(`styles/pages/עמוד-${introPage}.css`, '@import url("./ratio-source-intro.css");');
write('styles/pages/ratio-source-intro.css', introCss);

if (!(ratioTopic.pages || []).some((page) => page.number === introPage)) {
  ratioTopic.pages.unshift({
    number: introPage,
    file: `עמוד-${introPage}.html`,
    title: `עמוד 1 — ${topicName}`,
    h1: topicName,
    topic: topicName,
    previewPath: `/עמוד-${introPage}.html`,
    siteUrl: `${siteBase}עמוד-${introPage}.html`,
  });
}
ratioTopic.count = ratioTopic.pages.length;
topics.totalPages = topics.topics.reduce((sum, topic) => sum + (topic.pages || []).length, 0);
write('meta/topics.json', JSON.stringify(topics, null, 2));

if (previousBookPage) {
  const previousRel = `עמוד-${previousBookPage}.html`;
  let previousHtml = read(previousRel);
  const oldNext = `<a class="nav-link" href="עמוד-${originalFirstRatioPage}.html">הבא</a>`;
  const newNext = `<a class="nav-link" href="עמוד-${introPage}.html">הבא</a>`;
  if (previousHtml.includes(oldNext)) {
    previousHtml = previousHtml.replace(oldNext, newNext);
    write(previousRel, previousHtml);
  } else if (!previousHtml.includes(newNext)) {
    throw new Error(`${previousRel}: expected cross-topic next link was not found.`);
  }
}

let curriculum = read('scripts/curriculum-map.mjs');
const foundationsOld = "'g8.numstat.ratio.foundations': ['272-279', 307],";
const foundationsNew = `'g8.numstat.ratio.foundations': [${introPage}, '272-279', 307],`;
if (curriculum.includes(foundationsOld)) {
  curriculum = curriculum.replace(foundationsOld, foundationsNew);
} else if (!curriculum.includes(foundationsNew)) {
  throw new Error('Cannot update ratio foundations curriculum assignment.');
}
write('scripts/curriculum-map.mjs', curriculum);

let importer = read('scripts/import-ratio-workbook.mjs');
importer = replaceOnce(
  importer,
  'function pageHtml(globalPage, localPage, previousGlobalPage, nextGlobalPage) {',
  'function pageHtml(globalPage, localPage, sourcePage, previousGlobalPage, nextGlobalPage) {',
  'ratio pageHtml signature',
);
importer = replaceOnce(
  importer,
  "  const image = `assets/ratio/page-${String(localPage).padStart(3, '0')}.png`;",
  "  const image = `assets/ratio/page-${String(sourcePage).padStart(3, '0')}.png`;",
  'ratio source image index',
);
importer = replaceOnce(
  importer,
  '      <div class="nav-meta">יחס — עמוד ${localPage} / ${pageCount}</div>',
  '      <div class="nav-meta">יחס — עמוד ${localPage} / ${totalPageCount}</div>',
  'ratio nav total',
);
importer = replaceOnce(
  importer,
  '      <a class="topic-link is-active" href="עמוד-${startPage}.html" aria-current="page">יחס</a>',
  '      <a class="topic-link is-active" href="עמוד-${topicEntryPage}.html" aria-current="page">יחס</a>',
  'ratio topic entry link',
);
importer = replaceOnce(
  importer,
  '  <main class="a4-page page-${globalPage} ratio-import-page">',
  '  <main class="a4-page page-${globalPage} ratio-import-page" data-local-page="${localPage}">',
  'ratio local page overlay marker',
);
importer = replaceOnce(
  importer,
  'const priorRatio = topicList[priorRatioIndex];\nconst previousTopic = topicList[priorRatioIndex - 1];',
  `const priorRatio = topicList[priorRatioIndex];
const preservedIntroPages = (priorRatio.pages || []).filter((page) => {
  if (!Number.isInteger(page.number)) return false;
  const rel = page.file || \`עמוד-\${page.number}.html\`;
  const html = existingText(rel);
  return html?.includes('${sourceMarker}') ?? false;
});
const preservedIntroNumbers = new Set(preservedIntroPages.map((page) => page.number));
const totalPageCount = pageCount + preservedIntroPages.length;
const topicEntryPage = preservedIntroPages[0]?.number ?? startPage;
const previousTopic = topicList[priorRatioIndex - 1];`,
  'preserved ratio source intros',
);
importer = replaceOnce(
  importer,
  'const generatedFiles = new Map();\nconst pages = [];\nfor (let localPage = 1; localPage <= pageCount; localPage += 1) {\n  const globalPage = startPage + localPage - 1;\n  const previousGlobalPage = localPage > 1 ? globalPage - 1 : previousBookPage;\n  const nextGlobalPage = localPage < pageCount ? globalPage + 1 : nextBookPage;',
  `const generatedFiles = new Map();
const pages = preservedIntroPages.map((page, index) => ({
  ...page,
  title: \`עמוד \${index + 1} — \${topicName}\`,
  h1: topicName,
  topic: topicName,
}));
for (let sourcePage = 1; sourcePage <= pageCount; sourcePage += 1) {
  const localPage = preservedIntroPages.length + sourcePage;
  const globalPage = startPage + sourcePage - 1;
  const previousGlobalPage = sourcePage > 1
    ? globalPage - 1
    : (preservedIntroPages.at(-1)?.number ?? previousBookPage);
  const nextGlobalPage = sourcePage < pageCount ? globalPage + 1 : nextBookPage;`,
  'ratio generated page loop',
);
importer = replaceOnce(
  importer,
  '    normalizeText(pageHtml(globalPage, localPage, previousGlobalPage, nextGlobalPage)),',
  '    normalizeText(pageHtml(globalPage, localPage, sourcePage, previousGlobalPage, nextGlobalPage)),',
  'ratio pageHtml call',
);
importer = replaceOnce(
  importer,
  'updatedTopics.topics[priorRatioIndex] = { name: topicName, count: pageCount, pages };',
  'updatedTopics.topics[priorRatioIndex] = { name: topicName, count: totalPageCount, pages };',
  'ratio metadata count',
);
importer = replaceOnce(
  importer,
  '  if (page.number >= startPage && page.number <= endPage) continue;\n  staleFiles.push(`עמוד-${page.number}.html`, `styles/pages/עמוד-${page.number}.css`);',
  '  if (page.number >= startPage && page.number <= endPage) continue;\n  if (preservedIntroNumbers.has(page.number)) continue;\n  staleFiles.push(`עמוד-${page.number}.html`, `styles/pages/עמוד-${page.number}.css`);',
  'preserve source intro from stale cleanup',
);
importer = replaceOnce(
  importer,
  `.ratio-import-page {
  position: relative;
  padding: 0;
  background: #fff;
}
`,
  `.ratio-import-page {
  position: relative;
  padding: 0;
  background: #fff;
}

.ratio-import-page::after {
  content: attr(data-local-page);
  position: absolute;
  top: 4.2mm;
  left: 14mm;
  width: 8mm;
  height: 8mm;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #1d4ed8;
  border-radius: 50%;
  background: #fff;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}
`,
  'ratio shifted local page overlay',
);
importer = replaceOnce(
  importer,
  'console.log(`Ratio import preflight: ${pageCount} pages (${startPage}-${endPage}).`);',
  'console.log(`Ratio import preflight: ${pageCount} rendered source pages (${startPage}-${endPage}) + ${preservedIntroPages.length} preserved source intro page(s).`);',
  'ratio preflight message',
);
write('scripts/import-ratio-workbook.mjs', importer);

let audit = read('scripts/audit-ratio-compliance.mjs');
audit = replaceOnce(audit, 'const expectedCount = 48;', 'const expectedCount = 49;', 'ratio audit page count');
audit = replaceOnce(
  audit,
  `  if (!html.includes('יניב רז - מדריך מחוזי חט"ב בעיר ירושלים') ||
      !html.includes('הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין')) {
    missingFooters += 1;
    add('critical', 'MISSING_FOOTER', \`Page \${localPage} is missing the canonical two-line credit.\`, rel);
  }`,
  `  const isSourceIntro = html.includes('${sourceMarker}');
  const hasFooter = isSourceIntro
    ? html.includes('${sourceCredit1}') &&
      html.includes('${sourceCredit2}') &&
      html.includes('${sourceCredit3}') &&
      !html.includes('יניב רז - מדריך מחוזי חט"ב בעיר ירושלים')
    : html.includes('יניב רז - מדריך מחוזי חט"ב בעיר ירושלים') &&
      html.includes('הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין');
  if (!hasFooter) {
    missingFooters += 1;
    add('critical', 'MISSING_FOOTER', \`Page \${localPage} has an invalid credit footer.\`, rel);
  }`,
  'ratio source footer audit',
);
write('scripts/audit-ratio-compliance.mjs', audit);

let creditTest = read('tests/contracts/page-credit.test.mjs');
creditTest = replaceOnce(
  creditTest,
  `const CREDIT_2 = 'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין';`,
  `const CREDIT_2 = 'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין';
const SOURCE_MARKER = '${sourceMarker}';
const SOURCE_CREDITS = [
  '${sourceCredit1}',
  '${sourceCredit2}',
  '${sourceCredit3}',
];`,
  'source credit constants',
);
creditTest = replaceOnce(
  creditTest,
  `    assert.ok(html.includes(CREDIT_1), \`\${file}: missing credit line 1\`);
    assert.ok(html.includes(CREDIT_2), \`\${file}: missing credit line 2\`);

    // שתי השורות חייבות לשבת יחד בתוך אלמנט footer של הדף.
    const footers = html.match(/<footer[\\s\\S]*?<\\/footer>/g) || [];
    assert.ok(
      footers.some(f => f.includes(CREDIT_1) && f.includes(CREDIT_2)),
      \`\${file}: credit lines are not together inside a <footer>\`,
    );

    // שורה 2 מופיעה אחרי שורה 1 — "בשורה למטה".
    assert.ok(
      html.indexOf(CREDIT_1) < html.indexOf(CREDIT_2),
      \`\${file}: credit line 2 must follow credit line 1\`,
    );`,
  `    const footers = html.match(/<footer[\\s\\S]*?<\\/footer>/g) || [];
    const isSourceIntro = html.includes(SOURCE_MARKER);

    if (isSourceIntro) {
      assert.ok(!html.includes(CREDIT_1), \`\${file}: source-authored ratio intro must not credit Yaniv\`);
      for (const credit of SOURCE_CREDITS) {
        assert.ok(html.includes(credit), \`\${file}: missing source credit "\${credit}"\`);
      }
      assert.ok(
        footers.some((footer) => SOURCE_CREDITS.every((credit) => footer.includes(credit))),
        \`\${file}: source credits are not together inside a <footer>\`,
      );
    } else {
      assert.ok(html.includes(CREDIT_1), \`\${file}: missing credit line 1\`);
      assert.ok(html.includes(CREDIT_2), \`\${file}: missing credit line 2\`);
      assert.ok(
        footers.some(f => f.includes(CREDIT_1) && f.includes(CREDIT_2)),
        \`\${file}: credit lines are not together inside a <footer>\`,
      );
      assert.ok(
        html.indexOf(CREDIT_1) < html.indexOf(CREDIT_2),
        \`\${file}: credit line 2 must follow line 1\`,
      );
    }`,
  'page credit exception',
);
write('tests/contracts/page-credit.test.mjs', creditTest);

const introTest = `import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const topics = JSON.parse(fs.readFileSync('meta/topics.json', 'utf8'));
const ratio = topics.topics.find((topic) => topic.name === 'יחס');
const importer = fs.readFileSync('scripts/import-ratio-workbook.mjs', 'utf8');

test('ratio source task is the first worksheet page', () => {
  assert.ok(ratio, 'Ratio topic is missing');
  assert.equal(ratio.pages.length, 49, 'Ratio workbook must contain the new source page plus 48 existing pages');
  const first = ratio.pages[0];
  const html = fs.readFileSync(first.file, 'utf8');
  assert.match(html, /data-ratio-source-intro="tanami-krispin"/);
  assert.ok(html.includes('כתבו את היחס בין מספר העיגולים השחורים לאדומים במחרוזות הבאות:'));
  assert.ok(html.includes('${sourceCredit1}'));
  assert.ok(html.includes('${sourceCredit2}'));
  assert.ok(html.includes('${sourceCredit3}'));
  assert.ok(!html.includes('יניב רז - מדריך מחוזי חט"ב בעיר ירושלים'));
  assert.match(html, /יחס — עמוד 1 \/ 49/);
});

test('existing rendered ratio sequence follows the source intro as pages 2-49', () => {
  assert.equal(ratio.pages[1].number, 272);
  const page2 = fs.readFileSync('עמוד-272.html', 'utf8');
  assert.match(page2, /יחס — עמוד 2 \/ 49/);
  assert.match(page2, /data-local-page="2"/);
  assert.ok(page2.includes(\`href="\${ratio.pages[0].file}"\`), 'Page 2 must link back to the source intro');
});

test('ratio importer permanently preserves source intro pages', () => {
  assert.match(importer, /preservedIntroPages/);
  assert.match(importer, /data-ratio-source-intro="tanami-krispin"/);
  assert.match(importer, /data-local-page/);
});
`;
write('tests/contracts/ratio-source-intro.test.mjs', introTest);

let rules = read('CLAUDE.md');
rules = replaceOnce(
  rules,
  'בכל `עמוד-N.html` ללא יוצא מן הכלל מופיעה כותרת תחתית בת שתי שורות',
  'בכל `עמוד-N.html`, למעט חריגי קרדיט־מקור המוגדרים מיד להלן, מופיעה כותרת תחתית בת שתי שורות',
  'canonical footer exception wording',
);
const nextRuleAnchor = '- **אין תוויות קושי, שלב או סוג־שאלה גלויות — כלל גורף';
if (!rules.includes('חריג קרדיט־מקור לדפי הפתיחה של חוברת „יחס”')) {
  const sourceRule = `- **חריג קרדיט־מקור לדפי הפתיחה של חוברת „יחס” (הוראת יניב, 2026-08-18):** דף פתיחה שמועתק מן המסמך „יחס - כיתה ח' תשפ"ז - למורה” ומסומן בקוד \`${sourceMarker}\` נושא את קרדיט הכותבים המקורי, ולא את קרדיט יניב. בתוך footer אחד מופיעים: \`${sourceCredit1}\`; \`${sourceCredit2}\`; \`${sourceCredit3}\`. **השם יניב רז אינו מופיע בדפי מקור אלה.** כל שאר דפי היחס וכל שאר דפי הריפו ממשיכים להשתמש בקרדיט הקבוע שלעיל. מחולל/יבוא חוברת היחס חייב לשמר דפי מקור מסומנים אלה לפני רצף 48 דפי המקור המרונדרים ולא למחוק אותם.\n\n`;
  rules = replaceOnce(rules, nextRuleAnchor, sourceRule + nextRuleAnchor, 'ratio source credit rule');
}
write('CLAUDE.md', rules);

console.log(`Prepared ratio source intro as global page ${introPage}.`);
console.log(`Previous book page: ${previousBookPage ?? 'none'}; next ratio page: ${originalFirstRatioPage}.`);
console.log(`Ratio topic will contain ${totalRatioPages} pages after import.`);
