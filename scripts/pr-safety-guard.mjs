import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const baseRef = process.env.PR_BASE_SHA || process.env.GITHUB_BASE_REF || 'origin/main';
const headRef = process.env.PR_HEAD_SHA || 'HEAD';
const mode = process.env.PR_SAFETY_MODE || 'infrastructure';

const protectedPatterns = [
  /^עמוד-\d+\.html$/u,
  /^styles\/pages\/עמוד-\d+\.css$/u,
  /^styles\/a4-base\.css$/u,
  /^meta\/topics\.json$/u,
  /^pages\//u,
  /^sources\/legacy\/parabula-old\/sources\//u
];

const allowedInfrastructurePatterns = [
  /^\.github\/workflows\//u,
  /^scripts\//u,
  /^preview\//u,
  /^package\.json$/u,
  /^package-lock\.json$/u,
  /^README\.md$/u,
  /^STATE\/PROJECT_CONTINUITY\.md$/u,
  /^preview\.ps1$/u
];

const selfScanExclusions = new Set([
  'scripts/pr-safety-guard.mjs'
]);

function runGit(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function normalizeFileList(text) {
  return String(text || '')
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(Boolean);
}

function matchesAny(file, patterns) {
  return patterns.some(pattern => pattern.test(file));
}

function getChangedFiles() {
  try {
    return normalizeFileList(runGit(['diff', '--name-only', `${baseRef}...${headRef}`]));
  } catch {
    return normalizeFileList(runGit(['diff', '--name-only', `${baseRef}`, headRef]));
  }
}

function hasUnsafeContent(file) {
  if (selfScanExclusions.has(file)) return false;
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) return false;
  if (!/\.(mjs|js|html|css|md|json|ps1|yml|yaml)$/u.test(file)) return false;
  const text = fs.readFileSync(fullPath, 'utf8');
  return /תוכן חדש|TODO_DEMO|PLACEHOLDER_WORKSHEET|fake content|demo worksheet/iu.test(text);
}

const changedFiles = getChangedFiles();
const protectedTouched = changedFiles.filter(file => matchesAny(file, protectedPatterns));
const outsideInfra = changedFiles.filter(file => !matchesAny(file, allowedInfrastructurePatterns));
const unsafeContent = changedFiles.filter(file => hasUnsafeContent(file));

const warnings = [];
const failures = [];

if (mode === 'infrastructure' && protectedTouched.length > 0) {
  failures.push(`Protected worksheet/content files changed: ${protectedTouched.join(', ')}`);
}

if (mode === 'infrastructure' && outsideInfra.length > 0) {
  warnings.push(`Files outside the infrastructure allowlist changed: ${outsideInfra.join(', ')}`);
}

if (unsafeContent.length > 0) {
  failures.push(`Unsafe demo/placeholder content found in changed files: ${unsafeContent.join(', ')}`);
}

const report = {
  generatedAt: new Date().toISOString(),
  mode,
  baseRef,
  headRef,
  changedFiles,
  protectedTouched,
  outsideInfra,
  unsafeContent,
  status: failures.length ? 'fail' : 'pass',
  warnings,
  failures
};

fs.mkdirSync(path.join(root, 'meta', 'audit'), { recursive: true });
fs.writeFileSync(path.join(root, 'meta', 'audit', 'pr-safety-guard.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  process.exit(1);
}
