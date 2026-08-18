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
    assert.match(workflow, new RegExp(fragment.replace(/[.*+?^${}()|\\]/g, '\\$&')));
  }
});

test('ratio change guard hard-codes the canonical bounds and rejects foreign root pages', () => {
  assert.match(scopeGuard, /const firstRatioPage = 272;/u);
  assert.match(scopeGuard, /const lastRatioPage = 319;/u);
  assert.match(scopeGuard, /Foreign canonical pages changed/u);
  assert.match(scopeGuard, /process\.exit\(1\)/u);
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

test('ratio workflow stays verification-only', () => {
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/u);
  assert.doesNotMatch(workflow, /contents:\s*write/u);
  assert.doesNotMatch(workflow, /git\s+(?:commit|push)/u);
});
