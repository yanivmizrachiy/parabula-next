#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const topic = 'מערכת משוואות בשני נעלמים';
const entryPage = 609;
const legacyTopicPage = 601;
const previousExternalPage = 573;
const exitPage = 531;
const manifestPath = path.join(root, 'meta', 'two-variable-systems-manifest.json');
const syncPath = path.join(root, 'meta', 'systems-drive-sync.json');

const taskKinds = [
  ['system-card', 'systems'],
  ['story-card', 'stories'],
  ['classification-card', 'classification'],
  ['challenge-card', 'challenge'],
  ['reasoning-card', 'reasoning'],
];

const errors = [];
const warnings = [];

const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);
const readText = (file) => fs.readFileSync(file, 'utf8');
const pagePath = (page) => path.join(root, `עמוד-${page}.html`);
const pageCssPath = (page) => path.join(root, 'styles', 'pages', `עמוד-${page}.css`);

const extractNumber = (html, label, regex) => {
  const match = html.match(regex);
  if (!match) {
    fail(label);
    return null;
  }
  return Number(match[1]);
};

const countTaskKinds = (html) => {
  const counts = Object.fromEntries(taskKinds.map(([, kind]) => [kind, 0]));
  const sectionRegex = /<section\b[^>]*class="([^"]+)"[^>]*>/g;
  for (const match of html.matchAll(sectionRegex)) {
    const classes = new Set(match[1].trim().split(/\s+/));
    for (const [className, kind] of taskKinds) {
      if (classes.has(className)) counts[kind] += 1;
    }
  }
  return Object.fromEntries(Object.entries(counts).filter(([, count]) => count > 0));
};

const pages = [];
const seen = new Set();
let currentPage = entryPage;
let expectedPrevious = previousExternalPage;

for (let guard = 0; guard < 100; guard += 1) {
  if (seen.has(currentPage)) {
    fail(`navigation loop detected at page ${currentPage}`);
    break;
  }
  seen.add(currentPage);

  const htmlFile = pagePath(currentPage);
  if (!fs.existsSync(htmlFile)) {
    fail(`missing workbook page: עמוד-${currentPage}.html`);
    break;
  }

  const html = readText(htmlFile);
  if (!/<html\s+lang="he"\s+dir="rtl">/.test(html)) fail(`page ${currentPage}: missing Hebrew RTL root`);
  if (!html.includes(`<h1 class="page-title">${topic}</h1>`)) fail(`page ${currentPage}: incorrect topic heading`);
  if (!html.includes('class="a4-page') || !html.includes('systems2-page')) fail(`page ${currentPage}: missing systems2-page A4 root`);

  const activeTopicMatch = html.match(new RegExp(`<a\\s+class="topic-link is-active"\\s+href="עמוד-(\\d+)\\.html"\\s+aria-current="page">${topic}<\\/a>`));
  if (!activeTopicMatch) {
    fail(`page ${currentPage}: missing active topic link`);
  } else {
    const topicTarget = Number(activeTopicMatch[1]);
    if (topicTarget !== entryPage && topicTarget !== legacyTopicPage) {
      fail(`page ${currentPage}: active topic link targets page ${topicTarget}, expected ${entryPage}`);
    } else if (topicTarget === legacyTopicPage) {
      warn(`page ${currentPage}: keeps the legacy topic link to page ${legacyTopicPage}; the viewer entry remains page ${entryPage}`);
    }
  }

  const previous = extractNumber(
    html,
    `page ${currentPage}: missing previous navigation link`,
    /<a\s+class="nav-link"\s+href="עמוד-(\d+)\.html">הקודם<\/a>/,
  );
  const next = extractNumber(
    html,
    `page ${currentPage}: missing next navigation link`,
    /<a\s+class="nav-link"\s+href="עמוד-(\d+)\.html">הבא<\/a>/,
  );
  const position = extractNumber(
    html,
    `page ${currentPage}: missing workbook position`,
    new RegExp(`${topic} — עמוד (\\d+) / \\d+`),
  );
  const reportedTotal = extractNumber(
    html,
    `page ${currentPage}: missing workbook total`,
    new RegExp(`${topic} — עמוד \\d+ / (\\d+)`),
  );
  const printedPageNumber = extractNumber(
    html,
    `page ${currentPage}: missing printed page number`,
    /<div\s+class="page-number">(\d+)<\/div>/,
  );

  if (previous !== null && previous !== expectedPrevious) {
    fail(`page ${currentPage}: previous link is ${previous}, expected ${expectedPrevious}`);
  }
  if (position !== null && position !== pages.length + 1) {
    fail(`page ${currentPage}: position is ${position}, expected ${pages.length + 1}`);
  }
  if (printedPageNumber !== null && printedPageNumber !== pages.length + 1) {
    fail(`page ${currentPage}: printed number is ${printedPageNumber}, expected ${pages.length + 1}`);
  }

  const cssFile = pageCssPath(currentPage);
  if (!fs.existsSync(cssFile)) {
    fail(`page ${currentPage}: missing page CSS`);
  } else if (!readText(cssFile).includes("@import url('../topics/two-variable-systems.css');")) {
    fail(`page ${currentPage}: page CSS must import the shared systems stylesheet`);
  }

  const kindCounts = countTaskKinds(html);
  const taskCount = Object.values(kindCounts).reduce((sum, count) => sum + count, 0);
  if (taskCount === 0) fail(`page ${currentPage}: no recognized worksheet tasks`);
  if (Object.keys(kindCounts).length > 1) warn(`page ${currentPage}: mixes task kinds (${Object.keys(kindCounts).join(', ')})`);

  pages.push({
    position: pages.length + 1,
    page: currentPage,
    taskCount,
    taskKinds: kindCounts,
    reportedTotal,
  });

  if (next === null) break;
  if (next === exitPage) break;
  expectedPrevious = currentPage;
  currentPage = next;
}

