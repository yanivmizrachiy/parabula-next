// בדיקות מנוע ה־SVG: הלוך־חזור, קנה מידה זהה, אורכים, שטחים וכיווניות טקסט.
import test from 'node:test';
import assert from 'node:assert/strict';

import { createGrid, shoelaceArea, axisParallelLength, needsLtr } from '../src/coordinate-svg.mjs';

test('הלוך־חזור: כל שיעור שלם חוזר לעצמו אחרי המרה ל־SVG ובחזרה', () => {
  const g = createGrid({ xMin: -7, xMax: 9, yMin: -5, yMax: 11, unit: 17, pad: 21 });
  for (let x = g.xMin; x <= g.xMax; x += 1) {
    assert.ok(Math.abs(g.toMathX(g.toSvgX(x)) - x) < 1e-9, `X ${x} לא חזר לעצמו`);
  }
  for (let y = g.yMin; y <= g.yMax; y += 1) {
    assert.ok(Math.abs(g.toMathY(g.toSvgY(y)) - y) < 1e-9, `Y ${y} לא חזר לעצמו`);
  }
});

test('קנה מידה זהה ב־X וב־Y: יחידה אחת נותנת אותו מספר פיקסלים בשני הצירים', () => {
  const g = createGrid({ xMin: -4, xMax: 6, yMin: -3, yMax: 8, unit: 15 });
  const dx = g.toSvgX(1) - g.toSvgX(0);
  const dy = g.toSvgY(0) - g.toSvgY(1);
  assert.equal(dx, 15);
  assert.equal(dy, 15);
  assert.equal(dx, dy);
});

test('ציר Y מופנה כלפי מעלה: y גדול יותר נותן קואורדינטת SVG קטנה יותר', () => {
  const g = createGrid({ xMin: 0, xMax: 5, yMin: 0, yMax: 5, unit: 20 });
  assert.ok(g.toSvgY(5) < g.toSvgY(0));
});

test('מידות ה־viewBox נגזרות מהתחום ומהשוליים', () => {
  const g = createGrid({ xMin: -2, xMax: 8, yMin: -1, yMax: 4, unit: 10, pad: 12 });
  assert.equal(g.width, 10 * 10 + 24);
  assert.equal(g.height, 5 * 10 + 24);
  assert.match(g.toString(), /viewBox="0 0 124 74"/);
});

test('אורך קטע המקביל לציר מחושב כערך מוחלט של ההפרש', () => {
  assert.equal(axisParallelLength([-6, 4], [3, 4]), 9);
  assert.equal(axisParallelLength([3, 4], [-6, 4]), 9);
  assert.equal(axisParallelLength([5, -8], [5, 3]), 11);
  assert.equal(axisParallelLength([-10, -4], [-3, -4]), 7);
});

test('קטע אלכסוני נדחה — אינו בכלים המותרים לחטיבת הביניים', () => {
  assert.throws(() => axisParallelLength([0, 0], [3, 4]), /not axis-parallel/);
});

test('meta של הקטע רושם אורך, כיוון וחיתוך ציר נכונים', () => {
  const g = createGrid({ xMin: -8, xMax: 5, yMin: -2, yMax: 7 });
  g.segment([-6, 4], [3, 4]);
  const [segment] = g.meta.segments;
  assert.equal(segment.length, 9);
  assert.equal(segment.axisParallel, 'x');
  assert.deepEqual(g.meta.axisCrossings, [{ axis: 'y', at: [0, 4] }]);
});

test('קטע שאינו חוצה ציר אינו רושם חיתוך', () => {
  const g = createGrid({ xMin: -9, xMax: 0, yMin: 0, yMax: 8 });
  g.segment([-7, 5], [-2, 5]);
  assert.deepEqual(g.meta.axisCrossings, []);
});

test('שטח מלבן בנוסחת השרוכים תואם אורך כפול רוחב', () => {
  const rect = [[-5, -3], [4, -3], [4, 6], [-5, 6]];
  assert.equal(shoelaceArea(rect), 81);
  assert.equal(shoelaceArea(rect), 9 * 9);
});

test('שטח משולש שווה למחצית מכפלת בסיס בגובה', () => {
  assert.equal(shoelaceArea([[0, 0], [8, 0], [0, 6]]), (8 * 6) / 2);
});

