import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const importScript = fs.readFileSync('scripts/import-ratio-workbook.mjs', 'utf8');
const workflow = fs.readFileSync('.github/workflows/ratio-workbook-v2.yml', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

test('ratio import is read-only unless --write is explicit', () => {
  assert.match(importScript, /process\.argv\.includes\('--write'\)/);
  assert.match(importScript, /Read-only preflight complete/);
  assert.match(packageJson.scripts['ratio:import:check'], /import-ratio-workbook\.mjs$/);
  assert.match(packageJson.scripts['ratio:import:write'], /import-ratio-workbook\.mjs --write$/);
});

test('ratio import validates all 48 images before any write', () => {
  const validationIndex = importScript.indexOf('const missingImages');
  const writeIndex = importScript.indexOf("if (!writeMode)");
  const firstWriteIndex = importScript.indexOf('fs.writeFileSync(temporary');
  assert.ok(validationIndex >= 0, 'missing image preflight was not found');
  assert.ok(writeIndex > validationIndex, 'write-mode gate must follow image preflight');
  assert.ok(firstWriteIndex > writeIndex, 'filesystem writes must occur only after the write-mode gate');
});

test('ratio import does not hide A4 overflow', () => {
  assert.doesNotMatch(importScript, /\.ratio-import-page\s*\{[^}]*overflow\s*:\s*hidden/s);
});

test('ratio import preserves cross-topic navigation', () => {
  assert.match(importScript, /previousBookPage/);
  assert.match(importScript, /nextBookPage/);
  assert.match(importScript, /previousGlobalPage/);
  assert.match(importScript, /nextGlobalPage/);
});

test('ratio CI is verification-only', () => {
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
  assert.doesNotMatch(workflow, /git\s+commit/);
  assert.doesNotMatch(workflow, /git\s+push/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.match(workflow, /Verify generated images are committed and current/);
});
