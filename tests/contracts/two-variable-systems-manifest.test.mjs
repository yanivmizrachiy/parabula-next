import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const manifestPath = path.join(root, 'meta', 'two-variable-systems-manifest.json');

const runAudit = (...args) => spawnSync(
  process.execPath,
  ['scripts/audit-two-variable-systems.mjs', ...args],
  { cwd: root, encoding: 'utf8' },
);

test('systems workbook manifest is current and structurally valid', () => {
  const result = runAudit('--check');
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /16 pages · 69 tasks/);
});

test('systems workbook manifest records the complete progression', () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.topic, 'מערכת משוואות בשני נעלמים');
  assert.equal(manifest.entryPage, 609);
  assert.equal(manifest.totalPages, 16);
  assert.equal(manifest.totalTasks, 69);
  assert.deepEqual(manifest.pageOrder, [609, 601, 602, 603, 604, 605, 606, 607, 608, 610, 611, 612, 613, 614, 615, 616]);
  assert.deepEqual(manifest.taskKindTotals, {
    systems: 43,
    stories: 5,
    classification: 3,
    challenge: 15,
    reasoning: 3,
  });
  assert.equal(manifest.pages.reduce((sum, page) => sum + page.taskCount, 0), manifest.totalTasks);
});
