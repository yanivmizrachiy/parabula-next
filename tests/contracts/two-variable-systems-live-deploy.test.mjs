import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const script = fs.readFileSync(path.join(root, 'scripts', 'verify-live-systems-workbook.mjs'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'systems-live-deploy-smoke.yml'), 'utf8');

test('live verification derives the expected state from canonical repository data', () => {
  assert.match(script, /meta['"], 'two-variable-systems-manifest\.json'/);
  assert.match(script, /meta['"], 'topics\.json'/);
  assert.match(script, /process\.env\.SITE_URL \|\| topics\.siteUrl/);
  assert.doesNotMatch(script, /totalPages\s*===\s*16/);
  assert.doesNotMatch(script, /totalTasks\s*===\s*69/);
});

test('live verification checks the gateway, both history controllers and every page', () => {
  assert.match(script, /systems-workbook\.html/);
  assert.match(script, /catalog\.html/);
  assert.match(script, /const deepLinkScript = extractAsset/);
  assert.match(script, /catalog deep-link script/);
  assert.match(script, /mobile-app\.html/);
  assert.match(script, /const mobileDeepLinkScript = extractAsset/);
  assert.match(script, /mobile deep-link script/);
  assert.match(script, /target\.searchParams\.set\('file', requested\)/);
  assert.match(script, /searchParams\.get\('file'\)/);
  assert.match(script, /MutationObserver/);
  assert.match(script, /popstate/);
  assert.match(script, /window\.location\.reload\(\)/);
  assert.match(script, /bootConfig\.requestedFile/);
  assert.match(script, /liveManifest\.pages\.map/);
  assert.match(script, /class=\\?"a4-page/);
  assert.match(script, /JSON\.stringify\(liveManifest\) === JSON\.stringify\(expectedManifest\)/);
});

test('live verification rejects unresolved versions and stale local-storage routing', () => {
  assert.match(script, /__MOBILE_VERSION__/);
  assert.match(script, /!gateHtml\.includes\('parabula-catalog:last-file'\)/);
  assert.match(script, /!catalogHtml\.includes\('__MOBILE_VERSION__'\)/);
  assert.match(script, /!mobileHtml\.includes\('__MOBILE_VERSION__'\)/);
});

test('live verification retries after deployment propagation and bypasses stale caches', () => {
  assert.match(script, /LIVE_SMOKE_ATTEMPTS/);
  assert.match(script, /LIVE_SMOKE_DELAY_MS/);
  assert.match(script, /cache:\s*'no-store'/);
  assert.match(script, /live-smoke/);
});

test('live verification writes structured success and failure diagnostics', () => {
  assert.match(script, /meta['"], 'audit', 'systems-live-deploy\.json'/);
  assert.match(script, /function writeReport/);
  assert.match(script, /status: 'success'/);
  assert.match(script, /status: 'failure'/);
  assert.match(script, /durationMs/);
  assert.match(script, /failures/);
});

test('workflow runs only after a successful main deployment and preserves the report artifact', () => {
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /Validate and deploy parabula-next/);
  assert.match(workflow, /branches:\s*\n\s*- main/);
  assert.match(workflow, /workflow_run\.conclusion == 'success'/);
  assert.match(workflow, /node scripts\/verify-live-systems-workbook\.mjs/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /name: systems-live-deploy-report/);
  assert.match(workflow, /path: meta\/audit\/systems-live-deploy\.json/);
  assert.match(workflow, /if-no-files-found: error/);
  assert.doesNotMatch(workflow, /npm run systems:live:check/);
});
