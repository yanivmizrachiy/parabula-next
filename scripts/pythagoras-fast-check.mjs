import { spawnSync } from 'node:child_process';

const checks = [
  ['--test',
    'tests/contracts/pythagoras-maintainability.test.mjs',
    'tests/contracts/pythagoras-foundations.test.mjs',
    'tests/contracts/pythagoras-deep-quality.test.mjs',
    'tests/contracts/pythagoras-workbook-resilience.test.mjs'
  ],
  ['scripts/validate-pythagoras-workbook.mjs']
];

for (const args of checks) {
  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    env: process.env
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('[pythagoras-fast-check] static contracts passed');
