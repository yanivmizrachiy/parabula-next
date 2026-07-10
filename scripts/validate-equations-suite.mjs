import { spawnSync } from 'node:child_process';

/**
 * Equations validation suite — realigned 2026-06 to the live HTML + MathJax
 * rebuild of every משוואות.pdf source page.
 *
 * The previous suite asserted a design that no longer exists (a separate
 * preview "equations app", SVG/PDF-image worksheet wrappers with .pdf-wrap /
 * .pdf-page, a page-1 SVG "pilot" shell, a page-95 "editable" prototype, and a
 * temporary easy-edit overlay). Those checks were retired because the
 * production conversion replaced that design with live, per-page HTML+MathJax
 * worksheets (see STATE/EQUATIONS_DESIGN_PASS_RULES.md).
 *
 * Retired checks (no longer run — superseded design):
 *   - validate-equations-app.mjs              (separate equations app + SVG content)
 *   - validate-equations-design-pass-strict.mjs (.pdf-wrap/.pdf-page markers)
 *   - validate-equations-print-scope.mjs      (separate equations/print/topics app)
 *   - validate-equations-pilot-page-1.mjs     (SVG pilot shell for page 1)
 *   - validate-equations-easy-edits.mjs       (overlay on the PDF image)
 *   - validate-page-95-editable.mjs           (separate editable prototype)
 * The retired script files were deleted on 2026-07-10 (recoverable from git
 * history); they are not part of the canonical gate.
 *
 * Canonical gate for the live design:
 *   1. master-map consistency (audit-equations-master-map.mjs)
 *   2. live design validation of all 52 converted pages (validate-equations-live.mjs)
 *   3. access layer (validate-access-layer.mjs)
 */
const checks = [
  {
    name: 'equations master map consistency',
    command: ['node', 'scripts/audit-equations-master-map.mjs']
  },
  {
    name: 'equations live HTML + MathJax design',
    command: ['node', 'scripts/validate-equations-live.mjs']
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
console.log('design=live HTML + MathJax');
console.log('quadratic_equations_touched=0');
console.log(`finished_at=${new Date().toISOString()}`);
