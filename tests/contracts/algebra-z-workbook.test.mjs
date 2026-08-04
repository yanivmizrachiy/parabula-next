import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const manifestRaw = fs.readFileSync('meta/algebra-z-workbook.json', 'utf8');
const manifest = JSON.parse(manifestRaw);
const html = fs.readFileSync('algebra-z-workbook.html', 'utf8');
const js = fs.readFileSync('algebra-z-workbook.js', 'utf8');
const css = fs.readFileSync('algebra-z-workbook.css', 'utf8');

test('algebra-z manifest preserves the 15-page dual-output local contract', () => {
  assert.equal(manifest.pageCount, 15);
  assert.equal(manifest.format, 'A4');
  assert.equal(manifest.migration.strategy, 'strict-local');
  assert.equal(manifest.migration.strictLocalReady, true);
  assert.deepEqual(Object.keys(manifest.files).sort(), ['bw', 'color']);
  for (const file of Object.values(manifest.files)) {
    assert.match(file.path, /^assets\/workbooks\/algebra-z\/downloads\/algebra-z-(?:color|bw)\.pdf$/);
    assert.match(file.sha256, /^[a-f0-9]{64}$/);
    assert.ok(file.bytes > 100_000);
    assert.equal('fallbackDriveId' in file, false);
  }
});

test('algebra-z viewer exposes all essential reading and print actions', () => {
  for (const id of ['colorMode', 'bwMode', 'prevPage', 'nextPage', 'pageNumber', 'zoomMode', 'downloadButton', 'openButton', 'fullscreenButton', 'pdfFrame']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(css, /\.viewer-panel:fullscreen/);
  assert.match(js, /assertLocalPdf/);
});

test('algebra-z public runtime has no Google Drive dependency', () => {
  const runtime = `${manifestRaw}\n${html}\n${js}`;
  assert.doesNotMatch(runtime, /drive\.google\.com/);
  assert.doesNotMatch(runtime, /drive\.usercontent\.google\.com/);
  assert.doesNotMatch(runtime, /fallbackDriveId/);
});

test('algebra-z viewer carries the exact district credits', () => {
  const first = 'יניב רז - מדריך מחוזי חט״ב בעיר ירושלים';
  const second = 'הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין';
  assert.deepEqual(manifest.credits, [first, second]);
  assert.ok(html.includes(first));
  assert.ok(html.includes(second));
});

// BEGIN APPROVED LOGO-FREE ALGEBRA-Z RELEASE
test('algebra-z PDFs are the approved logo-free release', () => {
  assert.equal(manifest.presentation?.logoRemoved, true);
  assert.deepEqual(
    {
      color: manifest.files.color.sha256,
      bw: manifest.files.bw.sha256
    },
    {
      color: 'c2efa89f9e71384e60a29bfed96a0ffe55a56905a57ab42b273b06afd6deaff8',
      bw: '64658224a48acf9b682dcec4a8e00fa157910cbd01964a7ad92f00eae4535024'
    }
  );
});
// END APPROVED LOGO-FREE ALGEBRA-Z RELEASE
