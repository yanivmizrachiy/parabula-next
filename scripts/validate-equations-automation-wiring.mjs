import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`missing required file: ${rel}`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) {
    failures.push(`${label}: missing ${needle}`);
  }
}

const packageJson = read('package.json');
const guardWorkflow = read('.github/workflows/equations-guard.yml');

const requiredFiles = [
  'scripts/equations-smart-queue.mjs',
  'scripts/validate-equations-print-smoke.mjs',
  'scripts/audit-equations-svg-conversion-plan.mjs',
  'scripts/validate-equations-page1-source-lock.mjs'
];

for (const file of requiredFiles) {
  read(file);
}

requireText(packageJson, 'audit:equations:smart-queue', 'package.json');
requireText(packageJson, 'validate:equations:print-smoke', 'package.json');
requireText(packageJson, 'audit:equations:svg-plan', 'package.json');

requireText(guardWorkflow, 'contents: read', 'equations guard workflow');
requireText(guardWorkflow, 'npm run validate:equations:all', 'equations guard workflow');
requireText(guardWorkflow, 'npm run validate:equations:print-smoke', 'equations guard workflow');
requireText(guardWorkflow, 'node scripts/validate-equations-page1-source-lock.mjs', 'equations guard workflow');
requireText(guardWorkflow, 'npm run audit:equations:smart-queue', 'equations guard workflow');
requireText(guardWorkflow, 'npm run audit:equations:svg-plan', 'equations guard workflow');
requireText(guardWorkflow, 'git status --porcelain', 'equations guard workflow');

if (failures.length) {
  console.error('EQUATIONS_AUTOMATION_WIRING_FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('EQUATIONS_AUTOMATION_WIRING_OK');
console.log('required_files=4');
console.log('package_scripts=connected');
console.log('guard_workflow=connected');
console.log('read_only_guard=YES');
