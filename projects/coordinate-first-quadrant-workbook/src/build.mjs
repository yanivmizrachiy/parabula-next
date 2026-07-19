import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const workbookDir = path.join(root, 'workbook');
const distDir = path.join(root, 'dist');
const downloadsDir = path.join(root, 'downloads');
const previewDir = path.join(root, 'preview');
const auditDir = path.join(root, 'audit');
for (const dir of [distDir, downloadsDir, previewDir, auditDir]) fs.mkdirSync(dir, { recursive: true });

const fragments = [
  'workbook-01.htmlfrag', 'workbook-02.htmlfrag', 'workbook-03.htmlfrag',
  'workbook-04.htmlfrag', 'workbook-05-06.htmlfrag', 'workbook-07-08.htmlfrag',
  'workbook-09-10.htmlfrag', 'workbook-11-12.htmlfrag',
  'workbook-13-14.htmlfrag', 'workbook-15.htmlfrag'
];
const standalone = fragments.map(name => fs.readFileSync(path.join(workbookDir, name), 'utf8')).join('');
const pageIds = [...standalone.matchAll(/id="page-(\d{1,2})"/g)].map(match => Number(match[1]));
const uniquePages = [...new Set(pageIds)].sort((a, b) => a - b);
if (pageIds.length !== 30 || uniquePages.length !== 30 || uniquePages.some((value, index) => value !== index + 1)) {
  throw new Error(`Expected pages 1-30 exactly once; received ${JSON.stringify(pageIds)}`);
}

const styleMatch = standalone.match(/<style>([\s\S]*?)<\/style>/i);
const scripts = [...standalone.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
if (!styleMatch || scripts.length !== 1) throw new Error('Expected one embedded style and one embedded script.');
let css = styleMatch[1].trim() + '\n';
const js = scripts[0][1].trim() + '\n';
let cleanHtml = standalone
  .replace(styleMatch[0], '<link rel="stylesheet" href="workbook.css">')
  .replace(scripts[0][0], '<script src="workbook.js"></script>');

const widths = new Set();
cleanHtml = cleanHtml.replace(/class="([^"]*\bblank\b[^"]*)"\s+style="--blank-width:(\d+)ch"/g, (_, classes, width) => {
  widths.add(Number(width));
  return `class="${classes} blank-w-${width}"`;
});
for (const width of [...widths].sort((a, b) => a - b)) css += `.blank-w-${width}{--blank-width:${width}ch}\n`;
if (/<style\b/i.test(cleanHtml) || /\sstyle="/i.test(cleanHtml)) throw new Error('Inline CSS remained after normalization.');

fs.writeFileSync(path.join(distDir, 'index.html'), cleanHtml);
fs.writeFileSync(path.join(distDir, 'workbook.css'), css);
fs.writeFileSync(path.join(distDir, 'workbook.js'), js);
fs.writeFileSync(path.join(distDir, 'standalone-source.html'), standalone);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(distDir, 'index.html')).href, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.querySelectorAll('.coordinate-grid svg').length === document.querySelectorAll('.coordinate-grid').length);
const domAudit = await page.evaluate(() => ({
  pages: document.querySelectorAll('.sheet').length,
  grids: document.querySelectorAll('.coordinate-grid svg').length,
  questions: document.querySelectorAll('.q-card, .mist-card').length,
  title: document.title,
  rtl: document.documentElement.dir === 'rtl'
}));
if (domAudit.pages !== 30 || domAudit.grids !== 46 || !domAudit.rtl) throw new Error(`DOM audit failed: ${JSON.stringify(domAudit)}`);
await page.pdf({
  path: path.join(downloadsDir, 'coordinate-first-quadrant-workbook.pdf'),
  format: 'A4', printBackground: true, preferCSSPageSize: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' }
});
await page.locator('#page-1').screenshot({ path: path.join(previewDir, 'page-01.png') });
await browser.close();

const pdfInfo = execFileSync('pdfinfo', [path.join(downloadsDir, 'coordinate-first-quadrant-workbook.pdf')], { encoding: 'utf8' });
const pdfPages = Number((pdfInfo.match(/^Pages:\s+(\d+)/m) || [])[1]);
if (pdfPages !== 30) throw new Error(`Expected a 30-page PDF; generated ${pdfPages}.`);

const zipPath = path.join(downloadsDir, 'coordinate-first-quadrant-source.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
execFileSync('zip', ['-q', '-r', zipPath, 'README.md', 'project-metadata.json', 'index.html', 'workbook', 'src', 'dist'], { cwd: root });

const hashFile = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const generated = [
  'dist/index.html', 'dist/workbook.css', 'dist/workbook.js', 'dist/standalone-source.html',
  'downloads/coordinate-first-quadrant-workbook.pdf',
  'downloads/coordinate-first-quadrant-source.zip', 'preview/page-01.png'
];
const files = generated.map(relative => {
  const absolute = path.join(root, relative);
  return { path: relative, bytes: fs.statSync(absolute).size, sha256: hashFile(absolute) };
});
const audit = { title: 'מערכת צירים — רביע ראשון', generatedAt: new Date().toISOString(), htmlPages: 30, pdfPages, ...domAudit, files };
fs.writeFileSync(path.join(auditDir, 'generated-audit.json'), JSON.stringify(audit, null, 2) + '\n');
const checksumLines = [...files, { path: 'audit/generated-audit.json', bytes: fs.statSync(path.join(auditDir, 'generated-audit.json')).size, sha256: hashFile(path.join(auditDir, 'generated-audit.json')) }]
  .map(item => `${item.sha256} *${item.path}`).join('\n') + '\n';
fs.writeFileSync(path.join(root, 'SHA256SUMS.txt'), checksumLines);
console.log(JSON.stringify(audit, null, 2));
