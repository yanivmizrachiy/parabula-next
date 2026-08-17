import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');

test('עמוד 1 שומר את המשימות הטובות ומרחיב רק את סעיף הסיווג', () => {
  const html = read('עמוד-634.html');
  assert.match(html, /בחרו זווית ישרה אחת מהסרטוטים וכתבו את מידתה/u);
  assert.match(html, /הוסיפו בסרטוט סימון של זווית ישרה/u);
  assert.match(html, /קבעו בכל סרטוט: ישרה או לא ישרה/u);
  assert.equal((html.match(/aria-label="כתבו ישרה או לא ישרה"/gu) || []).length, 3);
  assert.equal((html.match(/class="guided-ray-svg"/gu) || []).length, 2);
});

test('הקורא הקנוני תומך בקישור ישיר למצב גלילה ואינו משוכפל', () => {
  const catalog = read('catalog.html');
  const deepLink = read('catalog-deep-link.js');
  assert.match(catalog, /data-mode="scroll"/u);
  assert.match(deepLink, /MODE_PATTERN = \/\^\(single\|spread\|scroll\)\$\//u);
  assert.match(deepLink, /searchParams\.get\('mode'\)/u);
  assert.match(deepLink, /applyRequestedMode/u);
  assert.match(deepLink, /mode-btn\[data-mode=/u);
  assert.equal(fs.existsSync('pythagoras-reader.html'), false, 'אין ליצור קורא פיתגורס צדדי במקום catalog הקנוני');
  assert.equal(fs.existsSync('scripts/pythagoras-reader.js'), false);
  assert.equal(fs.existsSync('styles/pythagoras-reader.css'), false);
});
