import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const firstGlobalPage = 272;
const pageCount = 48;

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

test('ratio canonical pages are live HTML rather than whole-page raster images', () => {
  for (let localPage = 1; localPage <= pageCount; localPage += 1) {
    const globalPage = firstGlobalPage + localPage - 1;
    const file = `עמוד-${globalPage}.html`;
    const html = read(file);
    const selectableText = html.replace(/<[^>]+>/gu, ' ').replace(/\s+/gu, ' ').trim();

    assert.equal(html.includes('ratio-import-image'), false, `${file}: raster import marker is forbidden`);
    assert.equal(html.includes('ratio-import-page'), false, `${file}: legacy raster page class is forbidden`);
    assert.ok(html.includes('ratio-live-page'), `${file}: missing live ratio page class`);
    assert.ok(html.includes('worksheet-page'), `${file}: missing semantic worksheet root`);
    assert.equal(/\sstyle\s*=\s*["']/u.test(html), false, `${file}: inline CSS is forbidden`);
    assert.ok(/<(?:section|article|div|p|table|svg)\b/iu.test(html), `${file}: missing live semantic or vector content`);
    assert.ok(selectableText.length > 40 || html.includes('<svg'), `${file}: page contains neither meaningful selectable text nor vector content`);

    const css = read(`styles/pages/עמוד-${globalPage}.css`);
    assert.equal(css.trim(), '@import url("../topics/ratio-live.css");', `${file}: wrong canonical ratio stylesheet`);
  }
});

test('ratio live stylesheet is local and does not call Google Fonts', () => {
  const cssPath = path.join(root, 'styles', 'topics', 'ratio-live.css');
  assert.ok(fs.existsSync(cssPath), 'Missing styles/topics/ratio-live.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.equal(css.includes('fonts.googleapis.com'), false, 'Remote Google Fonts import is forbidden');
  assert.ok(css.includes('.ratio-live-page'), 'Missing canonical ratio wrapper rules');
});

test('legacy raster importer requires an explicit destructive override', () => {
  const importer = read('scripts/import-ratio-workbook.mjs');
  assert.ok(importer.includes('--allow-raster-baseline'), 'Legacy importer is not guarded');
  assert.ok(importer.includes('Legacy ratio raster import is disabled'), 'Legacy importer lacks a clear safety failure');
});
