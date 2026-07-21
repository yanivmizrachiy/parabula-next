import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'systems-workbook.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'systems-workbook.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'systems-workbook.js'), 'utf8');

test('systems workbook app is a separate RTL shell that preserves worksheet pages', () => {
  assert.match(html, /<html lang="he" dir="rtl">/);
  assert.match(html, /id="workbook-frame"/);
  assert.match(html, /src="עמוד-609\.html"/);
  assert.match(html, /type="module" src="systems-workbook\.js"/);
  assert.match(html, /id="page-list"/);
  assert.match(html, /id="page-select"/);
  assert.match(html, /id="previous-button"/);
  assert.match(html, /id="next-button"/);
  assert.match(html, /id="print-page-button"/);
});

test('systems workbook app derives all pages from the canonical manifest', () => {
  assert.match(js, /meta\/two-variable-systems-manifest\.json/);
  assert.match(js, /manifest\.pages/);
  assert.match(js, /manifest\.totalPages/);
  assert.match(js, /manifest\.totalTasks/);
  assert.doesNotMatch(js, /const\s+pageOrder\s*=\s*\[/);
});

test('systems workbook app supports fast navigation and accessibility', () => {
  assert.match(js, /localStorage\.getItem/);
  assert.match(js, /history\[method\]/);
  assert.match(js, /touchstart/);
  assert.match(js, /touchend/);
  assert.match(js, /ArrowLeft/);
  assert.match(js, /ArrowRight/);
  assert.match(js, /contentWindow\?\.print/);
  assert.match(js, /navigator\.clipboard/);
  assert.match(css, /@media \(max-width: 980px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /button:focus-visible/);
});
