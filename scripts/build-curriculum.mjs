// scripts/build-curriculum.mjs
// מזריק את עץ תכנית הלימודים ואת שיוך הדפים אל meta/topics.json.
// הרצה: node scripts/build-curriculum.mjs   (או --check לבדיקה בלבד, ללא כתיבה)
//
// המונים נגזרים כאן בזמן ריצה מתוך השיוך בפועל — אין ספירה קשיחה בשום מקום.
// מערך topics השטוח נשמר כפי שהוא; נוסף לו רק שדה curriculumId בכל דף.

import fs from 'node:fs';
import path from 'node:path';
import { CURRICULUM, buildPageIndex, walkCurriculum } from './curriculum-map.mjs';

const root = process.cwd();
const topicsPath = path.join(root, 'meta', 'topics.json');
const checkOnly = process.argv.includes('--check');
const pagePattern = /^עמוד-(\d+)\.html$/;

const fail = (message) => {
  console.error(`[FAIL] ${message}`);
  process.exit(1);
};

// ── 1. קלט ─────────────────────────────────────────────────────────────
const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));
const pageIndex = buildPageIndex();

const filesOnDisk = fs
  .readdirSync(root)
  .map((file) => pagePattern.exec(file))
  .filter(Boolean)
  .map((match) => Number(match[1]))
  .sort((a, b) => a - b);

// ── 2. שערי שלמות — אף דף רשום לא נשאר בלי בית ────────────────────────
// היקף העבודה הוא הדפים הרשומים ב־topics.json. דף שקיים בדיסק ועדיין לא נרשם
// שם הוא דף בתהליך קליטה: מדווחים עליו, אך הוא אינו מפיל את הבנייה ואינו נספר.
const registered = new Set();
for (const topic of topics.topics) for (const page of topic.pages) registered.add(page.number);

const unassigned = [...registered].filter((number) => !pageIndex.has(number)).sort((a, b) => a - b);
if (unassigned.length) {
  fail(
    `${unassigned.length} דפים רשומים ב־topics.json ואינם משויכים ב־scripts/curriculum-map.mjs: ${unassigned.join(', ')}\n` +
      '       כל דף חייב שיוך מפורש לצומת בתכנית הלימודים.',
  );
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
for (const nodeId of new Set(pageIndex.values())) {
  const entry = byId.get(nodeId);
  if (!entry) fail(`שיוך לצומת שאינו קיים בעץ: ${nodeId}`);
  if (entry.node.children?.length) fail(`שיוך לצומת שאינו עלה: ${nodeId}`);
}

// ── 3. בניית העץ עם מונים נגזרים ───────────────────────────────────────
const pagesByNode = new Map();
for (const [number, nodeId] of pageIndex) {
  if (!registered.has(number)) continue;
  if (!pagesByNode.has(nodeId)) pagesByNode.set(nodeId, []);
  pagesByNode.get(nodeId).push(number);
}
for (const list of pagesByNode.values()) list.sort((a, b) => a - b);

function buildNode(node) {
  const pages = pagesByNode.get(node.id) ?? [];
  const children = (node.children ?? []).map(buildNode);
  const pageCount = pages.length + children.reduce((sum, child) => sum + child.pageCount, 0);
  const out = { id: node.id, name: node.name };
  if (node.extension) out.extension = true;
  out.directCount = pages.length;
  out.pageCount = pageCount;
  if (pages.length) out.pages = pages;
  if (children.length) out.children = children;
  return out;
}

const nodes = CURRICULUM.map(buildNode);
const totalInTree = nodes.reduce((sum, node) => sum + node.pageCount, 0);
if (totalInTree !== registered.size) {
  fail(`סכום המונים בעץ (${totalInTree}) אינו שווה למספר הדפים הרשומים (${registered.size})`);
}

// ── 4. הזרקה למטא־דאטה, בלי לגעת במבנה השטוח ──────────────────────────
let touchedPages = 0;
for (const topic of topics.topics) {
  for (const page of topic.pages) {
    const nodeId = pageIndex.get(page.number);
    if (!nodeId) fail(`דף ${page.number} מופיע ב־topics.json ואינו משויך בתכנית הלימודים`);
    if (page.curriculumId !== nodeId) touchedPages += 1;
    page.curriculumId = nodeId;
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

// ── 5. פלט ─────────────────────────────────────────────────────────────
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

console.log(
  `[INFO] ${registered.size} דפים רשומים · ${nodeEntries.length} צמתים · ${leafCount} עלים · ` +
    `${topics.curriculum.emptyLeafNodes} עלים ריקים · ${touchedPages} שיוכי דף עודכנו`,
);
