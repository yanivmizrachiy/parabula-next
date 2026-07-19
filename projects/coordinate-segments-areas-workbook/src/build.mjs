// בניית חוברת „אורכי קטעים, שטחים והיקפים במערכת הצירים”.
//
// הבנייה מפיקה: dist/ (HTML+CSS+JS), מפתח מורה, preview, audit JSON,
// PDF ו־ZIP, ולבסוף SHA256SUMS.txt.
//
// שלבים התלויים בדפדפן (PDF, preview, מדידת ניצול עמוד) מדלגים בעדינות
// כאשר Playwright אינו זמין, ומסמנים זאת ב־audit תחת `skipped`.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import pages from './pages/index.mjs';
import { renderPage, FOOTER_LINES, esc } from './render.mjs';
import { answers, glossary } from './answers.mjs';
import { buildTeacherKey } from './teacher-key.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const distDir = path.join(root, 'dist');
const downloadsDir = path.join(root, 'downloads');
const previewDir = path.join(root, 'preview');
const auditDir = path.join(root, 'audit');
for (const dir of [distDir, downloadsDir, previewDir, auditDir]) fs.mkdirSync(dir, { recursive: true });

const meta = JSON.parse(fs.readFileSync(path.join(root, 'project-metadata.json'), 'utf8'));

// ---------- אינווריאנטים מבניים לפני כתיבה (CLAUDE.md §4.3) ----------

const numbers = pages.map(page => page.n);
const expected = Array.from({ length: pages.length }, (_, i) => i + 1);
if (numbers.length !== new Set(numbers).size) throw new Error(`Duplicate page numbers: ${numbers.join(',')}`);
if (numbers.some((n, i) => n !== expected[i])) {
  throw new Error(`Pages must be a gapless run starting at 1; received ${numbers.join(',')}`);
}

const body = pages.map(renderPage).join('\n');

