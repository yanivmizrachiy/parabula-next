import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('עמוד-634.html', 'utf8');
const css = fs.readFileSync('styles/pages/עמוד-634.css', 'utf8');

test('עמוד 1: משימת הציור היא השלמת קרן מודרכת ולא מסגרות ריקות', () => {
  assert.match(page, /בכל מסגרת נתונה קרן אחת/u);
  assert.equal((page.match(/class="guided-ray-svg"/gu) || []).length, 2);
  assert.equal((page.match(/class="guide-ray"/gu) || []).length, 2);
  assert.doesNotMatch(page, /class="drawing-space"/u);
  assert.match(page, /קרן נתונה מסובבת/u);
  assert.match(css, /\.guided-ray-svg/u);
  assert.match(css, /\.guide-ray/u);
  assert.match(css, /height:\s*100px/u);
});
