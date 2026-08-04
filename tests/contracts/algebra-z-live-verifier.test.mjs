import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const verifier = fs.readFileSync('scripts/verify-algebra-z-live.mjs', 'utf8');
const workflow = fs.readFileSync('.github/workflows/algebra-z-live-smoke.yml', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

test('live verifier enforces the public strict-local release contract', () => {
  for (const token of [
    '2.1.0-strict-local',
    'strict-local',
    'strictLocalReady',
    'assertLocalPdf',
    'fallbackDriveId',
    'drive.google.com',
    'drive.usercontent.google.com',
    '/Count'
  ]) {
    assert.ok(verifier.includes(token), `verifier is missing ${token}`);
  }

  for (const id of [
    'colorMode',
    'bwMode',
    'downloadButton',
    'openButton',
    'fullscreenButton',
    'pdfFrame'
  ]) {
    assert.ok(verifier.includes(id), `verifier is missing #${id}`);
  }
});

test('package exposes CLI commands for live verification', () => {
  assert.equal(
    packageJson.scripts['algebra-z:live'],
    'node scripts/verify-algebra-z-live.mjs'
  );
  assert.equal(
    packageJson.scripts['algebra-z:live:browser'],
    'node scripts/verify-algebra-z-live.mjs --browser'
  );
});

test('GitHub Actions continuously verifies the live deployment', () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /Validate and deploy parabula-next/);
  assert.match(workflow, /verify-algebra-z-live\.mjs/);
  assert.match(workflow, /playwright install --with-deps chromium/);
});
