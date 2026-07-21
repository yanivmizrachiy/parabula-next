import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const gate = fs.readFileSync(path.join(root, 'systems-workbook.html'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'two-variable-systems-workbook.yml'), 'utf8');
const build = fs.readFileSync(path.join(root, 'scripts', 'copy-static-site.mjs'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

const legacyAssets = ['systems-workbook.css', 'systems-workbook.js'];

test('obsolete standalone systems reader assets are absent', () => {
  for (const asset of legacyAssets) {
    assert.equal(fs.existsSync(path.join(root, asset)), false, `${asset} must not return`);
  }
});

test('systems gateway uses only canonical desktop and mobile readers', () => {
  assert.match(gate, /\.\/catalog\.html/);
  assert.match(gate, /\.\/mobile-app\.html/);
  for (const asset of legacyAssets) assert.doesNotMatch(gate, new RegExp(asset.replace('.', '\\.')));
});

test('build, offline cache and dedicated workflow do not reference legacy assets', () => {
  for (const source of [build, serviceWorker, workflow]) {
    for (const asset of legacyAssets) {
      assert.doesNotMatch(source, new RegExp(asset.replace('.', '\\.')));
    }
  }
});

test('systems workflow watches both canonical readers and live verification', () => {
  for (const asset of [
    'catalog.html',
    'catalog.css',
    'catalog.js',
    'mobile-app.html',
    'mobile-app.css',
    'mobile-app.js',
    'scripts/verify-live-systems-workbook.mjs',
  ]) {
    assert.match(workflow, new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
