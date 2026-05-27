import { spawnSync } from 'node:child_process';

const steps = [
  ['Termux status snapshot', 'node', ['scripts/termux-equations-status.mjs']],
  ['Automation wiring', 'node', ['scripts/validate-equations-automation-wiring.mjs']],
  ['Page 1 source lock', 'node', ['scripts/validate-equations-page1-source-lock.mjs']],
  ['Page 1 source checklist', 'node', ['scripts/audit-equations-page1-source-checklist.mjs']],
  ['First three readiness', 'node', ['scripts/validate-equations-first3-readiness.mjs']],
  ['Print smoke', 'npm', ['run', 'validate:equations:print-smoke']],
  ['Smart queue', 'npm', ['run', 'audit:equations:smart-queue']],
  ['SVG conversion plan', 'npm', ['run', 'audit:equations:svg-plan']]
];

const results = [];

console.log('TERMUX_EQUATIONS_AGENT_START');
console.log('scope=משוואות');
console.log('excluded=משוואות ריבועיות');
console.log('mode=read_only_audit');
console.log('writes_files=NO');
console.log('installs_dependencies=NO');

for (const [name, command, args] of steps) {
  console.log(`\n=== ${name} ===`);
  console.log(`command=${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const stdout = result.stdout?.trim() || '';
  const stderr = result.stderr?.trim() || '';
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);

  const status = result.status ?? 1;
  results.push({ name, status });
  console.log(`exit_code=${status}`);
}

const failed = results.filter((item) => item.status !== 0);
const passed = results.length - failed.length;

console.log('\nTERMUX_EQUATIONS_AGENT_SUMMARY');
console.log(`passed=${passed}`);
console.log(`failed=${failed.length}`);
for (const item of failed) {
  console.log(`FAILED_STEP=${item.name}`);
}

if (failed.length === 0) {
  console.log('TERMUX_EQUATIONS_AGENT_OK');
} else {
  console.log('TERMUX_EQUATIONS_AGENT_FAILED');
  process.exit(1);
}
