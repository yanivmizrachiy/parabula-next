import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const join = (...parts) => path.join(root, ...parts);
const exists = (rel) => fs.existsSync(join(rel));
const read = (rel) => fs.readFileSync(join(rel), 'utf8');

const errors = [];
const warnings = [];

const requiredFiles = [
  'preview/app.html',
  'preview/README.md',
  'preview/phone.html',
  'preview/phone.js',
  'preview/mobile.css',
  'preview/manifest.webmanifest',
  'preview/icon.svg',
  'preview/sw.js',
  'preview/install.html',
  'preview/print.html',
  'preview/print.js'
];

for (const rel of requiredFiles) {
  if (!exists(rel)) errors.push(`Missing app-layer file: ${rel}`);
}

function requireIncludes(file, phrase) {
  if (!exists(file)) return;
  const text = read(file);
  if (!text.includes(phrase)) {
    errors.push(`${file} missing expected reference: ${phrase}`);
  }
}

requireIncludes('preview/app.html', './phone.html');
requireIncludes('preview/app.html', './print.html');
requireIncludes('preview/app.html', '../STATE/README.md');
requireIncludes('preview/phone.html', './phone.js');
requireIncludes('preview/phone.html', './mobile.css');
requireIncludes('preview/phone.html', './manifest.webmanifest');
requireIncludes('preview/install.html', './phone.html');
requireIncludes('preview/install.html', './print.html');
requireIncludes('preview/print.html', './print.js');

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
