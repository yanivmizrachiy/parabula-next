import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const circleDir = path.join(root, 'workbooks', 'circle');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const manifest = JSON.parse(read('workbooks/circle/manifest.json'));
const topManifest = JSON.parse(read('workbooks/manifest.json'));
const pageCount = Number(manifest.pageCount);

if (!Number.isInteger(pageCount) || pageCount < 1) throw new Error('circle manifest pageCount is invalid');

const files = fs.readdirSync(circleDir)
  .filter(name => /^page-\d+\.html$/.test(name))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

if (files.length !== pageCount) throw new Error(`circle page count mismatch: files=${files.length}, manifest=${pageCount}`);
for (let i = 1; i <= pageCount; i += 1) {
  const expected = `page-${i}.html`;
  if (files[i - 1] !== expected) throw new Error(`circle sequence gap at ${i}: got ${files[i - 1]}`);
  const html = read(`workbooks/circle/${expected}`);
  const visible = html.match(/<div class="page-number"[^>]*>(\d+)<\/div>/)?.[1];
  if (Number(visible) !== i) throw new Error(`${expected}: visible page number is ${visible}`);
}

if (Number(topManifest.workbooks?.circle?.pages) !== pageCount) {
  throw new Error(`top manifest circle count mismatch: ${topManifest.workbooks?.circle?.pages} vs ${pageCount}`);
}
if (topManifest.workbooks?.circle?.entry !== 'workbooks/circle/index.html') throw new Error('circle canonical entry changed');
if (manifest.canonicalRepository !== 'yanivmizrachiy/razpages') throw new Error('wrong canonical repository');
if (manifest.canonicalRoot !== 'workbooks/circle') throw new Error('wrong canonical circle root');
if (manifest.sourceOfTruth !== true || manifest.singleWorkbook !== true) throw new Error('circle must be the single source-of-truth workbook');

const allHtml = files.map(name => read(`workbooks/circle/${name}`)).join('\n');
const requiredMarkers = [
  'המעגל הוא קו הגבול. העיגול הוא התחום שבתוך המעגל.',
  'חוט, נעץ ועיפרון',
  'קוטר, רדיוס ומיתר',
  'זווית מרכזית וחלק מעיגול',
  'העין של לונדון',
  'המכרז העירוני',
  'ראש העיר רוצה להכפיל את רדיוס הבריכה',
  'מעגל שמרכזו בראשית הצירים'
];
for (const marker of requiredMarkers) {
  if (!allHtml.includes(marker)) throw new Error(`missing consolidated circle source marker: ${marker}`);
}

for (const forbidden of ['smartschool-hebrew-voice-notes', 'raw.githubusercontent.com/yanivmizrachiy/smartschool-hebrew-voice-notes']) {
  if (allHtml.includes(forbidden)) throw new Error(`published circle workbook still depends on legacy repo: ${forbidden}`);
}

const normalizedHashes = new Map();
for (const name of files) {
  let html = read(`workbooks/circle/${name}`);
  html = html
    .replace(/<div class="page-number"[^>]*>\d+<\/div>/g, '')
    .replace(/aria-label="עמוד \d+"/g, '')
    .replace(/<meta name="circle-provenance"[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const hash = crypto.createHash('sha256').update(html).digest('hex');
  if (normalizedHashes.has(hash)) throw new Error(`exact duplicate circle pages: ${normalizedHashes.get(hash)} and ${name}`);
  normalizedHashes.set(hash, name);
}

const index = read('workbooks/circle/index.html');
if (!index.includes("fetch('manifest.json'")) throw new Error('circle reader must derive count/stages from its manifest');
if (!index.includes('id="stage"')) throw new Error('circle reader missing graded-stage navigation');

const rules = read('CLAUDE.md');
if (!rules.includes('חוברת מעגל קנונית יחידה')) throw new Error('CLAUDE.md is not synchronized with the single circle workbook contract');

console.log(`Canonical circle workbook QA passed: ${pageCount} contiguous, graded, non-duplicate pages.`);
