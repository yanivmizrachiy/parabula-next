import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pagePath = path.join(root, 'עמוד-95.html');
const sourceProofPath = path.join(root, 'STATE', 'EQUATIONS_PAGE_1_SOURCE_VERIFICATION.md');

function read(pathname) {
  if (!fs.existsSync(pathname)) return '';
  return fs.readFileSync(pathname, 'utf8');
}

function count(text, pattern) {
  return (text.match(pattern) || []).length;
}

if (!fs.existsSync(pagePath)) {
  throw new Error('Missing page 1 file: עמוד-95.html');
}

const html = read(pagePath);
const proof = read(sourceProofPath);
const exercises = count(html, /class\s*=\s*"[^"]*\bexercise\b[^"]*"/g);
const answers = count(html, /class\s*=\s*"[^"]*\banswer-line\b[^"]*"/g);
const verified = count(html, /data-correction\s*=\s*"verified"/g);
const preserved = count(html, /data-correction\s*=\s*"existing-content-preserved"/g);
const squareEquationPresent = /4\s*\+\s*x\s*=\s*\\square/.test(html);
const proofExists = proof.includes('PAGE_1_SOURCE_VERIFIED=YES') && proof.includes('4 + x = \\square');

const failures = [];

if (exercises !== 12) failures.push(`expected 12 page-1 exercises, found ${exercises}`);
if (answers !== 12) failures.push(`expected 12 page-1 answer areas, found ${answers}`);

if (verified === 12 && squareEquationPresent && !proofExists) {
  failures.push('page 1 is fully marked verified while 4 + x = \\square is still present without STATE/EQUATIONS_PAGE_1_SOURCE_VERIFICATION.md proof marker');
}

if (verified > 0 && preserved > 0) {
  failures.push(`page 1 has mixed verification states: verified=${verified}, preserved=${preserved}`);
}

if (failures.length) {
  console.error('EQUATIONS_PAGE1_SOURCE_LOCK_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('EQUATIONS_PAGE1_SOURCE_LOCK_OK');
console.log(`exercises=${exercises}`);
console.log(`answers=${answers}`);
console.log(`verified=${verified}`);
console.log(`preserved=${preserved}`);
console.log(`square_equation_present=${squareEquationPresent ? 'YES' : 'NO'}`);
console.log(`source_proof=${proofExists ? 'YES' : 'NO'}`);
