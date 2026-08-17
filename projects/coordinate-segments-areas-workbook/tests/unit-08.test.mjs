// חוזי יחידה 8 — חקר, הנמקה ומבדק סיום (עמודים 71–75).
// דוגמאות נגדיות וספירות פתרונות נבדקות חישובית, לא רק כמלל.

import test from 'node:test';
import assert from 'node:assert/strict';
import pages from '../src/pages/index.mjs';
import unit08 from '../src/pages/unit-08-inquiry.mjs';
import { answers } from '../src/all-answers.mjs';
import { derive } from '../src/teacher-key.mjs';
import { EXPECTED_PAGES } from './expected-pages.mjs';

test(`רצף העמודים 1–${EXPECTED_PAGES} רציף (בדיקת יחידה 8)`, () => {
  const ns = pages.map(p => p.n);
  assert.equal(ns.length, EXPECTED_PAGES, `יש ${ns.length} עמודים במקום ${EXPECTED_PAGES}`);
  assert.deepEqual([...ns].sort((a, b) => a - b), Array.from({ length: EXPECTED_PAGES }, (_, i) => i + 1));
});

test('יחידה 8 מחוברת לרצף במלואה, והספר מסתיים בעמוד 75', () => {
  const range = pages.filter(p => p.n >= 71 && p.n <= 75);
  assert.equal(range.length, 5);
  for (const p of unit08) {
    assert.ok(pages.includes(p), `עמוד ${p.n} של unit-08 אינו ברצף`);
  }
  assert.equal(Math.max(...pages.map(p => p.n)), 75);
});

test('עמוד 71: הדוגמאות הנגדיות מפריכות באמת', () => {
  const c1 = answers.find(a => a.id === 'p71-counter1').expect;
  assert.equal(4 * 6, c1.areaBoth);
  assert.equal(2 * 12, c1.areaBoth, 'אותו שטח');
  assert.equal(c1.perimeterA, 2 * (4 + 6));
  assert.equal(c1.perimeterB, 2 * (2 + 12));
  assert.notEqual(c1.perimeterA, c1.perimeterB, 'ההיקפים חייבים להיות שונים');

  const c2 = answers.find(a => a.id === 'p71-counter2').expect;
  assert.equal(2 * (6 + 6), c2.perimeterBoth);
  assert.equal(2 * (2 + 10), c2.perimeterBoth, 'אותו היקף');
  assert.equal(c2.areaA, 6 * 6);
  assert.equal(c2.areaB, 2 * 10);
  assert.notEqual(c2.areaA, c2.areaB, 'השטחים חייבים להיות שונים');
});

test('עמוד 72: ספירות הפתרונות מדויקות', () => {
  const rect48 = answers.find(a => a.id === 'p72-rect48').expect;
  const pairs48 = [];
  for (let w = 1; w * w <= 48; w += 1) {
    if (48 % w === 0) pairs48.push([w, 48 / w]);
  }
  assert.equal(pairs48.length, rect48.pairCount, 'מספר זוגות המחלקים של 48');

  const lineC = answers.find(a => a.id === 'p72-lineC').expect;
  assert.equal(lineC.base, 7 - 1);
  assert.equal(lineC.height, 6 - 1);
  assert.equal(lineC.areaForAnyC, lineC.base * lineC.height / 2);
  // גם הישר y=-4 במרחק 5 מהבסיס y=1.
  assert.equal(Math.abs(-4 - 1), lineC.height);

  const perim28 = answers.find(a => a.id === 'p72-perim28').expect;
  assert.equal(perim28.sumOfSides, 28 / 2);
  const pairs28 = [];
  for (let w = 1; w <= perim28.sumOfSides - w; w += 1) pairs28.push([w, perim28.sumOfSides - w]);
  assert.equal(pairs28.length, perim28.pairCount, 'מספר זוגות שסכומם 14');

  // שני קודקודים: נגדיים ⇒ מלבן יחיד; סמוכים ⇒ אינסוף (הצלע הניצבת חופשית).
  const fourth = answers.find(a => a.id === 'p72-fourth').expect;
  assert.equal(fourth.ifOpposite, 'מלבן יחיד');
  assert.match(fourth.ifAdjacent, /אינסוף/);
  assert.doesNotMatch(fourth.ifAdjacent, /שני מלבנים/, 'התיקון מהאימות האדברסרי חייב להישמר');
});

