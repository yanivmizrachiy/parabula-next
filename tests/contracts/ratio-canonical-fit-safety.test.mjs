import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const fitCss = fs.readFileSync('sources/lovable/ratio-workbook/src/ratio-canonical-fit.css', 'utf8');
const mainSource = fs.readFileSync('sources/lovable/ratio-workbook/src/main.tsx', 'utf8');
const pageLayout = fs.readFileSync('sources/lovable/ratio-workbook/src/components/worksheet/pages/PageLayout.tsx', 'utf8');

const allowedFitPages = new Set([1, 16, 18, 21, 48]);

test('canonical fit is loaded after the main ratio layout fixes', () => {
  const layoutIndex = mainSource.indexOf('./ratio-layout-fixes.css');
  const fitIndex = mainSource.indexOf('./ratio-canonical-fit.css');
  assert.ok(layoutIndex >= 0, 'ratio layout fixes import is missing');
  assert.ok(fitIndex > layoutIndex, 'canonical fit must load after the general ratio layout layer');
});

test('canonical fit never hides overflow, scales a page, or shrinks typography', () => {
  assert.doesNotMatch(fitCss, /overflow\s*:\s*hidden/iu);
  assert.doesNotMatch(fitCss, /transform\s*:\s*scale/iu);
  assert.doesNotMatch(fitCss, /zoom\s*:/iu);
  assert.doesNotMatch(fitCss, /font-size\s*:/iu);
});

test('canonical fit is restricted to the five measured blocker pages only', () => {
  const pageIds = [...fitCss.matchAll(/\.ratio-page-(\d+)/gu)].map((match) => Number(match[1]));
  assert.ok(pageIds.length > 0, 'canonical fit has no page-scoped selectors');
  for (const pageId of pageIds) {
    assert.ok(allowedFitPages.has(pageId), `unexpected page in canonical fit scope: ${pageId}`);
  }
  for (const pageId of allowedFitPages) {
    assert.ok(pageIds.includes(pageId), `missing measured blocker page from canonical fit: ${pageId}`);
  }
});

test('PageLayout gives every ratio page a stable ratio-page-N class', () => {
  assert.match(pageLayout, /`ratio-page-\$\{pageNumber\}`/u);
});
