// scripts/validate-curriculum.mjs
// שער CI לתכנית הלימודים. קורא read-only ואינו משנה דף עבודה או מטא־דאטה.
// הרצה: node scripts/validate-curriculum.mjs
//
// הבדיקה נגזרת מהנתונים בפועל בכל הרצה — אין כאן ספירה קשיחה של דפים או נושאים.

import fs from 'node:fs';
import path from 'node:path';
import { CURRICULUM, walkCurriculum } from './curriculum-map.mjs';

const root = process.cwd();
const topicsPath = path.join(root, 'meta', 'topics.json');
const pagePattern = /^עמוד-(\d+)\.html$/;

const errors = [];
const check = (condition, message) => {
  if (!condition) errors.push(message);
};

const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
const curriculum = topics.curriculum;

check(Boolean(curriculum), 'meta/topics.json חסר את המפתח curriculum');
if (!curriculum) {
  console.error('VALIDATE_CURRICULUM_FAIL\n - ' + errors.join('\n - '));
  process.exit(1);
}

// ── שטיחת העץ ──────────────────────────────────────────────────────────
const flat = [];
const walk = (nodes, depth, parentId) => {
  for (const node of nodes) {
    flat.push({ node, depth, parentId });
    if (node.children?.length) walk(node.children, depth + 1, node.id);
  }
};
walk(curriculum.nodes, 0, null);

// ── העץ השמור מושווה למקור, לא לעצמו ──────────────────────────────────
// בלי זה אפשר למחוק צומת ריק מ-topics.json ולעדכן את שלושת הסיכומים,
// והבדיקה תעבור — כי כל הספירות נגזרות מאותו עץ שנבדק. השוואה למפה
// היא מה שמגן על אינווריאנט "בית ריק" של §4.4.
const mapIds = new Set(walkCurriculum(CURRICULUM).map((entry) => entry.node.id));
const storedIds = new Set(flat.map(({ node }) => node.id));
for (const id of mapIds) {
  check(storedIds.has(id), `הצומת ${id} קיים ב-curriculum-map.mjs וחסר ב-meta/topics.json`);
}
for (const id of storedIds) {
  check(mapIds.has(id), `הצומת ${id} קיים ב-meta/topics.json ואינו במפה`);
}

// ── מזהים ייחודיים ותקינים ─────────────────────────────────────────────
const seen = new Set();
for (const { node, parentId } of flat) {
  check(!seen.has(node.id), `מזהה צומת כפול: ${node.id}`);
  seen.add(node.id);
  check(typeof node.name === 'string' && node.name.length > 0, `צומת ללא שם: ${node.id}`);
  if (parentId) {
    check(
      node.id.startsWith(`${parentId}.`),
      `מזהה הצומת ${node.id} אינו נגזר ממזהה האב ${parentId}`,
    );
  }
}

// ── כל דף רשום משויך לעלה קיים, בדיוק פעם אחת ─────────────────────────
const leafIds = new Set(flat.filter(({ node }) => !node.children?.length).map(({ node }) => node.id));
const registered = new Map();
for (const topic of topics.topics) {
  for (const page of topic.pages) {
    check(!registered.has(page.number), `דף ${page.number} מופיע פעמיים ב־topics.json`);
    registered.set(page.number, page);
    check(
      typeof page.curriculumId === 'string' && page.curriculumId.length > 0,
      `דף ${page.number} חסר curriculumId`,
    );
    check(
      leafIds.has(page.curriculumId),
      `דף ${page.number} משויך אל ${page.curriculumId} שאינו צומת עלה קיים`,
    );
  }
}

// ── המונים נגזרים מחדש ומושווים לערכים השמורים ────────────────────────
const directByNode = new Map();
for (const page of registered.values()) {
  directByNode.set(page.curriculumId, (directByNode.get(page.curriculumId) ?? 0) + 1);
}

