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
const EXPECTED_EQUATIONS_COUNT = 54;
const failures = [];
const warnings = [];
const notes = [];

function abs(relPath) {
  return path.join(root, relPath);
}

function exists(relPath) {
  return fs.existsSync(abs(relPath));
}

function read(relPath) {
  return fs.readFileSync(abs(relPath), 'utf8');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

function localIndex(page) {
  const title = String(page.title || '');
  const match = title.match(/עמוד\s+(\d+)/);
  if (match) return Number(match[1]);
  return Number(page.number || 0);
}

function cssPathFor(page) {
  return `styles/pages/${page.file.replace(/\.html$/, '.css')}`;
}

function pageClassFor(page) {
  const match = String(page.file || '').match(/עמוד-(\d+)\.html$/);
  return match ? `page-${match[1]}` : '';
}

function assetIndexFor(page) {
  return String(localIndex(page)).padStart(2, '0');
}

function validateShells() {
  for (const relPath of requiredFiles) {
    assert(exists(relPath), `Missing required file: ${relPath}`);
  }

  if (failures.length) return null;

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

  return metadata;
}

function validateMetadata(metadata) {
  const topics = Array.isArray(metadata.topics) ? metadata.topics : [];
  const exactTopic = topics.find((topic) => topic.name === TARGET_TOPIC);
  const forbiddenTopic = topics.find((topic) => topic.name === EXCLUDED_TOPIC);

  assert(Boolean(exactTopic), 'meta/topics.json must contain the exact משוואות topic.');
  assert(!forbiddenTopic || forbiddenTopic.name !== exactTopic?.name, 'משוואות and משוואות ריבועיות must remain distinct topics.');
  if (!exactTopic) return [];

  const pages = Array.isArray(exactTopic.pages) ? exactTopic.pages : [];
  assert(exactTopic.count === pages.length, 'The משוואות topic count must match its pages array length.');
  assert(pages.length === EXPECTED_EQUATIONS_COUNT, `Expected ${EXPECTED_EQUATIONS_COUNT} non-quadratic equations pages, got ${pages.length}.`);
  assert(pages.every((page) => page.topic === TARGET_TOPIC), 'Every equations page must carry topic=משוואות.');
  assert(pages.every((page) => page.topic !== EXCLUDED_TOPIC), 'No quadratic-equations page may appear in the equations app source topic.');
  assert(pages.every((page) => String(page.file || '').startsWith('עמוד-') && String(page.file || '').endsWith('.html')), 'Every equations page must point to a root עמוד-N.html file.');

  const sorted = pages.slice().sort((a, b) => localIndex(a) - localIndex(b));
  const seenIndexes = new Set();
  for (const page of sorted) {
    const idx = localIndex(page);
    assert(Number.isInteger(idx) && idx >= 1 && idx <= EXPECTED_EQUATIONS_COUNT, `Invalid topic-local index for ${page.file}: ${idx}`);
    assert(!seenIndexes.has(idx), `Duplicate topic-local index ${idx} in equations metadata.`);
    seenIndexes.add(idx);
  }

  for (let i = 1; i <= EXPECTED_EQUATIONS_COUNT; i += 1) {
    assert(seenIndexes.has(i), `Missing topic-local equations page index ${i}.`);
  }

  const first = sorted[0];
  assert(localIndex(first) === 1, 'The first topic-local equations page must be page 1.');
  assert(first.file === 'עמוד-95.html', `Expected topic-local equations page 1 to be עמוד-95.html, got ${first.file}.`);
  notes.push(`Equations metadata pages validated: ${pages.length}`);
  notes.push(`First topic-local page: ${first.title} (${first.file})`);
  return sorted;
}

function validateWorksheetPage(page, sortedPages) {
  const htmlPath = page.file;
  const cssPath = cssPathFor(page);
  const pageClass = pageClassFor(page);
  const local = localIndex(page);
  const expectedAsset = `pages/משוואות/assets/page-${assetIndexFor(page)}.svg`;
  const nextPage = sortedPages[local] || null;
  const prevPage = sortedPages[local - 2] || null;

  assert(exists(htmlPath), `Missing equations root page: ${htmlPath}`);
  assert(exists(cssPath), `Missing equations page CSS: ${cssPath}`);
  assert(exists(expectedAsset), `Missing equations SVG asset for ${htmlPath}: ${expectedAsset}`);
  if (!exists(htmlPath) || !exists(cssPath)) return;

  const html = read(htmlPath);
  const css = read(cssPath);

  assert(html.includes('dir="rtl"'), `${htmlPath} must preserve RTL direction.`);
  assert(!/<style\b/i.test(html), `${htmlPath} must not contain inline <style> blocks.`);
  assert(!/\sstyle\s*=/.test(html), `${htmlPath} must not contain style attributes.`);
  assert(html.includes('styles/a4-base.css'), `${htmlPath} must link styles/a4-base.css.`);
  assert(html.includes(`styles/pages/${page.file.replace(/\.html$/, '.css')}`), `${htmlPath} must link its page-specific CSS.`);
  assert(pageClass && html.includes(`main class="a4-page ${pageClass}"`), `${htmlPath} must contain main.a4-page.${pageClass}.`);
  assert(html.includes(`<div class="nav-meta">${TARGET_TOPIC} — עמוד ${local} / ${EXPECTED_EQUATIONS_COUNT}</div>`), `${htmlPath} must show correct local nav metadata.`);
  assert(html.includes(`<div class="page-number">${local}</div>`), `${htmlPath} must show correct local page-number badge.`);
  assert(html.includes(`src="${expectedAsset}"`), `${htmlPath} must use the expected equations SVG asset ${expectedAsset}.`);
  assert(!html.includes(EXCLUDED_TOPIC), `${htmlPath} must not reference ${EXCLUDED_TOPIC}.`);

  if (local === 1) {
    assert(html.includes('href="עמוד-42.html"'), `${htmlPath} page 1 must link next to עמוד-42.html.`);
  }
  if (nextPage) {
    assert(html.includes(`href="${nextPage.file}"`), `${htmlPath} must link to next topic-local page ${nextPage.file}.`);
  }
  if (prevPage) {
    assert(html.includes(`href="${prevPage.file}"`), `${htmlPath} must link to previous topic-local page ${prevPage.file}.`);
  }

  assert(!/<style\b/i.test(css), `${cssPath} must not contain HTML style blocks.`);
  assert(css.includes(`.${pageClass} .question-block`), `${cssPath} must scope question-block styles to .${pageClass}.`);
  assert(css.includes(`.${pageClass} .pdf-wrap`), `${cssPath} must scope pdf-wrap styles to .${pageClass}.`);
  assert(css.includes(`.${pageClass} .pdf-page`), `${cssPath} must scope pdf-page styles to .${pageClass}.`);
  warn(!/^\.header-container\s*\{/m.test(css), `${cssPath} still contains a global .header-container override from legacy equations cleanup.`);
  warn(!/^\.page-title\s*\{/m.test(css), `${cssPath} still contains a global .page-title override from legacy equations cleanup.`);
  warn(!/^body,html,\.a4-page\s*\{/m.test(css), `${cssPath} still contains a global body/html/.a4-page override from legacy equations cleanup.`);
}

const metadata = validateShells();
if (metadata) {
  const sortedPages = validateMetadata(metadata);
  for (const page of sortedPages) validateWorksheetPage(page, sortedPages);
}

if (failures.length) {
  console.error('VALIDATE_EQUATIONS_APP_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) {
    console.error('VALIDATE_EQUATIONS_APP_WARNINGS');
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log('VALIDATE_EQUATIONS_APP_OK');
for (const note of notes) console.log(`- ${note}`);
if (warnings.length) {
  console.log('VALIDATE_EQUATIONS_APP_WARNINGS');
  for (const warning of warnings) console.log(`- ${warning}`);
}
