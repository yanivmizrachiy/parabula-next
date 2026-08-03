import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const strictLocal = process.argv.includes('--strict-local');
const writeReport = process.argv.includes('--report');
const errors = [];
const warnings = [];

function readText(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

const manifestPath = 'meta/algebra-z-workbook.json';
const htmlPath = 'algebra-z-workbook.html';
const jsPath = 'algebra-z-workbook.js';
const cssPath = 'algebra-z-workbook.css';

const manifest = JSON.parse(readText(manifestPath));
const html = readText(htmlPath);
const js = readText(jsPath);
const css = readText(cssPath);

assert(manifest.pageCount === 15, 'manifest.pageCount must equal 15');
assert(manifest.format === 'A4', 'manifest.format must equal A4');
assert(manifest.files?.color && manifest.files?.bw, 'manifest must define color and bw files');
assert(Array.isArray(manifest.credits) && manifest.credits.length === 2, 'manifest must contain the two canonical credit lines');
assert(manifest.credits?.[0] === 'יניב רז - מדריך מחוזי חט״ב בעיר ירושלים', 'first credit line is not canonical');
assert(manifest.credits?.[1] === 'הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין', 'second credit line is not canonical');

for (const id of ['colorMode', 'bwMode', 'prevPage', 'nextPage', 'pageNumber', 'zoomMode', 'downloadButton', 'openButton', 'fullscreenButton', 'pdfFrame']) {
  assert(html.includes(`id="${id}"`), `missing viewer control #${id}`);
}
assert(html.includes(manifest.credits[0]) && html.includes(manifest.credits[1]), 'HTML is missing canonical credits');
assert(js.includes('local-first') || js.includes('probeLocal'), 'viewer must probe the local PDF before fallback');
assert(js.includes('fallbackDriveId'), 'viewer must retain a controlled fallback until strict-local migration is complete');
assert(!html.includes('drive.google.com'), 'HTML must not hard-code Drive URLs');
assert(css.includes(':fullscreen'), 'viewer must define a fullscreen layout');

const fileResults = {};
for (const [mode, file] of Object.entries(manifest.files)) {
  const absolute = path.join(root, file.path);
  const exists = fs.existsSync(absolute);
  fileResults[mode] = { path: file.path, exists };
  assert(/^[a-f0-9]{64}$/.test(file.sha256), `${mode}: invalid SHA-256 in manifest`);
  assert(Number.isInteger(file.bytes) && file.bytes > 100_000, `${mode}: invalid byte count in manifest`);
  assert(file.path.startsWith('assets/workbooks/algebra-z/downloads/'), `${mode}: non-canonical local path`);

  if (!exists) {
    const message = `${mode}: local PDF is not committed yet (${file.path})`;
    if (strictLocal) errors.push(message);
    else warnings.push(message);
    continue;
  }

  const data = fs.readFileSync(absolute);
  fileResults[mode] = {
    path: file.path,
    exists: true,
    bytes: data.length,
    sha256: sha256(data),
    pdfHeader: data.subarray(0, 5).toString('ascii')
  };
  assert(data.subarray(0, 5).toString('ascii') === '%PDF-', `${mode}: invalid PDF header`);
  assert(data.length === file.bytes, `${mode}: byte count differs from manifest`);
  assert(sha256(data) === file.sha256, `${mode}: SHA-256 differs from manifest`);
  assert(data.includes(Buffer.from('/Count 15')), `${mode}: PDF does not advertise 15 pages`);
  assert(data.subarray(Math.max(0, data.length - 2048)).includes(Buffer.from('%%EOF')), `${mode}: PDF EOF marker missing`);
}

const report = {
  checkedAt: new Date().toISOString(),
  strictLocal,
  ok: errors.length === 0,
  errors,
  warnings,
  pageCount: manifest.pageCount,
  files: fileResults
};

if (writeReport) {
  const out = path.join(root, 'meta/audit/algebra-z-workbook-validation.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
