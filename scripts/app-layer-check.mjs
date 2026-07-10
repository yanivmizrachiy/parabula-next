import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const join = (...parts) => path.join(root, ...parts);
const exists = (rel) => fs.existsSync(join(rel));
const read = (rel) => fs.readFileSync(join(rel), 'utf8');

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
  'preview/print.js'
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
  'scripts/ship_mobile_release.sh'
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
