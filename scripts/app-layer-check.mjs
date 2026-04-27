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

function requireAnyIncludes(file, phrases, description) {
  if (!exists(file)) return;
  const text = read(file);
  if (!phrases.some((phrase) => text.includes(phrase))) {
    errors.push(`${file} missing expected reference for ${description}: ${phrases.join(' OR ')}`);
  }
}

requireIncludes('preview/app.html', './topics.html');
requireIncludes('preview/app.html', './print.html');
requireIncludes('preview/app.html', '../mobile-app.html');
requireAnyIncludes('preview/app.html', ['../STATE/README.md', 'STATE'], 'state documentation access');
requireAnyIncludes('preview/phone.html', ['../mobile-app.html', './phone.js'], 'compat redirect or compat runtime');
requireAnyIncludes('preview/phone.html', ['./mobile.css', './manifest.webmanifest', '../mobile-app.html'], 'compat assets or canonical redirect');
requireIncludes('preview/install.html', './phone.html');
requireIncludes('preview/install.html', './print.html');
requireIncludes('preview/install.html', '../mobile-app.html');
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
