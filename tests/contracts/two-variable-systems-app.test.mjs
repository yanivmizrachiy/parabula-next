import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const gateHtml = fs.readFileSync(path.join(root, 'systems-workbook.html'), 'utf8');
const catalogHtml = fs.readFileSync(path.join(root, 'catalog.html'), 'utf8');
const catalogDeepLink = fs.readFileSync(path.join(root, 'catalog-deep-link.js'), 'utf8');
const mobileHtml = fs.readFileSync(path.join(root, 'mobile-app.html'), 'utf8');
const mobileJs = fs.readFileSync(path.join(root, 'mobile-app.js'), 'utf8');
const mobileDeepLink = fs.readFileSync(path.join(root, 'mobile-deep-link.js'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const copyStaticSite = fs.readFileSync(path.join(root, 'scripts', 'copy-static-site.mjs'), 'utf8');

const entryFile = 'עמוד-609.html';

test('systems workbook link passes the requested file directly to either canonical reader', () => {
  assert.match(gateHtml, /<html lang="he" dir="rtl">/);
  assert.match(gateHtml, /const ENTRY_FILE = 'עמוד-609\.html'/);
  assert.match(gateHtml, /\.\/catalog\.html/);
  assert.match(gateHtml, /\.\/mobile-app\.html/);
  assert.match(gateHtml, /target\.searchParams\.set\('file', requested\)/);
  assert.doesNotMatch(gateHtml, /parabula-catalog:last-file/);
  assert.match(gateHtml, /window\.location\.replace\(target\.href\)/);
  assert.match(gateHtml, /max-width: 820px/);
  assert.match(gateHtml, /pointer: coarse/);
});

test('desktop canonical reader opens and shares the requested file from the URL', () => {
  assert.match(catalogHtml, /catalog-deep-link\.js\?v=__MOBILE_VERSION__/);
  assert.match(catalogDeepLink, /new URL\(window\.location\.href\)\.searchParams\.get\('file'\)/);
  assert.match(catalogDeepLink, /findPageButton/);
  assert.match(catalogDeepLink, /target\.click\(\)/);
  assert.match(catalogDeepLink, /history\[method\]/);
  assert.match(catalogDeepLink, /MutationObserver/);
  assert.match(catalogDeepLink, /popstate/);
  assert.match(catalogDeepLink, /pendingHistoryMode = 'push'/);
});

test('mobile canonical reader opens, shares and restores worksheet file links', () => {
  assert.match(mobileHtml, /requestedFile: params\.get\('file'\) \|\| ''/);
  assert.match(mobileHtml, /mobile-deep-link\.js\?v=__MOBILE_VERSION__/);
  assert.match(mobileJs, /bootConfig\.requestedFile/);
  assert.match(mobileJs, /\^עמוד-\\d\+\\\.html\$/);
  assert.match(mobileJs, /const first = requested \|\| findPage\(remembered\)/);
  assert.match(mobileJs, /syncCurrentPage\(first, \{ persist: !requested \}\)/);
  assert.match(mobileDeepLink, /\.page-card\.active/);
  assert.match(mobileDeepLink, /history\[method\]/);
  assert.match(mobileDeepLink, /MutationObserver/);
  assert.match(mobileDeepLink, /popstate/);
  assert.match(mobileDeepLink, /window\.location\.reload\(\)/);
  assert.match(mobileDeepLink, /pendingHistoryMode = 'push'/);
});

test('gateway and canonical readers are required and versioned in production builds', () => {
  for (const asset of ['catalog.html', 'catalog.js', 'catalog.css', 'catalog-deep-link.js', 'mobile-app.html', 'mobile-app.js', 'mobile-deep-link.js', 'systems-workbook.html', 'meta/two-variable-systems-manifest.json']) {
    assert.match(copyStaticSite, new RegExp(`['"]${asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`));
  }
  assert.match(copyStaticSite, /const tokenFiles = \[[^\]]*'catalog\.html'/s);
  assert.match(copyStaticSite, /for \(const file of rootFiles\)[\s\S]*\(html\|css\|js\|json\|svg\|webmanifest\)/);
});

test('gateway and both canonical readers have offline shells', () => {
  for (const asset of ['systems-workbook.html', 'catalog.html', 'catalog.css', 'catalog.js', 'catalog-deep-link.js', 'mobile-app.html', 'mobile-app.js', 'mobile-deep-link.js']) {
    assert.match(serviceWorker, new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(serviceWorker, /const catalogPath = new URL\('\.\/catalog\.html'/);
  assert.match(serviceWorker, /pathname === catalogPath/);
  assert.match(serviceWorker, new RegExp(entryFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});
