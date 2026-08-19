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

test('בתרגילי חזקה/שורש עם תשובה נפרדת נשמר מבנה אנכי', () => {
  assertStackedCards(639, 20);
  assertStackedCards(640, 12);
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

test('שכבת החזקות המשותפת היא מקור העריכה היחיד לגופן ולכרטיסים הקומפקטיים', () => {
  const css = read('styles/topics/pythagoras-power-practice.css');
  assert.match(css, /\.stacked-answer-card\s*\{[^}]*flex-direction:\s*column/us);
  assert.match(css, /\.stacked-answer-card \.exercise-answer\s*\{[^}]*justify-content:\s*center/us);
  assert.match(css, /\.stacked-answer-card \.exercise-expression\s*\{[^}]*font-size:\s*18px/us);
  assert.match(css, /:has\(\.power-example-stack\) \.foundation-note\s*\{[^}]*font-size:\s*15px/us);
  assert.match(css, /\.missing-base-slot\s*\{[^}]*width:\s*34px/us);
});

test('עמוד 639 משתמש בארבע עמודות ומוסיף תרגול במקום לנפח גופנים', () => {
  const css = read('styles/pages/עמוד-639.css');
  const html = read('עמוד-639.html');
  assert.match(css, /grid-template-columns:\s*repeat\(4,/u);
  assert.match(css, /\.power-grid \.stacked-answer-card\s*\{[^}]*min-height:\s*82px/us);
  assert.match(css, /\.product-practice-grid \.stacked-answer-card\s*\{[^}]*min-height:\s*70px/us);
  assert.equal((html.match(/class="product-practice-grid"/gu) || []).length, 1);
  assert.equal((html.match(/class="math-card stacked-answer-card"/gu) || []).length, 20);
  assert.match(html, /כתבו את התשובה מתחת לכל תרגיל/u);
});

test('עמוד 640 מציג בסיס חסר כריבוע השלמה לפני חזקה, בלי סימן שאלה ובלי תשובה כפולה', () => {
  const html = read('עמוד-640.html');
  const missingCards = html.split('<div class="math-card missing-base-card">').slice(1);
  assert.equal(missingCards.length, 12, 'עמוד 640: נדרשים 12 תרגילי בסיס חסר');
  assert.doesNotMatch(html, /\?\s*\^?\s*2|\?\^2/u, 'עמוד 640: אסור סימן שאלה במקום המספר החסר');
  assert.equal((html.match(/class="foundation-fill missing-base-slot"/gu) || []).length, 12, 'עמוד 640: לכל תרגיל תיבת השלמה אחת');
  assert.equal((html.match(/class="missing-base-equals">=<\/span>/gu) || []).length, 12, 'עמוד 640: סימן שווה חייב להופיע אחרי החזקה');
  for (const [index, card] of missingCards.entries()) {
    const end = card.indexOf('</div></div>');
    const body = end >= 0 ? card.slice(0, end) : card;
    assert.doesNotMatch(body, /exercise-answer/u, `עמוד 640, בסיס חסר ${index + 1}: אין תיבת תשובה כפולה מתחת לתרגיל`);
    assert.match(body, /missing-base-slot[\s\S]*missing-base-power">2<\/sup>[\s\S]*missing-base-equals">=<\/span>/u, `עמוד 640, בסיס חסר ${index + 1}: סדר הכתיב חייב להיות □² = מספר`);
  }
  assert.match(html, /class="work-lines power-scratch-space" data-required-lines="4"/u, 'עמוד 640: נשמר מרחב חישוב אמיתי');
});

test('עמודים 641–642 אינם מחזירים תיבות תשובה inline בתרגילי השורש והקירוב', () => {
  const page641 = read('עמוד-641.html');
  const page642 = read('עמוד-642.html');
  assert.doesNotMatch(page641, /\\sqrt\{(?:4|9|16|25|36|49|64|81|100|121|144|169)\}=\\\)\s*<span class="foundation-fill/u);
  assert.doesNotMatch(page642, /\\sqrt\{(?:20|50|130)\}\\approx\\\)\s*<span class="foundation-fill/u);
});
