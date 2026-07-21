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
  assert(match, `live workbook: missing ${label}`);
  return match[1];
}

async function verifyLiveDeployment() {
  const { value: liveManifest } = await fetchJson('meta/two-variable-systems-manifest.json');
  assertManifestIntegrity(liveManifest);
  assert(
    JSON.stringify(liveManifest) === JSON.stringify(expectedManifest),
    'live manifest does not match the canonical repository manifest yet',
  );

  const { text: appHtml } = await fetchText('systems-workbook.html');
  assert(!appHtml.includes('__MOBILE_VERSION__'), 'live workbook still contains an unresolved build version token');
  assert(appHtml.includes(`<h1>${liveManifest.topic}</h1>`), 'live workbook heading differs from the manifest topic');
  assert(appHtml.includes('id="workbook-frame"'), 'live workbook is missing the worksheet frame');
  assert(
    appHtml.includes(`src="עמוד-${liveManifest.entryPage}.html"`),
    'live workbook frame does not open the canonical entry page',
  );

  const stylesheet = extractAsset(appHtml, /<link[^>]+rel="stylesheet"[^>]+href="([^"]*systems-workbook\.css[^"]*)"/, 'stylesheet');
  const script = extractAsset(appHtml, /<script[^>]+src="([^"]*systems-workbook\.js[^"]*)"/, 'application script');
  const [{ text: css }, { text: js }] = await Promise.all([fetchText(stylesheet), fetchText(script)]);
  assert(css.includes('.app-layout'), 'live workbook stylesheet is incomplete');
  assert(js.includes('two-variable-systems-manifest.json'), 'live workbook script is incomplete');

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
  };
}

let lastError;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const result = await verifyLiveDeployment();
    console.log(`Live systems workbook verified: ${result.site}`);
    console.log(`pages=${result.pages} tasks=${result.tasks} entryPage=${result.entryPage}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.warn(`Live verification attempt ${attempt}/${attempts} failed: ${error.message}`);
    if (attempt < attempts) await sleep(delayMs);
  }
}

throw lastError;
