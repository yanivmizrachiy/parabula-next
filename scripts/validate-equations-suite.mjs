import { spawnSync } from 'node:child_process';

const checks = [
  {
    name: 'equations app + worksheet family',
    command: ['node', 'scripts/validate-equations-app.mjs']
  },
  {
    name: 'strict equations design pass',
    command: ['node', 'scripts/validate-equations-design-pass-strict.mjs']
  },
  {
    name: 'equations-only print and topics scope',
    command: ['node', 'scripts/validate-equations-print-scope.mjs']
  },
  {
    name: 'equations pilot page 1',
    command: ['node', 'scripts/validate-equations-pilot-page-1.mjs']
  },
  {
    name: 'access layer',
    command: ['node', 'scripts/validate-access-layer.mjs']
  }
];

const startedAt = new Date().toISOString();
const results = [];

console.log('VALIDATE_EQUATIONS_SUITE_START');
console.log(`started_at=${startedAt}`);

for (const check of checks) {
  console.log(`\n--- RUN ${check.name} ---`);
  const result = spawnSync(check.command[0], check.command.slice(1), {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  const ok = result.status === 0;
  results.push({ name: check.name, ok, status: result.status });
  console.log(`--- ${ok ? 'PASS' : 'FAIL'} ${check.name} ---`);
}

const failed = results.filter((entry) => !entry.ok);
console.log('\nVALIDATE_EQUATIONS_SUITE_SUMMARY');
for (const entry of results) {
  console.log(`${entry.ok ? 'PASS' : 'FAIL'} :: ${entry.name}`);
}

if (failed.length) {
  console.error('VALIDATE_EQUATIONS_SUITE_FAILED');
  console.error(`failed_checks=${failed.length}`);
  process.exit(1);
}

console.log('VALIDATE_EQUATIONS_SUITE_OK');
console.log('scope=משוואות only');
console.log('quadratic_equations_touched=0');
console.log(`finished_at=${new Date().toISOString()}`);
