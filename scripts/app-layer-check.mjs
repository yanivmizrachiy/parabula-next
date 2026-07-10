import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const join = (...parts) => path.join(root, ...parts);
const exists = rel => fs.existsSync(join(rel));
const read = rel => fs.readFileSync(join(rel), 'utf8');

const errors = [];
const warnings = [];

const requiredFiles = [
  'index.html',
  'catalog.html',
  'mobile-app.html',
  'mobile-app.js',
  'mobile-app.css',
  'mobile-app.webmanifest',
  'sw.js',
  'preview/app.html',
  'preview/topics.html',
  'preview/print.html',
  'preview/print.js',
  'scripts/validate-mobile-all-pages.mjs'
];

for (const rel of requiredFiles) {
  if (!exists(rel)) errors.push(`Missing canonical app-layer file: ${rel}`);
}

const forbiddenLegacy = [
  'preview/phone.html',
  'preview/phone.js',
  'preview/mobile.html',
  'preview/mobile-app.html',
  'preview/mobile-app.js',
  'preview/mobile-app.css',
  'preview/mobile-app-install.html',
  'preview/mobile-app-install.js',
  'preview/manifest.webmanifest',
  'preview/sw.js',
  'preview/install.html',
  'mobile-topics.json',
  'mobile-app-install.html',
  'mobile-app-install.js',
  'scripts/ship_mobile_release.sh',
  'scripts/one-time-clean-mobile-architecture.mjs',
  '.github/workflows/one-time-clean-mobile-architecture.yml',
  'STATE/mobile-app-cleanup-trigger.tmp',
  'scripts/validate-open-full-all-pages.mjs',
  'scripts/tmp-audit-equations-page-16.mjs',
  'scripts/patch-claude-mobile-visual-rules.mjs',
  '.github/workflows/tmp-audit-equations-page-16.yml',
  'STATE/tmp-page16-visual-audit-trigger.txt'
];
for (const rel of forbiddenLegacy) {
  if (exists(rel)) errors.push(`Obsolete duplicate app-layer file must be removed: ${rel}`);
}

function requireIncludes(file, phrase) {
  if (!exists(file)) return;
  const text = read(file);
  if (!text.includes(phrase)) errors.push(`${file} missing expected reference: ${phrase}`);
}

requireIncludes('preview/app.html', './topics.html');
requireIncludes('preview/app.html', './print.html');
requireIncludes('preview/app.html', '../mobile-app.html');
requireIncludes('preview/print.html', './print.js');
requireIncludes('mobile-app.js', './meta/topics.json');
requireIncludes('mobile-app.js', 'beforeinstallprompt');
requireIncludes('mobile-app.js', 'display-mode: standalone');
requireIncludes('package.json', 'validate:mobile:all-pages');
requireIncludes('.github/workflows/deploy-pages.yml', 'validate-mobile-all-pages.mjs');
requireIncludes('.github/workflows/deploy-pages.yml', 'shard: [0, 1, 2, 3, 4, 5, 6, 7]');

const output = {
  generatedAt: new Date().toISOString(),
  status: errors.length ? 'fail' : 'pass',
  errors,
  warnings
};

fs.mkdirSync(join('meta', 'audit'), { recursive: true });
fs.writeFileSync(join('meta', 'audit', 'app-layer-check.json'), JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(output, null, 2));
if (errors.length) process.exit(1);
