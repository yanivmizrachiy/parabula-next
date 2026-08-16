import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OLD_FIRST = 617;
const NEW_FIRST = 634;
const COUNT = 17;
const OFFSET = NEW_FIRST - OLD_FIRST;

const htmlName = (n) => `עמוד-${n}.html`;
const cssName = (n) => path.join('styles', 'pages', `עמוד-${n}.css`);
const abs = (p) => path.join(ROOT, p);
const exists = (p) => fs.existsSync(abs(p));
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const write = (p, content) => fs.writeFileSync(abs(p), content, 'utf8');

const oldIds = Array.from({ length: COUNT }, (_, i) => OLD_FIRST + i);
const newIds = oldIds.map((n) => n + OFFSET);

// Safety: never overwrite a destination. If the migration has already completed,
// allow a no-op rerun; any partial state is a hard failure.
const oldHtmlPresent = oldIds.filter((n) => exists(htmlName(n)));
const newHtmlPresent = newIds.filter((n) => exists(htmlName(n)));
if (oldHtmlPresent.length === 0 && newHtmlPresent.length === COUNT) {
  console.log('[OK] Pythagoras foundation IDs already migrated.');
  process.exit(0);
}
if (oldHtmlPresent.length !== COUNT) {
  throw new Error(`מצב מקור חלקי: נמצאו ${oldHtmlPresent.length}/${COUNT} דפי HTML בטווח ${OLD_FIRST}-${OLD_FIRST + COUNT - 1}`);
}
if (newHtmlPresent.length !== 0) {
  throw new Error(`הטווח החדש אינו פנוי לחלוטין: ${newHtmlPresent.join(', ')}`);
}
for (const n of oldIds) {
  if (!exists(cssName(n))) throw new Error(`חסר CSS מקור: ${cssName(n)}`);
}
for (const n of newIds) {
  if (exists(cssName(n))) throw new Error(`CSS יעד כבר קיים: ${cssName(n)}`);
}

const remapHtmlRefs = (input) => {
  let out = input;
  for (let i = 0; i < COUNT; i += 1) {
    out = out.replaceAll(htmlName(oldIds[i]), htmlName(newIds[i]));
  }
  return out;
};

for (let i = 0; i < COUNT; i += 1) {
  const oldId = oldIds[i];
  const newId = newIds[i];
  let html = remapHtmlRefs(read(htmlName(oldId)));
  html = html.replaceAll(`styles/pages/עמוד-${oldId}.css`, `styles/pages/עמוד-${newId}.css`);
  html = html.replace(new RegExp(`\\bpage-${oldId}\\b`, 'g'), `page-${newId}`);
  write(htmlName(newId), html);

  let css = read(cssName(oldId));
  css = css.replaceAll(`page-${oldId}`, `page-${newId}`);
  write(cssName(newId), css);
}

// Reconnect the two external edges of the local Pythagoras sequence.
for (const [file, from, to] of [
  ['עמוד-530.html', htmlName(OLD_FIRST), htmlName(NEW_FIRST)],
  ['עמוד-9.html', htmlName(OLD_FIRST + COUNT - 1), htmlName(NEW_FIRST + COUNT - 1)],
]) {
  const before = read(file);
  const after = before.replaceAll(from, to);
  if (after === before) throw new Error(`${file}: קישור הקצה ${from} לא נמצא`);
  write(file, after);
}

// Move the explicit curriculum ownership range without touching any other subject.
const curriculumPath = path.join('scripts', 'curriculum-map.mjs');
{
  const before = read(curriculumPath);
  const needle = `'g7.geo.pythagoras': ['617-633', '9-30', 41, '375-380'],`;
  const replacement = `'g7.geo.pythagoras': ['634-650', '9-30', 41, '375-380'],`;
  if (!before.includes(needle)) throw new Error('לא נמצא שיוך פיתגורס הצפוי ב-curriculum-map.mjs');
  write(curriculumPath, before.replace(needle, replacement));
}

// Move the dedicated contract to the new physical IDs while preserving local 1–17 semantics.
const contractPath = path.join('tests', 'contracts', 'pythagoras-foundations.test.mjs');
{
  let text = read(contractPath);
  text = text.replace('const FIRST = 617;', 'const FIRST = 634;');
  for (let i = 0; i < COUNT; i += 1) {
    text = text.replaceAll(htmlName(oldIds[i]), htmlName(newIds[i]));
  }
  write(contractPath, text);
}

// Update any explicit physical-ID references in the single source of truth, if present.
const rulesPath = 'CLAUDE.md';
{
  let text = read(rulesPath);
  text = text.replaceAll('617–633', '634–650');
  text = text.replaceAll('617-633', '634-650');
  for (let i = 0; i < COUNT; i += 1) {
    text = text.replaceAll(htmlName(oldIds[i]), htmlName(newIds[i]));
  }
  write(rulesPath, text);
}

// Move registration numbers and any exact physical file references in topics metadata.
const topicsPath = path.join('meta', 'topics.json');
{
  const topics = JSON.parse(read(topicsPath));
  let moved = 0;
  const remapValue = (value) => {
    if (Array.isArray(value)) return value.map(remapValue);
    if (value && typeof value === 'object') {
      const out = {};
      for (const [key, val] of Object.entries(value)) out[key] = remapValue(val);
      if (Number.isInteger(out.number) && out.number >= OLD_FIRST && out.number < OLD_FIRST + COUNT) {
        out.number += OFFSET;
        moved += 1;
      }
      return out;
    }
    if (typeof value === 'string') {
      let out = value;
      for (let i = 0; i < COUNT; i += 1) out = out.replaceAll(htmlName(oldIds[i]), htmlName(newIds[i]));
      return out;
    }
    return value;
  };
  const remapped = remapValue(topics);
  if (moved !== COUNT) throw new Error(`meta/topics.json: ציפיתי להעביר ${COUNT} רשומות, הועברו ${moved}`);
  write(topicsPath, `${JSON.stringify(remapped, null, 2)}\n`);
}

// Remove the old physical files only after all new copies and canonical references exist.
for (const n of oldIds) {
  fs.unlinkSync(abs(htmlName(n)));
  fs.unlinkSync(abs(cssName(n)));
}

// Final local invariants before generators/checks run.
for (const n of oldIds) {
  if (exists(htmlName(n)) || exists(cssName(n))) throw new Error(`הטווח הישן לא נוקה: ${n}`);
}
for (const n of newIds) {
  if (!exists(htmlName(n)) || !exists(cssName(n))) throw new Error(`הטווח החדש אינו שלם: ${n}`);
}

console.log(`[OK] Pythagoras foundations migrated safely: ${OLD_FIRST}-${OLD_FIRST + COUNT - 1} -> ${NEW_FIRST}-${NEW_FIRST + COUNT - 1}.`);
