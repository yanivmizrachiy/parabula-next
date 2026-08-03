import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const strict = process.argv.includes('--strict');
const checkOnly = process.argv.includes('--check');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'meta/algebra-z-workbook.json'), 'utf8'));
const chunkRoot = path.join(root, 'assets/workbooks/algebra-z/chunks');
const results = [];
const errors = [];

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function fail(message) {
  errors.push(message);
}

function listParts(mode) {
  const dir = path.join(chunkRoot, mode);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => /^part-\d+\.b64$/.test(name))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    .map((name) => path.join(dir, name));
}

for (const [mode, file] of Object.entries(manifest.files)) {
  const parts = listParts(mode);
  const output = path.join(root, file.path);
  const record = { mode, parts: parts.length, output: file.path, status: 'pending' };

  if (!parts.length) {
    record.status = 'no-chunks';
    results.push(record);
    if (strict) fail(`${mode}: no encoded PDF chunks found`);
    continue;
  }

  try {
    const encoded = parts.map((part) => fs.readFileSync(part, 'utf8').replace(/\s+/g, '')).join('');
    if (!encoded.length || encoded.length % 4 !== 0) throw new Error('invalid base64 length');
    const compressed = Buffer.from(encoded, 'base64');
    const pdf = zlib.gunzipSync(compressed);
    const actualHash = sha256(pdf);

    if (pdf.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error('invalid PDF header');
    if (!pdf.subarray(Math.max(0, pdf.length - 4096)).includes(Buffer.from('%%EOF'))) throw new Error('missing PDF EOF marker');
    if (!pdf.includes(Buffer.from('/Count 15'))) throw new Error('PDF page tree does not contain /Count 15');
    if (pdf.length !== file.bytes) throw new Error(`byte mismatch: expected ${file.bytes}, got ${pdf.length}`);
    if (actualHash !== file.sha256) throw new Error(`SHA-256 mismatch: expected ${file.sha256}, got ${actualHash}`);

    record.bytes = pdf.length;
    record.sha256 = actualHash;
    record.status = checkOnly ? 'verified' : 'written';

    if (!checkOnly) {
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, pdf);
    }
  } catch (error) {
    record.status = 'invalid';
    record.error = error.message;
    fail(`${mode}: ${error.message}`);
  }

  results.push(record);
}

const report = {
  checkedAt: new Date().toISOString(),
  strict,
  checkOnly,
  ok: errors.length === 0,
  errors,
  results
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
