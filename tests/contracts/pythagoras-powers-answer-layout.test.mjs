import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');

function assertStackedCards(page, expectedCards) {
  const html = read(`עמוד-${page}.html`);
  const starts = html.split('<div class="math-card stacked-answer-card">').slice(1);
  assert.equal(starts.length, expectedCards, `עמוד ${page}: מספר כרטיסי תשובה אנכיים שגוי`);

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

test('בכל תרגיל חזקה או שורש בעמודים 639–642 התשובה נמצאת במבנה נפרד מתחת לתרגיל', () => {
  assertStackedCards(639, 14);
  assertStackedCards(640, 16);
  assertStackedCards(641, 13);
  assertStackedCards(642, 3);
});

test('דוגמאות ההסבר בעמודים 639, 641 ו-643 מציגות תשובה מתחת לביטוי', () => {
  for (const page of [639, 641, 643]) {
    const html = read(`עמוד-${page}.html`);
    const css = read(`styles/pages/עמוד-${page}.css`);
    const example = html.match(/class="power-example-stack"[\s\S]*?class="exercise-expression"[\s\S]*?class="exercise-answer"/u);
    assert.ok(example, `עמוד ${page}: דוגמת החזקה/שורש חייבת להיות במבנה אנכי של תרגיל ואז תשובה`);
    assert.match(css, /pythagoras-power-practice\.css/u);
  }
});

test('רכיב החזקות והשורשים המשותף אוכף פריסה אנכית ולא inline', () => {
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

test('עמודים 641–642 אינם מחזירים תיבות תשובה inline בתרגילי השורש והקירוב', () => {
  const page641 = read('עמוד-641.html');
  const page642 = read('עמוד-642.html');
  assert.doesNotMatch(page641, /\\sqrt\{(?:4|9|16|25|36|49|64|81|100|121|144|169)\}=\\\)\s*<span class="foundation-fill/u);
  assert.doesNotMatch(page642, /\\sqrt\{(?:20|50|130)\}\\approx\\\)\s*<span class="foundation-fill/u);
});
