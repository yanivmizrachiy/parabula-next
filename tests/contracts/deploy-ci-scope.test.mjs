import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  buildCanonicalPythagorasPaths,
  classifyChangeScope,
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
  assert.equal(result.pythagoras, false);
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

  assert.equal(classifyChangeScope({ eventName: 'pull_request', changedFiles: relevant, pythagorasPaths }).mobile, true);
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

  const result = classifyChangeScope({
    eventName: 'pull_request',
    changedFiles: [canonicalPage],
    pythagorasPaths,
  });
  assert.equal(result.pythagoras, true);
});

test('pushes always run mobile validation but only relevant pushes run heavy Pythagoras validation', () => {
  const unrelatedPush = classifyChangeScope({
    eventName: 'push',
    changedFiles: ['README.md'],
    pythagorasPaths,
  });
  assert.equal(unrelatedPush.mobile, true);
  assert.equal(unrelatedPush.pythagoras, false);

  const relevantPush = classifyChangeScope({
    eventName: 'push',
    changedFiles: ['styles/topics/pythagoras-power-practice.css'],
    pythagorasPaths,
  });
  assert.equal(relevantPush.mobile, true);
  assert.equal(relevantPush.pythagoras, true);

  const manual = classifyChangeScope({ eventName: 'workflow_dispatch', changedFiles: [], pythagorasPaths });
  assert.equal(manual.mobile, true);
  assert.equal(manual.pythagoras, true);
});

test('deploy workflow uses the classifier for mobile and Pythagoras browser gates', () => {
  assert.match(workflow, /scope:\s*\n\s+runs-on: ubuntu-latest/);
  assert.match(workflow, /node scripts\/classify-ci-change-scope\.mjs/);
  assert.match(workflow, /mobile-browser-gate:\s*\n\s+needs: scope\s*\n\s+if: needs\.scope\.outputs\.mobile == 'true'/);
  assert.match(workflow, /mobile-interaction-gate:\s*\n\s+needs: scope\s*\n\s+if: needs\.scope\.outputs\.mobile == 'true'/);
  assert.match(workflow, /pythagoras-browser-gate:\s*\n\s+needs: scope\s*\n\s+if: needs\.scope\.outputs\.pythagoras == 'true'/);
  assert.match(workflow, /mobile-deep-gate:\s*\n\s+if: github\.event_name != 'pull_request'/);
  assert.match(workflow, /needs: \[build, mobile-browser-gate, mobile-interaction-gate, mobile-deep-gate, pythagoras-browser-gate\]/);
});
