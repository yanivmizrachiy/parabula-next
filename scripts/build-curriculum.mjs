// scripts/build-curriculum.mjs
// מזריק את עץ תכנית הלימודים ואת שיוך הדפים אל meta/topics.json.
// הרצה: node scripts/build-curriculum.mjs   (או --check לבדיקה בלבד, ללא כתיבה)
//
// curriculumId הוא הבית הראשי היחיד של הדף. relatedCurriculumIds הם הצגות
// משניות בתוך אותה שכבת גיל. directCount מונה הצגות ישירות; pageCount מונה
// דפים ייחודיים בענף, ולכן דף שמוצג בשני תתי־נושאים אינו מנפח את מונה האב.

import fs from 'node:fs';
import path from 'node:path';
import {
  CURRICULUM,
  buildPageIndex,
  buildRelatedPageIndex,
  walkCurriculum,
} from './curriculum-map.mjs';

const root = process.cwd();
const topicsPath = path.join(root, 'meta', 'topics.json');
const checkOnly = process.argv.includes('--check');
const pagePattern = /^עמוד-(\d+)\.html$/;

const fail = (message) => {
  console.error(`[FAIL] ${message}`);
  process.exit(1);
};

const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
const pageIndex = buildPageIndex();
const relatedIndex = buildRelatedPageIndex();

const filesOnDisk = fs
  .readdirSync(root)
  .map((file) => pagePattern.exec(file))
  .filter(Boolean)
  .map((match) => Number(match[1]))
  .sort((a, b) => a - b);

const registered = new Set();
for (const topic of topics.topics) for (const page of topic.pages) registered.add(page.number);

const unassigned = [...registered].filter((number) => !pageIndex.has(number)).sort((a, b) => a - b);
if (unassigned.length) {
  fail(
    `${unassigned.length} דפים רשומים ב־topics.json ואינם משויכים ב־scripts/curriculum-map.mjs: ${unassigned.join(', ')}\n` +
      '       כל דף חייב בית ראשי מפורש בתכנית הלימודים.',
  );
}

for (const number of relatedIndex.keys()) {
  if (!pageIndex.has(number)) fail(`cross-listing מפנה לדף ${number} שאין לו בית ראשי`);
  if (!registered.has(number)) fail(`cross-listing מפנה לדף ${number} שאינו רשום ב־topics.json`);
}

const onDisk = new Set(filesOnDisk);
const ghosts = [...pageIndex.keys()].filter((number) => !onDisk.has(number)).sort((a, b) => a - b);
if (ghosts.length) fail(`שיוך מפנה לדפים שאינם קיימים בדיסק: ${ghosts.join(', ')}`);

const pendingIntake = filesOnDisk.filter((number) => !registered.has(number));
if (pendingIntake.length) {
  console.warn(
    `[WARN] ${pendingIntake.length} דפים קיימים בדיסק וטרם נרשמו ב־topics.json: ${pendingIntake.join(', ')}\n` +
      '       הם אינם נספרים בעץ עד לרישומם ולשיוכם.',
  );
}

const nodeEntries = walkCurriculum();
const byId = new Map(nodeEntries.map((entry) => [entry.node.id, entry]));
const validateLeaf = (nodeId, label) => {
  const entry = byId.get(nodeId);
  if (!entry) fail(`${label} לצומת שאינו קיים בעץ: ${nodeId}`);
  if (entry.node.children?.length) fail(`${label} לצומת שאינו עלה: ${nodeId}`);
};
for (const nodeId of new Set(pageIndex.values())) validateLeaf(nodeId, 'שיוך');
for (const [number, nodeIds] of relatedIndex) {
  const primary = pageIndex.get(number);
  for (const nodeId of nodeIds) {
    validateLeaf(nodeId, 'cross-listing');
    if (nodeId === primary) fail(`דף ${number} מוצג שוב בבית הראשי שלו ${nodeId}`);
    if (nodeId.split('.')[0] !== primary.split('.')[0]) {
      fail(`דף ${number} מוצג בשכבת גיל אחרת: ${primary} → ${nodeId}`);
    }
  }
}

