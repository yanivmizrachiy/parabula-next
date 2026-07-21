import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const guard = fs.readFileSync(path.join(root, '.github', 'workflows', 'equations-guard.yml'), 'utf8');
const app = fs.readFileSync(path.join(root, '.github', 'workflows', 'equations-app-validation.yml'), 'utf8');

function triggerSection(workflow) {
  return workflow.slice(0, workflow.indexOf('\npermissions:'));
}

const guardTriggers = triggerSection(guard);
const appTriggers = triggerSection(app);

test('worksheet guard no longer runs for preview-only application changes', () => {
  assert.doesNotMatch(guardTriggers, /preview\/\*\*/);
  assert.match(guardTriggers, /עמוד-\*\.html/);
  assert.match(guardTriggers, /styles\/pages\/\*\*/);
  assert.match(guardTriggers, /sources\/equations\/משוואות-52\.pdf/);
});

test('application validation no longer runs for every worksheet page change', () => {
  assert.doesNotMatch(appTriggers, /עמוד-\*\.html/);
  assert.doesNotMatch(appTriggers, /styles\/pages\/עמוד-\*\.css/);
  assert.match(appTriggers, /preview\/equations\.html/);
  assert.match(appTriggers, /preview\/print\.js/);
  assert.match(appTriggers, /preview\/topics\.js/);
});

test('shared application data still triggers app validation', () => {
  for (const requiredPath of [
    'meta/topics.json',
    'pages/משוואות/assets/page-*.svg',
    'scripts/validate-equations-suite.mjs',
    'package.json',
    'package-lock.json',
  ]) {
    assert.match(appTriggers, new RegExp(requiredPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('both workflows remain manually runnable and read-only', () => {
  for (const workflow of [guard, app]) {
    assert.match(workflow, /workflow_dispatch:/);
    assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  }
});
