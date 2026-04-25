import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

function pageFilesFrom(payload) {
  return payload.topics.flatMap((topic) => topic.pages || []).map((page) => page.file);
}

test('meta/topics.json and mobile-topics.json stay in sync', () => {
  const canonical = readJson('meta/topics.json');
  const mobile = readJson('mobile-topics.json');

  assert.deepEqual(mobile, canonical, 'mobile-topics.json must stay identical to meta/topics.json');
});

test('meta/topics.json only references real canonical root pages', () => {
  const payload = readJson('meta/topics.json');
  const pages = payload.topics.flatMap((topic) => topic.pages || []);
  const seen = new Set();

  assert.ok(Array.isArray(payload.topics), 'meta/topics.json must include topics');
  assert.equal(typeof payload.totalPages, 'number', 'meta/topics.json must declare totalPages');
  assert.equal(pages.length, payload.totalPages, 'totalPages must match actual page count');

  for (const page of pages) {
    assert.match(page.file, /^עמוד-\d+\.html$/u, `unexpected page file: ${page.file}`);
    assert.equal(page.previewPath, `/${page.file}`, `${page.file}: previewPath must point to the real root page`);
    assert.ok(page.siteUrl.includes(`/${page.file}`), `${page.file}: siteUrl must point to the real published page`);
    assert.ok(fs.existsSync(path.join(root, page.file)), `${page.file}: missing canonical root page`);
    assert.ok(!seen.has(page.file), `${page.file}: duplicate metadata entry`);
    seen.add(page.file);
  }
});

test('metadata page count matches the repository root pages', () => {
  const payload = readJson('meta/topics.json');
  const metaFiles = pageFilesFrom(payload).sort((a, b) => a.localeCompare(b, 'he'));
  const repoFiles = fs
    .readdirSync(root)
    .filter((name) => /^עמוד-\d+\.html$/u.test(name))
    .sort((a, b) => a.localeCompare(b, 'he'));

  assert.deepEqual(metaFiles, repoFiles, 'metadata must cover every canonical root worksheet page exactly once');
});
