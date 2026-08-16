import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const root = process.cwd();
const appDir = path.join(root, 'sources', 'lovable', 'ratio-workbook');
const distAssetsDir = path.join(appDir, 'dist', 'assets');
const firstGlobalPage = 272;
const pageCount = 48;
const expectedA4 = { width: 793.7, height: 1122.5 };
const sourceBaseUrl = 'http://127.0.0.1:4174';
const writeMode = process.argv.includes('--write');
const checkMode = process.argv.includes('--check');

if (writeMode && checkMode) {
  throw new Error('Use either --write or --check, not both.');
}

const mode = writeMode ? 'write' : checkMode ? 'check' : 'preflight';
const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ratio-live-candidate-'));
const candidateFiles = new Set();

const footer = `    <footer class="gz-footer">
      <div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div>
      <div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div>
    </footer>`;

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('exit', (code) => code === 0
      ? resolve()
      : reject(new Error(`${command} exited with code ${code}`)));
  });
}

async function waitForServer(url, timeoutMs = 45_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function normalizeText(value) {
  return value.replaceAll('\r\n', '\n').replace(/\s+$/, '') + '\n';
}

function rewriteAssetReferences(value, prefix) {
  return value
    .replaceAll('="/assets/', `="${prefix}`)
    .replaceAll("='/assets/", `='${prefix}`)
    .replaceAll('url(/assets/', `url(${prefix}`)
    .replaceAll('url("/assets/', `url("${prefix}`)
    .replaceAll("url('/assets/", `url('${prefix}`);
}

function sanitizeBundledCss(css) {
  const googleFontImport = /@import\s*(?:url\(\s*["']?[^)]*fonts\.googleapis\.com[^)]*\)|["'][^"']*fonts\.googleapis\.com[^"']*["'])\s*;?/giu;
  const withoutRemoteFonts = css.replace(googleFontImport, '');
  if (/fonts\.googleapis\.com|https?:\/\//i.test(withoutRemoteFonts)) {
    throw new Error('Ratio CSS bundle still contains a remote URL after sanitization.');
  }

  const rewritten = rewriteAssetReferences(withoutRemoteFonts, '../../assets/ratio/live/');
  return normalizeText(`${rewritten.trim()}

/* Canonical semantic ratio wrapper. */
.ratio-live-page {
  position: relative;
  display: block;
  margin: 0;
  padding: 0;
  box-shadow: none;
  border: 0;
  overflow: visible;
}

/* a4-base.css is shared by the whole book and has legacy selectors that
   collide with the React workbook class names. Re-establish the verified
   React geometry inside ratio canonical pages instead of clipping content. */
.ratio-live-page > .header-container {
  margin-bottom: 0;
}

.ratio-live-page .page-title {
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
}

.ratio-live-page .question-block {
  flex-direction: row;
  justify-content: flex-start;
}

.ratio-live-page .multiple-choice {
  justify-content: flex-start;
  width: auto;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  direction: inherit;
}

.ratio-live-page > .gz-footer {
  position: absolute;
  inset-inline: 9mm;
  bottom: 0.8mm;
  margin: 0;
  padding-top: 2px;
  background: #fff;
  z-index: 20;
}

@media print {
  .ratio-live-page {
    margin: 0;
    padding: 0;
    box-shadow: none;
    border: 0;
    overflow: visible;
  }
}
`);
}

async function writeCandidate(rel, content) {
  const target = path.join(tempRoot, rel);
  await fs.mkdir(path.dirname(target), { recursive: true });
  if (Buffer.isBuffer(content)) await fs.writeFile(target, content);
  else await fs.writeFile(target, normalizeText(content), 'utf8');
  candidateFiles.add(rel);
}

function pageHtml({ globalPage, localPage, previous, next, sourceClasses, sourceHtml }) {
  const classes = ['a4-page', `page-${globalPage}`, 'ratio-live-page', 'worksheet-page', ...sourceClasses]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(' ');

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
      <div class="nav-side"><a class="nav-link" href="עמוד-${previous}.html">הקודם</a></div>
      <div class="nav-meta">יחס — עמוד ${localPage} / ${pageCount}</div>
      <div class="nav-side"><a class="nav-link" href="עמוד-${next}.html">הבא</a></div>
    </div>
    <div class="preview-nav-topics" aria-label="נושא הדף">
      <a class="topic-link is-active" href="עמוד-${firstGlobalPage}.html" aria-current="page">יחס</a>
    </div>
  </nav>

  <main class="${classes}">
${sourceHtml}
${footer}
  </main>
</body>
</html>`;
}

async function collectCandidateAssets() {
  const entries = await fs.readdir(distAssetsDir, { withFileTypes: true });
  const cssFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
    .map((entry) => entry.name)
    .sort();
  if (cssFiles.length === 0) throw new Error('Ratio build produced no CSS bundle.');

  const cssParts = [];
  for (const filename of cssFiles) {
    cssParts.push(await fs.readFile(path.join(distAssetsDir, filename), 'utf8'));
  }
  await writeCandidate('styles/topics/ratio-live.css', sanitizeBundledCss(cssParts.join('\n')));

  for (const entry of entries) {
    if (!entry.isFile() || entry.name.endsWith('.css')) continue;
    await writeCandidate(
      path.join('assets', 'ratio', 'live', entry.name),
      await fs.readFile(path.join(distAssetsDir, entry.name)),
    );
  }
}

async function prepareCandidateStaticFiles() {
  await fs.mkdir(path.join(tempRoot, 'styles'), { recursive: true });
  await fs.copyFile(path.join(root, 'styles', 'a4-base.css'), path.join(tempRoot, 'styles', 'a4-base.css'));
  await fs.cp(path.join(root, 'vendor', 'fonts'), path.join(tempRoot, 'vendor', 'fonts'), { recursive: true });
}

function createStaticServer(baseDir) {
  const mime = new Map([
    ['.html', 'text/html; charset=utf-8'],
    ['.css', 'text/css; charset=utf-8'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.svg', 'image/svg+xml'],
    ['.png', 'image/png'],
    ['.woff2', 'font/woff2'],
    ['.woff', 'font/woff'],
  ]);

  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://127.0.0.1');
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || `עמוד-${firstGlobalPage}.html`;
      const target = path.resolve(baseDir, relative);
      const allowedPrefix = `${path.resolve(baseDir)}${path.sep}`;
      if (target !== path.resolve(baseDir) && !target.startsWith(allowedPrefix)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      const bytes = await fs.readFile(target);
      response.writeHead(200, { 'content-type': mime.get(path.extname(target)) || 'application/octet-stream' });
      response.end(bytes);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
}

async function compareCandidateWithRepository() {
  const mismatches = [];
  for (const rel of [...candidateFiles].sort()) {
    const [candidate, current] = await Promise.all([
      fs.readFile(path.join(tempRoot, rel)),
      fs.readFile(path.join(root, rel)).catch(() => null),
    ]);
    if (!current || !candidate.equals(current)) mismatches.push(rel);
  }
  if (mismatches.length > 0) {
    throw new Error(`Canonical semantic ratio files are missing or stale:\n${mismatches.join('\n')}`);
  }
}

async function writeCandidateToRepository() {
  for (const rel of [...candidateFiles].sort()) {
    const source = path.join(tempRoot, rel);
    const target = path.join(root, rel);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
  }
  await fs.rm(path.join(root, 'styles', 'pages', 'ratio-import.css'), { force: true });
}

const topicsDocument = JSON.parse(await fs.readFile(path.join(root, 'meta', 'topics.json'), 'utf8'));
const topicList = Array.isArray(topicsDocument.topics) ? topicsDocument.topics : [];
const ratioIndex = topicList.findIndex((topic) => topic.name === 'יחס');
if (ratioIndex < 0) throw new Error('Topic יחס is missing from meta/topics.json.');
const ratioTopic = topicList[ratioIndex];
if (!Array.isArray(ratioTopic.pages) || ratioTopic.pages.length !== pageCount) {
  throw new Error(`Expected ${pageCount} ratio pages in metadata.`);
}
for (let index = 0; index < pageCount; index += 1) {
  const expected = firstGlobalPage + index;
  if (ratioTopic.pages[index]?.number !== expected) {
    throw new Error(`Ratio page mapping is not stable at local page ${index + 1}: expected ${expected}.`);
  }
}
const previousBookPage = topicList[ratioIndex - 1]?.pages?.at(-1)?.number;
const nextBookPage = topicList[ratioIndex + 1]?.pages?.[0]?.number;
if (!previousBookPage || !nextBookPage) throw new Error('Could not resolve cross-topic ratio navigation neighbors.');

await run('npm', ['run', 'build'], { cwd: appDir });
await prepareCandidateStaticFiles();
await collectCandidateAssets();

const sourcePreview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4174'], {
  cwd: appDir,
  stdio: 'ignore',
});

let browser;
let sourceContext;
let candidateContext;
let candidateServer;
try {
  await waitForServer(sourceBaseUrl);
  browser = await chromium.launch({ headless: true });
  sourceContext = await browser.newContext({ viewport: { width: 794, height: 1123 }, locale: 'he-IL' });
  const sourcePage = await sourceContext.newPage();

  for (let localPage = 1; localPage <= pageCount; localPage += 1) {
    const globalPage = firstGlobalPage + localPage - 1;
    await sourcePage.goto(`${sourceBaseUrl}/render/${localPage}`, { waitUntil: 'networkidle' });
    await sourcePage.locator('[data-render-ready="true"]').waitFor({ state: 'visible' });
    await sourcePage.evaluate(async () => { if ('fonts' in document) await document.fonts.ready; });

    const source = await sourcePage.evaluate(() => {
      const sheet = document.querySelector('.worksheet-page');
      if (!(sheet instanceof HTMLElement)) throw new Error('Missing .worksheet-page source root.');
      const clone = sheet.cloneNode(true);
      if (!(clone instanceof HTMLElement)) throw new Error('Could not clone .worksheet-page.');
      clone.querySelectorAll('.gz-footer, .preview-nav, script').forEach((element) => element.remove());
      if (clone.querySelector('[style]')) throw new Error('Inline CSS is forbidden in semantic ratio source.');
      return {
        classes: Array.from(clone.classList).filter((name) => name !== 'worksheet-page'),
        html: clone.innerHTML.trim(),
      };
    });

    const sourceHtml = rewriteAssetReferences(source.html, 'assets/ratio/live/');
    if (/<img[^>]+assets\/ratio\/page-\d{3}\.png/i.test(sourceHtml) || sourceHtml.includes('ratio-import-image')) {
      throw new Error(`Semantic source page ${localPage} still depends on a full-page PNG.`);
    }

    const previous = localPage === 1 ? previousBookPage : globalPage - 1;
    const next = localPage === pageCount ? nextBookPage : globalPage + 1;
    await writeCandidate(
      `עמוד-${globalPage}.html`,
      pageHtml({ globalPage, localPage, previous, next, sourceClasses: source.classes, sourceHtml }),
    );
    await writeCandidate(`styles/pages/עמוד-${globalPage}.css`, '@import url("../topics/ratio-live.css");');
  }

  candidateServer = createStaticServer(tempRoot);
  await new Promise((resolve, reject) => {
    candidateServer.once('error', reject);
    candidateServer.listen(0, '127.0.0.1', resolve);
  });
  const address = candidateServer.address();
  if (!address || typeof address === 'string') throw new Error('Could not resolve candidate server port.');
  const candidateBaseUrl = `http://127.0.0.1:${address.port}`;

  candidateContext = await browser.newContext({ viewport: { width: 794, height: 1123 }, locale: 'he-IL' });
  const page = await candidateContext.newPage();
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));

  const findings = [];
  for (let localPage = 1; localPage <= pageCount; localPage += 1) {
    browserErrors.length = 0;
    const globalPage = firstGlobalPage + localPage - 1;
    await page.goto(`${candidateBaseUrl}/עמוד-${globalPage}.html`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { if ('fonts' in document) await document.fonts.ready; });

    const geometry = await page.evaluate(() => {
      const sheet = document.querySelector('.ratio-live-page');
      const content = sheet?.querySelector(':scope > .page-content');
      const footer = sheet?.querySelector(':scope > .gz-footer');
      if (!(sheet instanceof HTMLElement) || !(content instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
        throw new Error('Canonical candidate is missing sheet, content or footer.');
      }
      const sheetRect = sheet.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const childBottoms = Array.from(content.children)
        .filter((element) => element instanceof HTMLElement)
        .map((element) => element.getBoundingClientRect().bottom);
      return {
        width: sheetRect.width,
        height: sheetRect.height,
        sheetClientHeight: sheet.clientHeight,
        sheetScrollHeight: sheet.scrollHeight,
        contentClientHeight: content.clientHeight,
        contentScrollHeight: content.scrollHeight,
        contentClientWidth: content.clientWidth,
        contentScrollWidth: content.scrollWidth,
        footerTop: footerRect.top,
        footerBottom: footerRect.bottom,
        sheetBottom: sheetRect.bottom,
        lastContentBottom: childBottoms.length ? Math.max(...childBottoms) : sheetRect.top,
        a4Count: document.querySelectorAll('.a4-page').length,
        nestedWorksheetCount: sheet.querySelectorAll('.worksheet-page').length,
        fullPagePngCount: document.querySelectorAll('img[src*="assets/ratio/page-"]').length,
      };
    });

    const pageFindings = [];
    if (geometry.a4Count !== 1) pageFindings.push(`expected one A4 root, found ${geometry.a4Count}`);
    if (geometry.nestedWorksheetCount !== 0) pageFindings.push('nested worksheet page detected');
    if (geometry.fullPagePngCount !== 0) pageFindings.push('full-page PNG dependency detected');
    if (Math.abs(geometry.width - expectedA4.width) > 2 || Math.abs(geometry.height - expectedA4.height) > 2) {
      pageFindings.push(`not A4: ${geometry.width}×${geometry.height}`);
    }
    if (geometry.contentScrollHeight - geometry.contentClientHeight > 1) {
      pageFindings.push(`content vertical overflow ${geometry.contentScrollHeight - geometry.contentClientHeight}px`);
    }
    if (geometry.contentScrollWidth - geometry.contentClientWidth > 1) {
      pageFindings.push(`content horizontal overflow ${geometry.contentScrollWidth - geometry.contentClientWidth}px`);
    }
    if (geometry.sheetScrollHeight - geometry.sheetClientHeight > 1) {
      pageFindings.push(`sheet overflow ${geometry.sheetScrollHeight - geometry.sheetClientHeight}px`);
    }
    if (geometry.footerBottom > geometry.sheetBottom + 1) pageFindings.push('footer leaves A4 bounds');
    if (geometry.lastContentBottom > geometry.footerTop - 1) pageFindings.push('footer overlaps worksheet content');
    if (browserErrors.length > 0) pageFindings.push(`browser errors: ${browserErrors.join(' | ')}`);

    findings.push(...pageFindings.map((message) => ({ page: localPage, message })));
    process.stdout.write(`Semantic canonical candidate ${localPage}/${pageCount}: ${pageFindings.length === 0 ? 'PASS' : `FAIL — ${pageFindings.join('; ')}`}\n`);
  }

  if (findings.length > 0) {
    throw new Error(`Semantic canonical preflight failed (${findings.length} findings): ${findings.map(({ page: failedPage, message }) => `p${failedPage} ${message}`).join(' | ')}`);
  }

  if (checkMode) {
    await compareCandidateWithRepository();
    console.log('Canonical semantic ratio pages are current and match the verified source.');
  } else if (writeMode) {
    await writeCandidateToRepository();
    console.log('Wrote verified semantic canonical ratio pages 272-319.');
  } else {
    console.log('Read-only semantic canonical preflight complete. No repository files were written.');
  }
} finally {
  if (candidateContext) await candidateContext.close();
  if (sourceContext) await sourceContext.close();
  if (browser) await browser.close();
  if (candidateServer) await new Promise((resolve) => candidateServer.close(resolve));
  sourcePreview.kill('SIGTERM');
  await fs.rm(tempRoot, { recursive: true, force: true });
}
