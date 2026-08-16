import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const exporter = fs.readFileSync('scripts/export-ratio-workbook-live.mjs', 'utf8');
const workflow = fs.readFileSync('.github/workflows/ratio-workbook-v2.yml', 'utf8');

test('semantic canonical exporter is read-only unless --write is explicit', () => {
  assert.match(exporter, /process\.argv\.includes\('--write'\)/);
  assert.match(exporter, /Read-only semantic canonical preflight complete\. No repository files were written\./);
  assert.match(exporter, /mkdtemp\(path\.join\(os\.tmpdir\(\), 'ratio-live-candidate-'\)\)/);
});

test('semantic canonical exporter rejects raster full-page dependencies and nested A4', () => {
  assert.match(exporter, /full-page PNG/);
  assert.match(exporter, /nested worksheet page detected/);
  assert.match(exporter, /expected one A4 root/);
  assert.match(exporter, /content vertical overflow/);
  assert.match(exporter, /footer overlaps worksheet content/);
});

test('semantic canonical wrapper never hides overflow', () => {
  assert.match(exporter, /\.ratio-live-page \{[\s\S]*?overflow: visible;/);
  assert.doesNotMatch(exporter, /\.ratio-live-page \{[\s\S]*?overflow:\s*hidden;/);
});

test('semantic canonical exporter derives cross-topic navigation from metadata', () => {
  assert.match(exporter, /previousBookPage/);
  assert.match(exporter, /nextBookPage/);
  assert.match(exporter, /ratioTopic\.pages\[index\]\?\.number/);
  assert.match(exporter, /expected = firstGlobalPage \+ index/);
});

test('semantic canonical exporter audits all 48 candidates before any repository write', () => {
  assert.match(exporter, /const pageCount = 48/);
  const auditIndex = exporter.indexOf("if (findings.length > 0)");
  const writeIndex = exporter.indexOf('await writeCandidateToRepository()');
  assert.ok(auditIndex >= 0, 'candidate audit gate is missing');
  assert.ok(writeIndex > auditIndex, 'repository write must occur only after candidate audit');
});

test('ratio verification workflow remains read-only', () => {
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /git\s+(commit|push)/);
});
