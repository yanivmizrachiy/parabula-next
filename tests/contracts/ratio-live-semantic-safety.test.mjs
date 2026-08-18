import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const exporter = fs.readFileSync('scripts/export-ratio-workbook-live.mjs', 'utf8');
const workflow = fs.readFileSync('.github/workflows/ratio-workbook-v2.yml', 'utf8');

test('semantic canonical exporter is read-only unless --write is explicit', () => {
  assert.match(exporter, /process\.argv\.includes\('--write'\)/);
  assert.match(exporter, /Read-only semantic canonical preflight complete[\s\S]*No repository files were written\./);
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

test('semantic canonical wrapper neutralizes shared A4 class collisions instead of changing worksheet content', () => {
  assert.match(exporter, /\.ratio-live-page > \.header-container \{\s*margin-bottom: 0;/);
  assert.match(exporter, /\.ratio-live-page \.page-title \{[\s\S]*?font-size: inherit;[\s\S]*?font-weight: inherit;/);
  assert.match(exporter, /\.ratio-live-page \.question-block \{\s*flex-direction: row;\s*justify-content: flex-start;/);
  assert.match(exporter, /\.ratio-live-page \.multiple-choice \{[\s\S]*?padding: 0;[\s\S]*?background: transparent;/);
});

test('semantic canonical exporter derives printed identity and cross-topic navigation from canonical metadata', () => {
  assert.match(exporter, /const ratioPages = sortedTopicPages\(ratioTopic, 'יחס'\)/);
  assert.match(exporter, /localPageNumberFromMetadata\(pageMeta\)/);
  assert.match(exporter, /canonicalTitle: pageMeta\.h1/);
  assert.match(exporter, /geometry\.headerTitle !== pageMeta\.h1/);
  assert.match(exporter, /geometry\.documentTitle !== pageMeta\.title/);
  assert.match(exporter, /const previousPages = sortedTopicPages\(/);
  assert.match(exporter, /const nextPages = sortedTopicPages\(/);
  assert.match(exporter, /previousPages\.at\(-1\)\?\.number/);
  assert.match(exporter, /nextPages\[0\]\?\.number/);
  assert.match(exporter, /previous navigation mismatch/);
  assert.match(exporter, /next navigation mismatch/);
});

test('semantic canonical exporter audits all 48 candidates before any repository write', () => {
  assert.match(exporter, /const pageCount = 48/);
  const auditIndex = exporter.indexOf("if (findings.length > 0)");
  const writeIndex = exporter.indexOf('await writeCandidateToRepository()');
  assert.ok(auditIndex >= 0, 'candidate audit gate is missing');
  assert.ok(writeIndex > auditIndex, 'repository write must occur only after candidate audit');
});

test('ratio verification stays read-only and branch write is isolated to a post-verification job', () => {
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
  const verifyStart = workflow.indexOf('verify-render-and-audit:');
  const materializeStart = workflow.indexOf('materialize-verified-print-output:');
  assert.ok(verifyStart >= 0 && materializeStart > verifyStart, 'verification/materialization jobs are missing or out of order');

  const verifyJob = workflow.slice(verifyStart, materializeStart);
  const materializeJob = workflow.slice(materializeStart);
  assert.doesNotMatch(verifyJob, /contents:\s*write/);
  assert.doesNotMatch(verifyJob, /git\s+(commit|push)/);

  assert.match(materializeJob, /needs:\s*verify-render-and-audit/);
  assert.match(materializeJob, /github\.event_name == 'pull_request'/);
  assert.match(materializeJob, /github\.head_ref == 'agent\/ratio-safe-upgrade-20260818'/);
  assert.match(materializeJob, /github\.actor != 'github-actions\[bot\]'/);
  assert.match(materializeJob, /permissions:\s*\n\s*contents:\s*write/);
  assert.match(materializeJob, /Reject every staged file outside ratio print scope/);
  assert.match(materializeJob, /git commit -m 'chore\(יחס\): materialize verified 48-page print output'/);
  assert.match(materializeJob, /git push origin HEAD:agent\/ratio-safe-upgrade-20260818/);
});