const totalPages = pages.length;
const totalTasks = pages.reduce((sum, page) => sum + page.taskCount, 0);
const taskKindTotals = Object.fromEntries(taskKinds.map(([, kind]) => [kind, 0]));
for (const page of pages) {
  for (const [kind, count] of Object.entries(page.taskKinds)) taskKindTotals[kind] += count;
}
for (const page of pages) {
  if (page.reportedTotal !== null && page.reportedTotal !== totalPages) {
    fail(`page ${page.page}: reports ${page.reportedTotal} pages, actual traversal found ${totalPages}`);
  }
  delete page.reportedTotal;
}

const manifest = {
  schemaVersion: 1,
  topic,
  entryPage,
  previousExternalPage,
  exitPage,
  totalPages,
  totalTasks,
  taskKindTotals,
  pageOrder: pages.map(({ page }) => page),
  pages,
};

if (fs.existsSync(syncPath)) {
  const sync = JSON.parse(readText(syncPath));
  const syncedPages = sync.repositoryPages ?? [];
  if (JSON.stringify(syncedPages) !== JSON.stringify(manifest.pageOrder)) {
    fail(`meta/systems-drive-sync.json repositoryPages differs from live navigation order`);
  }
} else {
  fail('missing meta/systems-drive-sync.json');
}

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

if (errors.length === 0 && args.has('--write')) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, serialized, 'utf8');
}

if (errors.length === 0 && !args.has('--write')) {
  if (!fs.existsSync(manifestPath)) {
    fail('missing meta/two-variable-systems-manifest.json; run npm run systems:manifest:write');
  } else if (readText(manifestPath) !== serialized) {
    fail('systems manifest is stale; run npm run systems:manifest:write and commit the result');
  }
}

if (args.has('--report') || args.has('--write') || args.has('--check') || process.argv.length === 2) {
  console.log(`${topic}: ${totalPages} pages · ${totalTasks} tasks`);
  console.log(`order: ${manifest.pageOrder.join(' → ')}`);
  console.log(`task kinds: ${Object.entries(taskKindTotals).map(([kind, count]) => `${kind}=${count}`).join(', ')}`);
  for (const message of warnings) console.warn(`warning: ${message}`);
}

if (errors.length > 0) {
  for (const message of errors) console.error(`error: ${message}`);
  process.exitCode = 1;
}
