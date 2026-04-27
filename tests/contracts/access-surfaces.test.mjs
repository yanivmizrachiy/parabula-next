import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('preview app points to canonical topic, print, mobile, and state surfaces', () => {
  const html = read('preview/app.html');
  assert.ok(html.includes('./topics.html'), 'preview/app.html should link to topics');
  assert.ok(html.includes('./print.html'), 'preview/app.html should link to print center');
  assert.ok(html.includes('../mobile-app.html'), 'preview/app.html should link to canonical mobile app');
  assert.ok(html.includes('../STATE/README.md'), 'preview/app.html should link to STATE documentation');
});

test('compat phone entry redirects to canonical mobile app', () => {
  const html = read('preview/phone.html');
  assert.ok(html.includes('../mobile-app.html'), 'preview/phone.html should point to canonical mobile app');
});

test('mobile app uses print center preview handoff and book navigation', () => {
  const js = read('mobile-app.js');
  assert.ok(js.includes('./preview/print.html'), 'mobile-app.js should deep-link to preview/print.html');
  assert.ok(js.includes('autopreview'), 'mobile-app.js should request preview-before-print');
  assert.ok(js.includes('goBookRelative('), 'mobile-app.js should expose global book navigation');
});

test('print center supports URL-driven selection for preview-before-print', () => {
  const js = read('preview/print.js');
  assert.ok(js.includes("searchParams.get('files')"), 'preview/print.js should accept files query parameter');
  assert.ok(js.includes("searchParams.getAll('file')"), 'preview/print.js should accept repeated file query parameters');
});
