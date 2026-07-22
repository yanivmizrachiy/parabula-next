#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'meta', 'two-variable-systems-manifest.json');
const topicsPath = path.join(root, 'meta', 'topics.json');
const reportPath = path.join(root, 'meta', 'audit', 'systems-live-deploy.json');
const expectedManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
const siteUrl = process.env.SITE_URL || topics.siteUrl;

if (!siteUrl) throw new Error('Missing site URL: set SITE_URL or meta/topics.json siteUrl');

const baseUrl = new URL(siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`);
const attempts = Math.max(1, Number(process.env.LIVE_SMOKE_ATTEMPTS || 12));
const delayMs = Math.max(0, Number(process.env.LIVE_SMOKE_DELAY_MS || 5000));
const smokeVersion = process.env.GITHUB_SHA || String(Date.now());
const startedAt = Date.now();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

function writeReport(payload) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function liveUrl(relativePath) {
  const url = new URL(relativePath, baseUrl);
  url.searchParams.set('live-smoke', smokeVersion);
  return url;
}

async function fetchText(relativePath) {
  const url = liveUrl(relativePath);
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-cache' },
  });
  if (!response.ok) throw new Error(`${url.pathname}: HTTP ${response.status}`);
  return { text: await response.text(), url };
}

async function fetchJson(relativePath) {
  const { text, url } = await fetchText(relativePath);
  try {
    return { value: JSON.parse(text), url };
  } catch (error) {
    throw new Error(`${url.pathname}: invalid JSON (${error.message})`);
  }
}

function assertManifestIntegrity(manifest) {
  assert(Array.isArray(manifest.pages), 'live manifest: pages must be an array');
  assert(Array.isArray(manifest.pageOrder), 'live manifest: pageOrder must be an array');
  assert(manifest.totalPages === manifest.pages.length, 'live manifest: totalPages differs from pages.length');
  assert(
    manifest.totalTasks === manifest.pages.reduce((sum, page) => sum + Number(page.taskCount || 0), 0),
    'live manifest: totalTasks differs from the sum of page task counts',
  );
  assert(
    JSON.stringify(manifest.pageOrder) === JSON.stringify(manifest.pages.map((page) => page.page)),
    'live manifest: pageOrder differs from pages',
  );
  assert(manifest.entryPage === manifest.pageOrder[0], 'live manifest: entryPage is not the first page');
}

function extractAsset(html, pattern, label) {
  const match = html.match(pattern);
  assert(match, `live reader: missing ${label}`);
  return match[1];
}

async function verifyLiveDeployment() {
  const { value: liveManifest } = await fetchJson('meta/two-variable-systems-manifest.json');
  assertManifestIntegrity(liveManifest);
  assert(
    JSON.stringify(liveManifest) === JSON.stringify(expectedManifest),
    'live manifest does not match the canonical repository manifest yet',
  );

  const entryFile = `עמוד-${liveManifest.entryPage}.html`;
  const { text: gateHtml } = await fetchText('systems-workbook.html');
  assert(!gateHtml.includes('__MOBILE_VERSION__'), 'live systems gateway contains an unresolved build version token');
  assert(gateHtml.includes(`const ENTRY_FILE = '${entryFile}'`), 'live systems gateway does not use the canonical entry page');
  assert(gateHtml.includes("'./catalog.html'"), 'live systems gateway is missing the desktop canonical reader');
  assert(gateHtml.includes("'./mobile-app.html'"), 'live systems gateway is missing the mobile canonical reader');
  assert(gateHtml.includes("target.searchParams.set('file', requested)"), 'live systems gateway does not pass the requested file directly');
  assert(!gateHtml.includes('parabula-catalog:last-file'), 'live systems gateway still depends on desktop local storage');
  assert(gateHtml.includes('window.location.replace(target.href)'), 'live systems gateway does not redirect safely');

  const [{ text: catalogHtml }, { text: mobileHtml }] = await Promise.all([
    fetchText('catalog.html'),
    fetchText('mobile-app.html'),
  ]);
  assert(!catalogHtml.includes('__MOBILE_VERSION__'), 'live desktop reader contains an unresolved build version token');
  assert(!mobileHtml.includes('__MOBILE_VERSION__'), 'live mobile reader contains an unresolved build version token');
  const catalogScript = extractAsset(catalogHtml, /<script[^>]+src="([^"]*catalog\.js[^"]*)"/, 'catalog script');
  const deepLinkScript = extractAsset(catalogHtml, /<script[^>]+src="([^"]*catalog-deep-link\.js[^"]*)"/, 'catalog deep-link script');
  const mobileScript = extractAsset(mobileHtml, /<script[^>]+src="([^"]*mobile-app\.js[^"]*)"/, 'mobile application script');
  const mobileDeepLinkScript = extractAsset(mobileHtml, /<script[^>]+src="([^"]*mobile-deep-link\.js[^"]*)"/, 'mobile deep-link script');
  const [{ text: catalogJs }, { text: catalogDeepLink }, { text: mobileJs }, { text: mobileDeepLink }] = await Promise.all([
    fetchText(catalogScript),
    fetchText(deepLinkScript),
    fetchText(mobileScript),
    fetchText(mobileDeepLinkScript),
  ]);
  assert(catalogJs.includes("const LS_POS = 'parabula-catalog:last-file'"), 'desktop reader lost its remembered-position fallback');
  assert(catalogDeepLink.includes("searchParams.get('file')"), 'desktop reader does not accept a direct requested file');
  assert(catalogDeepLink.includes('target.click()'), 'desktop deep-link controller cannot open the requested page');
  assert(catalogDeepLink.includes('MutationObserver'), 'desktop deep-link controller cannot sync the active page URL');
  assert(catalogDeepLink.includes('popstate'), 'desktop deep-link controller cannot restore browser history');
  assert(mobileHtml.includes("requestedFile: params.get('file') || ''"), 'mobile reader does not accept a requested file');
  assert(mobileJs.includes('bootConfig.requestedFile'), 'mobile reader does not consume the requested file');
  assert(mobileDeepLink.includes("searchParams.set('file', normalized)"), 'mobile reader cannot sync the active page URL');
  assert(mobileDeepLink.includes('.page-card.active'), 'mobile reader cannot detect the active page');
  assert(mobileDeepLink.includes('MutationObserver'), 'mobile reader cannot observe page changes');
  assert(mobileDeepLink.includes('popstate'), 'mobile reader cannot restore browser history');
  assert(mobileDeepLink.includes('window.location.reload()'), 'mobile reader cannot restore a page across topics');

  const pageResults = await Promise.all(liveManifest.pages.map(async (page) => {
    const file = `עמוד-${page.page}.html`;
    const { text } = await fetchText(file);
    assert(text.includes('class="a4-page'), `${file}: missing canonical A4 page root`);
    assert(text.includes(liveManifest.topic), `${file}: missing workbook topic`);
    return file;
  }));

  return {
    site: baseUrl.href,
    pages: pageResults.length,
    tasks: liveManifest.totalTasks,
    entryPage: liveManifest.entryPage,
    readers: 2,
    directLinks: 2,
    historyControllers: 2,
  };
}

let lastError;
const failures = [];
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const result = await verifyLiveDeployment();
    writeReport({
      schemaVersion: 1,
      status: 'success',
      checkedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      commit: smokeVersion,
      attempt,
      failures,
      ...result,
    });
    console.log(`Live systems workbook verified: ${result.site}`);
    console.log(`pages=${result.pages} tasks=${result.tasks} entryPage=${result.entryPage} canonicalReaders=${result.readers} directLinks=${result.directLinks} historyControllers=${result.historyControllers}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    failures.push({ attempt, message: error.message });
    console.warn(`Live verification attempt ${attempt}/${attempts} failed: ${error.message}`);
    if (attempt < attempts) await sleep(delayMs);
  }
}

writeReport({
  schemaVersion: 1,
  status: 'failure',
  checkedAt: new Date().toISOString(),
  durationMs: Date.now() - startedAt,
  commit: smokeVersion,
  attempts,
  failures,
  error: lastError?.message || 'Live verification failed without an error message',
});

throw lastError;