test('נקודה נרשמת ב־meta עם השיעורים המתמטיים המקוריים', () => {
  const g = createGrid({ xMin: -3, xMax: 6, yMin: -3, yMax: 6 });
  g.point(-2, 5, 'A');
  assert.deepEqual(g.meta.points[0].x, -2);
  assert.deepEqual(g.meta.points[0].y, 5);
});

test('needsLtr מזהה טקסט מספרי ופוסח על טקסט עברי', () => {
  assert.equal(needsLtr('-5'), true);
  assert.equal(needsLtr('(0,5)'), true);
  assert.equal(needsLtr('x=4'), true);
  assert.equal(needsLtr('y'), false);
  assert.equal(needsLtr('אורך 5'), false, 'טקסט עברי עם ספרה אינו LTR');
});

test('כל <text> מספרי ב־SVG מקבל direction="ltr"', () => {
  const g = createGrid({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 }).grid().axes();
  const texts = [...g.toString().matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)];
  assert.ok(texts.length > 0);
  for (const [, attributes, content] of texts) {
    if (needsLtr(content)) {
      assert.match(attributes, /direction="ltr"/, `חסר direction="ltr" עבור "${content}"`);
    }
  }
});

test('תוויות השנתות מכסות את כל השיעורים השלמים פרט לאפס הכפול', () => {
  const g = createGrid({ xMin: -3, xMax: 3, yMin: -2, yMax: 2 }).axes();
  const labels = [...g.toString().matchAll(/class="cg-tick-label"[^>]*>([^<]+)</g)].map(m => m[1]);
  for (const value of ['-3', '-2', '-1', '1', '2', '3']) assert.ok(labels.includes(value), `חסרה תווית ${value}`);
  assert.equal(labels.filter(l => l === '0').length, 1, 'האפס מופיע פעם אחת בלבד');
});

test('הצירים נמשכים על פני כל התחום ומקבלים חץ', () => {
  const g = createGrid({ xMin: -4, xMax: 6, yMin: -3, yMax: 5, unit: 10, pad: 10 }).axes();
  const svg = g.toString();
  assert.equal((svg.match(/marker-end="url\(#cg-arrow\)"/g) || []).length, 2);
  const xAxis = svg.match(/<line class="cg-axis" x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)"/);
  assert.equal(Number(xAxis[1]), g.toSvgX(-4));
  assert.equal(Number(xAxis[3]), g.toSvgX(6));
});

test('הרשת מייצרת קו לכל שיעור שלם בשני הכיוונים', () => {
  const g = createGrid({ xMin: 0, xMax: 4, yMin: 0, yMax: 3 }).grid();
  const gridLines = (g.toString().match(/class="cg-grid"/g) || []).length;
  assert.equal(gridLines, 5 + 4);
});

test('createGrid דוחה תחום הפוך, יחידה לא חיובית ושיעור שאינו שלם', () => {
  assert.throws(() => createGrid({ xMin: 5, xMax: 5, yMin: 0, yMax: 4 }), /xMax/);
  assert.throws(() => createGrid({ xMin: 0, xMax: 4, yMin: 3, yMax: 1 }), /yMax/);
  assert.throws(() => createGrid({ xMin: 0, xMax: 4, yMin: 0, yMax: 4, unit: 0 }), /unit/);
  assert.throws(() => createGrid({ xMin: 0.5, xMax: 4, yMin: 0, yMax: 4 }), /integer/);
});

test('הסרטוט המצויר תואם במדידה חוזרת לשיעורים המבוקשים', () => {
  // בדיקת הלוך־חזור אמיתית: קוראים את הקואורדינטות מתוך ה־SVG שנכתב
  // וממירים אותן בחזרה לשיעורים מתמטיים.
  const g = createGrid({ xMin: -6, xMax: 8, yMin: -4, yMax: 9, unit: 13, pad: 16 });
  g.segment([-5, 3], [6, 3]);
  const line = g.toString().match(/<line class="cg-seg" x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/);
  assert.equal(g.toMathX(Number(line[1])), -5);
  assert.equal(g.toMathY(Number(line[2])), 3);
  assert.equal(g.toMathX(Number(line[3])), 6);
  assert.equal(g.toMathY(Number(line[4])), 3);
  assert.equal(Math.abs(g.toMathX(Number(line[3])) - g.toMathX(Number(line[1]))), 11);
});
