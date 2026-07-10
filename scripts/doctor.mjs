import { spawnSync } from 'node:child_process';

const steps = [
  { name: 'npm test', cmd: 'npm', args: ['test'] },
  { name: 'npm run verify', cmd: 'npm', args: ['run', 'verify'] },
  { name: 'single rules source check', cmd: 'node', args: ['scripts/single-rules-source-check.mjs'] },
  { name: 'canonical app layer check', cmd: 'node', args: ['scripts/app-layer-check.mjs'] },
  { name: 'mobile runtime check', cmd: 'node', args: ['scripts/validate-mobile-runtime.mjs'] },
  { name: 'recovery audit', cmd: 'node', args: ['scripts/recovery-audit.mjs'] },
  { name: 'duplicate audit', cmd: 'node', args: ['scripts/duplicate-audit.mjs'] }
];

const summary = [];
let failed = false;

for (const step of steps) {
  console.log(`\n=== ${step.name} ===`);
  const result = spawnSync(step.cmd, step.args, { stdio: 'inherit', shell: process.platform === 'win32' });
  const code = result.status ?? 1;
  summary.push({ step: step.name, exitCode: code });
  if (code !== 0) {
    failed = true;
    console.error(`FAILED: ${step.name} (exit ${code})`);
    break;
  }
}

console.log('\n=== doctor summary ===');
console.log(JSON.stringify(summary, null, 2));
if (failed) process.exit(1);