test('עמוד 73: הפתרון לדוגמה עומד בכל האילוצים', () => {
  const yard = derive(answers.find(a => a.id === 'p73-yard'));
  assert.equal(yard.area, 28);
  const ex = answers.find(a => a.id === 'p73-example').expect;
  assert.equal(ex.yard, yard.area);
  assert.equal(ex.classroom, 6 * 4);
  assert.equal(ex.shade, 4 * 3 / 2);
  assert.equal(ex.total, ex.classroom + ex.yard + ex.shade);
  assert.equal(ex.inRange, ex.total >= ex.rangeMin && ex.total <= ex.rangeMax);
  assert.equal(ex.classroomPerimeter, 2 * (6 + 4));
  assert.ok(ex.classroomPerimeter <= ex.perimeterCap, 'אילוץ ההיקף חייב להתקיים בדוגמה');
  // החצר חוצה את ציר Y: קודקודיה משני עברי x=0; צלעה העליונה על ציר X.
  const yardVerts = answers.find(a => a.id === 'p73-yard').vertices;
  assert.ok(yardVerts.some(v => v[0] < 0) && yardVerts.some(v => v[0] > 0), 'החצר חייבת לחצות את ציר Y');
  assert.ok(yardVerts.some(v => v[1] < 0) && yardVerts.every(v => v[1] <= 0), 'החצר משיקה לציר X מלמטה');
});

test('עמוד 74: שכונת המדע — כל הצורות נגזרות והטעות מזוהה', () => {
  const school = derive(answers.find(a => a.id === 'p74-school'));
  assert.equal(school.area, 24);
  assert.equal(school.perimeter, 20);
  const park = derive(answers.find(a => a.id === 'p74-park'));
  assert.equal(park.baseLength, 6);
  assert.equal(park.height, 4);
  assert.equal(park.area, 12);
  const pool = derive(answers.find(a => a.id === 'p74-pool'));
  assert.equal(pool.area, 15);
  const missing = answers.find(a => a.id === 'p74-missingD').expect;
  assert.equal(missing.D, '(-4,5)');
  const error = answers.find(a => a.id === 'p74-error').expect;
  assert.equal(error.wrongPerimeter, 6 + 4);
  assert.equal(error.correctPerimeter, school.perimeter);
});

test('עמוד 75: המבחן המסכם — קטע, מלבן-ריבוע, משולש ודלתון', () => {
  const seg = derive(answers.find(a => a.id === 'p75-segment'));
  assert.equal(seg.length, 7);
  const rect = derive(answers.find(a => a.id === 'p75-rect'));
  assert.equal(rect.width, rect.height, 'המלבן הוא למעשה ריבוע 5×5');
  assert.equal(rect.area, 25);
  assert.equal(rect.perimeter, 20);
  // המלבן חוצה את ציר X: פינותיו משני עברי y=0.
  const corners = answers.find(a => a.id === 'p75-rect').corners;
  assert.ok(corners[0][1] < 0 && corners[1][1] > 0);
  const tri = derive(answers.find(a => a.id === 'p75-triangle'));
  assert.equal(tri.area, 12);
  const kite = derive(answers.find(a => a.id === 'p75-kite'));
  assert.equal(kite.area, 12);
  assert.equal(kite.area, tri.area, 'שטח המשולש ושטח הדלתון שווים בכוונה');
  // פירוק צורה במבחן: צורת ה-L — חיסור וחלוקה נותנים אותו שטח.
  const L = derive(answers.find(a => a.id === 'p75-L'));
  assert.equal(L.area, 14);
  assert.equal(L.perimeter, 18);
  assert.equal(5 * 4 - 3 * 2, L.area, 'חיסור מהמלבן החוסם');
  assert.equal(5 * 2 + 2 * 2, L.area, 'חלוקה לשני מלבנים');
  // חקר: שטח = היקף מספרית.
  assert.equal(4 * 4, 2 * (4 + 4));
  assert.equal(3 * 6, 2 * (3 + 6));
});

test('כיסוי תשובות: לכל עמוד 71–75 יש לפחות רשומה אחת', () => {
  for (let n = 71; n <= 75; n++) {
    assert.ok(answers.some(a => a.page === n), `עמוד ${n} ללא רשומת תשובה`);
  }
});
