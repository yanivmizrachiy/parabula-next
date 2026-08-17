// בדיקות מוטציה לשומרים עצמם.
// שומר שאינו נכשל על קלט פגום הוא שומר מדומה; כאן מוודאים שכל ביטוי
// זיהוי אכן תופס את ההפרה שהוא אמור למנוע.
import test from 'node:test';
import assert from 'node:assert/strict';

import { needsLtr } from '../src/coordinate-svg.mjs';
import { ltr, pt, expr, esc, FOOTER_LINES } from '../src/render.mjs';

const BARE_POINT = /(?<!>)\b[A-Z]\(-?\d+,-?\d+\)/g;
const SINGLE_DOLLAR = /(?<!\$)\$(?!\$)/g;

test('גלאי שיעורי הנקודה תופס נקודה שאינה עטופה ב־LTR', () => {
  const broken = '<p class="wtask-text">נתונה A(3,2) על הישר</p>';
  assert.equal((broken.match(BARE_POINT) || []).length, 1, 'הגלאי פספס נקודה חשופה');
});

test('גלאי שיעורי הנקודה אינו מסמן נקודה עטופה כראוי', () => {
  assert.equal((pt('A', 3, 2).match(BARE_POINT) || []).length, 0);
  assert.equal((ltr('B(-4,7)').match(BARE_POINT) || []).length, 0);
});

test('גלאי תוחם ה־$ היחיד תופס $ בודד ומתעלם מ־$$', () => {
  assert.equal(('העלות $ 5 שקלים'.match(SINGLE_DOLLAR) || []).length, 1);
  assert.equal(('$$x=1$$'.match(SINGLE_DOLLAR) || []).length, 0);
});

test('גלאי ה־LTR תופס טקסט SVG מספרי בלי direction', () => {
  const broken = '<text class="cg-tick-label" x="10" y="20">-5</text>';
  const [, attributes, content] = broken.match(/<text\b([^>]*)>([\s\S]*?)<\/text>/);
  assert.equal(needsLtr(content), true);
  assert.equal(/direction="ltr"/.test(attributes), false, 'הגלאי היה אמור לסמן חוסר');
});

test('גלאי ה־inline CSS תופס style ו־<style>', () => {
  assert.equal(/\sstyle\s*=\s*["']/i.test('<div style="color:red">x</div>'), true);
  assert.equal(/<style\b/i.test('<style>.a{}</style>'), true);
  assert.equal(/\sstyle\s*=\s*["']/i.test('<div class="wtask">x</div>'), false);
});

test('גלאי מספור השאלות תופס „שאלה N” ואינו תופס טקסט לגיטימי', () => {
  assert.equal(/שאלה\s*\d/.test('<h3>שאלה 3</h3>'), true);
  assert.equal(/שאלה\s*\d/.test('כתבו שאלה משלכם'), false);
});

test('בדיקת הכותרת התחתונה רגישה לנוסח תואר חסר', () => {
  const wrong = 'יניב רז - מדריך חט"ב בעיר ירושלים';
  assert.notEqual(esc(wrong), esc(FOOTER_LINES[0]));
  assert.equal(/מדריך חט"ב בעיר ירושלים/.test(wrong), true, 'הגלאי חייב לזהות את הנוסח השגוי');
});

test('גלאי מכל ה־LTR תופס ביטוי מענה בלי dir', () => {
  const good = expr(['_', '+', '_']);
  assert.match(good, /<span class="wexpr" dir="ltr">/);
  const broken = good.replace(' dir="ltr"', '');
  const matches = [...broken.matchAll(/<span class="wexpr"([^>]*)>/g)];
  assert.equal(matches.length, 1);
  assert.equal(/dir="ltr"/.test(matches[0][1]), false, 'הגלאי היה אמור לסמן חוסר');
});
