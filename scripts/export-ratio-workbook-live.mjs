import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const root = process.cwd();
const appDir = path.join(root, 'sources', 'lovable', 'ratio-workbook');
const distDir = path.join(appDir, 'dist');
const distAssetsDir = path.join(distDir, 'assets');
const publicAssetsDir = path.join(root, 'assets', 'ratio', 'live');
const topicCssPath = path.join(root, 'styles', 'topics', 'ratio-live.css');
const baseUrl = 'http://127.0.0.1:4174';
const firstGlobalPage = 272;
const pageCount = 48;
const lastGlobalPage = firstGlobalPage + pageCount - 1;
const previousTopicPage = 600;
const nextTopicPage = 561;
const checkOnly = process.argv.includes('--check');

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
      // Preview server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function normalizeText(text) {
  return text.replaceAll('\r\n', '\n');
}

async function writeOrCheck(filePath, content) {
  const normalized = normalizeText(content);
  if (checkOnly) {
    let current;
    try {
      current = normalizeText(await fs.readFile(filePath, 'utf8'));
    } catch {
      throw new Error(`Generated file is missing: ${path.relative(root, filePath)}`);
    }
    if (current !== normalized) {
      throw new Error(`Generated file is stale: ${path.relative(root, filePath)}`);
    }
    return;
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, normalized, 'utf8');
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

  if (withoutRemoteFonts.includes('fonts.googleapis.com')) {
    throw new Error('Could not remove every Google Fonts reference from the ratio CSS bundle.');
  }

  const rewritten = rewriteAssetReferences(withoutRemoteFonts, '../../assets/ratio/live/');
  return `${rewritten.trim()}\n\n/* Canonical Parabula wrapper */
.ratio-live-page {
  position: relative;
  margin: 0;
  box-shadow: none;
  border: 0;
  overflow: hidden;
}

.ratio-live-page .gz-footer {
  z-index: 20;
}

@media print {
  .ratio-live-page {
    margin: 0;
    box-shadow: none;
    border: 0;
  }
}
`;
}

function pageHtml({ globalPage, localPage, sourceClasses, sourceHtml }) {
  const previous = localPage === 1 ? previousTopicPage : globalPage - 1;
  const next = localPage === pageCount ? nextTopicPage : globalPage + 1;
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
</html>
`;
}

async function collectBundledAssets() {
  const entries = await fs.readdir(distAssetsDir, { withFileTypes: true });
  const cssFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
    .map((entry) => entry.name)
    .sort();

  if (cssFiles.length === 0) {
    throw new Error('Ratio build produced no CSS bundle.');
  }

  const cssParts = [];
  for (const filename of cssFiles) {
    cssParts.push(await fs.readFile(path.join(distAssetsDir, filename), 'utf8'));
  }
  await writeOrCheck(topicCssPath, sanitizeBundledCss(cssParts.join('\n')));

  const assetFiles = entries.filter((entry) => entry.isFile() && !entry.name.endsWith('.css'));
  if (!checkOnly) {
    await fs.rm(publicAssetsDir, { recursive: true, force: true });
    await fs.mkdir(publicAssetsDir, { recursive: true });
  }

  for (const entry of assetFiles) {
    const source = path.join(distAssetsDir, entry.name);
    const target = path.join(publicAssetsDir, entry.name);
    if (checkOnly) {
      const [sourceBytes, targetBytes] = await Promise.all([
        fs.readFile(source),
        fs.readFile(target).catch(() => null),
      ]);
      if (!targetBytes || !sourceBytes.equals(targetBytes)) {
        throw new Error(`Generated asset is missing or stale: ${path.relative(root, target)}`);
      }
    } else {
      await fs.copyFile(source, target);
    }
  }
}

await run('npm', ['run', 'build'], { cwd: appDir });
await collectBundledAssets();

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4174'], {
  cwd: appDir,
  stdio: 'ignore',
});

let browser;
let context;
try {
  await waitForServer(baseUrl);
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({
    viewport: { width: 794, height: 1123 },
    locale: 'he-IL',
  });
  const page = await context.newPage();

  for (let localPage = 1; localPage <= pageCount; localPage += 1) {
    const globalPage = firstGlobalPage + localPage - 1;
    await page.goto(`${baseUrl}/render/${localPage}`, { waitUntil: 'networkidle' });
    await page.locator('[data-render-ready="true"]').waitFor({ state: 'visible' });
    await page.evaluate(async () => {
      if ('fonts' in document) await document.fonts.ready;
    });

    const source = await page.evaluate((expectedPageNumber) => {
      const sheet = document.querySelector('.worksheet-page');
      if (!(sheet instanceof HTMLElement)) {
        throw new Error('Missing .worksheet-page');
      }

      const clone = sheet.cloneNode(true);
      if (!(clone instanceof HTMLElement)) {
        throw new Error('Could not clone .worksheet-page');
      }

      clone.querySelectorAll('.gz-footer, .preview-nav, script').forEach((element) => element.remove());

      const existingHeader = clone.querySelector('.page-header, .header-container');
      if (existingHeader instanceof HTMLElement) {
        const canonicalHeader = document.createElement('header');
        canonicalHeader.className = 'header-container page-header';
        for (const child of Array.from(existingHeader.childNodes)) {
          canonicalHeader.append(child);
        }
        existingHeader.replaceWith(canonicalHeader);

        const title = canonicalHeader.querySelector('.page-header-title, .page-title');
        if (title instanceof HTMLElement) {
          title.classList.add('page-title');
        }

        const oldNumber = canonicalHeader.querySelector('.page-header-num, .page-number');
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = oldNumber?.textContent?.trim() || String(expectedPageNumber);
        if (oldNumber) oldNumber.replaceWith(pageNumber);
        else canonicalHeader.append(pageNumber);
      } else {
        const canonicalHeader = document.createElement('header');
        canonicalHeader.className = 'header-container';
        const title = document.createElement('h1');
        title.className = 'page-title';
        title.textContent = 'יחס';
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = String(expectedPageNumber);
        canonicalHeader.append(title, pageNumber);
        clone.prepend(canonicalHeader);
      }

      const inlineStyle = clone.querySelector('[style]');
      if (inlineStyle) {
        throw new Error(`Inline CSS is forbidden in ratio source: ${inlineStyle.tagName.toLowerCase()}`);
      }

      return {
        classes: Array.from(clone.classList).filter((name) => name !== 'worksheet-page'),
        html: clone.innerHTML.trim(),
      };
    }, localPage);

    const sourceHtml = rewriteAssetReferences(source.html, 'assets/ratio/live/');
    if (sourceHtml.includes('ratio-import-image')) {
      throw new Error(`Page ${localPage} still contains the raster import marker.`);
    }

    await writeOrCheck(
      path.join(root, `עמוד-${globalPage}.html`),
      pageHtml({ globalPage, localPage, sourceClasses: source.classes, sourceHtml }),
    );
    await writeOrCheck(
      path.join(root, 'styles', 'pages', `עמוד-${globalPage}.css`),
      '@import url("../topics/ratio-live.css");\n',
    );
    process.stdout.write(`${checkOnly ? 'Checked' : 'Exported'} ratio page ${localPage}/${pageCount}\n`);
  }
} finally {
  if (context) await context.close();
  if (browser) await browser.close();
  preview.kill('SIGTERM');
}

process.stdout.write(`${checkOnly ? 'Verified' : 'Generated'} live ratio pages ${firstGlobalPage}-${lastGlobalPage}.\n`);
