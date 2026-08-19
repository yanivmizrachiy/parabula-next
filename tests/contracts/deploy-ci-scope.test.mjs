import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  buildCanonicalPythagorasPaths,
  classifyChangeScope,
  isMobileDeepRelevantPath,
  isMobileRelevantPath,
  isPythagorasRelevantPath,
} from '../../scripts/classify-ci-change-scope.mjs';

const root = process.cwd();
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'deploy-pages.yml'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
const pythagorasPaths = buildCanonicalPythagorasPaths(meta);

test('CI-only pull requests skip browser-heavy mobile and Pythagoras gates', () => {
  const result = classifyChangeScope({
    eventName: 'pull_request',
    changedFiles: [
      'scripts/verify-live-systems-workbook.mjs',
      '.github/workflows/systems-live-deploy-smoke.yml',
      'tests/contracts/two-variable-systems-live-deploy.test.mjs',
    ],
    pythagorasPaths,
  });

  assert.equal(result.mobile, false);
  assert.equal(result.mobileDeep, false);
  assert.equal(result.pythagoras, false);
});

test('page and topic edits run fast mobile gates but not the whole-site deep mobile audit', () => {
  const localPageChange = classifyChangeScope({
    eventName: 'push',
    changedFiles: ['עמוד-639.html', 'styles/pages/עמוד-639.css'],
    pythagorasPaths,
  });
  assert.equal(localPageChange.mobile, true);
  assert.equal(localPageChange.mobileDeep, false);
  assert.equal(localPageChange.pythagoras, true);

  assert.equal(isMobileRelevantPath('עמוד-639.html'), true);
  assert.equal(isMobileDeepRelevantPath('עמוד-639.html'), false);
  assert.equal(isMobileRelevantPath('styles/pages/עמוד-639.css'), true);
  assert.equal(isMobileDeepRelevantPath('styles/pages/עמוד-639.css'), false);
});

test('global mobile/runtime changes require the expensive all-pages mobile audit', () => {
  for (const file of ['mobile-app.js', 'reader-actions.css', 'sw.js', 'styles/a4-base.css']) {
    assert.equal(isMobileDeepRelevantPath(file), true, `${file} should require deep mobile validation`);
  }

  const result = classifyChangeScope({
    eventName: 'push',
    changedFiles: ['styles/a4-base.css'],
    pythagorasPaths,
  });
  assert.equal(result.mobile, true);
  assert.equal(result.mobileDeep, true);
});

test('workflow-only edits stay on the fast build path', () => {
  const file = '.github/workflows/deploy-pages.yml';
  assert.equal(isMobileRelevantPath(file), false);
  assert.equal(isMobileDeepRelevantPath(file), false);
  assert.equal(isPythagorasRelevantPath(file, pythagorasPaths), false);

  const result = classifyChangeScope({
    eventName: 'push',
    changedFiles: [file, 'scripts/verify-live-build.mjs', 'scripts/write-build-info.mjs'],
    pythagorasPaths,
  });
  assert.equal(result.mobile, false);
  assert.equal(result.mobileDeep, false);
  assert.equal(result.pythagoras, false);
});

test('canonical Pythagoras pages, CSS and shared infrastructure require the Pythagoras gate', () => {
  const canonicalPage = [...pythagorasPaths].find((file) => /^עמוד-\d+\.html$/u.test(file));
  const canonicalCss = [...pythagorasPaths].find((file) => /^styles\/pages\/עמוד-\d+\.css$/u.test(file));
  assert.ok(canonicalPage);
  assert.ok(canonicalCss);
  assert.equal(isPythagorasRelevantPath(canonicalPage, pythagorasPaths), true);
  assert.equal(isPythagorasRelevantPath(canonicalCss, pythagorasPaths), true);
  assert.equal(isPythagorasRelevantPath('styles/topics/pythagoras-power-practice.css', pythagorasPaths), true);
  assert.equal(isPythagorasRelevantPath('עמוד-609.html', pythagorasPaths), false);
});

test('unrelated main pushes do not run browser-heavy gates; manual releases still run everything', () => {
  const unrelatedPush = classifyChangeScope({
    eventName: 'push',
    changedFiles: ['README.md'],
    pythagorasPaths,
  });
  assert.equal(unrelatedPush.mobile, false);
  assert.equal(unrelatedPush.mobileDeep, false);
  assert.equal(unrelatedPush.pythagoras, false);

  const manual = classifyChangeScope({ eventName: 'workflow_dispatch', changedFiles: [], pythagorasPaths });
  assert.equal(manual.mobile, true);
  assert.equal(manual.mobileDeep, true);
  assert.equal(manual.pythagoras, true);
});

test('deploy workflow uses scoped gates and verifies the commit that became live', () => {
  assert.match(workflow, /mobile_deep:\s*\$\{\{ steps\.classify\.outputs\.mobile_deep \}\}/);
  assert.match(workflow, /mobile-browser-gate:\s*\n\s+needs: scope\s*\n\s+if: needs\.scope\.outputs\.mobile == 'true'/);
  assert.match(workflow, /mobile-interaction-gate:\s*\n\s+needs: scope\s*\n\s+if: needs\.scope\.outputs\.mobile == 'true'/);
  assert.match(workflow, /mobile-deep-gate:\s*\n\s+needs: scope\s*\n\s+if: github\.event_name != 'pull_request' && needs\.scope\.outputs\.mobile_deep == 'true'/);
  assert.match(workflow, /needs\.mobile-deep-gate\.result == 'success' \|\| needs\.mobile-deep-gate\.result == 'skipped'/);
  assert.match(workflow, /needs\.mobile-browser-gate\.result == 'success' \|\| needs\.mobile-browser-gate\.result == 'skipped'/);
  assert.match(workflow, /needs\.mobile-interaction-gate\.result == 'success' \|\| needs\.mobile-interaction-gate\.result == 'skipped'/);
  assert.match(workflow, /node scripts\/write-build-info\.mjs dist "\$GITHUB_SHA"/);
  assert.match(workflow, /Verify live deployment commit/);
  assert.match(workflow, /node scripts\/verify-live-build\.mjs "\$PAGE_URL" "\$EXPECTED_SHA"/);
});
