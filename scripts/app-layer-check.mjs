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

function requirePattern(file, pattern, message) {
  if (!exists(file)) return;
  const text = read(file);
  if (!pattern.test(text)) {
    errors.push(message);
  }
}

requirePattern('preview/app.html', /href="\.\/all-pages\.html"/u, 'preview/app.html must link to ./all-pages.html');
requirePattern('preview/app.html', /href="\.\/topics\.html"/u, 'preview/app.html must link to ./topics.html');
requirePattern('preview/app.html', /href="\.\/print\.html"/u, 'preview/app.html must link to ./print.html');
requirePattern('preview/app.html', /href="\.\.\/mobile-app\.html"/u, 'preview/app.html must link to ../mobile-app.html');
requirePattern('preview/app.html', /href="\.\.\/STATE\/README\.md"/u, 'preview/app.html must link to ../STATE/README.md');
requirePattern('preview/install.html', /href="\.\/phone\.html"/u, 'preview/install.html must link to ./phone.html');
requirePattern('preview/install.html', /href="\.\/print\.html"/u, 'preview/install.html must link to ./print.html');
requirePattern('preview/print.html', /<script\s+src="\.\/print\.js"/u, 'preview/print.html must load ./print.js');

if (exists('preview/phone.html')) {
  const text = read('preview/phone.html');
  const isRedirectOnly =
    /url=\.\.\/mobile-app\.html/u.test(text) &&
    /href="\.\.\/mobile-app\.html/u.test(text);
  const isLegacyShell =
    /<script\s+src="\.\/phone\.js"/u.test(text) &&
    /href="\.\/mobile\.css"/u.test(text) &&
    /href="\.\/manifest\.webmanifest"/u.test(text);

  if (!isRedirectOnly && !isLegacyShell) {
    errors.push('preview/phone.html must either redirect to ../mobile-app.html or include the legacy phone shell assets');
  }
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
