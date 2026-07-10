import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const requiredFiles = [
  'CLAUDE.md',
  'package.json',
  'meta/topics.json',
  'index.html',
  'catalog.html',
  'mobile-app.html',
  'mobile-app.js',
  'mobile-app.css',
  'preview/index.html',
  'preview/app.html',
  'preview/topics.html',
  'preview/print.html',
  'scripts/validate-access-layer.mjs',
  'scripts/audit-preview-overlaps.mjs',
  'scripts/single-rules-source-check.mjs'
];

for (const file of requiredFiles) {
  assert(exists(file), `Missing required file: ${file}`);
}

if (exists('preview/app.html')) {
  const s = read('preview/app.html');
  for (const link of ['./topics.html', './print.html', './mobile-app.html']) {
    assert(s.includes(link), `preview/app.html must include ${link}`);
  }
}

if (exists('preview/topics.html')) {
  const s = read('preview/topics.html');
  assert(s.includes('dir="rtl"') || s.includes("dir='rtl'"), 'preview/topics.html must preserve RTL');
}

if (exists('mobile-app.js')) {
  const s = read('mobile-app.js');
  assert(s.includes('meta/topics.json'), 'mobile-app.js must read meta/topics.json');
}

if (exists('catalog.js')) {
  const s = read('catalog.js');
  assert(s.includes('meta/topics.json'), 'catalog.js must read meta/topics.json');
}

if (exists('package.json')) {
  const pkg = JSON.parse(read('package.json'));
  const scripts = pkg?.scripts || {};
  assert(!!scripts['validate:access'], 'package.json must include validate:access');
  assert(!!scripts['rules:check'], 'package.json must include rules:check');
  assert(!!scripts['preview'], 'package.json must include preview');
  assert(!!scripts['test'], 'package.json must include test');
  assert(!!scripts['verify'], 'package.json must include verify');
}

if (failures.length) {
  console.error('ACCESS LAYER VALIDATION FAILED');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('ACCESS LAYER VALIDATION OK');
