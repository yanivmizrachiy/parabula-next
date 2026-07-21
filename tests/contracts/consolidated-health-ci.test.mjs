import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const deploy = fs.readFileSync(path.join(root, '.github', 'workflows', 'deploy-pages.yml'), 'utf8');
const manualWorkflows = [
  'repository-health.yml',
  'preview-health.yml',
  'preview-guard.yml',
  'recovery-audit.yml',
].map((name) => ({
  name,
  text: fs.readFileSync(path.join(root, '.github', 'workflows', name), 'utf8'),
}));

test('main build runs every unique repository health audit in one job', () => {
  for (const command of [
    'node scripts/recovery-audit.mjs',
    'node scripts/preview-guard.mjs',
    'node scripts/preview-style-audit.mjs',
    'node scripts/app-layer-check.mjs',
    'node scripts/duplicate-audit.mjs',
  ]) {
    assert.match(deploy, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(deploy, /name: Upload consolidated health audits/);
  assert.match(deploy, /name: repository-health-audits/);
});

test('all consolidated audit reports are uploaded from the main build', () => {
  for (const report of [
    'meta/audit/recovery-audit.json',
    'meta/audit/preview-guard.json',
    'meta/audit/preview-style-audit.json',
    'meta/audit/app-layer-check.json',
    'meta/audit/duplicate-audit.json',
  ]) {
    assert.match(deploy, new RegExp(report.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('legacy standalone health workflows are manual-only', () => {
  for (const { name, text } of manualWorkflows) {
    const triggerSection = text.slice(0, text.indexOf('\npermissions:'));
    assert.match(triggerSection, /workflow_dispatch:/, `${name} must remain manually runnable`);
    assert.doesNotMatch(triggerSection, /\n\s*push:/, `${name} must not duplicate main push CI`);
    assert.doesNotMatch(triggerSection, /\n\s*pull_request:/, `${name} must not duplicate PR CI`);
  }
});

test('manual workflows remain read-only diagnostics', () => {
  for (const { name, text } of manualWorkflows) {
    assert.match(text, /permissions:\s*\n\s*contents: read/, `${name} must stay read-only`);
  }
});
