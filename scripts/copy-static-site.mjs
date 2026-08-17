import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { versionizeHtml, assertMathjaxVersioned } from './lib/versionize-assets.mjs';

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
  copyTree(from, to);
  return true;
}

function copyTree(from, to) {
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyTree(source, target);
    else fs.copyFileSync(source, target);
  }
}

if (!fs.existsSync(dist)) {
  throw new Error('dist directory is missing. Run vite build before copy-static-site.');
}

// preview/ אינו מועתק: CLAUDE.md קובע שהוא משטח פיתוח מקומי בלבד ואינו חלק
// מהאתר המפורסם. אין אליו הפניות זמן-ריצה מהקוראים או מדפי האתר.
const dirs = ['styles', 'meta', 'pages', 'vendor', 'assets'];
for (const dir of dirs) {
  if (copyDirIfExists(dir)) log(`copied ${dir}/`);
}

const coordinateWorkbookRoot = 'projects/coordinate-first-quadrant-workbook';
const coordinateWorkbookTarget = 'projects/coordinate-first-quadrant-workbook';
if (copyDirIfExists(`${coordinateWorkbookRoot}/dist`, coordinateWorkbookTarget)) {
  log(`copied ${coordinateWorkbookRoot}/dist/`);
}
if (copyDirIfExists(`${coordinateWorkbookRoot}/downloads`, `${coordinateWorkbookTarget}/downloads`)) {
  log(`copied ${coordinateWorkbookRoot}/downloads/`);
}
if (copyDirIfExists(`${coordinateWorkbookRoot}/preview`, `${coordinateWorkbookTarget}/preview`)) {
  log(`copied ${coordinateWorkbookRoot}/preview/`);
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
  'catalog.html',
  'catalog.js',
  'catalog.css',
  'catalog-deep-link.js',
  'mobile-app.html',
  'mobile-app.js',
  'mobile-app.css',
  'mobile-deep-link.js',
  'mobile-app.webmanifest',
  'systems-workbook.html',
  'sw.js',
  'reader-actions.js',
  'reader-actions.css',
  'meta/topics.json',
  'meta/two-variable-systems-manifest.json',
  'styles/a4-base.css',
  'assets/pythagoras/vector/page-05.svg',
  'assets/pythagoras/vector/page-22.svg',
  'coordinate-first-quadrant.html',
  'projects/coordinate-first-quadrant-workbook/index.html',
  'projects/coordinate-first-quadrant-workbook/workbook.css',
  'projects/coordinate-first-quadrant-workbook/workbook.js',
  'projects/coordinate-first-quadrant-workbook/downloads/coordinate-first-quadrant-workbook.pdf'
];

const missing = required.filter(rel => !fs.existsSync(path.join(dist, rel)));
if (missing.length) {
  console.error('[copy-static-site] missing required dist files:');
  for (const rel of missing) console.error(`- ${rel}`);
  process.exit(1);
}

const versionInputs = [
  'index.html', 'index.js',
  'catalog.html', 'catalog.css', 'catalog.js', 'catalog-deep-link.js',
  'mobile-app.html', 'mobile-app.css', 'mobile-app.js', 'mobile-deep-link.js', 'mobile-app.webmanifest',
  'systems-workbook.html', 'sw.js', 'reader-actions.css', 'reader-actions.js',
  'meta/topics.json', 'meta/two-variable-systems-manifest.json'
];
const hash = crypto.createHash('sha256');
for (const rel of versionInputs) {
  hash.update(rel);
  hash.update(fs.readFileSync(path.join(root, rel)));
}
const buildVersion = String(process.env.GITHUB_SHA || '').slice(0, 12) || hash.digest('hex').slice(0, 12);
const tokenFiles = ['index.html', 'index.js', 'catalog.html', 'mobile-app.html', 'mobile-app.js', 'mobile-app.webmanifest', 'systems-workbook.html', 'sw.js'];
for (const rel of tokenFiles) {
  const file = path.join(dist, rel);
  const source = fs.readFileSync(file, 'utf8');
  const output = source.replaceAll(VERSION_TOKEN, buildVersion);
  if (output.includes(VERSION_TOKEN)) throw new Error(`Unresolved mobile version token in dist/${rel}`);
  fs.writeFileSync(file, output, 'utf8');
}

// חיבור כל נכסי ה-HTML של dist לגרסת ה-build: מוסיף ?v=<buildVersion> לסקריפט MathJax
// ולכל קישורי ה-CSS, כדי ש-deploy חדש תמיד יטען מנוע וסגנון טריים ולא cache ישן שובר.
function walkHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(p));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

let versionedCount = 0;
for (const file of walkHtml(dist)) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file).replaceAll(path.sep, '/');
  const output = versionizeHtml(src, buildVersion);
  assertMathjaxVersioned(output, rel);
  if (output !== src) {
    fs.writeFileSync(file, output, 'utf8');
    versionedCount += 1;
  }
}
log(`versionized MathJax + CSS in ${versionedCount} HTML files`);

const pageCount = fs.readdirSync(dist).filter(file => /^עמוד-\d+\.html$/.test(file)).length;
log(`dist ready with ${pageCount} root worksheet pages; mobile version=${buildVersion}`);
