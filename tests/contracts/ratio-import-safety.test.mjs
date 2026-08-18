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

test('legacy PNG write is blocked when the semantic exporter exists', () => {
  assert.match(importScript, /semanticExporterPath/);
  assert.match(importScript, /Legacy ratio PNG import write is disabled/);
  assert.match(importScript, /export-ratio-workbook-live\.mjs --write/);
});

test('ratio import validates all 48 images before any legacy write path', () => {
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

test('ratio verification stays read-only while verified output materialization is isolated', () => {
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);

  const verifyStart = workflow.indexOf('verify-render-and-audit:');
  const materializeStart = workflow.indexOf('materialize-verified-print-output:');
  assert.ok(verifyStart >= 0 && materializeStart > verifyStart, 'verification/materialization jobs are missing or out of order');

  const verifyJob = workflow.slice(verifyStart, materializeStart);
  const materializeJob = workflow.slice(materializeStart);

  assert.doesNotMatch(verifyJob, /contents:\s*write/);
  assert.doesNotMatch(verifyJob, /git\s+(?:commit|push)/);
  assert.match(verifyJob, /Verify committed derived images on canonical\/bot revisions/);
  assert.match(verifyJob, /Protect every non-ratio page from this change/);

  assert.match(materializeJob, /needs:\s*verify-render-and-audit/);
  assert.match(materializeJob, /github\.event_name == 'pull_request'/);
  assert.match(materializeJob, /github\.head_ref == 'agent\/ratio-safe-upgrade-20260818'/);
  assert.match(materializeJob, /github\.actor != 'github-actions\[bot\]'/);
  assert.match(materializeJob, /permissions:\s*\n\s*contents:\s*write/);
  assert.match(materializeJob, /Reject every staged file outside ratio print scope/);
  assert.match(materializeJob, /git commit -m 'chore\(יחס\): materialize verified 48-page print output'/);
  assert.match(materializeJob, /git push origin HEAD:agent\/ratio-safe-upgrade-20260818/);
});
