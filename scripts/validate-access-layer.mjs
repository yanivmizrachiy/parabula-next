import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const assert = (condition, message) => { if (!condition) failures.push(message); };

const requiredFiles = [
  'CLAUDE.md',
  'package.json',
  'meta/topics.json',
  'index.html',
  'catalog.html',
  'mobile-app.html',
  'mobile-app.js',
  'mobile-app.css',
  'mobile-app.webmanifest',
  'mobile-app-install.html',
  'sw.js',
  'preview/index.html',
  'preview/app.html',
  'preview/topics.html',
  'preview/print.html',
  'scripts/validate-access-layer.mjs',
  'scripts/audit-preview-overlaps.mjs',
  'scripts/single-rules-source-check.mjs'
];

for (const file of requiredFiles) assert(exists(file), `Missing required file: ${file}`);

const forbiddenLegacy = [
  'mobile-topics.json',
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
  'preview/install.html'
];
for (const file of forbiddenLegacy) assert(!exists(file), `Obsolete duplicate must be removed: ${file}`);

if (exists('preview/app.html')) {
  const text = read('preview/app.html');
  for (const link of ['./topics.html', './print.html', '../mobile-app.html']) {
    assert(text.includes(link), `preview/app.html must include ${link}`);
  }
}

if (exists('preview/topics.html')) {
  const text = read('preview/topics.html');
  assert(text.includes('dir="rtl"') || text.includes("dir='rtl'"), 'preview/topics.html must preserve RTL');
}

if (exists('mobile-app.js')) {
  const text = read('mobile-app.js');
  assert(text.includes('./meta/topics.json'), 'mobile-app.js must read meta/topics.json');
  assert(!text.includes('mobile-topics.json'), 'mobile-app.js must not use a metadata mirror');
}

if (exists('catalog.js')) {
  assert(read('catalog.js').includes('meta/topics.json'), 'catalog.js must read meta/topics.json');
}

if (exists('package.json')) {
  const scripts = JSON.parse(read('package.json'))?.scripts || {};
  for (const name of ['validate:access', 'validate:mobile', 'rules:check', 'preview', 'test', 'verify']) {
    assert(!!scripts[name], `package.json must include ${name}`);
  }
}

if (failures.length) {
  console.error('ACCESS LAYER VALIDATION FAILED');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}
console.log('ACCESS LAYER VALIDATION OK');
