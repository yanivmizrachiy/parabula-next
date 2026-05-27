import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`missing file: ${rel}`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

function count(text, pattern) {
  return (text.match(pattern) || []).length;
}

const page1 = read('עמוד-95.html');
const page2 = read('עמוד-42.html');
const page3 = read('עמוד-43.html');
const page3Css = read('styles/pages/עמוד-43.css');
const topicsText = read('meta/topics.json');

let topics = { topics: [] };
try {
  topics = JSON.parse(topicsText);
} catch (error) {
  failures.push(`meta/topics.json invalid JSON: ${error.message}`);
}

const equations = topics.topics?.find((topic) => topic.name === 'משוואות');
const firstThree = Array.isArray(equations?.pages)
  ? equations.pages.slice(0, 3).map((page) => page.file)
  : [];

const expectedFirstThree = ['עמוד-95.html', 'עמוד-42.html', 'עמוד-43.html'];
for (let index = 0; index < expectedFirstThree.length; index += 1) {
  if (firstThree[index] !== expectedFirstThree[index]) {
    failures.push(`first three order mismatch at ${index}: expected ${expectedFirstThree[index]}, got ${firstThree[index] || 'missing'}`);
  }
}

const page1Exercises = count(page1, /class\s*=\s*"[^"]*\bexercise\b[^"]*"/g);
const page1Answers = count(page1, /class\s*=\s*"[^"]*\banswer-line\b[^"]*"/g);
const page1Verified = count(page1, /data-correction\s*=\s*"verified"/g);
const page1Preserved = count(page1, /data-correction\s*=\s*"existing-content-preserved"/g);

if (page1Exercises !== 12) failures.push(`page 1 expected 12 exercises, found ${page1Exercises}`);
if (page1Answers !== 12) failures.push(`page 1 expected 12 answer areas, found ${page1Answers}`);
if (page1Verified === 12 && page1Preserved > 0) failures.push('page 1 cannot be both fully verified and preserved');

const page2Exercises = count(page2, /class\s*=\s*"[^"]*\bexercise\b[^"]*"/g);
const page2Answers = count(page2, /class\s*=\s*"[^"]*\banswer-line\b[^"]*"/g);
const page2Verified = count(page2, /data-correction\s*=\s*"verified"/g);

if (page2Exercises !== 10) failures.push(`page 2 expected 10 exercises, found ${page2Exercises}`);
if (page2Answers !== 10) failures.push(`page 2 expected 10 answer areas, found ${page2Answers}`);
if (page2Verified !== 10) failures.push(`page 2 expected 10 verified markers, found ${page2Verified}`);

if (!page3.includes('page-03.svg')) failures.push('page 3 must still reference page-03.svg until reliable source conversion exists');
if (/translateY|object-fit\s*:\s*cover/.test(page3Css)) failures.push('page 3 CSS has crop risk');
if (!/object-fit\s*:\s*contain/.test(page3Css)) failures.push('page 3 CSS should keep SVG contained');

if (failures.length) {
  console.error('EQUATIONS_FIRST3_READINESS_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('EQUATIONS_FIRST3_READINESS_OK');
console.log(`page1_exercises=${page1Exercises}`);
console.log(`page1_answers=${page1Answers}`);
console.log(`page1_verified=${page1Verified}`);
console.log(`page1_preserved=${page1Preserved}`);
console.log(`page2_verified=${page2Verified}`);
console.log('page3_svg=YES');
console.log(`first_three=${firstThree.join(',')}`);
