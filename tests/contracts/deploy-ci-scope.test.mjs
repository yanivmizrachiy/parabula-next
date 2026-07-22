import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { classifyChangeScope, isMobileRelevantPath } from '../../scripts/classify-ci-change-scope.mjs';

const root = process.cwd();
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'deploy-pages.yml'), 'utf8');

test('CI-only pull requests skip browser-heavy mobile gates', () => {
  const result = classifyChangeScope({
    eventName: 'pull_request',
    changedFiles: [
      'scripts/verify-live-systems-workbook.mjs',
      '.github/workflows/systems-live-deploy-smoke.yml',
      'tests/contracts/two-variable-systems-live-deploy.test.mjs',
    ],
  });

  assert.equal(result.mobile, false);
});

test('reader, A4, style, asset, PWA and build changes require mobile gates', () => {
  const relevant = [
    'mobile-app.js',
    'catalog-deep-link.js',
    'reader-actions.css',
    'עמוד-609.html',
    'styles/topics/two-variable-systems.css',
    'assets/example.png',
    'sw.js',
    'package-lock.json',
    '.github/workflows/deploy-pages.yml',
  ];

  for (const file of relevant) {
    assert.equal(isMobileRelevantPath(file), true, `${file} should require mobile validation`);
  }

  assert.equal(classifyChangeScope({ eventName: 'pull_request', changedFiles: relevant }).mobile, true);
});

test('pushes and manual releases always run mobile validation', () => {
  assert.equal(classifyChangeScope({ eventName: 'push', changedFiles: [] }).mobile, true);
  assert.equal(classifyChangeScope({ eventName: 'workflow_dispatch', changedFiles: [] }).mobile, true);
});

test('deploy workflow uses the classifier for both browser-heavy PR gates', () => {
  assert.match(workflow, /scope:\s*\n\s+runs-on: ubuntu-latest/);
  assert.match(workflow, /node scripts\/classify-ci-change-scope\.mjs/);
  assert.match(workflow, /mobile-browser-gate:\s*\n\s+needs: scope\s*\n\s+if: needs\.scope\.outputs\.mobile == 'true'/);
  assert.match(workflow, /mobile-interaction-gate:\s*\n\s+needs: scope\s*\n\s+if: needs\.scope\.outputs\.mobile == 'true'/);
  assert.match(workflow, /mobile-deep-gate:\s*\n\s+if: github\.event_name != 'pull_request'/);
});
