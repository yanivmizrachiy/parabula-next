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

const topics = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
const systemsTopic = topics.topics.find((entry) => entry.name === 'מערכת משוואות בשני נעלמים');

test('systems workbook manifest is current and structurally valid', () => {
  const result = runAudit('--check');
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  // מספר העמודים גדל בכל פיצול (§4.6) — מספר המשימות הוא האינווריאנט הקבוע
  assert.match(result.stdout, new RegExp(`${systemsTopic.count} pages · 68 tasks`));
});

test('systems workbook manifest records the complete progression', () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.topic, 'מערכת משוואות בשני נעלמים');
  assert.equal(manifest.entryPage, 609);
  assert.equal(manifest.totalPages, systemsTopic.count);
  assert.equal(manifest.totalTasks, 68);
  assert.deepEqual(manifest.pageOrder, systemsTopic.pages.map((page) => page.number));
  // אף תרגיל לא נעלם ולא נוצר בפיצול — זה החוזה שחייב להישמר
  assert.deepEqual(manifest.taskKindTotals, {
    systems: 42,
    stories: 5,
    classification: 3,
    challenge: 15,
    reasoning: 3,
  });
  assert.equal(manifest.pages.reduce((sum, page) => sum + page.taskCount, 0), manifest.totalTasks);
});
