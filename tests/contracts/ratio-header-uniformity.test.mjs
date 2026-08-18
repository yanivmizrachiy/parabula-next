import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const chapterPath = path.join(root, 'sources/lovable/ratio-workbook/src/data/ratioChapters.json');
const pageLayoutPath = path.join(root, 'sources/lovable/ratio-workbook/src/components/worksheet/pages/PageLayout.tsx');
const sourceCssPath = path.join(root, 'sources/lovable/ratio-workbook/src/ratio-v2.css');
const liveCssPath = path.join(root, 'styles/pages/ratio-import.css');

const chapterDocument = JSON.parse(fs.readFileSync(chapterPath, 'utf8'));
const chapters = chapterDocument.chapters;

test('ratio chapter map covers every page exactly once and uses the approved first heading', () => {
  assert.equal(chapters.find((chapter) => chapter.id === 1)?.title, 'משמעות היחס');

  const pageIds = chapters.flatMap((chapter) => chapter.pageIds).sort((a, b) => a - b);
  assert.deepEqual(pageIds, Array.from({ length: 48 }, (_, index) => index + 1));
  assert.equal(new Set(pageIds).size, 48);
});

test('ratio source renderer resolves headings from the canonical map', () => {
  const source = fs.readFileSync(pageLayoutPath, 'utf8');
  assert.match(source, /ratioChapters\.json/);
  assert.match(source, /canonicalRatioChapterTitle/);
  assert.match(source, /נושא: \{topic\} \| \{chapterTitle\}/);
});

test('ratio source and live shell share one Rubik and blue heading system', () => {
  const sourceCss = fs.readFileSync(sourceCssPath, 'utf8');
  const liveCss = fs.readFileSync(liveCssPath, 'utf8');

  assert.match(sourceCss, /--ws-font-sans:\s*'Rubik'/);
  assert.match(sourceCss, /--ws-accent:\s*#1d4ed8/);
  assert.match(sourceCss, /--ws-title:\s*#1e3a8a/);
  assert.match(sourceCss, /\.page-header-title[\s\S]*font-family:\s*var\(--ws-font-sans\)/);

  assert.match(liveCss, /--ratio-header-font:\s*'Rubik'/);
  assert.match(liveCss, /--ratio-header-accent:\s*var\(--title-blue, #1d4ed8\)/);
  assert.match(liveCss, /--ratio-header-title:\s*#1e3a8a/);
  assert.match(liveCss, /content:\s*"נושא: יחס \| " var\(--ratio-header-section\)/);
  assert.match(liveCss, /--ratio-header-section:\s*"משמעות היחס"/);
});
