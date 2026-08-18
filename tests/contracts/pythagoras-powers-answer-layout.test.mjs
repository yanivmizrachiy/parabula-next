import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');

function assertStackedCards(page, expectedCards) {
  const html = read(`עמוד-${page}.html`);
  const starts = html.split('<div class="math-card stacked-answer-card">').slice(1);
  assert.equal(starts.length, expectedCards, `עמוד ${page}: מספר כרטיסי חזקה אנכיים שגוי`);

  for (const [index, chunk] of starts.entries()) {
    const expression = chunk.indexOf('class="exercise-expression"');
    const answer = chunk.indexOf('class="exercise-answer"');
    assert.ok(expression >= 0, `עמוד ${page}, כרטיס ${index + 1}: חסר תרגיל`);
    assert.ok(answer > expression, `עמוד ${page}, כרטיס ${index + 1}: התשובה חייבת להופיע מתחת/אחרי התרגיל`);
  }

  assert.match(
    read(`styles/pages/עמוד-${page}.css`),
    /pythagoras-power-practice\.css/u,
    `עמוד ${page}: חסרה שכבת העיצוב המשותפת לתשובה מתחת לתרגיל`,
  );
}

test('בכל תרגיל חזקה בעמודים 639–640 התשובה נמצאת במבנה נפרד מתחת לתרגיל', () => {
  assertStackedCards(639, 14);
  assertStackedCards(640, 16);
});

test('רכיב החזקות המשותף אוכף פריסה אנכית ולא inline', () => {
  const css = read('styles/topics/pythagoras-power-practice.css');
  assert.match(css, /\.stacked-answer-card\s*\{[^}]*flex-direction:\s*column/us);
  assert.match(css, /\.stacked-answer-card \.exercise-answer\s*\{[^}]*justify-content:\s*center/us);
});

test('עמוד 639 מנצל את שטח הדף באמצעות שלוש עמודות ותרגילי מכפלה נפרדים', () => {
  const css = read('styles/pages/עמוד-639.css');
  const html = read('עמוד-639.html');
  assert.match(css, /grid-template-columns:\s*repeat\(3,/u);
  assert.match(css, /min-height:\s*112px/u);
  assert.equal((html.match(/class="product-practice-grid"/gu) || []).length, 1);
  assert.match(html, /כתבו את התשובה מתחת לכל תרגיל/u);
});
