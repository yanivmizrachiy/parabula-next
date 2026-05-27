import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pageFile = 'עמוד-95.html';
const sourcePdfFile = path.join('sources', 'legacy', 'parabula-old', 'sources', 'משוואות.pdf');
const pagePath = path.join(root, pageFile);
const sourcePdfPath = path.join(root, sourcePdfFile);

function read(relOrFull) {
  if (!fs.existsSync(relOrFull)) return '';
  return fs.readFileSync(relOrFull, 'utf8');
}

function stripMathJax(value) {
  return value
    .replace(/\\\(/g, '')
    .replace(/\\\)/g, '')
    .replace(/\\square/g, '\\square')
    .trim();
}

if (!fs.existsSync(pagePath)) {
  throw new Error(`Missing page file: ${pageFile}`);
}

if (!fs.existsSync(sourcePdfPath)) {
  throw new Error(`Missing source PDF: ${sourcePdfFile}`);
}

const html = read(pagePath);
const sourcePdfBytes = fs.statSync(sourcePdfPath).size;
const exerciseRegex = /<li class="exercise"[^>]*data-source-line="(\d+)"[^>]*data-correction="([^"]+)"[^>]*>\s*<span class="eq">([^<]+)<\/span>/g;
const exercises = [];
let match;
while ((match = exerciseRegex.exec(html)) !== null) {
  exercises.push({
    sourceLine: Number(match[1]),
    correction: match[2],
    equation: stripMathJax(match[3])
  });
}

const failures = [];
if (sourcePdfBytes <= 0) failures.push('source PDF is empty');
if (exercises.length !== 12) failures.push(`expected 12 exercises, found ${exercises.length}`);

const sourceLines = exercises.map((item) => item.sourceLine).sort((a, b) => a - b);
for (let index = 1; index <= 12; index += 1) {
  if (sourceLines[index - 1] !== index) {
    failures.push(`expected source line ${index}, got ${sourceLines[index - 1] ?? 'missing'}`);
  }
}

const square = exercises.find((item) => item.equation.includes('\\square'));
if (!square) failures.push('expected to find the unresolved square equation for source verification');

const allPreserved = exercises.every((item) => item.correction === 'existing-content-preserved');
if (!allPreserved) failures.push('page 1 source checklist expects all items to remain existing-content-preserved until source verification');

console.log('EQUATIONS_PAGE1_SOURCE_CHECKLIST_OK');
console.log(`page=${pageFile}`);
console.log(`source_pdf=${sourcePdfFile}`);
console.log(`source_pdf_bytes=${sourcePdfBytes}`);
console.log(`exercises=${exercises.length}`);
console.log(`all_preserved=${allPreserved ? 'YES' : 'NO'}`);
console.log('--- PAGE1_SOURCE_CHECKLIST_START ---');
console.log('| line | equation | status |');
console.log('|---:|---|---|');
for (const item of exercises) {
  const flag = item.equation.includes('\\square') ? 'NEEDS SOURCE PROOF' : 'needs source comparison';
  console.log(`| ${item.sourceLine} | \`${item.equation}\` | ${flag} |`);
}
console.log('--- PAGE1_SOURCE_CHECKLIST_END ---');

if (failures.length) {
  console.error('EQUATIONS_PAGE1_SOURCE_CHECKLIST_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
