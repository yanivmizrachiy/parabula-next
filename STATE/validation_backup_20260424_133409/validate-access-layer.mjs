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
  'meta/all-pages-index.json',
  'preview/topics.html',
  'preview/topics.css',
  'preview/topics.js',
  'preview/all-pages.html',
  'preview/all-pages.js',
  'preview/booklet.html',
  'preview/booklet.js',
  'preview/print.html',
  'preview/print.js',
  'preview/flow-shell.css',
  'preview/flow-shell.js',
  'preview/app.html',
  'STATE/LIVE_STATUS.md',
  'STATE/ARCHITECTURE_MAP.md',
  'STATE/SAFE_IMPROVEMENT_REPORT.md'
];

for (const file of requiredFiles) {
  assert(exists(file), `Missing required file: ${file}`);
}

if (exists('meta/all-pages-index.json')) {
  const data = JSON.parse(read('meta/all-pages-index.json'));
  assert(Array.isArray(data.pages), 'meta/all-pages-index.json must contain pages array');
  assert((data.pages || []).length > 0, 'meta/all-pages-index.json must contain at least one page');
}

for (const file of ['preview/topics.js', 'preview/all-pages.js', 'preview/booklet.js', 'preview/print.js']) {
  if (!exists(file)) continue;
  const s = read(file);
  assert(s.includes('all-pages-index.json'), `${file} must use meta/all-pages-index.json`);
}

for (const file of ['preview/topics.html', 'preview/all-pages.html', 'preview/booklet.html', 'preview/print.html']) {
  if (!exists(file)) continue;
  const s = read(file);
  assert(s.includes('./flow-shell.css'), `${file} must include flow-shell.css`);
  assert(s.includes('./flow-shell.js'), `${file} must include flow-shell.js`);
}

if (exists('preview/app.html')) {
  const s = read('preview/app.html');
  for (const link of ['./topics.html', './all-pages.html', './booklet.html', './print.html', './index.html']) {
    assert(s.includes(link), `preview/app.html must include ${link}`);
  }
}

if (failures.length) {
  console.error('ACCESS LAYER VALIDATION FAILED');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('ACCESS LAYER VALIDATION OK');
