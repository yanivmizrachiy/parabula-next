import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'sources', 'lovable', 'ratio-workbook', 'src');
const mapSource = readFileSync(join(sourceRoot, 'data', 'worksheetPages.tsx'), 'utf8');
const introSource = readFileSync(join(sourceRoot, 'components', 'worksheet', 'corrected', 'TeacherIntroPages.tsx'), 'utf8');
const introCss = readFileSync(join(sourceRoot, 'teacher-intro-pages.css'), 'utf8');

function worksheetBlock() {
  const start = mapSource.indexOf('export const WORKSHEET_PAGES');
  assert.notEqual(start, -1, 'WORKSHEET_PAGES must be defined');
  return mapSource.slice(start);
}

// One parsed entry per WORKSHEET_PAGES line: { id, chapter, authors, component }.
function pageEntries() {
  return worksheetBlock()
    .split('\n')
    .filter((line) => /\{ id:\s*\d+,/.test(line))
    .map((line) => ({
      id: Number((line.match(/id:\s*(\d+)/) || [])[1]),
      chapter: (line.match(/CHAPTERS\.(\w+)/) || [])[1],
      authors: /credit:\s*'authors'/.test(line),
      component: (line.match(/<(\w+)\s*\/>/) || [])[1],
    }));
}

test('the eight supplied teacher explanation pages remain, credited to the authors', () => {
  for (let page = 1; page <= 8; page += 1) {
    const padded = String(page).padStart(2, '0');
    const re = new RegExp(`credit:\\s*'authors',[^\\n]*<TeacherIntroPage${padded}\\s*/>`);
    assert.match(mapSource, re, `TeacherIntroPage${padded} must stay an authors-credited explanation page`);
  }
  const authorEntries = pageEntries().filter((e) => e.authors);
  assert.equal(authorEntries.length, 8, 'exactly the eight supplied pages carry the authors credit');
});

test('the workbook is a single contiguous page sequence (ids 1..N, all pages kept)', () => {
  const ids = pageEntries().map((e) => e.id);
  assert.ok(ids.length >= 56, 'all supplied, original and curriculum pages must be present');
  assert.deepEqual(ids, Array.from({ length: ids.length }, (_, i) => i + 1), 'ids must be contiguous 1..N');
});

test('explanations always come before the practice inside each chapter', () => {
  const seenPractice = new Set();
  for (const entry of pageEntries()) {
    if (!entry.chapter) continue;
    if (entry.authors) {
      assert.ok(
        !seenPractice.has(entry.chapter),
        `explanation page ${entry.component} must precede the practice pages of chapter ${entry.chapter}`,
      );
    } else {
      seenPractice.add(entry.chapter);
    }
  }
});

test('opening explanation preserves source attribution and the real curriculum link', () => {
  assert.match(introSource, /ד״ר יחיאל תנעמי ואיילת קריספין/);
  assert.match(introSource, /קישור לת״ל/);
  assert.match(introSource, /https:\/\/meyda\.education\.gov\.il\/files\/Pop\/0files\/matmatika\/Chativat-Beynayim\/curriculum\/updating\/numerical_7_8\.pdf/);
  assert.match(introSource, /שנה״ל תשפ״ז/);
  assert.match(introSource, /יחס ישר: מהות, סוגי יחסים, יחסים שווים ופעולות מותרות/);
});

test('all eight supplied pages are semantic HTML/React pages, not full-page image replacements', () => {
  for (let page = 1; page <= 8; page += 1) {
    assert.match(introSource, new RegExp(`export function TeacherIntroPage${String(page).padStart(2, '0')}\\(`));
  }
  assert.doesNotMatch(introSource, /<img\b[^>]*className=["'][^"']*(?:full-page|page-image|ratio-import-image)/i);
  assert.match(introCss, /\.teacher-intro-page\s*\{/);
  assert.match(introCss, /Eight opening ratio pages transcribed semantically from the teacher worksheet/);
});