const pagesByNode = new Map();
const addPlacement = (nodeId, number) => {
  if (!pagesByNode.has(nodeId)) pagesByNode.set(nodeId, []);
  const list = pagesByNode.get(nodeId);
  if (!list.includes(number)) list.push(number);
};
for (const [number, nodeId] of pageIndex) {
  if (registered.has(number)) addPlacement(nodeId, number);
}
for (const [number, nodeIds] of relatedIndex) {
  if (!registered.has(number)) continue;
  for (const nodeId of nodeIds) addPlacement(nodeId, number);
}
for (const [nodeId, list] of pagesByNode) {
  list.sort((a, b) =>
    Number(pageIndex.get(a) !== nodeId) - Number(pageIndex.get(b) !== nodeId) || a - b);
}

function buildNode(node) {
  const pages = pagesByNode.get(node.id) ?? [];
  const children = (node.children ?? []).map(buildNode);
  const pageNumbers = new Set(pages);
  for (const child of children) for (const number of child.__pageNumbers) pageNumbers.add(number);
  const out = { id: node.id, name: node.name };
  if (node.extension) out.extension = true;
  out.directCount = pages.length;
  out.pageCount = pageNumbers.size;
  if (pages.length) out.pages = pages;
  if (children.length) out.children = children;
  Object.defineProperty(out, '__pageNumbers', { value: pageNumbers, enumerable: false });
  return out;
}

const nodes = CURRICULUM.map(buildNode);
const allTreePages = new Set();
for (const node of nodes) for (const number of node.__pageNumbers) allTreePages.add(number);
if (allTreePages.size !== registered.size) {
  fail(`העץ מכסה ${allTreePages.size} דפים ייחודיים במקום ${registered.size}`);
}

let touchedPages = 0;
for (const topic of topics.topics) {
  for (const page of topic.pages) {
    const nodeId = pageIndex.get(page.number);
    if (!nodeId) fail(`דף ${page.number} מופיע ב־topics.json ואינו משויך בתכנית הלימודים`);
    const related = [...(relatedIndex.get(page.number) ?? [])];
    const before = JSON.stringify({ primary: page.curriculumId, related: page.relatedCurriculumIds ?? [] });
    page.curriculumId = nodeId;
    if (related.length) page.relatedCurriculumIds = related;
    else delete page.relatedCurriculumIds;
    const after = JSON.stringify({ primary: page.curriculumId, related: page.relatedCurriculumIds ?? [] });
    if (before !== after) touchedPages += 1;
  }
}

const leafCount = nodeEntries.filter((entry) => !entry.node.children?.length).length;
topics.curriculum = {
  source: 'כותרות לדפי עבודה במתמטיקה חטיבת ביניים',
  totalNodes: nodeEntries.length,
  leafNodes: leafCount,
  emptyLeafNodes: nodeEntries.filter(
    (entry) => !entry.node.children?.length && !pagesByNode.has(entry.node.id),
  ).length,
  nodes,
};

const serialized = `${JSON.stringify(topics, null, 2)}\n`;
const previous = fs.readFileSync(topicsPath, 'utf-8');
const changed = serialized !== previous;

if (checkOnly) {
  if (changed) fail('meta/topics.json אינו מעודכן. הריצו: node scripts/build-curriculum.mjs');
  console.log('[OK] meta/topics.json מעודכן מול תכנית הלימודים.');
} else {
  if (changed) fs.writeFileSync(topicsPath, serialized, 'utf-8');
  console.log(`[OK] ${changed ? 'נכתב' : 'ללא שינוי'} — meta/topics.json`);
}

const relatedPlacements = [...relatedIndex.values()].reduce((sum, ids) => sum + ids.length, 0);
console.log(
  `[INFO] ${registered.size} דפים ייחודיים · ${relatedPlacements} cross-listings · ` +
    `${nodeEntries.length} צמתים · ${leafCount} עלים · ` +
    `${topics.curriculum.emptyLeafNodes} עלים ריקים · ${touchedPages} שיוכי דף עודכנו`,
);
