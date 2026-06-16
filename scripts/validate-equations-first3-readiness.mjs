import fs from 'node:fs';
import path from 'node:path';

/**
 * First-three readiness — realigned 2026-06 to the live HTML + MathJax rebuild.
 *
 * The first three משוואות pages (עמוד-95, עמוד-42, עמוד-43 = logical 1,2,3) are
 * now live HTML + MathJax conversions of משוואות.pdf pages 1–3. This guard locks
 * their order and that each one is a live page with exactly the number of cards
 * given by the faithful transcription in meta/equations-content.json — and that
 * none of them regressed to the retired SVG/image worksheet (page 3 used to be
 * page-03.svg; it is now live HTML).
 */
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

const count = (text, pattern) => (text.match(pattern) || []).length;

let content = { pages: {} };
try {
  content = JSON.parse(read('meta/equations-content.json') || '{"pages":{}}');
} catch (error) {
  failures.push(`meta/equations-content.json invalid JSON: ${error.message}`);
}

let topics = { topics: [] };
try {
  topics = JSON.parse(read('meta/topics.json'));
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

const pages = [
  { file: 'עמוד-95.html', logical: 1 },
  { file: 'עמוד-42.html', logical: 2 },
  { file: 'עמוד-43.html', logical: 3 }
];

const summary = {};
for (const { file, logical } of pages) {
  const html = read(file);
  if (!html) continue;
  const expected = content.pages?.[String(logical)]?.equations?.length;
  const blocks = count(html, /class="problem-block"/g);
  const answers = count(html, /class="problem-answer"/g);
  const live = count(html, /class="problem-equation"/g);
  summary[file] = { expected, blocks, answers, live };

  if (!Number.isInteger(expected) || expected <= 0) {
    failures.push(`${file}: no transcription for logical ${logical} in equations-content.json`);
  } else {
    if (blocks !== expected) failures.push(`${file}: expected ${expected} problem cards, found ${blocks}`);
    if (answers !== expected) failures.push(`${file}: expected ${expected} answer areas, found ${answers}`);
    if (live !== expected) failures.push(`${file}: expected ${expected} live equations, found ${live}`);
  }
  if (!html.includes('equations-page')) failures.push(`${file}: missing equations-page class`);
  if (/<img[^>]*class="pdf-page"/.test(html)) failures.push(`${file}: must not use img.pdf-page (now live HTML)`);
  if (/page-0?\d+\.svg/.test(html)) failures.push(`${file}: must not reference an SVG worksheet asset (now live HTML)`);
}

if (failures.length) {
  console.error('EQUATIONS_FIRST3_READINESS_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('EQUATIONS_FIRST3_READINESS_OK');
console.log('design=live HTML + MathJax');
console.log(`first_three=${firstThree.join(',')}`);
for (const [file, s] of Object.entries(summary)) {
  console.log(`${file}: cards=${s.blocks} answers=${s.answers} live=${s.live} (expected ${s.expected})`);
}