// הכותרת התחתונה מכילה מרכאות, ולכן היא מופיעה ב־HTML בצורתה המוגנת.
for (const line of FOOTER_LINES) {
  const occurrences = body.split(esc(line)).length - 1;
  if (occurrences !== pages.length) {
    throw new Error(`Footer line "${line}" appeared ${occurrences} times; expected ${pages.length}`);
  }
}
if (/<style\b/i.test(body) || /\sstyle\s*=\s*["']/i.test(body)) throw new Error('Inline CSS found in generated pages.');
if (/שאלה\s*\d/.test(body)) throw new Error('Visible question numbering found; forbidden by CLAUDE.md §4.');

const usesMathJax = body.includes('\\(') || body.includes('$$');
const mathJaxTag = usesMathJax
  ? '<script id="MathJax-script" src="../../../vendor/mathjax/tex-mml-chtml.js"></script>'
  : '';

const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title}</title>
<link rel="stylesheet" href="workbook.css">
</head>
<body>
<main class="workbook">
${body}
</main>
${mathJaxTag}
<script src="workbook.js"></script>
</body>
</html>
`;

fs.copyFileSync(path.join(root, 'styles', 'workbook.css'), path.join(distDir, 'workbook.css'));
fs.copyFileSync(path.join(root, 'styles', 'teacher-key.css'), path.join(distDir, 'teacher-key.css'));
fs.copyFileSync(path.join(root, 'src', 'workbook.js'), path.join(distDir, 'workbook.js'));
fs.writeFileSync(path.join(distDir, 'index.html'), html);
fs.writeFileSync(path.join(distDir, 'teacher-key.html'), buildTeacherKey({ meta, answers, glossary }));

// ---------- שלבי דפדפן ----------

const skipped = [];
let domAudit = null;
let utilization = null;
let pdfPages = null;

let chromium = null;
try {
  ({ chromium } = await import('playwright'));
} catch {
  skipped.push('playwright-not-installed');
}

if (chromium) {
  const launchOptions = { headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] };
  if (process.env.CHROME_PATH) launchOptions.executablePath = process.env.CHROME_PATH;
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(distDir, 'index.html')).href, { waitUntil: 'networkidle' });

  domAudit = await page.evaluate(() => ({
    pages: document.querySelectorAll('.a4-page').length,
    grids: document.querySelectorAll('svg.cg').length,
    tasks: document.querySelectorAll('.wtask').length,
    answerSlots: document.querySelectorAll('.wline, .wrule, .wbox').length,
    rtl: document.documentElement.dir === 'rtl',
    title: document.title
  }));

  // מדידת ניצול עמוד.
  //
  // `.wbody` משתמש ב־space-between, ולכן הבלוק האחרון תמיד נוגע בתחתית הגוף.
  // מדידה לפי מיקום הבלוק האחרון הייתה מחזירה אותו אחוז לכל דף ומסתירה דף ריק.
  // לכן הניצול נמדד כסכום גובהי הבלוקים בפועל (התוכן עצמו) מול הגובה הזמין,
  // והחריגה נמדדת מול הגובה הטבעי הדרוש, כולל המרווח המינימלי בין הבלוקים.
  utilization = await page.evaluate(() => {
    const mmToPx = 96 / 25.4;
    return [...document.querySelectorAll('.a4-page')].map(el => {
      const bodyEl = el.querySelector('.wbody');
      const blocks = [...bodyEl.children];
      const gap = parseFloat(getComputedStyle(bodyEl).rowGap) || 0;
      const contentHeight = blocks.reduce((sum, child) => sum + child.getBoundingClientRect().height, 0);
      const naturalHeight = contentHeight + gap * Math.max(0, blocks.length - 1);
      const available = bodyEl.getBoundingClientRect().height;
      return {
        page: Number(el.dataset.page),
        percent: Math.round((naturalHeight / available) * 1000) / 10,
        overflows: naturalHeight > available + 0.5,
        contentMm: Math.round((contentHeight / mmToPx) * 10) / 10,
        availableMm: Math.round((available / mmToPx) * 10) / 10,
        heightMm: Math.round((el.getBoundingClientRect().height / mmToPx) * 10) / 10
      };
    });
  });

  await page.pdf({
    path: path.join(downloadsDir, 'coordinate-segments-areas-workbook.pdf'),
    format: 'A4', printBackground: true, preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  await page.locator('#page-1').screenshot({ path: path.join(previewDir, 'page-01.png') });
  await page.locator('#page-14').screenshot({ path: path.join(previewDir, 'page-14.png') });
  await browser.close();

  if (domAudit.pages !== pages.length) throw new Error(`DOM page count ${domAudit.pages} != ${pages.length}`);
  if (!domAudit.rtl) throw new Error('Document is not RTL.');

  try {
    const info = execFileSync('pdfinfo', [path.join(downloadsDir, 'coordinate-segments-areas-workbook.pdf')], { encoding: 'utf8' });
    pdfPages = Number((info.match(/^Pages:\s+(\d+)/m) || [])[1]);
    if (pdfPages !== pages.length) throw new Error(`PDF has ${pdfPages} pages; expected ${pages.length}`);
  } catch (error) {
    if (/^PDF has /.test(error.message)) throw error;
    skipped.push('pdfinfo-unavailable');
  }
}

// ---------- ZIP ----------

const zipPath = path.join(downloadsDir, 'coordinate-segments-areas-source.zip');
try {
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  execFileSync('zip', ['-q', '-r', zipPath, 'README.md', 'STATUS.md', 'project-metadata.json', 'src', 'styles', 'content', 'research', 'dist'], { cwd: root });
} catch {
  skipped.push('zip-unavailable');
}

// ---------- audit + SHA256 ----------

const hashFile = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const candidates = [
  'dist/index.html', 'dist/workbook.css', 'dist/workbook.js',
  'dist/teacher-key.html', 'dist/teacher-key.css',
  'downloads/coordinate-segments-areas-workbook.pdf',
  'downloads/coordinate-segments-areas-source.zip',
  'preview/page-01.png', 'preview/page-14.png'
];
const files = candidates
  .filter(relative => fs.existsSync(path.join(root, relative)))
  .map(relative => {
    const absolute = path.join(root, relative);
    return { path: relative, bytes: fs.statSync(absolute).size, sha256: hashFile(absolute) };
  });

const audit = {
  title: meta.title,
  slug: meta.slug,
  htmlPages: pages.length,
  pdfPages,
  answerRecords: answers.length,
  glossaryTerms: glossary.length,
  usesMathJax,
  dom: domAudit,
  utilization,
  skipped,
  files
};
const auditPath = path.join(auditDir, 'generated-audit.json');
fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n');

const checksumLines = [...files, { path: 'audit/generated-audit.json', sha256: hashFile(auditPath) }]
  .map(item => `${item.sha256} *${item.path}`).join('\n') + '\n';
fs.writeFileSync(path.join(root, 'SHA256SUMS.txt'), checksumLines);

console.log(JSON.stringify({ ...audit, files: files.map(f => f.path) }, null, 2));
if (skipped.length) console.warn(`\nדילוגים: ${skipped.join(', ')}`);
