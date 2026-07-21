import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const gateHtml = fs.readFileSync(path.join(root, 'systems-workbook.html'), 'utf8');
const catalogJs = fs.readFileSync(path.join(root, 'catalog.js'), 'utf8');
const mobileHtml = fs.readFileSync(path.join(root, 'mobile-app.html'), 'utf8');
const mobileJs = fs.readFileSync(path.join(root, 'mobile-app.js'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const copyStaticSite = fs.readFileSync(path.join(root, 'scripts', 'copy-static-site.mjs'), 'utf8');

const entryFile = 'עמוד-609.html';

test('systems workbook link is a smart RTL gateway to the canonical readers', () => {
  assert.match(gateHtml, /<html lang="he" dir="rtl">/);
  assert.match(gateHtml, /const ENTRY_FILE = 'עמוד-609\.html'/);
  assert.match(gateHtml, /\.\/catalog\.html/);
  assert.match(gateHtml, /\.\/mobile-app\.html/);
  assert.match(gateHtml, /parabula-catalog:last-file/);
  assert.match(gateHtml, /window\.location\.replace\(target\.href\)/);
  assert.match(gateHtml, /max-width: 820px/);
  assert.match(gateHtml, /pointer: coarse/);
});

test('desktop canonical reader opens the requested systems page from the gateway', () => {
  assert.match(catalogJs, /const LS_POS = 'parabula-catalog:last-file'/);
  assert.match(catalogJs, /localStorage\.getItem\(LS_POS\)/);
  assert.match(catalogJs, /state\.pages\.findIndex\(\(p\) => p\.file === savedFile\)/);
  assert.match(catalogJs, /goTo\(startIdx >= 0 \? startIdx : 0/);
});

test('mobile canonical reader accepts and opens the requested systems page', () => {
  assert.match(mobileHtml, /requestedFile: params\.get\('file'\) \|\| ''/);
  assert.match(mobileJs, /bootConfig\.requestedFile/);
  assert.match(mobileJs, /\^עמוד-\\d\+\\\.html\$/);
  assert.match(mobileJs, /const first = requested \|\| findPage\(remembered\)/);
  assert.match(mobileJs, /syncCurrentPage\(first, \{ persist: !requested \}\)/);
});

test('gateway and canonical readers remain part of production and offline builds', () => {
  for (const asset of ['systems-workbook.html', 'catalog.html', 'catalog.js', 'mobile-app.html', 'mobile-app.js', 'meta/two-variable-systems-manifest.json']) {
    assert.match(copyStaticSite, new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(serviceWorker, /systems-workbook\.html/);
  assert.match(serviceWorker, /catalog\.html/);
  assert.match(serviceWorker, /mobile-app\.html/);
  assert.match(serviceWorker, new RegExp(entryFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});
