import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'sources', 'lovable', 'ratio-workbook', 'src');
const mapSource = readFileSync(join(sourceRoot, 'data', 'worksheetPages.tsx'), 'utf8');
const introSource = readFileSync(join(sourceRoot, 'components', 'worksheet', 'corrected', 'TeacherIntroPages.tsx'), 'utf8');
const introCss = readFileSync(join(sourceRoot, 'teacher-intro-pages.css'), 'utf8');

function blockBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `missing start marker: ${start}`);
  assert.notEqual(endIndex, -1, `missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('the supplied teacher worksheet is permanently the first eight ratio pages', () => {
  const opening = blockBetween(mapSource, 'const OPENING_PAGES', 'const EXISTING_PAGES');
  const entries = opening.match(/component:\s*\(\)\s*=>\s*<TeacherIntroPage\d{2}\s*\/>/g) ?? [];
  assert.equal(entries.length, 8, 'ratio workbook must keep exactly eight supplied teacher opening pages');

  for (let page = 1; page <= 8; page += 1) {
    const padded = String(page).padStart(2, '0');
    assert.match(opening, new RegExp(`\\{ id: ${page},[^\\n]*<TeacherIntroPage${padded} \\/>`));
  }

  assert.match(mapSource, /export const WORKSHEET_PAGES:[\s\S]*\.\.\.OPENING_PAGES,[\s\S]*\.\.\.EXISTING_PAGES\.map\(\(page\) => \(\{ \.\.\.page, id: page\.id \+ OPENING_PAGES\.length \}\)\)/);
});

test('all original 48 ratio pages remain after the eight supplied opening pages', () => {
  const existing = blockBetween(mapSource, 'const EXISTING_PAGES', 'export const WORKSHEET_PAGES');
  const ids = [...existing.matchAll(/\{ id:\s*(\d+),/g)].map((match) => Number(match[1]));
  assert.equal(ids.length, 48, 'none of the original 48 ratio pages may be removed');
  assert.deepEqual(ids, Array.from({ length: 48 }, (_, index) => index + 1));
});

test('opening page 1 preserves source attribution and the real curriculum link', () => {
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
