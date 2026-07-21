import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const topicName = 'יחס';
const expectedCount = 48;
const writeReport = process.argv.includes('--report');
const reportPath = path.join(root, 'assets', 'ratio', 'compliance-audit.json');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

const topics = JSON.parse(read('meta/topics.json'));
const topicList = topics.topics || [];
const topicIndex = topicList.findIndex((candidate) => candidate.name === topicName);
const topic = topicList[topicIndex];
if (!topic) {
  throw new Error(`Topic ${topicName} is missing from meta/topics.json.`);
}

const findings = [];
function add(severity, code, message, file = null) {
  findings.push({ severity, code, message, file });
}

if ((topic.pages || []).length !== expectedCount) {
  add('critical', 'PAGE_COUNT', `Expected ${expectedCount} pages, found ${(topic.pages || []).length}.`, 'meta/topics.json');
}

const pageNumbers = (topic.pages || []).map((page) => page.number);
if (new Set(pageNumbers).size !== pageNumbers.length) {
  add('critical', 'DUPLICATE_PAGE_NUMBER', 'Ratio metadata contains duplicate global page numbers.', 'meta/topics.json');
}

let imageOnlyPages = 0;
let missingFooters = 0;
let hiddenOverflowPages = 0;
let brokenNavigationPages = 0;
let missingPageFiles = 0;

for (let index = 0; index < (topic.pages || []).length; index += 1) {
  const page = topic.pages[index];
  const rel = page.file || `עמוד-${page.number}.html`;
  if (!exists(rel)) {
    missingPageFiles += 1;
    add('critical', 'MISSING_PAGE', 'Canonical ratio page file is missing.', rel);
    continue;
  }

  const html = read(rel);
  const localPage = index + 1;
  const expectedPrevious = index > 0
    ? topic.pages[index - 1]?.number
    : topicList[topicIndex - 1]?.pages?.at(-1)?.number;
  const expectedNext = index < topic.pages.length - 1
    ? topic.pages[index + 1]?.number
    : topicList[topicIndex + 1]?.pages?.[0]?.number;

  if (/<img[^>]+assets\/ratio\/page-\d{3}\.png/i.test(html)) {
    imageOnlyPages += 1;
  }
  if (!html.includes('יניב רז - מדריך מחוזי חט"ב בעיר ירושלים') ||
      !html.includes('הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין')) {
    missingFooters += 1;
    add('critical', 'MISSING_FOOTER', `Page ${localPage} is missing the canonical two-line credit.`, rel);
  }
  if (/\.ratio-import-page\s*\{[^}]*overflow\s*:\s*hidden/s.test(html)) {
    hiddenOverflowPages += 1;
    add('high', 'HIDDEN_OVERFLOW_INLINE', `Page ${localPage} hides A4 overflow.`, rel);
  }
  if (expectedPrevious && !html.includes(`href="עמוד-${expectedPrevious}.html"`)) {
    brokenNavigationPages += 1;
    add('high', 'PREVIOUS_NAV', `Page ${localPage} does not link to expected previous page ${expectedPrevious}.`, rel);
  }
  if (expectedNext && !html.includes(`href="עמוד-${expectedNext}.html"`)) {
    brokenNavigationPages += 1;
    add('high', 'NEXT_NAV', `Page ${localPage} does not link to expected next page ${expectedNext}.`, rel);
  }
}

const ratioCss = exists('styles/pages/ratio-import.css') ? read('styles/pages/ratio-import.css') : '';
if (/\.ratio-import-page\s*\{[^}]*overflow\s*:\s*hidden/s.test(ratioCss)) {
  add('critical', 'HIDDEN_A4_OVERFLOW', 'ratio-import.css hides overflow on the A4 page.', 'styles/pages/ratio-import.css');
}

const importScript = read('scripts/import-ratio-workbook.mjs');
if (!/process\.argv\.includes\('--write'\)/.test(importScript)) {
  add('critical', 'UNGUARDED_IMPORT', 'Ratio import does not require an explicit --write flag.', 'scripts/import-ratio-workbook.mjs');
}

const workflow = read('.github/workflows/ratio-workbook-v2.yml');
if (/contents:\s*write/.test(workflow) || /git\s+(commit|push)/.test(workflow)) {
  add('critical', 'WRITING_CI', 'Ratio verification workflow still writes to the repository.', '.github/workflows/ratio-workbook-v2.yml');
}

if (imageOnlyPages > 0) {
  add(
    'critical',
    'IMAGE_ONLY_CANONICAL_PAGES',
    `${imageOnlyPages} canonical ratio pages still use full-page PNG images instead of semantic HTML/SVG/MathJax.`,
  );
}

const severityWeight = { critical: 20, high: 8, medium: 3, low: 1 };
const penalty = findings.reduce((sum, finding) => sum + (severityWeight[finding.severity] || 0), 0);
const score = Math.max(0, Math.min(100, 100 - penalty));
const summary = {
  generatedAt: new Date().toISOString(),
  topic: topicName,
  expectedPages: expectedCount,
  actualPages: (topic.pages || []).length,
  score,
  status: findings.length === 0 ? 'compliant' : 'non-compliant',
  counters: {
    missingPageFiles,
    imageOnlyPages,
    missingFooters,
    hiddenOverflowPages,
    brokenNavigationPages,
  },
  findings,
};

const serialized = `${JSON.stringify(summary, null, 2)}\n`;
console.log(serialized);
if (writeReport) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, serialized, 'utf8');
  console.log(`Wrote report: ${path.relative(root, reportPath)}`);
}

if (findings.some((finding) => finding.severity === 'critical')) {
  process.exitCode = 1;
}
