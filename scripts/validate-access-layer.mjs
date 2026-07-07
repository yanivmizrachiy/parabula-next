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

function assertNoInlineStyle(file) {
  if (!exists(file)) return;
  const s = read(file);
  assert(!/<style[\s>]/i.test(s), `${file} must not include inline <style>`);
  assert(!/\sstyle\s*=\s*["']/i.test(s), `${file} must not include inline style attributes`);
}

const requiredFiles = [
  'PROJECT_RULES.md',
  'package.json',
  'meta/topics.json',
  'mobile-app.html',
  'mobile-app.js',
  'preview/index.html',
  'preview/index.css',
  'preview/app.html',
  'preview/topics.html',
  'preview/print.html',
  'scripts/validate-access-layer.mjs',
  'scripts/audit-preview-overlaps.mjs',
  'STATE/LIVE_STATUS.md',
  'STATE/ARCHITECTURE_MAP.md',
  'STATE/PROJECT_CONTINUITY.md'
];

for (const file of requiredFiles) {
  assert(exists(file), `Missing required file: ${file}`);
}

if (exists('preview/app.html')) {
  const s = read('preview/app.html');
  for (const link of ['./topics.html', './print.html', '../mobile-app.html']) {
    assert(s.includes(link), `preview/app.html must include ${link}`);
  }
}

if (exists('preview/index.html')) {
  const s = read('preview/index.html');
  assert(s.includes('./index.css'), 'preview/index.html must load ./index.css');
}

for (const file of [
  'preview/index.html',
  'preview/app.html',
  'preview/topics.html',
  'preview/print.html',
  'mobile-app.html'
]) {
  assertNoInlineStyle(file);
}

if (exists('preview/topics.html')) {
  const s = read('preview/topics.html');
  assert(s.includes('dir="rtl"') || s.includes("dir='rtl'"), 'preview/topics.html must preserve RTL');
}

if (exists('mobile-app.js')) {
  const s = read('mobile-app.js');
  assert(s.includes('./meta/topics.json'), 'mobile-app.js must use canonical ./meta/topics.json');
  assert(!s.includes('mobile-topics.json'), 'mobile-app.js must not depend on legacy mobile-topics.json');
}

if (exists('package.json')) {
  const pkg = JSON.parse(read('package.json'));
  const scripts = pkg?.scripts || {};
  assert(!!scripts['validate:access'], 'package.json must include validate:access');
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
