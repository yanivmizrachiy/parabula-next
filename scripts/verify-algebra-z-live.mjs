import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const useBrowser = args.includes('--browser');
const outArg = args.find((arg) => arg.startsWith('--out='));
const screenshotArg = args.find((arg) => arg.startsWith('--screenshot='));
const outputPath = outArg ? outArg.slice('--out='.length) : null;
const screenshotPath = screenshotArg ? screenshotArg.slice('--screenshot='.length) : null;
const baseUrl = (process.env.ALGEBRA_Z_BASE_URL || 'https://yanivmizrachiy.github.io/parabula-next').replace(/\/$/, '');
const checkedAt = new Date().toISOString();
const errors = [];
const evidence = {};

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function cacheBusted(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}verify=${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function fetchBytes(url) {
  const response = await fetch(cacheBusted(url), {
    redirect: 'follow',
    headers: {
      'cache-control': 'no-cache',
      pragma: 'no-cache'
    }
  });

  const bytes = Buffer.from(await response.arrayBuffer());
  return {
    url,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get('content-type') || '',
    bytes
  };
}

function verifyPdf(name, result, expected) {
  const ascii = result.bytes.toString('latin1');
  const tail = result.bytes.subarray(Math.max(0, result.bytes.length - 4096)).toString('latin1');
  const actualSha = sha256(result.bytes);

  assert(result.ok && result.status === 200, `${name}: HTTP ${result.status}`);
  assert(result.bytes.subarray(0, 5).toString('ascii') === '%PDF-', `${name}: invalid PDF header`);
  assert(tail.includes('%%EOF'), `${name}: EOF marker missing`);
  assert(ascii.includes(`/Count ${expected.pages}`), `${name}: expected ${expected.pages} pages`);
  assert(result.bytes.length === expected.bytes, `${name}: byte count ${result.bytes.length} != ${expected.bytes}`);
  assert(actualSha === expected.sha256, `${name}: SHA-256 ${actualSha} != ${expected.sha256}`);

  return {
    status: result.status,
    contentType: result.contentType,
    bytes: result.bytes.length,
    sha256: actualSha,
    pages: expected.pages,
    header: result.bytes.subarray(0, 5).toString('ascii'),
    eof: tail.includes('%%EOF')
  };
}

const manifestPath = path.join(root, 'meta/algebra-z-workbook.json');
const localManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const canonicalCredits = [
  'יניב רז - מדריך מחוזי חט״ב בעיר ירושלים',
  'הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין'
];

assert(localManifest.release === '2.1.0-strict-local', 'local manifest release must be 2.1.0-strict-local');
assert(localManifest.pageCount === 15, 'local manifest pageCount must be 15');
assert(localManifest.format === 'A4', 'local manifest format must be A4');
assert(localManifest.migration?.strategy === 'strict-local', 'local migration strategy must be strict-local');
assert(localManifest.migration?.strictLocalReady === true, 'local strictLocalReady must be true');
assert(JSON.stringify(localManifest.credits) === JSON.stringify(canonicalCredits), 'local credits are not canonical');

const localRaw = JSON.stringify(localManifest);
for (const forbidden of ['drive.google.com', 'drive.usercontent.google.com', 'fallbackDriveId']) {
  assert(!localRaw.includes(forbidden), `local manifest contains forbidden token: ${forbidden}`);
}

const expected = {
  color: {
    ...localManifest.files.color,
    pages: localManifest.pageCount
  },
  bw: {
    ...localManifest.files.bw,
    pages: localManifest.pageCount
  }
};

const urls = {
  page: `${baseUrl}/algebra-z-workbook.html`,
  js: `${baseUrl}/algebra-z-workbook.js`,
  manifest: `${baseUrl}/meta/algebra-z-workbook.json`,
  color: `${baseUrl}/${expected.color.path}`,
  bw: `${baseUrl}/${expected.bw.path}`
};

const [pageResult, jsResult, manifestResult, colorResult, bwResult] = await Promise.all([
  fetchBytes(urls.page),
  fetchBytes(urls.js),
  fetchBytes(urls.manifest),
  fetchBytes(urls.color),
  fetchBytes(urls.bw)
]);

const html = pageResult.bytes.toString('utf8');
const js = jsResult.bytes.toString('utf8');
const liveManifestText = manifestResult.bytes.toString('utf8');

assert(pageResult.ok && pageResult.status === 200, `page: HTTP ${pageResult.status}`);
assert(jsResult.ok && jsResult.status === 200, `JavaScript: HTTP ${jsResult.status}`);
assert(manifestResult.ok && manifestResult.status === 200, `manifest: HTTP ${manifestResult.status}`);

for (const id of [
  'colorMode',
  'bwMode',
  'prevPage',
  'nextPage',
  'pageNumber',
  'zoomMode',
  'downloadButton',
  'openButton',
  'fullscreenButton',
  'pdfFrame'
]) {
  assert(html.includes(`id="${id}"`), `live HTML missing #${id}`);
}

assert(html.includes(canonicalCredits[0]), 'live HTML missing first canonical credit');
assert(html.includes(canonicalCredits[1]), 'live HTML missing second canonical credit');
assert(js.includes('assertLocalPdf'), 'live JavaScript does not enforce local PDF verification');

for (const [surface, text] of [
  ['HTML', html],
  ['JavaScript', js],
  ['manifest', liveManifestText]
]) {
  for (const forbidden of ['drive.google.com', 'drive.usercontent.google.com', 'fallbackDriveId']) {
    assert(!text.includes(forbidden), `${surface} contains forbidden token: ${forbidden}`);
  }
}

let liveManifest = null;
try {
  liveManifest = JSON.parse(liveManifestText);
} catch (error) {
  errors.push(`live manifest is invalid JSON: ${error.message}`);
}

if (liveManifest) {
  assert(liveManifest.release === localManifest.release, 'live release differs from local release');
  assert(liveManifest.pageCount === localManifest.pageCount, 'live pageCount differs from local pageCount');
  assert(liveManifest.format === localManifest.format, 'live format differs from local format');
  assert(liveManifest.migration?.strategy === 'strict-local', 'live migration strategy is not strict-local');
  assert(liveManifest.migration?.strictLocalReady === true, 'live strictLocalReady is not true');
  assert(JSON.stringify(liveManifest.credits) === JSON.stringify(canonicalCredits), 'live credits are not canonical');

  for (const mode of ['color', 'bw']) {
    assert(liveManifest.files?.[mode]?.path === expected[mode].path, `${mode}: live path differs`);
    assert(liveManifest.files?.[mode]?.bytes === expected[mode].bytes, `${mode}: live byte count differs`);
    assert(liveManifest.files?.[mode]?.sha256 === expected[mode].sha256, `${mode}: live SHA-256 differs`);
  }
}

evidence.http = {
  page: { status: pageResult.status, contentType: pageResult.contentType, bytes: pageResult.bytes.length },
  js: { status: jsResult.status, contentType: jsResult.contentType, bytes: jsResult.bytes.length },
  manifest: { status: manifestResult.status, contentType: manifestResult.contentType, bytes: manifestResult.bytes.length }
};

evidence.pdf = {
  color: verifyPdf('color PDF', colorResult, expected.color),
  bw: verifyPdf('B/W PDF', bwResult, expected.bw)
};

if (useBrowser) {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors = [];
  const criticalRequestFailures = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  page.on('requestfailed', (request) => {
    const requestUrl = request.url();
    const pathname = new URL(requestUrl).pathname.toLowerCase();
    if (requestUrl.startsWith(baseUrl) && !pathname.endsWith('.pdf')) {
      criticalRequestFailures.push(`${request.method()} ${requestUrl} — ${request.failure()?.errorText || 'failed'}`);
    }
  });

  try {
    const response = await page.goto(cacheBusted(urls.page), {
      waitUntil: 'networkidle',
      timeout: 90000
    });

    assert(response?.status() === 200, `browser page HTTP ${response?.status() ?? 'none'}`);

    await page.locator('#downloadButton').waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForFunction(
      () => document.querySelector('#downloadButton')?.getAttribute('href')?.includes('algebra-z-color.pdf'),
      null,
      { timeout: 30000 }
    );

    const initialDownload = await page.locator('#downloadButton').getAttribute('href');
    const initialOpen = await page.locator('#openButton').getAttribute('href');
    const initialFrame = await page.locator('#pdfFrame').getAttribute('src');

    assert(initialDownload?.includes('algebra-z-color.pdf'), 'browser color download link is incorrect');
    assert(initialOpen?.includes('algebra-z-color.pdf'), 'browser color open link is incorrect');
    assert(initialFrame?.includes('algebra-z-color.pdf'), 'browser color iframe source is incorrect');

    await page.locator('#bwMode').click();
    await page.waitForFunction(
      () => document.querySelector('#downloadButton')?.getAttribute('href')?.includes('algebra-z-bw.pdf'),
      null,
      { timeout: 30000 }
    );

    const bwDownload = await page.locator('#downloadButton').getAttribute('href');
    const bwOpen = await page.locator('#openButton').getAttribute('href');
    const bwFrame = await page.locator('#pdfFrame').getAttribute('src');

    assert(bwDownload?.includes('algebra-z-bw.pdf'), 'browser B/W download link is incorrect');
    assert(bwOpen?.includes('algebra-z-bw.pdf'), 'browser B/W open link is incorrect');
    assert(bwFrame?.includes('algebra-z-bw.pdf'), 'browser B/W iframe source is incorrect');

    await page.locator('#colorMode').click();
    await page.waitForFunction(
      () => document.querySelector('#downloadButton')?.getAttribute('href')?.includes('algebra-z-color.pdf'),
      null,
      { timeout: 30000 }
    );

    const sourceBadge = (await page.locator('#sourceBadge').textContent())?.trim() || '';
    assert(sourceBadge === 'קובץ מקומי מהאתר', `browser source badge is unexpected: ${sourceBadge}`);
    assert(consoleErrors.length === 0, `browser console errors: ${consoleErrors.join(' | ')}`);
    assert(criticalRequestFailures.length === 0, `browser request failures: ${criticalRequestFailures.join(' | ')}`);

    if (screenshotPath) {
      fs.mkdirSync(path.dirname(path.resolve(screenshotPath)), { recursive: true });
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    evidence.browser = {
      ok: true,
      initialDownload,
      initialOpen,
      initialFrame,
      bwDownload,
      bwOpen,
      bwFrame,
      sourceBadge,
      consoleErrors,
      criticalRequestFailures,
      screenshotPath
    };
  } finally {
    await browser.close();
  }
}

const report = {
  checkedAt,
  baseUrl,
  ok: errors.length === 0,
  errors,
  expected,
  urls,
  evidence
};

if (outputPath) {
  const absoluteOutput = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
  fs.writeFileSync(absoluteOutput, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
