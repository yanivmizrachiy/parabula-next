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
  assertStackedCards(641, 12);
  assertStackedCards(642, 3);
});

test('דוגמאות ההסבר האנכיות בעמודים 639 ו-643 נשמרות קומפקטיות', () => {
  for (const page of [639, 643]) {
    const html = read(`עמוד-${page}.html`);
    const css = read(`styles/pages/עמוד-${page}.css`);
    const example = html.match(/class="power-example-stack"[\s\S]*?class="exercise-expression"[\s\S]*?class="exercise-answer"/u);
    assert.ok(example, `עמוד ${page}: דוגמת החזקה חייבת להיות במבנה אנכי של תרגיל ואז תשובה`);
    assert.match(css, /pythagoras-power-practice\.css/u);
  }
});

test('שכבת החזקות המשותפת מרכזת טיפוגרפיה, גריד וריווח', () => {
  const css = read('styles/topics/pythagoras-power-practice.css');
  for (const variable of [
    '--power-question-gap', '--power-grid-columns', '--power-grid-gap',
    '--power-card-min-height', '--power-card-padding', '--power-instruction-font-size',
    '--power-sentence-columns',
  ]) {
    assert.match(css, new RegExp(variable), `חסר משתנה משותף ${variable}`);
  }
  assert.match(css, /\.pyt-foundation \.question-block\s*\{[^}]*justify-content:\s*flex-start/us);
  assert.match(css, /\.pyt-foundation \.power-grid\s*\{[^}]*repeat\(var\(--power-grid-columns\)/us);
  assert.match(css, /\.stacked-answer-card \.exercise-expression\s*\{[^}]*font-size:\s*18px/us);
  assert.match(css, /\.compact-root-note\s*\{[^}]*padding:\s*8px 12px/us);
  assert.match(css, /\.missing-base-slot\s*\{[^}]*width:\s*34px/us);
  assert.match(css, /\.power-sentence-grid\s*\{/u);
  assert.match(css, /\.missing-root-card\s*\{/u);
});

test('עמוד 639 משנה משתנים בלבד עבור גריד/כרטיס/שטח עבודה ומוסיף תרגול', () => {
  const css = read('styles/pages/עמוד-639.css');
  const html = read('עמוד-639.html');
  assert.match(css, /--power-grid-columns:\s*4/u);
  assert.match(css, /--power-card-min-height:\s*82px/u);
  assert.match(css, /--power-scratch-min-height:\s*110px/u);
  assert.equal((html.match(/class="product-practice-grid"/gu) || []).length, 1);
  assert.equal((html.match(/class="math-card stacked-answer-card"/gu) || []).length, 20);
  assert.match(html, /class="work-lines power-scratch-space" data-required-lines="4"/u);
  assert.match(html, /\\\(17\^2=/u);
  assert.match(html, /\\\(30\^2\\\)/u);
});

test('עמוד 640 מציג בסיס חסר תקין ומנצל את השטח במשפטי השלמה', () => {
  const html = read('עמוד-640.html');
  const css = read('styles/pages/עמוד-640.css');
  const missingCards = html.split('<div class="math-card missing-base-card">').slice(1);
  assert.equal(missingCards.length, 12, 'עמוד 640: נדרשים 12 תרגילי בסיס חסר');
  assert.doesNotMatch(html, /\?\s*\^?\s*2|\?\^2/u, 'עמוד 640: אסור סימן שאלה במקום המספר החסר');
  assert.equal((html.match(/class="foundation-fill missing-base-slot"/gu) || []).length, 12, 'עמוד 640: לכל תרגיל תיבת השלמה אחת');
  assert.equal((html.match(/class="missing-base-equals">=<\/span>/gu) || []).length, 12, 'עמוד 640: סימן שווה חייב להופיע אחרי החזקה');
  assert.equal((html.match(/class="power-sentence-card"/gu) || []).length, 8, 'עמוד 640: נדרשים שמונה משפטי השלמה נוספים');
  assert.match(html, /הריבוע של המספר \\\(7\\\) הוא/u);
  assert.match(html, /הוא \\\(100\\\)/u);
  assert.doesNotMatch(html, /power-scratch-space/u, 'עמוד 640: אין להשאיר רשת גדולה במקום תרגול שימושי');
  assert.match(css, /--power-grid-columns:\s*4/u);
  assert.match(css, /--power-sentence-columns:\s*2/u);
});

test('עמוד 641 מציג הסבר שורש קצר, LTR לדוגמה ותרגול הפוך במקום בלוק 64', () => {
  const html = read('עמוד-641.html');
  const css = read('styles/pages/עמוד-641.css');
  assert.match(html, /פעולת השורש היא הפעולה ההפוכה של פעולת ההעלאה בריבוע/u);
  assert.match(html, /class="math-ltr">\\\(5\^2=25\\\)<\/span>/u);
  assert.doesNotMatch(html, /כתבו זוג מתאים של חזקה ושורש עבור המספר/u);
  assert.equal((html.match(/class="math-card missing-root-card"/gu) || []).length, 8, 'עמוד 641: נדרשים שמונה תרגילי שורש הפוכים');
  assert.equal((html.match(/missing-radicand-slot/gu) || []).length, 8, 'עמוד 641: בכל תרגיל הפוך משלימים את המספר בתוך השורש');
  assert.match(css, /--power-grid-columns:\s*4/u);
});

test('עמוד 651 כולל רק דוגמה קומפקטית והוראת פתרון קצרה', () => {
  const html = read('עמוד-651.html');
  const css = read('styles/pages/עמוד-651.css');
  assert.doesNotMatch(html, /כאשר \\\(x\\\) מייצג אורך של צלע/u);
  assert.match(html, /class="compact-solution-flow"[\s\S]*x\^2=81[\s\S]*x=\\sqrt\{81\}[\s\S]*x=9/u);
  assert.match(html, />פתרו לפי הדוגמה\.<\/div>/u);
  assert.match(css, /\.compact-worked-example\s*\{/u);
  assert.match(css, /font-size:\s*15px/u);
});

test('עמודים 641–642 אינם מחזירים תיבות תשובה inline בתרגילי השורש והקירוב', () => {
  const page641 = read('עמוד-641.html');
  const page642 = read('עמוד-642.html');
  assert.doesNotMatch(page641, /\\sqrt\{(?:4|9|16|25|36|49|64|81|100|121|144|169)\}=\\\)\s*<span class="foundation-fill/u);
  assert.doesNotMatch(page642, /\\sqrt\{(?:20|50|130)\}\\approx\\\)\s*<span class="foundation-fill/u);
});
