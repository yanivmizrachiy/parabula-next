import fs from 'node:fs';
import path from 'node:path';

/**
 * Page-1 source lock — realigned 2026-06 to the live HTML + MathJax rebuild.
 *
 * Page 1 (עמוד-95) is now the faithful live conversion of source page 1 of
 * משוואות.pdf: 8 live MathJax equations (not the old 12-exercise SVG/overlay
 * shell). This guard locks that conversion against regressions: correct card
 * count (driven by the faithful transcription in meta/equations-content.json),
 * contiguous provenance, the source PDF present, and NO residue of the retired
 * design (img.pdf-page, \square placeholder, .exercise / .answer-line /
 * data-correction markers).
 */
const root = process.cwd();
const PAGE = 'עמוד-95.html';
const pagePath = path.join(root, PAGE);
const sourcePdfPath = path.join(root, 'sources', 'legacy', 'parabula-old', 'sources', 'משוואות.pdf');
const contentPath = path.join(root, 'meta', 'equations-content.json');

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');
const count = (text, pattern) => (text.match(pattern) || []).length;

if (!fs.existsSync(pagePath)) throw new Error(`Missing page 1 file: ${PAGE}`);
if (!fs.existsSync(contentPath)) throw new Error('Missing meta/equations-content.json');

const html = read(pagePath);
const content = JSON.parse(read(contentPath));
const expected = content.pages?.['1']?.equations?.length; // faithful PDF page-1 transcription (8)

const failures = [];
if (!Number.isInteger(expected) || expected <= 0) {
  failures.push('meta/equations-content.json has no transcription for source page 1');
}

const problemBlocks = count(html, /class="problem-block"/g);
const answers = count(html, /class="problem-answer"/g);
const liveEquations = count(html, /class="problem-equation"/g);
const sourceLines = [...html.matchAll(/data-source-line="(\d+)"/g)].map((m) => Number(m[1])).sort((a, b) => a - b);

const sourcePdfExists = fs.existsSync(sourcePdfPath);
const sourcePdfBytes = sourcePdfExists ? fs.statSync(sourcePdfPath).size : 0;
const sourcePdfReady = sourcePdfExists && sourcePdfBytes > 0;

if (Number.isInteger(expected) && expected > 0) {
  if (problemBlocks !== expected) failures.push(`expected ${expected} page-1 problem cards, found ${problemBlocks}`);
  if (answers !== expected) failures.push(`expected ${expected} page-1 answer areas, found ${answers}`);
  if (liveEquations !== expected) failures.push(`expected ${expected} page-1 live MathJax equations, found ${liveEquations}`);
  for (let i = 1; i <= expected; i += 1) {
    if (sourceLines[i - 1] !== i) failures.push(`expected data-source-line ${i}, got ${sourceLines[i - 1] ?? 'missing'}`);
  }
}

if (!html.includes('data-source="משוואות.pdf"')) failures.push('page 1 missing data-source="משוואות.pdf" provenance');
if (!html.includes('data-source-page="1"')) failures.push('page 1 missing data-source-page="1" provenance');
if (!sourcePdfReady) failures.push('missing or empty source PDF: sources/legacy/parabula-old/sources/משוואות.pdf');

// retired-design residue must be gone (no regression to SVG/overlay/placeholder)
if (/<img[^>]*class="pdf-page"/.test(html)) failures.push('page 1 must not use img.pdf-page as content');
if (/\\square/.test(html)) failures.push('page 1 must not contain the unresolved \\square placeholder');
if (/class="[^"]*\bexercise\b/.test(html)) failures.push('page 1 must not use the retired .exercise structure');
if (/answer-line/.test(html)) failures.push('page 1 must not use the retired .answer-line structure');
if (/data-correction=/.test(html)) failures.push('page 1 must not use retired data-correction markers');

if (failures.length) {
  console.error('EQUATIONS_PAGE1_SOURCE_LOCK_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('EQUATIONS_PAGE1_SOURCE_LOCK_OK');
console.log(`design=live HTML + MathJax`);
console.log(`problem_cards=${problemBlocks}`);
console.log(`answer_areas=${answers}`);
console.log(`live_equations=${liveEquations}`);
console.log(`expected_from_transcription=${expected}`);
console.log(`source_pdf=${sourcePdfReady ? 'YES' : 'NO'}`);
console.log(`source_pdf_bytes=${sourcePdfBytes}`);
