import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

function log(message) {
  console.log(`[copy-static-site] ${message}`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFileIfExists(fromRel, toRel = fromRel) {
  const from = path.join(root, fromRel);
  if (!fs.existsSync(from) || fs.statSync(from).isDirectory()) return false;
  const to = path.join(dist, toRel);
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
  return true;
}

function copyDirIfExists(fromRel, toRel = fromRel) {
  const from = path.join(root, fromRel);
  if (!fs.existsSync(from) || !fs.statSync(from).isDirectory()) return false;
  const to = path.join(dist, toRel);
  fs.cpSync(from, to, { recursive: true, force: true });
  return true;
}

if (!fs.existsSync(dist)) {
  throw new Error('dist directory is missing. Run vite build before copy-static-site.');
}

const dirs = ['styles', 'meta', 'preview'];
for (const dir of dirs) {
  if (copyDirIfExists(dir)) log(`copied ${dir}/`);
}

const rootFiles = fs.readdirSync(root);
for (const file of rootFiles) {
  if (/^עמוד-\d+\.html$/.test(file)) copyFileIfExists(file);
}

for (const file of rootFiles) {
  if (/\.(html|css|js|json|svg|webmanifest)$/.test(file)) copyFileIfExists(file);
}

const required = [
  'index.html',
  'mobile-app.html',
  'mobile-app.js',
  'mobile-app.css',
  'meta/topics.json',
  'styles/a4-base.css',
  'preview/index.html',
];

const missing = required.filter(rel => !fs.existsSync(path.join(dist, rel)));
if (missing.length) {
  console.error('[copy-static-site] missing required dist files:');
  for (const rel of missing) console.error(`- ${rel}`);
  process.exit(1);
}

const pageCount = fs.readdirSync(dist).filter(file => /^עמוד-\d+\.html$/.test(file)).length;
log(`dist ready with ${pageCount} root worksheet pages`);
