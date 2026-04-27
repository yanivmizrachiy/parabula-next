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
  assert.ok(js.includes("new URL(relativeFile, window.location.href).href"), 'mobile-app.js should resolve worksheet pages on the current origin');
  assert.ok(js.includes('readerNotice'), 'mobile-app.js should expose reader notice feedback');
  assert.ok(js.includes('READER_MODES'), 'mobile-app.js should expose explicit reader modes');
  assert.ok(js.includes('mobile-reader-stage'), 'mobile-app.js should build a dedicated mobile reader stage');
});

test('mobile app protects topic-local page ordering before file-number ordering', () => {
  const js = read('mobile-app.js');
  assert.ok(js.includes('function pageLocalOrder(page)'), 'mobile-app.js should define pageLocalOrder');
  assert.ok(js.includes('function sortTopicPages(pages)'), 'mobile-app.js should define sortTopicPages');
  assert.ok(js.includes('const firstPage = sortTopicPages(topic.pages || [])[0];'), 'topic entry should use topic-local ordering for first page');
  assert.ok(js.includes('visiblePages = sortTopicPages(topic?.pages || []).filter'), 'visible topic page list should use topic-local ordering');
  assert.ok(js.includes('flatPages = (db.topics || []).flatMap(t => sortTopicPages(t.pages || []));'), 'global book order should preserve topic order and topic-local page order');
});

test('print center supports URL-driven selection for preview-before-print', () => {
  const js = read('preview/print.js');
  assert.ok(js.includes("searchParams.get('files')"), 'preview/print.js should accept files query parameter');
  assert.ok(js.includes("searchParams.getAll('file')"), 'preview/print.js should accept repeated file query parameters');
  assert.ok(js.includes("searchParams.get('source')"), 'preview/print.js should detect handoff source');
});

test('mobile app html exposes install and reader guidance controls', () => {
  const html = read('mobile-app.html');
  assert.ok(html.includes('id="openInstallBtn"'), 'mobile-app.html should expose install entry button');
  assert.ok(html.includes('id="readerNotice"'), 'mobile-app.html should expose reader notice region');
  assert.ok(html.includes('id="readerModeFullBtn"'), 'mobile-app.html should expose full-page reader mode control');
  assert.ok(html.includes('id="readerModeZoomBtn"'), 'mobile-app.html should expose enlarged reader mode control');
});

test('mobile install flow keeps manifest and script wiring', () => {
  const html = read('mobile-app-install.html');
  const js = read('mobile-app-install.js');
  assert.ok(html.includes('mobile-app.webmanifest'), 'mobile-app-install.html should load the mobile manifest');
  assert.ok(html.includes('mobile-app-install.js'), 'mobile-app-install.html should load the install script');
  assert.ok(js.includes('beforeinstallprompt'), 'mobile-app-install.js should handle beforeinstallprompt');
  assert.ok(js.includes('display-mode: standalone'), 'mobile-app-install.js should detect standalone mode');
});
