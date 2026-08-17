import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');

test('עמוד 1 שומר את המשימות הטובות ומרחיב רק את סעיף הסיווג', () => {
  const html = read('עמוד-634.html');
  assert.match(html, /בחרו אחת מן הזוויות הישרות וכתבו את מידתה/u);
  assert.match(html, /הוסיפו בסרטוט סימון של זווית ישרה/u);
  assert.match(html, /קבעו בכל סרטוט: ישרה או לא ישרה/u);
  assert.equal((html.match(/aria-label="כתבו ישרה או לא ישרה"/gu) || []).length, 3);
  assert.equal((html.match(/class="guided-ray-svg"/gu) || []).length, 2);
});

test('לקורא פיתגורס יש 43 דפים בגלילה רציפה וטעינה עצלה', () => {
  const html = read('pythagoras-reader.html');
  const js = read('scripts/pythagoras-reader.js');
  const css = read('styles/pythagoras-reader.css');
  assert.match(html, /reader-pages/u);
  assert.match(html, /scripts\/pythagoras-reader\.js/u);
  const pageArray = js.match(/const pages = \[([^\]]+)\]/u)?.[1] ?? '';
  const pages = pageArray.split(',').map((value) => Number(value.trim())).filter(Number.isFinite);
  assert.equal(pages.length, 43);
  assert.deepEqual(pages.slice(0, 4), [634, 635, 636, 637]);
  assert.match(js, /IntersectionObserver/u);
  assert.match(js, /rootMargin: '1800px 0px'/u);
  assert.match(js, /scrollIntoView\(\{ behavior: 'smooth'/u);
  assert.match(css, /scroll-behavior: smooth/u);
  assert.match(css, /pointer-events: none/u);
  assert.match(css, /position: sticky/u);
});
