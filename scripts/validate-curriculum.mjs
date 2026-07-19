// scripts/validate-curriculum.mjs
// שער CI לתכנית הלימודים. קורא read-only ואינו משנה דף עבודה או מטא־דאטה.

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
const pagePattern = /^עמוד-(\d+)\.html$/;
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };

const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
const curriculum = topics.curriculum;
check(Boolean(curriculum), 'meta/topics.json חסר את המפתח curriculum');
if (!curriculum) {
  console.error('VALIDATE_CURRICULUM_FAIL\n - ' + errors.join('\n - '));
  process.exit(1);
}

const flat = [];
const walk = (nodes, depth, parentId) => {
  for (const node of nodes) {
    flat.push({ node, depth, parentId });
    if (node.children?.length) walk(node.children, depth + 1, node.id);
  }
};
walk(curriculum.nodes, 0, null);

const mapIds = new Set(walkCurriculum(CURRICULUM).map((entry) => entry.node.id));
const storedIds = new Set(flat.map(({ node }) => node.id));
for (const id of mapIds) check(storedIds.has(id), `הצומת ${id} קיים במפה וחסר ב-meta/topics.json`);
for (const id of storedIds) check(mapIds.has(id), `הצומת ${id} קיים ב-meta/topics.json ואינו במפה`);

const seen = new Set();
for (const { node, parentId } of flat) {
  check(!seen.has(node.id), `מזהה צומת כפול: ${node.id}`);
  seen.add(node.id);
  check(typeof node.name === 'string' && node.name.length > 0, `צומת ללא שם: ${node.id}`);
  if (parentId) check(node.id.startsWith(`${parentId}.`), `מזהה ${node.id} אינו נגזר מהאב ${parentId}`);
}

const leafIds = new Set(flat.filter(({ node }) => !node.children?.length).map(({ node }) => node.id));
const sourcePrimary = buildPageIndex();
const sourceRelated = buildRelatedPageIndex();
const registered = new Map();
const placementIdsOf = (page) => [page.curriculumId, ...(page.relatedCurriculumIds ?? [])];

for (const topic of topics.topics) {
  for (const page of topic.pages) {
    check(!registered.has(page.number), `דף ${page.number} מופיע פעמיים ב־topics.json`);
    registered.set(page.number, page);
    check(leafIds.has(page.curriculumId), `דף ${page.number} משויך אל עלה לא קיים: ${page.curriculumId}`);
    check(sourcePrimary.get(page.number) === page.curriculumId,
      `הבית הראשי של דף ${page.number} אינו תואם למפה`);

    const related = page.relatedCurriculumIds ?? [];
    check(Array.isArray(related), `relatedCurriculumIds של דף ${page.number} אינו מערך`);
    check(new Set(related).size === related.length, `cross-listing כפול בדף ${page.number}`);
    const expected = [...(sourceRelated.get(page.number) ?? [])].sort();
    const actual = [...related].sort();
    check(JSON.stringify(actual) === JSON.stringify(expected),
      `cross-listing של דף ${page.number} אינו תואם למפה`);
    for (const nodeId of related) {
      check(leafIds.has(nodeId), `דף ${page.number} מוצג בצומת לא קיים: ${nodeId}`);
      check(nodeId !== page.curriculumId, `דף ${page.number} מוצג שוב בבית הראשי שלו`);
      check(nodeId.split('.')[0] === page.curriculumId.split('.')[0],
        `דף ${page.number} מוצג בשכבת גיל אחרת: ${page.curriculumId} → ${nodeId}`);
    }
  }
}

for (const number of sourcePrimary.keys()) check(registered.has(number), `דף ${number} קיים במפה וחסר במטא־דאטה`);
for (const number of sourceRelated.keys()) check(registered.has(number), `cross-listing לדף ${number} שחסר במטא־דאטה`);

const directByNode = new Map();
for (const [number, page] of registered) {
  for (const nodeId of placementIdsOf(page)) {
    if (!directByNode.has(nodeId)) directByNode.set(nodeId, new Set());
    directByNode.get(nodeId).add(number);
  }
}

const recompute = (node) => {
  const direct = new Set(directByNode.get(node.id) ?? []);
  const subtree = new Set(direct);
  for (const child of node.children ?? []) for (const number of recompute(child)) subtree.add(number);
  check(node.directCount === direct.size,
    `directCount שגוי בצומת ${node.id}: רשום ${node.directCount}, נגזר ${direct.size}`);
  check(node.pageCount === subtree.size,
    `pageCount שגוי בצומת ${node.id}: רשום ${node.pageCount}, נגזר ${subtree.size}`);
  const listed = new Set(node.pages ?? []);
  check(listed.size === direct.size,
    `רשימת pages בצומת ${node.id} מכילה ${listed.size} דפים אך נגזרו ${direct.size}`);
  for (const number of listed) check(direct.has(number), `הצומת ${node.id} מונה את דף ${number} ללא placement`);
  for (const number of direct) check(listed.has(number), `דף ${number} מוצג ב־${node.id} וחסר ברשימת pages`);
  return subtree;
};

const allTreePages = new Set();
for (const node of curriculum.nodes) for (const number of recompute(node)) allTreePages.add(number);
check(allTreePages.size === registered.size,
  `העץ מכסה ${allTreePages.size} דפים ייחודיים במקום ${registered.size}`);
check(topics.totalPages === registered.size,
  `totalPages (${topics.totalPages}) אינו שווה למספר הדפים הרשומים (${registered.size})`);

const leafTotal = flat.filter(({ node }) => !node.children?.length).length;
const emptyLeaves = flat.filter(
  ({ node }) => !node.children?.length && (directByNode.get(node.id)?.size ?? 0) === 0,
).length;
check(curriculum.totalNodes === flat.length, `totalNodes שגוי: ${curriculum.totalNodes} מול ${flat.length}`);
check(curriculum.leafNodes === leafTotal, `leafNodes שגוי: ${curriculum.leafNodes} מול ${leafTotal}`);
check(curriculum.emptyLeafNodes === emptyLeaves,
  `emptyLeafNodes שגוי: ${curriculum.emptyLeafNodes} מול ${emptyLeaves}`);

const filesOnDisk = fs
  .readdirSync(root)
  .map((file) => pagePattern.exec(file))
  .filter(Boolean)
  .map((match) => Number(match[1]));
const missing = filesOnDisk.filter((number) => !registered.has(number)).sort((a, b) => a - b);
check(missing.length === 0, `דפים קיימים בדיסק ואינם רשומים: ${missing.join(', ')}`);
const orphaned = [...registered.keys()].filter((number) => !filesOnDisk.includes(number)).sort((a, b) => a - b);
check(orphaned.length === 0, `topics.json מפנה לדפים שאינם קיימים: ${orphaned.join(', ')}`);

if (errors.length) {
  console.error(`VALIDATE_CURRICULUM_FAIL (${errors.length})`);
  for (const message of errors) console.error(` - ${message}`);
  process.exit(1);
}

const crossListings = [...sourceRelated.values()].reduce((sum, ids) => sum + ids.length, 0);
console.log(
  `VALIDATE_CURRICULUM_OK (${registered.size} דפים / ${crossListings} cross-listings / ` +
    `${flat.length} צמתים / ${leafTotal} עלים / ${emptyLeaves} עלים ריקים)`,
);
