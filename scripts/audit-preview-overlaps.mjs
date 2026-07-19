import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));

const canonical = [
  'mobile-app.html',
  'mobile-app.js',
  'mobile-app.css',
  'mobile-app.webmanifest',
  'mobile-app-install.html',
  'sw.js',
  'meta/topics.json',
  'preview/app.html',
  'preview/topics.html',
  'preview/print.html'
];

const forbidden = [
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

const missing = canonical.filter((file) => !exists(file));
const obsolete = forbidden.filter((file) => exists(file));
const lines = [
  '# PREVIEW AND MOBILE OVERLAP AUDIT',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Canonical files',
  ...canonical.map((file) => `- ${exists(file) ? 'PASS' : 'FAIL'} — ${file}`),
  '',
  '## Obsolete duplicate files',
  ...(forbidden.map((file) => `- ${exists(file) ? 'FAIL' : 'PASS'} — ${file}`)),
  '',
  `Result: ${missing.length || obsolete.length ? 'FAIL' : 'PASS'}`
];

const outFile = path.join(root, 'meta', 'audit', 'preview-overlaps.md');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, lines.join('\n') + '\n', 'utf8');
console.log(lines.join('\n'));
if (missing.length || obsolete.length) process.exit(1);
