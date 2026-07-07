import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const join = (...parts) => path.join(root, ...parts);
const exists = rel => fs.existsSync(join(rel));
const read = rel => fs.readFileSync(join(rel), 'utf8');

const errors = [];
const warnings = [];

const requiredFiles = [
  'preview/app.html',
  'preview/README.md',
  'preview/topics.html',
  'preview/topics.js',
  'preview/topics.css',
  'preview/print.html',
  'preview/print.js',
  'preview/print.css',
  'mobile-app.html',
  'mobile-app.js',
  'mobile-app.css',
  'mobile-app.webmanifest',
  'icon.svg'
];

const legacyFiles = [
  'preview/phone.html',
  'preview/phone.js',
  'preview/mobile.css',
  'preview/manifest.webmanifest',
  'preview/sw.js',
  'preview/install.html'
];

for (const rel of requiredFiles) {
  if (!exists(rel)) errors.push(`Missing app-layer file: ${rel}`);
}

for (const rel of legacyFiles) {
  if (!exists(rel)) warnings.push(`Legacy app-layer file missing: ${rel}`);
}

function requireIncludes(file, phrase) {
  if (!exists(file)) return;
  const text = read(file);
  if (!text.includes(phrase)) errors.push(`${file} missing expected reference: ${phrase}`);
}

function warnIncludes(file, phrase) {
  if (!exists(file)) return;
  const text = read(file);
  if (!text.includes(phrase)) warnings.push(`${file} legacy reference missing: ${phrase}`);
}

requireIncludes('preview/app.html', './topics.html');
requireIncludes('preview/app.html', './print.html');
requireIncludes('preview/app.html', '../mobile-app.html');
requireIncludes('preview/topics.html', './topics.js');
requireIncludes('preview/topics.html', './topics.css');
requireIncludes('preview/print.html', './print.js');
requireIncludes('preview/print.html', './print.css');
requireIncludes('mobile-app.html', './mobile-app.js');
requireIncludes('mobile-app.html', './mobile-app.css');
requireIncludes('mobile-app.html', './mobile-app.webmanifest');
requireIncludes('mobile-app.html', './icon.svg');
requireIncludes('mobile-app.js', './meta/topics.json');

if (exists('preview/phone.html')) {
  warnIncludes('preview/phone.html', './phone.js');
  warnIncludes('preview/phone.html', './mobile.css');
  warnIncludes('preview/phone.html', './manifest.webmanifest');
}

if (exists('preview/install.html')) {
  warnIncludes('preview/install.html', './phone.html');
  warnIncludes('preview/install.html', './print.html');
}

if (exists('preview/README.md')) {
  const text = read('preview/README.md');
  if (text.includes('print-center.js')) {
    warnings.push('preview/README.md documents print-center.js; review whether duplication is still required');
  }
}

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