const recompute = (node) => {
  const direct = directByNode.get(node.id) ?? 0;
  const childTotal = (node.children ?? []).reduce((sum, child) => sum + recompute(child), 0);
  const total = direct + childTotal;
  check(
    node.directCount === direct,
    `directCount שגוי בצומת ${node.id}: רשום ${node.directCount}, נגזר ${direct}`,
  );
  check(
    node.pageCount === total,
    `pageCount שגוי בצומת ${node.id}: רשום ${node.pageCount}, נגזר ${total}`,
  );
  const listed = new Set(node.pages ?? []);
  check(
    listed.size === direct,
    `רשימת pages בצומת ${node.id} מכילה ${listed.size} דפים אך נגזרו ${direct}`,
  );
  // שני הכיוונים: כל דף ברשימה שייך לצומת, וכל דף ששייך לצומת מופיע ברשימה.
  // בדיקה בכיוון אחד בלבד מאפשרת החלפה ששומרת על האורך.
  for (const number of listed) {
    check(
      registered.get(number)?.curriculumId === node.id,
      `הצומת ${node.id} מונה את דף ${number} שאינו משויך אליו`,
    );
  }
  for (const [number, page] of registered) {
    if (page.curriculumId !== node.id) continue;
    check(listed.has(number), `דף ${number} משויך אל ${node.id} ואינו מופיע ברשימת pages שלו`);
  }
  return total;
};
const treeTotal = curriculum.nodes.reduce((sum, node) => sum + recompute(node), 0);

check(
  treeTotal === registered.size,
  `סכום העץ (${treeTotal}) אינו שווה למספר הדפים הרשומים (${registered.size})`,
);
check(
  topics.totalPages === registered.size,
  `totalPages (${topics.totalPages}) אינו שווה למספר הדפים הרשומים (${registered.size})`,
);

// ── כותרות הסיכום נגזרות אף הן ─────────────────────────────────────────
const leafTotal = flat.filter(({ node }) => !node.children?.length).length;
const emptyLeaves = flat.filter(
  ({ node }) => !node.children?.length && (directByNode.get(node.id) ?? 0) === 0,
).length;
check(curriculum.totalNodes === flat.length, `totalNodes שגוי: רשום ${curriculum.totalNodes}, נגזר ${flat.length}`);
check(curriculum.leafNodes === leafTotal, `leafNodes שגוי: רשום ${curriculum.leafNodes}, נגזר ${leafTotal}`);
check(
  curriculum.emptyLeafNodes === emptyLeaves,
  `emptyLeafNodes שגוי: רשום ${curriculum.emptyLeafNodes}, נגזר ${emptyLeaves}`,
);

// ── אף דף עבודה לא אבד: כל קובץ בדיסק רשום במטא־דאטה ──────────────────
const filesOnDisk = fs
  .readdirSync(root)
  .map((file) => pagePattern.exec(file))
  .filter(Boolean)
  .map((match) => Number(match[1]));
const missing = filesOnDisk.filter((number) => !registered.has(number)).sort((a, b) => a - b);
check(missing.length === 0, `דפים קיימים בדיסק ואינם רשומים ב־topics.json: ${missing.join(', ')}`);

const orphaned = [...registered.keys()]
  .filter((number) => !filesOnDisk.includes(number))
  .sort((a, b) => a - b);
check(orphaned.length === 0, `topics.json מפנה לדפים שאינם קיימים בדיסק: ${orphaned.join(', ')}`);

// ── דיווח ──────────────────────────────────────────────────────────────
if (errors.length) {
  console.error(`VALIDATE_CURRICULUM_FAIL (${errors.length})`);
  for (const message of errors) console.error(` - ${message}`);
  process.exit(1);
}

console.log(
  `VALIDATE_CURRICULUM_OK (${registered.size} דפים / ${flat.length} צמתים / ` +
    `${leafTotal} עלים / ${emptyLeaves} עלים ריקים)`,
);
