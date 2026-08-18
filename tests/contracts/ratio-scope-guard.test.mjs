import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflow = fs.readFileSync('.github/workflows/ratio-workbook-v2.yml', 'utf8');
const scopeGuard = fs.readFileSync('scripts/check-ratio-change-scope.mjs', 'utf8');

test('ratio workflow is scoped to canonical pages 272-319 instead of all worksheet pages', () => {
  assert.doesNotMatch(workflow, /['"]עמוד-\*\.html['"]/u);
  assert.doesNotMatch(workflow, /['"]styles\/pages\/עמוד-\*\.css['"]/u);

  for (const fragment of [
    'עמוד-27[2-9].html',
    'עמוד-28[0-9].html',
    'עמוד-29[0-9].html',
    'עמוד-30[0-9].html',
    'עמוד-31[0-9].html',
    'styles/pages/עמוד-27[2-9].css',
    'styles/pages/עמוד-31[0-9].css',
  ]) {
    assert.ok(workflow.includes(fragment), `missing exact ratio workflow glob: ${fragment}`);
  }
});

test('ratio change guard hard-codes the canonical bounds and rejects foreign root pages', () => {
  assert.match(scopeGuard, /const firstRatioPage = 272;/u);
  assert.match(scopeGuard, /const lastRatioPage = 319;/u);
  assert.match(scopeGuard, /Foreign canonical pages changed/u);
  assert.match(scopeGuard, /process\.exit\(1\)/u);
});

test('scope guard uses PR base or the previous push SHA instead of comparing main to itself', () => {
  assert.match(scopeGuard, /RATIO_SCOPE_BASE_SHA/u);
  assert.match(scopeGuard, /eventBaseSha \|\| `origin\/\$\{baseBranch\}`/u);
  assert.match(workflow, /RATIO_SCOPE_BASE_SHA:\s*\$\{\{ github\.event\.before \}\}/u);
  assert.match(workflow, /branches:\s*\n\s*- main/u);
  assert.doesNotMatch(workflow, /- fix\/ratio-workbook-deep-audit/u);
});

test('scope protection runs before dependency installation and all expensive checks', () => {
  const guardIndex = workflow.indexOf('Protect every non-ratio page from this change');
  const setupIndex = workflow.indexOf('Setup Node');
  const installIndex = workflow.indexOf('Install root dependencies');
  const renderIndex = workflow.indexOf('Render and audit all 48 A4 pages');

  assert.ok(guardIndex >= 0, 'ratio scope guard step is missing');
  assert.ok(setupIndex > guardIndex, 'scope guard must run before Node setup');
  assert.ok(installIndex > guardIndex, 'scope guard must run before dependency installation');
  assert.ok(renderIndex > guardIndex, 'scope guard must run before rendering');
});

test('verification is read-only and the only write job is branch-limited after verification', () => {
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/u);
  const verifyStart = workflow.indexOf('verify-render-and-audit:');
  const materializeStart = workflow.indexOf('materialize-verified-print-output:');
  assert.ok(verifyStart >= 0 && materializeStart > verifyStart);

  const verifyJob = workflow.slice(verifyStart, materializeStart);
  const materializeJob = workflow.slice(materializeStart);
  assert.doesNotMatch(verifyJob, /contents:\s*write/u);
  assert.doesNotMatch(verifyJob, /git\s+(?:commit|push)/u);
  assert.match(materializeJob, /needs:\s*verify-render-and-audit/u);
  assert.match(materializeJob, /github\.head_ref == 'agent\/ratio-safe-upgrade-20260818'/u);
  assert.match(materializeJob, /github\.actor != 'github-actions\[bot\]'/u);
  assert.match(materializeJob, /permissions:\s*\n\s*contents:\s*write/u);
  assert.match(materializeJob, /Reject every staged file outside ratio print scope/u);
});

test('materialize staged-file guard preserves exact UTF-8 paths', () => {
  const materializeStart = workflow.indexOf('materialize-verified-print-output:');
  assert.ok(materializeStart >= 0, 'materialize job is missing');
  const materializeJob = workflow.slice(materializeStart);

  assert.ok(
    materializeJob.includes("while IFS= read -r -d '' file; do"),
    'staged-file guard must read NUL-delimited paths',
  );
  assert.ok(
    materializeJob.includes('git diff --cached --name-only -z'),
    'staged-file guard must request unquoted NUL-delimited Git paths',
  );
  assert.doesNotMatch(
    materializeJob,
    /done < <\(git diff --cached --name-only\)\s*$/mu,
    'plain name-only output would reintroduce Git quoting for Hebrew filenames',
  );
});
