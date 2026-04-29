import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'preview/equations.html',
  'preview/equations.css',
  'preview/equations.js',
  'preview/print.html',
  'preview/print.css',
  'preview/print.js',
  'meta/topics.json'
];

const TARGET_TOPIC = 'משוואות';
const EXCLUDED_TOPIC = 'משוואות ריבועיות';
const failures = [];
const notes = [];

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function localIndex(page) {
  const title = String(page.title || '');
  const match = title.match(/עמוד\s+(\d+)/);
  if (match) return Number(match[1]);
  return Number(page.number || 0);
}

for (const relPath of requiredFiles) {
  assert(fs.existsSync(path.join(root, relPath)), `Missing required file: ${relPath}`);
}

if (!failures.length) {
  const equationsHtml = read('preview/equations.html');
  const equationsJs = read('preview/equations.js');
  const printHtml = read('preview/print.html');
  const printJs = read('preview/print.js');
  const metadata = JSON.parse(read('meta/topics.json'));

  assert(equationsHtml.includes('dir="rtl"'), 'preview/equations.html must preserve RTL direction.');
  assert(equationsHtml.includes('./equations.css'), 'preview/equations.html must link preview/equations.css.');
  assert(equationsHtml.includes('./equations.js'), 'preview/equations.html must load preview/equations.js.');
  assert(!/<style\b/i.test(equationsHtml), 'preview/equations.html must not contain inline <style> blocks.');
  assert(!/\sstyle\s*=/.test(equationsHtml), 'preview/equations.html must not contain style attributes.');

  assert(printHtml.includes('./print.css'), 'preview/print.html must link preview/print.css.');
  assert(printHtml.includes('./equations.html'), 'preview/print.html must expose a link back to the dedicated equations app.');
  assert(!/<style\b/i.test(printHtml), 'preview/print.html must not contain inline <style> blocks.');
  assert(!/\sstyle\s*=/.test(printHtml), 'preview/print.html must not contain style attributes.');

  assert(equationsJs.includes(`TARGET_TOPIC = '${TARGET_TOPIC}'`), 'preview/equations.js must target the exact משוואות topic.');
  assert(equationsJs.includes(`EXCLUDED_TOPIC = '${EXCLUDED_TOPIC}'`), 'preview/equations.js must explicitly protect against the quadratic-equations topic.');
  assert(equationsJs.includes('../meta/topics.json'), 'preview/equations.js must read meta/topics.json.');
  assert(equationsJs.includes('downloadLinks'), 'preview/equations.js must support exporting page links.');
  assert(equationsJs.includes('openPrintCenter'), 'preview/equations.js must hand off to the print center.');

  assert(printJs.includes('requestedTopic'), 'preview/print.js must support a topic URL parameter.');
  assert(printJs.includes('autoSelectMode'), 'preview/print.js must support autoselect mode.');
  assert(printJs.includes('localPageIndex'), 'preview/print.js must sort by topic-local page index.');
  assert(printJs.includes('pageSort'), 'preview/print.js must use a shared pageSort ordering function.');

  const topics = Array.isArray(metadata.topics) ? metadata.topics : [];
  const exactTopic = topics.find((topic) => topic.name === TARGET_TOPIC);
  const forbiddenTopic = topics.find((topic) => topic.name === EXCLUDED_TOPIC);

  assert(Boolean(exactTopic), 'meta/topics.json must contain the exact משוואות topic.');
  assert(!forbiddenTopic || forbiddenTopic.name !== exactTopic?.name, 'משוואות and משוואות ריבועיות must remain distinct topics.');

  if (exactTopic) {
    const pages = Array.isArray(exactTopic.pages) ? exactTopic.pages : [];
    assert(exactTopic.count === pages.length, 'The משוואות topic count must match its pages array length.');
    assert(pages.length === 54, `Expected 54 non-quadratic equations pages, got ${pages.length}.`);
    assert(pages.every((page) => page.topic === TARGET_TOPIC), 'Every equations page must carry topic=משוואות.');
    assert(pages.every((page) => page.topic !== EXCLUDED_TOPIC), 'No quadratic-equations page may appear in the equations app source topic.');
    assert(pages.every((page) => String(page.file || '').startsWith('עמוד-') && String(page.file || '').endsWith('.html')), 'Every equations page must point to a root עמוד-N.html file.');

    const sorted = pages.slice().sort((a, b) => localIndex(a) - localIndex(b));
    const first = sorted[0];
    assert(localIndex(first) === 1, 'The first topic-local equations page must be page 1.');
    assert(first.file === 'עמוד-95.html', `Expected topic-local equations page 1 to be עמוד-95.html, got ${first.file}.`);
    notes.push(`Equations pages validated: ${pages.length}`);
    notes.push(`First topic-local page: ${first.title} (${first.file})`);
  }
}

if (failures.length) {
  console.error('VALIDATE_EQUATIONS_APP_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('VALIDATE_EQUATIONS_APP_OK');
for (const note of notes) console.log(`- ${note}`);
