import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const VERSION_TOKEN = '__MOBILE_VERSION__';

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

const dirs = ['styles', 'meta', 'preview', 'pages', 'vendor', 'assets'];
for (const dir of dirs) {
  if (copyDirIfExists(dir)) log(`copied ${dir}/`);
}

if (!fs.existsSync(path.join(dist, 'assets/pythagoras/vector'))) {
  throw new Error('Missing required Pythagoras assets: assets/pythagoras/vector');
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
  'index.js',
  'mobile-app.html',
  'mobile-app.js',
  'mobile-app.css',
  'mobile-app.webmanifest',
  'sw.js',
  'reader-actions.js',
  'reader-actions.css',
  'meta/topics.json',
  'styles/a4-base.css',
  'preview/index.html',
  'assets/pythagoras/vector/page-05.svg',
  'assets/pythagoras/vector/page-22.svg'
];

const missing = required.filter(rel => !fs.existsSync(path.join(dist, rel)));
if (missing.length) {
  console.error('[copy-static-site] missing required dist files:');
  for (const rel of missing) console.error(`- ${rel}`);
  process.exit(1);
}

const versionInputs = [
  'index.html', 'index.js', 'mobile-app.html', 'mobile-app.css', 'mobile-app.js',
  'mobile-app.webmanifest', 'sw.js', 'reader-actions.css', 'reader-actions.js', 'meta/topics.json'
];
const hash = crypto.createHash('sha256');
for (const rel of versionInputs) {
  hash.update(rel);
  hash.update(fs.readFileSync(path.join(root, rel)));
}
const buildVersion = String(process.env.GITHUB_SHA || '').slice(0, 12) || hash.digest('hex').slice(0, 12);
const tokenFiles = ['index.html', 'index.js', 'mobile-app.html', 'mobile-app.js', 'mobile-app.webmanifest', 'sw.js'];
for (const rel of tokenFiles) {
  const file = path.join(dist, rel);
  const source = fs.readFileSync(file, 'utf8');
  const output = source.replaceAll(VERSION_TOKEN, buildVersion);
  if (output.includes(VERSION_TOKEN)) throw new Error(`Unresolved mobile version token in dist/${rel}`);
  fs.writeFileSync(file, output, 'utf8');
}

const pageCount = fs.readdirSync(dist).filter(file => /^עמוד-\d+\.html$/.test(file)).length;
log(`dist ready with ${pageCount} root worksheet pages; mobile version=${buildVersion}`);
