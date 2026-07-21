#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'meta', 'two-variable-systems-manifest.json');
const topicsPath = path.join(root, 'meta', 'topics.json');
const expectedManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
const siteUrl = process.env.SITE_URL || topics.siteUrl;

if (!siteUrl) throw new Error('Missing site URL: set SITE_URL or meta/topics.json siteUrl');

const baseUrl = new URL(siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`);
const attempts = Number(process.env.LIVE_SMOKE_ATTEMPTS || 12);
const delayMs = Number(process.env.LIVE_SMOKE_DELAY_MS || 5000);
const smokeVersion = process.env.GITHUB_SHA || String(Date.now());

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

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
  const catalogScript = extractAsset(catalogHtml, /<script[^>]+src="([^"]*catalog\.js[^"]*)"/, 'catalog script');
  const deepLinkScript = extractAsset(catalogHtml, /<script[^>]+src="([^"]*catalog-deep-link\.js[^"]*)"/, 'catalog deep-link script');
  const mobileScript = extractAsset(mobileHtml, /<script[^>]+src="([^"]*mobile-app\.js[^"]*)"/, 'mobile application script');
  const [{ text: catalogJs }, { text: catalogDeepLink }, { text: mobileJs }] = await Promise.all([
    fetchText(catalogScript),
    fetchText(deepLinkScript),
    fetchText(mobileScript),
  ]);
  assert(catalogJs.includes("const LS_POS = 'parabula-catalog:last-file'"), 'desktop reader lost its remembered-position fallback');
  assert(catalogDeepLink.includes("searchParams.get('file')"), 'desktop reader does not accept a direct requested file');
  assert(catalogDeepLink.includes('target.click()'), 'desktop deep-link controller cannot open the requested page');
  assert(catalogDeepLink.includes('MutationObserver'), 'desktop deep-link controller cannot sync the active page URL');
  assert(catalogDeepLink.includes('popstate'), 'desktop deep-link controller cannot restore browser history');
  assert(mobileHtml.includes("requestedFile: params.get('file') || ''"), 'mobile reader does not accept a requested file');
  assert(mobileJs.includes('bootConfig.requestedFile'), 'mobile reader does not consume the requested file');

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
  };
}

let lastError;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const result = await verifyLiveDeployment();
    console.log(`Live systems workbook verified: ${result.site}`);
    console.log(`pages=${result.pages} tasks=${result.tasks} entryPage=${result.entryPage} canonicalReaders=${result.readers} directLinks=${result.directLinks}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.warn(`Live verification attempt ${attempt}/${attempts} failed: ${error.message}`);
    if (attempt < attempts) await sleep(delayMs);
  }
}

throw lastError;
