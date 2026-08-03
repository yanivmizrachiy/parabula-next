import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = process.argv.includes('--write');
const manifestPath = path.join(root, 'meta/algebra-z-workbook.json');
const outputDir = path.join(root, 'assets/workbooks/algebra-z/downloads');

const sources = {
  color: {
    label: 'גרסה צבעונית',
    filename: 'algebra-z-color.pdf',
    url: process.env.ALGEBRA_Z_COLOR_URL || 'https://drive.usercontent.google.com/download?id=1sc4iqSAMTji4sroQZvLx5jpAWqtiA2Mw&export=download&confirm=t',
    bytes: 4344125,
    sha256: '349969fd8c79398081f1d98b7abfdce9d77043837ceeb59b0eda47a6679b1c7c'
  },
  bw: {
    label: 'גרסה בשחור־לבן',
    filename: 'algebra-z-bw.pdf',
    url: process.env.ALGEBRA_Z_BW_URL || 'https://drive.usercontent.google.com/download?id=17sDILtaouvzKLF9sQ2z4Un9yZhaxAlp_&export=download&confirm=t',
    bytes: 3515626,
    sha256: 'd2cfdf6ebe914410947ab79afccea821e5b448f29bff1d9f8940b65dc1c208c4'
  }
};

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function assertPdf(mode, data, spec) {
  const errors = [];
  if (data.subarray(0, 5).toString('ascii') !== '%PDF-') errors.push('missing PDF header');
  if (!data.subarray(Math.max(0, data.length - 2048)).includes(Buffer.from('%%EOF'))) errors.push('missing EOF marker');
  if (!data.includes(Buffer.from('/Count 15'))) errors.push('expected 15-page marker was not found');
  if (data.length !== spec.bytes) errors.push(`byte count ${data.length} != ${spec.bytes}`);
  const actualHash = sha256(data);
  if (actualHash !== spec.sha256) errors.push(`SHA-256 ${actualHash} != ${spec.sha256}`);
  if (errors.length) throw new Error(`${mode}: ${errors.join('; ')}`);
}

async function download(mode, spec) {
  const response = await fetch(spec.url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'parabula-next-algebra-z-import/2.1',
      accept: 'application/pdf,application/octet-stream;q=0.9,*/*;q=0.1'
    }
  });
  const type = response.headers.get('content-type') || '';
  if (!response.ok) throw new Error(`${mode}: HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (type.includes('text/html') || data.subarray(0, 256).toString('utf8').includes('<!DOCTYPE html')) {
    throw new Error(`${mode}: source returned an HTML permission/sign-in page instead of a PDF`);
  }
  assertPdf(mode, data, spec);
  return data;
}

const existingManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const downloaded = {};

for (const [mode, spec] of Object.entries(sources)) {
  downloaded[mode] = await download(mode, spec);
  console.log(`[algebra-z-import] ${mode}: verified ${downloaded[mode].length} bytes · ${spec.sha256}`);
}

if (!write) {
  console.log('[algebra-z-import] verification only; pass --write to store the PDFs and finalize the manifest');
  process.exit(0);
}

fs.mkdirSync(outputDir, { recursive: true });
for (const [mode, spec] of Object.entries(sources)) {
  fs.writeFileSync(path.join(outputDir, spec.filename), downloaded[mode]);
}

const manifest = {
  ...existingManifest,
  release: '2.1.0-strict-local',
  files: Object.fromEntries(Object.entries(sources).map(([mode, spec]) => [mode, {
    label: spec.label,
    filename: spec.filename,
    path: `assets/workbooks/algebra-z/downloads/${spec.filename}`,
    bytes: spec.bytes,
    sha256: spec.sha256
  }])),
  migration: {
    strategy: 'strict-local',
    strictLocalReady: true,
    source: 'automated-public-source-import-with-pinned-sha256'
  }
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log('[algebra-z-import] strict-local PDFs and manifest written successfully');
