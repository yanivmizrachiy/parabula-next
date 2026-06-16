import fs from 'node:fs';
import path from 'node:path';

/**
 * Page-1 source checklist — realigned 2026-06 to the live HTML + MathJax rebuild.
 *
 * Parses page 1 (עמוד-95) live cards in DOM order and locks each rendered
 * equation against the faithful transcription in meta/equations-content.json
 * (source page 1 of משוואות.pdf). Emits a human-readable checklist table and
 * fails on count / ordering / equation drift, or a missing/empty source PDF.
 * Read-only (prints to stdout, writes no files).
 */
const root = process.cwd();
const PAGE = 'עמוד-95.html';
const pagePath = path.join(root, PAGE);
const sourcePdfPath = path.join(root, 'sources', 'equations', 'משוואות-52.pdf');
const contentPath = path.join(root, 'meta', 'equations-content.json');

if (!fs.existsSync(pagePath)) throw new Error(`Missing page file: ${PAGE}`);
if (!fs.existsSync(sourcePdfPath)) throw new Error('Missing source PDF: sources/equations/משוואות-52.pdf');
if (!fs.existsSync(contentPath)) throw new Error('Missing meta/equations-content.json');

const html = fs.readFileSync(pagePath, 'utf8');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const sourcePdfBytes = fs.statSync(sourcePdfPath).size;

// Each live card: data-source-line="K" … <div class="problem-equation">\( EQ \)</div>
const cardRegex = /data-source-line="(\d+)"[\s\S]*?class="problem-equation">\\\(([\s\S]*?)\\\)<\/div>/g;
const cards = [];
let match;
while ((match = cardRegex.exec(html)) !== null) {
  cards.push({ sourceLine: Number(match[1]), equation: match[2].trim() });
}

const expectedEqs = (content.pages?.['1']?.equations || []).map((e) => e.trim());

const failures = [];
if (sourcePdfBytes <= 0) failures.push('source PDF is empty');
if (cards.length !== expectedEqs.length) {
  failures.push(`expected ${expectedEqs.length} page-1 cards, found ${cards.length}`);
}
cards.forEach((card, index) => {
  if (card.sourceLine !== index + 1) {
    failures.push(`card ${index + 1}: expected data-source-line ${index + 1}, got ${card.sourceLine}`);
  }
  if (expectedEqs[index] !== undefined && card.equation !== expectedEqs[index]) {
    failures.push(`card ${index + 1} equation drift: HTML "${card.equation}" != source "${expectedEqs[index]}"`);
  }
});

console.log('EQUATIONS_PAGE1_SOURCE_CHECKLIST');
console.log(`page=${PAGE}`);
console.log(`source_pdf=sources/equations/משוואות-52.pdf`);
console.log(`source_pdf_bytes=${sourcePdfBytes}`);
console.log(`cards=${cards.length}`);
console.log('--- PAGE1_SOURCE_CHECKLIST_START ---');
console.log('| line | equation | status |');
console.log('|---:|---|---|');
for (const card of cards) {
  const matchesSource = expectedEqs[card.sourceLine - 1] === card.equation;
  console.log(`| ${card.sourceLine} | \`${card.equation}\` | ${matchesSource ? 'matches source ✓' : 'DRIFT'} |`);
}
console.log('--- PAGE1_SOURCE_CHECKLIST_END ---');

if (failures.length) {
  console.error('EQUATIONS_PAGE1_SOURCE_CHECKLIST_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('EQUATIONS_PAGE1_SOURCE_CHECKLIST_OK');
