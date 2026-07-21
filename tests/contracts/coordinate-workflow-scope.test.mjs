import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const workflow = fs.readFileSync(
  path.join(process.cwd(), '.github', 'workflows', 'build-coordinate-first-quadrant.yml'),
  'utf8',
);

const triggerSection = workflow.slice(0, workflow.indexOf('\npermissions:'));

test('coordinate workbook workflow uses positive path filters', () => {
  assert.match(triggerSection, /push:[\s\S]*paths:/);
  assert.match(triggerSection, /pull_request:[\s\S]*paths:/);
  assert.doesNotMatch(triggerSection, /paths-ignore:/);
});

test('coordinate workflow runs for source and automation changes', () => {
  for (const requiredPath of [
    '.github/workflows/build-coordinate-first-quadrant.yml',
    'projects/coordinate-first-quadrant-workbook/**',
    'scripts/import-first-quadrant-workbook.mjs',
  ]) {
    assert.match(triggerSection, new RegExp(requiredPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('generated coordinate outputs do not retrigger the workflow', () => {
  for (const ignoredPath of [
    '!projects/coordinate-first-quadrant-workbook/dist/**',
    '!projects/coordinate-first-quadrant-workbook/downloads/**',
    '!projects/coordinate-first-quadrant-workbook/preview/**',
    '!projects/coordinate-first-quadrant-workbook/audit/generated-audit.json',
    '!projects/coordinate-first-quadrant-workbook/audit/build.log',
    '!projects/coordinate-first-quadrant-workbook/SHA256SUMS.txt',
  ]) {
    assert.match(triggerSection, new RegExp(ignoredPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
