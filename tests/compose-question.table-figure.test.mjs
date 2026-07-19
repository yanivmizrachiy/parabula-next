// שני באגי רנדרר שנתפסו בסקירה רב־סוכנית ונעולים כאן לצמיתות.
//
// 1. טבלת ערכים: שורת ה-headers מעולם לא נפלטה, וכל שורה קיבלה את headers[0]
//    ככותרת. ערכי ה-x נעלמו וכל השורות תויגו זהה — "מלאו את הטבלה" היה
//    בלתי אפשרי לביצוע. נמדד ב-11 שאלות על 11 דפים.
// 2. מקטעי סרטוט נשמרים בשני כתיבים ({from,to} ו-{through}). הסינון קיבל רק
//    את הראשון וזרק בשקט את השני — שאלות שכל כולן "קראו מהגרף" הודפסו
//    בלי גרף כלל.

import test from 'node:test';
import assert from 'node:assert/strict';
import { composeQuestion, figureSvg } from '../scripts/lib/compose-question.mjs';

test('טבלת ערכים פולטת את שורת הכותרות ואת כל שורות הנתונים', () => {
  const html = composeQuestion({
    id: 't1', stem: 'מלאו את הטבלה',
    table: {
      headers: ['X שעות', '0', '1', '2', '3'],
      rows: [['Y מרחק', '0', '3', null, null], ['נקודה', '(0;0)', '(1;3)', null, null]],
    },
  }, 'tt1');

  const trs = html.match(/<tr>/g) || [];
  assert.equal(trs.length, 3, 'ציפינו לשורת כותרות + שתי שורות נתונים');

  const heads = [...html.matchAll(/<th>(.*?)<\/th>/g)].map((m) => m[1].replace(/<[^>]*>/g, ''));
  assert.equal(heads.length, 3, 'כל שורה חייבת כותרת אחת');
  assert.notEqual(heads[0], heads[1], 'שורות שונות קיבלו את אותה כותרת');
  assert.ok(heads[1].includes('Y'), `שורה שנייה תויגה "${heads[1]}" במקום Y`);
  assert.ok(heads[2].includes('נקודה'), `שורה שלישית תויגה "${heads[2]}"`);

  // ערכי ה-x חייבים להופיע — בלעדיהם אי אפשר למלא את הטבלה
  for (const v of ['0', '1', '2', '3']) {
    assert.ok(html.includes(`>${v}<`), `ערך ה-x "${v}" נעדר מהטבלה`);
  }
});

test('מקטע בכתיב through מתורגם ומסורטט כמו מקטע בכתיב from/to', () => {
  const base = { kind: 'graph', xRange: [0, 10], yRange: [0, 10], gridStep: 1 };
  const withFromTo = figureSvg({ ...base, segments: [{ from: [0, 0], to: [4, 8] }] }, 'a');
  const withThrough = figureSvg({ ...base, segments: [{ through: [[0, 0], [4, 8]] }] }, 'a');

  assert.ok(withFromTo, 'כתיב from/to לא הפיק SVG');
  assert.ok(withThrough, 'כתיב through לא הפיק SVG — המקטע נזרק בשקט');
  assert.equal(
    (withThrough.match(/<line/g) || []).length,
    (withFromTo.match(/<line/g) || []).length,
    'שני הכתיבים חייבים לתת אותו מספר קווים',
  );
});

test('קו שבור בכתיב through מסורטט במלואו', () => {
  const svg = figureSvg({
    kind: 'graph', xRange: [0, 10], yRange: [0, 10], gridStep: 1,
    segments: [
      { through: [[0, 0], [4, 8]] },
      { through: [[4, 8], [7, 8]] },
      { through: [[7, 8], [9, 0]] },
    ],
  }, 'b');
  const empty = figureSvg({ kind: 'graph', xRange: [0, 10], yRange: [0, 10], gridStep: 1 }, 'b');
  const added = (svg.match(/<line/g) || []).length - (empty.match(/<line/g) || []).length;
  assert.equal(added, 3, `ציפינו לשלושה מקטעים, נוספו ${added}`);
});

test('מקטע פגום אינו מפיל את הרינדור', () => {
  const svg = figureSvg({
    kind: 'graph', xRange: [0, 5], yRange: [0, 5], gridStep: 1,
    segments: [{ through: [['A', 'B']] }, { from: 'A', to: 'B' }, { through: [[1, 1], [3, 3]] }],
  }, 'c');
  assert.ok(svg, 'קלט פגום החזיר null');
  assert.equal(/NaN|undefined/.test(svg), false, 'ערך לא תקין דלף ל-SVG');
});
