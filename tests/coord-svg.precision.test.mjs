// בדיקת דיוק מדיד למחולל מערכת הצירים (CLAUDE.md §4.3).
// הכלל: כל גודל גאומטרי מחושב ולא מנוחש, ונבדק בבדיקת הלוך-חזור — מחשבים את
// הגודל בחזרה מהקואורדינטות שנכתבו ומוודאים שהוא שווה בדיוק לערך המבוקש.
// כל טקסט LTR ב-SVG חייב direction="ltr", אחרת bidi בהקשר RTL הופך `-5` ל-`5-`.

import test from 'node:test';
import assert from 'node:assert/strict';
import { makeScale, axesSvg, clipLine, needsLtr, fmt } from '../scripts/lib/coord-svg.mjs';

const BOX = { xMin: -6, xMax: 6, yMin: -6, yMax: 6, unit: 15, pad: 16 };

test('הלוך-חזור: קואורדינטה מתמטית -> פיקסל -> קואורדינטה מתמטית', () => {
  const S = makeScale(BOX);
  for (let x = BOX.xMin; x <= BOX.xMax; x += 0.5) {
    for (let y = BOX.yMin; y <= BOX.yMax; y += 0.5) {
      assert.ok(Math.abs(S.mx(S.px(x)) - x) < 1e-9, `x=${x} לא שרד הלוך-חזור`);
      assert.ok(Math.abs(S.my(S.py(y)) - y) < 1e-9, `y=${y} לא שרד הלוך-חזור`);
    }
  }
});

test('ציר y יורד כלפי מטה במסך אך עולה מתמטית', () => {
  const S = makeScale(BOX);
  assert.ok(S.py(5) < S.py(-5), 'y=5 חייב להיות מעל y=-5 על המסך');
  assert.equal(S.px(0), S.pad + 6 * S.unit);
  assert.equal(S.py(0), S.pad + 6 * S.unit);
});

test('שיפוע הישר המסורטט שווה בדיוק לשיפוע המבוקש', () => {
  const S = makeScale(BOX);
  for (const m of [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3]) {
    for (const b of [-4, -1, 0, 2, 5]) {
      const seg = clipLine({ m, b, ...BOX });
      if (!seg) continue;
      const [[x1, y1], [x2, y2]] = seg;
      // הנקודות חייבות לשבת על הישר
      assert.ok(Math.abs(y1 - (m * x1 + b)) < 1e-9, `נקודה 1 לא על הישר m=${m} b=${b}`);
      assert.ok(Math.abs(y2 - (m * x2 + b)) < 1e-9, `נקודה 2 לא על הישר m=${m} b=${b}`);
      if (Math.abs(x2 - x1) < 1e-9) continue;
      // חישוב חוזר של השיפוע מהפיקסלים שנכתבו לקובץ
      const mBack = -(S.py(y2) - S.py(y1)) / (S.px(x2) - S.px(x1));
      assert.ok(Math.abs(mBack - m) < 1e-9, `שיפוע חוזר ${mBack} ≠ ${m}`);
    }
  }
});

test('ישר דרך שתי נקודות עובר בדיוק דרכן', () => {
  const svg = axesSvg({ ...BOX, id: 't1', lines: [{ through: [[-4, -3], [5, -6]] }], points: [{ x: -4, y: -3, name: 'A' }, { x: 5, y: -6, name: 'B' }] });
  const S = makeScale(BOX);
  const line = svg.match(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)" stroke="#1d4ed8"/);
  assert.ok(line, 'לא נמצא הישר הכחול');
  const [, X1, Y1, X2, Y2] = line.map(Number);
  const mBack = -(Y2 - Y1) / (X2 - X1);
  const mWanted = (-6 - -3) / (5 - -4); // = -1/3
  assert.ok(Math.abs(mBack - mWanted) < 1e-6, `שיפוע ${mBack} ≠ ${mWanted}`);
  // הנקודות המסומנות יושבות בדיוק על מקומן
  assert.ok(svg.includes(`cx="${S.px(-4)}" cy="${S.py(-3)}"`), 'נקודה A לא במקומה');
});

test('כל טקסט מספרי ב-SVG מקבל direction="ltr" (מניעת היפוך bidi)', () => {
  const svg = axesSvg({ ...BOX, id: 't2', showZero: true, lines: [{ m: 2, b: -4, label: 'I' }], points: [{ x: 0, y: -4, name: 'A(0,−4)' }] });
  for (const m of svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)) {
    const [, attrs, content] = m;
    if (!needsLtr(content)) continue;
    assert.ok(attrs.includes('direction="ltr"'), `טקסט "${content}" חסר direction="ltr"`);
  }
});

test('תוויות הצירים משתמשות במינוס יוניקוד ולא במקף', () => {
  assert.equal(fmt(-5), '−5');
  assert.equal(fmt(3), '3');
  assert.equal(needsLtr('−5'), true);
  assert.equal(needsLtr('ציר x'), false, 'טקסט עם עברית אינו LTR');
});

test('ישר אנכי נחתך נכון ואינו מייצר NaN', () => {
  const svg = axesSvg({ ...BOX, id: 't3', lines: [{ vertical: 3 }] });
  assert.equal(/NaN|Infinity/.test(svg), false, 'נמצא NaN/Infinity ב-SVG');
});

test('אין NaN בשום SVG שנוצר עם קלט תקין', () => {
  const svg = axesSvg({
    ...BOX, id: 't4',
    lines: [{ m: 0, b: 3 }, { m: -2, b: 1 }, { through: [[0, 0], [2, 6]] }],
    points: [{ x: -3, y: 4, name: 'P' }],
    segments: [{ from: [1, 1], to: [4, 4] }],
    polylines: [{ points: [[-5, -5], [0, 0], [5, 2]] }],
  });
  assert.equal(/NaN|Infinity|undefined/.test(svg), false, 'נמצא ערך לא תקין ב-SVG');
  assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
});

test('טווח ציר גדול אינו מייצר SVG ענק או אלפי אלמנטים', () => {
  // רגרסיה: שאלה מילולית עם ציר y בטווח 0..9000 יצרה SVG בגובה 54,321px
  // כי רצפת היחידה (max(6,…)) התעלמה מהטווח. כעת כל ציר מקבל קנה מידה עצמאי.
  const svg = axesSvg({
    xMin: -1, xMax: 9, yMin: 0, yMax: 9000,
    xUnit: 235 / 10, yUnit: 195 / 9000, id: 'big',
    xGridStep: 1, yGridStep: 1000, xTickStep: 1, yTickStep: 1000,
  });
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  assert.ok(vb, 'אין viewBox');
  assert.ok(Number(vb[2]) < 400, `גובה ה-SVG ${vb[2]} חורג — ציפינו פחות מ-400`);
  const elements = (svg.match(/<line|<text|<circle/g) || []).length;
  assert.ok(elements < 200, `${elements} אלמנטים — יותר מדי`);
});

test('רשת צפופה מדי מבוטלת ולא מייצרת אלפי קווים', () => {
  const svg = axesSvg({ xMin: 0, xMax: 9000, yMin: 0, yMax: 9000, xUnit: 0.02, yUnit: 0.02, gridStep: 1, id: 'dense' });
  assert.ok((svg.match(/<line/g) || []).length < 100, 'נוצרו יותר מדי קווים');
});
