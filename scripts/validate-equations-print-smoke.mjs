import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function readText(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`missing file: ${rel}`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

function assertIncludes(text, needle, label) {
  if (!text.includes(needle)) {
    failures.push(`${label}: missing ${needle}`);
  }
}

const printHtml = readText('preview/print.html');
const printJs = readText('preview/print.js');
const topicsText = readText('meta/topics.json');
let topics;

try {
  topics = JSON.parse(topicsText);
} catch (error) {
  failures.push(`meta/topics.json is not valid JSON: ${error.message}`);
  topics = { topics: [] };
}

assertIncludes(printHtml, 'print.js', 'preview/print.html');
assertIncludes(printJs, 'URLSearchParams', 'preview/print.js');
assertIncludes(printJs, 'topic', 'preview/print.js');
assertIncludes(printJs, 'autoselect', 'preview/print.js');
assertIncludes(printJs, 'maxLocalPage', 'preview/print.js');
assertIncludes(printJs, 'isWithinRequestedScope', 'preview/print.js');
assertIncludes(printJs, 'משוואות', 'preview/print.js');

const equations = topics.topics?.find((topic) => topic.name === 'משוואות');
const quadratic = topics.topics?.find((topic) => topic.name === 'משוואות ריבועיות');

if (!equations) {
  failures.push('missing topic: משוואות');
}

if (!quadratic) {
  failures.push('missing separate topic: משוואות ריבועיות');
}

if (equations && quadratic && equations === quadratic) {
  failures.push('equations and quadratic equations topic objects must remain separate');
}

const equationPages = Array.isArray(equations?.pages) ? equations.pages : [];
if (equationPages.length < 3) {
  failures.push(`expected at least 3 equations pages, found ${equationPages.length}`);
}

const firstThree = equationPages.slice(0, 3).map((page) => page.file);
const expectedFirstThree = ['עמוד-95.html', 'עמוד-42.html', 'עמוד-43.html'];

for (let index = 0; index < expectedFirstThree.length; index += 1) {
  if (firstThree[index] !== expectedFirstThree[index]) {
    failures.push(`unexpected first-three equations order at index ${index}: expected ${expectedFirstThree[index]}, got ${firstThree[index] || 'missing'}`);
  }
}

for (const file of expectedFirstThree) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`first-three equation page missing: ${file}`);
  }
}

const canonicalFirst3 = 'preview/print.html?topic=משוואות&autoselect=topic&maxLocalPage=3';
const canonicalFull = 'preview/print.html?topic=משוואות&autoselect=topic';

if (failures.length) {
  console.error('EQUATIONS_PRINT_SMOKE_FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('EQUATIONS_PRINT_SMOKE_OK');
console.log(`canonical_first3=${canonicalFirst3}`);
console.log(`canonical_full=${canonicalFull}`);
console.log(`equations_pages=${equationPages.length}`);
console.log(`first_three=${firstThree.join(',')}`);
