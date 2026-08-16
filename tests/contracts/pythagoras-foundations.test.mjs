import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FIRST = 617;
const COUNT = 17;
const TOTAL = 40;
const files = Array.from({ length: COUNT }, (_, i) => `עמוד-${FIRST + i}.html`);

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const visibleQuestionNumber = /(?:שאלה|תרגיל)\s*\d+/u;

for (let i = 0; i < files.length; i += 1) {
  const file = files[i];
  const local = i + 1;

  test(`${file}: חוזה דף יסודות פיתגורס`, () => {
    assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} חסר`);
    const html = read(file);

    assert.match(html, /<html\s+lang="he"\s+dir="rtl"/u);
    assert.match(html, new RegExp(`<title>עמוד ${local} — משפט פיתגורס<\\/title>`, 'u'));
    assert.match(html, new RegExp(`משפט פיתגורס — עמוד ${local} \\/ ${TOTAL}`, 'u'));
    assert.match(html, new RegExp(`<div class="page-number">${local}<\\/div>`, 'u'));
    assert.match(html, /styles\/topics\/pythagoras-foundations\.css/u);
    assert.match(html, /class="a4-page[^\"]*pythagoras[^\"]*pyt-foundation/u);
    assert.match(html, /<footer class="gz-footer">/u);
    assert.match(html, /יניב רז - מדריך מחוזי חט"ב בעיר ירושלים/u);
    assert.match(html, /הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין/u);
    assert.doesNotMatch(html, visibleQuestionNumber, 'אין מספור שאלות גלוי בדפי היסוד');

    const prev = local === 1 ? 'עמוד-530.html' : `עמוד-${FIRST + i - 1}.html`;
    const next = local === COUNT ? 'עמוד-9.html' : `עמוד-${FIRST + i + 1}.html`;
    assert.match(html, new RegExp(`href="${prev}"`, 'u'));
    assert.match(html, new RegExp(`href="${next}"`, 'u'));
  });
}

test('רצף התוכן מתקדם מהיסודות לפיתגורס', () => {
  assert.match(read('עמוד-617.html'), /זווית ישרה/u);
  assert.match(read('עמוד-618.html'), /משולש ישר/u);
  assert.match(read('עמוד-619.html'), /ניצבים/u);
  assert.match(read('עמוד-620.html'), /יתר/u);
  assert.match(read('עמוד-622.html'), /4\^2|4\\cdot4/u);
  assert.match(read('עמוד-624.html'), /שורש ריבועי/u);
  assert.match(read('עמוד-627.html'), /3\^2\+4\^2/u);
  assert.match(read('עמוד-628.html'), /סכום ריבועי אורכי הניצבים שווה לריבוע אורך היתר/u);
  assert.match(read('עמוד-629.html'), /a\^2\+b\^2=c\^2/u);
  assert.match(read('עמוד-631.html'), /מצאו את אורך היתר/u);
  assert.match(read('עמוד-632.html'), /מצאו את אורך הניצב החסר/u);
});
