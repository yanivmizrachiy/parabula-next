import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('empty curriculum nodes remain in data but stay hidden from public navigation', async () => {
  const [css, catalogHtml, mobileHtml, serviceWorker] = await Promise.all([
    read('empty-topic-visibility.css'),
    read('catalog.html'),
    read('mobile-app.html'),
    read('sw.js')
  ]);

  assert.match(css, /\.toc-node\.is-empty[\s\S]*\.topic-node\.is-empty[\s\S]*display:\s*none\s*!important/);
  assert.match(catalogHtml, /empty-topic-visibility\.css/);
  assert.match(mobileHtml, /empty-topic-visibility\.css/);
  assert.match(serviceWorker, /\.\/empty-topic-visibility\.css/);
});
