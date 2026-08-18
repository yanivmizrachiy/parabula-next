import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// חוזה: מקטע הסיום "שאלות מתוך תוכנית הלימודים" בחוברת היחס — שאלות 1–15 מן
// התחום המספרי לכיתה ח׳ (משרד החינוך, numerical_7_8.pdf, עמ' 48–52), שהועתקו
// בנאמנות כעמודי worksheet סמנטיים בסוף החוברת, אחרי 8 הפתיחה ו־48 המקור.

const root = process.cwd();
const sourceRoot = join(root, 'sources', 'lovable', 'ratio-workbook', 'src');
const mapSource = readFileSync(join(sourceRoot, 'data', 'worksheetPages.tsx'), 'utf8');
const pagesSource = readFileSync(
  join(sourceRoot, 'components', 'worksheet', 'corrected', 'CurriculumQuestionsPages.tsx'),
  'utf8',
);

function curriculumBlock() {
  const start = mapSource.indexOf('const CURRICULUM_PAGES');
  assert.notEqual(start, -1, 'CURRICULUM_PAGES must be defined');
  // מוגדר לפני OPENING_PAGES כדי לא להיכנס לטווחים שבדיקת עמודי הפתיחה סורקת.
  const end = mapSource.indexOf('const OPENING_PAGES', start);
  assert.notEqual(end, -1, 'CURRICULUM_PAGES must be defined before OPENING_PAGES');
  return mapSource.slice(start, end);
}

test('the closing curriculum section holds contiguous local pages 1..N', () => {
  const block = curriculumBlock();
  const ids = [...block.matchAll(/\{ id:\s*(\d+),/g)].map((m) => Number(m[1]));
  assert.ok(ids.length >= 5, 'curriculum section must hold at least five pages');
  assert.deepEqual(ids, Array.from({ length: ids.length }, (_, i) => i + 1), 'local ids must be contiguous 1..N');

  const componentRefs = [...block.matchAll(/<CurriculumPage(\d{2}) \/>/g)].map((m) => m[1]);
  assert.equal(componentRefs.length, ids.length, 'every curriculum page needs a component reference');
});

test('curriculum pages are appended at the very end of the workbook, after the 48 originals', () => {
  assert.match(
    mapSource,
    /\.\.\.CURRICULUM_PAGES\.map\(\(page\) => \(\{ \.\.\.page, id: page\.id \+ OPENING_PAGES\.length \+ EXISTING_PAGES\.length \}\)\)/,
    'curriculum pages must be remapped to the end of the local numbering',
  );
  const existingIdx = mapSource.indexOf('...EXISTING_PAGES.map');
  const curriculumIdx = mapSource.indexOf('...CURRICULUM_PAGES.map');
  assert.ok(existingIdx !== -1 && curriculumIdx > existingIdx, 'curriculum spread must follow the existing-pages spread');
});

test('the closing section is titled "שאלות מתוך תוכנית הלימודים" on every page', () => {
  assert.match(mapSource, /curriculum: '8 · שאלות מתוך תוכנית הלימודים'/);
  assert.match(pagesSource, /const TOPIC = 'שאלות מתוך תוכנית הלימודים'/);

  const exportCount = (pagesSource.match(/export function CurriculumPage\d{2}\(/g) ?? []).length;
  const topicCount = pagesSource.split('topic={TOPIC}').length - 1;
  assert.ok(exportCount >= 5, 'at least five curriculum page components must be exported');
  assert.equal(topicCount, exportCount, 'every curriculum page must carry the curriculum topic title');
});

test('curriculum pages are semantic React, never full-page images', () => {
  assert.doesNotMatch(pagesSource, /<img\b/i, 'curriculum pages must not fall back to page images');
  assert.match(pagesSource, /<Question>/, 'curriculum pages use the shared worksheet question component');
});

test('curriculum pages never print visible question numbers (project rule §4)', () => {
  // Strip comments first — internal notes may map to the source question numbers,
  // but nothing rendered to the student may carry a "שאלה N" heading or numbered prop.
  const codeOnly = pagesSource
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(codeOnly, /שאלה\s*\d/, 'no visible "שאלה N" headings are allowed');
  assert.doesNotMatch(codeOnly, /\bnumber=\{/, 'worksheet questions must not use the numbered-question prop');
  assert.doesNotMatch(codeOnly, /question-number/);
});

test('curriculum questions are transcribed faithfully from the ministry source', () => {
  const markers = [
    'חילקו 56 גולות בין אורי ודן', // Q4
    'היקף מלבן הוא 40 ס"מ', // Q8
    '2,000 ש"ח', // Q5 — investment
    'מסילה ישרה לתליית תמונות', // Q15 — picture rail
    'נתון מלבן שאורכו 3a בס"מ ורוחבו 2a', // Q11 — algebraic rectangle
    'משולש ישר זווית', // right-triangle questions (Q9, Q10, Q13)
    'שבט של הצופים', // Q2
  ];
  for (const marker of markers) {
    assert.ok(pagesSource.includes(marker), `missing faithful source marker: ${marker}`);
  }
});
