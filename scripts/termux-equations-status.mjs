import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`missing: ${rel}`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function count(text, pattern) {
  return (text.match(pattern) || []).length;
}

const required = [
  'עמוד-95.html',
  'עמוד-42.html',
  'עמוד-43.html',
  'styles/pages/עמוד-95.css',
  'styles/pages/עמוד-42.css',
  'styles/pages/עמוד-43.css',
  'meta/topics.json',
  'preview/print.html',
  'preview/print.js',
  '.github/workflows/equations-guard.yml',
  'docs/EQUATIONS_AUTOMATION_RULES.md',
  'sources/legacy/parabula-old/sources/משוואות.pdf'
];

for (const file of required) exists(file) || failures.push(`missing required file: ${file}`);

const page1 = read('עמוד-95.html');
const page2 = read('עמוד-42.html');
const page3 = read('עמוד-43.html');
const page3Css = read('styles/pages/עמוד-43.css');
const printJs = read('preview/print.js');
const guard = read('.github/workflows/equations-guard.yml');
const topicsText = read('meta/topics.json');

const page1Exercises = count(page1, /class\s*=\s*"[^"]*\bexercise\b[^"]*"/g);
const page1Answers = count(page1, /class\s*=\s*"[^"]*\banswer-line\b[^"]*"/g);
const page1Verified = count(page1, /data-correction\s*=\s*"verified"/g);
const page1Preserved = count(page1, /data-correction\s*=\s*"existing-content-preserved"/g);
const page1Square = /4\s*\+\s*x\s*=\s*\\square/.test(page1);

const page2Exercises = count(page2, /class\s*=\s*"[^"]*\bexercise\b[^"]*"/g);
const page2Verified = count(page2, /data-correction\s*=\s*"verified"/g);

const page3Svg = page3.includes('page-03.svg');
const page3Contain = /object-fit\s*:\s*contain/.test(page3Css);
const page3CropRisk = /translateY|object-fit\s*:\s*cover/.test(page3Css);

if (page1Exercises !== 12) failures.push(`page1 exercises expected 12, got ${page1Exercises}`);
if (page1Answers !== 12) failures.push(`page1 answers expected 12, got ${page1Answers}`);
if (page1Verified > 0) warnings.push(`page1 has verified markers before final source proof: ${page1Verified}`);
if (page1Preserved !== 12) warnings.push(`page1 preserved markers expected 12 until source proof, got ${page1Preserved}`);
if (!page1Square) warnings.push('page1 square equation was not found; confirm whether source verification already changed it');

if (page2Exercises !== 10) failures.push(`page2 exercises expected 10, got ${page2Exercises}`);
if (page2Verified !== 10) failures.push(`page2 verified markers expected 10, got ${page2Verified}`);

if (!page3Svg) failures.push('page3 must reference page-03.svg while still temporary SVG');
if (!page3Contain) failures.push('page3 CSS must keep object-fit: contain');
if (page3CropRisk) failures.push('page3 CSS has crop-risk layout');

for (const token of ['workflow_dispatch', 'contents: read', 'validate-equations-page1-source-lock.mjs', 'audit-equations-page1-source-checklist.mjs', 'validate-equations-first3-readiness.mjs']) {
  if (!guard.includes(token)) failures.push(`guard missing token: ${token}`);
}

for (const token of ['maxLocalPage', 'isWithinRequestedScope', 'משוואות']) {
  if (!printJs.includes(token)) failures.push(`print.js missing token: ${token}`);
}

let firstThree = [];
try {
  const meta = JSON.parse(topicsText);
  const equations = meta.topics?.find((topic) => topic.name === 'משוואות');
  firstThree = Array.isArray(equations?.pages) ? equations.pages.slice(0, 3).map((page) => page.file) : [];
} catch (error) {
  failures.push(`meta/topics.json parse failed: ${error.message}`);
}

const expected = ['עמוד-95.html', 'עמוד-42.html', 'עמוד-43.html'];
expected.forEach((file, index) => {
  if (firstThree[index] !== file) failures.push(`first three mismatch at ${index}: expected ${file}, got ${firstThree[index] || 'missing'}`);
});

console.log('TERMUX_EQUATIONS_STATUS_START');
console.log(`page1_exercises=${page1Exercises}`);
console.log(`page1_answers=${page1Answers}`);
console.log(`page1_verified=${page1Verified}`);
console.log(`page1_preserved=${page1Preserved}`);
console.log(`page1_square=${page1Square ? 'YES' : 'NO'}`);
console.log(`page2_exercises=${page2Exercises}`);
console.log(`page2_verified=${page2Verified}`);
console.log(`page3_svg=${page3Svg ? 'YES' : 'NO'}`);
console.log(`page3_contain=${page3Contain ? 'YES' : 'NO'}`);
console.log(`first_three=${firstThree.join(',')}`);
console.log(`warnings=${warnings.length}`);
for (const warning of warnings) console.log(`WARNING: ${warning}`);
console.log(`failures=${failures.length}`);
for (const failure of failures) console.log(`FAILURE: ${failure}`);
console.log(failures.length === 0 ? 'TERMUX_EQUATIONS_STATUS_OK' : 'TERMUX_EQUATIONS_STATUS_FAILED');
console.log('TERMUX_EQUATIONS_STATUS_END');

if (failures.length) process.exit(1);
