import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();
const exporterPath = path.join(root, 'sources', 'lovable', 'ratio-workbook', 'scripts', 'export-semantic-pages.mjs');
const packagePath = path.join(root, 'sources', 'lovable', 'ratio-workbook', 'package.json');

const exporter = fs.readFileSync(exporterPath, 'utf8');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

test('semantic ratio export is check-only unless --write is explicit', () => {
  assert.match(exporter, /process\.argv\.includes\('--write'\)/);
  assert.match(exporter, /if \(!writeMode\)/);
  assert.match(exporter, /No files were written/);
});

test('semantic export never writes canonical root pages', () => {
  assert.match(exporter, /preview['"], 'ratio-semantic'/);
  assert.doesNotMatch(exporter, /path\.join\(repoRoot, `עמוד-/);
  assert.match(exporter, /canonicalPagesChanged: false/);
});

test('semantic export rejects full-page ratio PNG dependencies', () => {
  assert.match(exporter, /assets\\\/ratio\\\/page-/);
  assert.match(exporter, /still contains a full-page PNG dependency/);
});

test('semantic export preserves all 48 source pages as the invariant', () => {
  assert.match(exporter, /pages\.length !== 48/);
  assert.match(exporter, /Expected 48 ratio source pages/);
});

test('package exposes separate pilot and all-page check/write commands', () => {
  const scripts = packageJson.scripts || {};
  assert.equal(scripts['semantic:pilot:check'], 'node scripts/export-semantic-pages.mjs --page=1');
  assert.match(scripts['semantic:pilot:write'], /--page=1 --write/);
  assert.equal(scripts['semantic:all:check'], 'node scripts/export-semantic-pages.mjs --all');
  assert.match(scripts['semantic:all:write'], /--all --write/);
});
