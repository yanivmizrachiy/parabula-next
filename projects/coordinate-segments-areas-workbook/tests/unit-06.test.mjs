// חוזי יחידה 6 — צורות מורכבות (עמודים 59–64).
// כל ערך נגזר מהקודקודים; רצף העמודים נאכף דרך העוגן המשותף.

import test from 'node:test';
import assert from 'node:assert/strict';
import pages from '../src/pages/index.mjs';
import unit06 from '../src/pages/unit-06-composite.mjs';
import { answers } from '../src/all-answers.mjs';
import { derive } from '../src/teacher-key.mjs';
import { shoelaceArea } from '../src/coordinate-svg.mjs';
import { EXPECTED_PAGES } from './expected-pages.mjs';

test(`רצף העמודים 1–${EXPECTED_PAGES} רציף, ללא חורים וללא כפילויות`, () => {
  const ns = pages.map(p => p.n);
  assert.equal(ns.length, EXPECTED_PAGES, `יש ${ns.length} עמודים במקום ${EXPECTED_PAGES}`);
  assert.deepEqual([...ns].sort((a, b) => a - b), Array.from({ length: EXPECTED_PAGES }, (_, i) => i + 1));
});

test('יחידה 6 מחוברת לרצף במלואה', () => {
  const range = pages.filter(p => p.n >= 59 && p.n <= 64);
  assert.equal(range.length, 6);
  for (const p of unit06) {
    assert.ok(pages.includes(p), `עמוד ${p.n} של unit-06 אינו ברצף`);
  }
});

test('כל רשומת rectilinear: צלעות מקבילות לצירים, שטח והיקף נגזרים ומוסכמים', () => {
  const records = answers.filter(r => r.kind === 'rectilinear');
  assert.ok(records.length >= 4, `רק ${records.length} רשומות rectilinear`);
  for (const r of records) {
    const d = derive(r); // זורק אם יש צלע אלכסונית
    assert.equal(d.area, shoelaceArea(r.vertices), r.id);
    assert.equal(d.sides, r.vertices.length, r.id);
    assert.equal(r.expect.area, d.area, `שטח שגוי ברשומה ${r.id}`);
    assert.equal(r.expect.perimeter, d.perimeter, `היקף שגוי ברשומה ${r.id}`);
  }
});

test('עמוד 59: חלקי הסביבון, קו המתאר וההיקף מתיישבים זה עם זה', () => {
  const parts = answers.find(a => a.id === 'p59-parts').expect;
  assert.equal(parts.bodyArea, 8 * 4);
  assert.equal(parts.pointTriangleArea, 8 * 3 / 2);
  assert.equal(parts.handleArea, 2 * 2);
  assert.equal(parts.totalArea, parts.bodyArea + parts.pointTriangleArea + parts.handleArea);

  const outlineVertices = [[2, 8], [5, 8], [5, 10], [7, 10], [7, 8], [10, 8], [10, 4], [6, 1], [2, 4]];
  assert.equal(shoelaceArea(outlineVertices), parts.totalArea, 'שרוכי קו המתאר חייבים לתת את סכום החלקים');

  const outline = answers.find(a => a.id === 'p59-outline').expect;
  const side = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  let perimeter = 0;
  for (let i = 0; i < outlineVertices.length; i += 1) {
    perimeter += side(outlineVertices[i], outlineVertices[(i + 1) % outlineVertices.length]);
  }
  assert.equal(perimeter, outline.perimeter, 'ההיקף חייב להיות סכום קטעי קו המתאר');
  assert.equal(outline.slantSide, Math.hypot(4, 3));
  // הסכומים לפי כיוון: אופקיים 3+2+3, אנכיים 2+2+4+4, יתרים 5+5.
  assert.equal(outline.horizontalSum, 3 + 2 + 3);
  assert.equal(outline.verticalSum, 2 + 2 + 4 + 4);
  assert.equal(outline.slantSum, 2 * outline.slantSide);
  assert.equal(outline.horizontalSum + outline.verticalSum + outline.slantSum, outline.perimeter);

  const subtract = answers.find(a => a.id === 'p59-subtract').expect;
  assert.equal(subtract.boundingRect, 8 * 9);
  assert.equal(subtract.boundingRect - subtract.cornerTriangles - subtract.sideRects, subtract.result);
  assert.equal(subtract.result, parts.totalArea);

  const error = answers.find(a => a.id === 'p59-error').expect;
  assert.equal(error.wrongPerimeter, outline.perimeter + outline.internalBodyTriangle + outline.internalBodyHandle);
  assert.equal(error.correctPerimeter, outline.perimeter);

  const bounding = answers.find(a => a.id === 'p59-bounding').expect;
  assert.equal(bounding.boundingPerimeter, 2 * (8 + 9));
  assert.equal(bounding.spinnerPerimeter, outline.perimeter);
  // הפרש 4 = פעמיים (3+4−5): כל חוד אלכסוני חוסך את ההפרש בין הניצבים ליתר.
  assert.equal(bounding.boundingPerimeter - bounding.spinnerPerimeter, 2 * (3 + 4 - 5));
});

test('עמוד 60: חץ — שתי דרכי הפירוק נותנות את שטח קו המתאר', () => {
  const parts = answers.find(a => a.id === 'p60-parts').expect;
  assert.equal(parts.rectArea, 7 * 4);
  assert.equal(parts.headTriangleEach, 4 * 4 / 2);
  assert.equal(parts.totalArea, parts.rectArea + 2 * parts.headTriangleEach);
  const outline = [[1, 3], [8, 3], [8, 1], [12, 5], [8, 9], [8, 7], [1, 7]];
  assert.equal(shoelaceArea(outline), parts.totalArea, 'שרוכי החץ חייבים להסכים');
  const alt = answers.find(a => a.id === 'p60-alt').expect;
  assert.equal(alt.bigHeadTriangle, 8 * 4 / 2);
  assert.equal(alt.altSum, parts.rectArea + alt.bigHeadTriangle);
  assert.equal(alt.altSum, parts.totalArea);

  const third = answers.find(a => a.id === 'p60-thirdWay').expect;
  assert.equal(third.boundingRect, 11 * 8);
  assert.equal(third.cutRects, 2 * (7 * 2));
  assert.equal(third.cutTriangles, 2 * (4 * 4 / 2));
  assert.equal(third.boundingRect - third.cutRects - third.cutTriangles, third.result);
  assert.equal(third.result, parts.totalArea);
});

test('עמוד 61: מסגרת בחיסור, וצורת L בשלוש דרכים', () => {
  const frame = answers.find(a => a.id === 'p61-frame').expect;
  assert.equal(frame.bigRect, 8 * 6);
  assert.equal(frame.hole, 4 * 2);
  assert.equal(frame.frameArea, frame.bigRect - frame.hole);

  const L = derive(answers.find(a => a.id === 'p61-L'));
  assert.equal(L.area, 36);
  assert.equal(L.perimeter, 28);
  assert.equal(8 * 6 - 4 * 3, L.area, 'חיסור מהמלבן החוסם');
  assert.equal(8 * 3 + 4 * 3, L.area, 'חלוקה אופקית');
  assert.equal(4 * 6 + 4 * 3, L.area, 'חלוקה אנכית');

  const bounding = answers.find(a => a.id === 'p61-L-bounding').expect;
  assert.equal(bounding.boundingPerimeter, 2 * (8 + 6));
  assert.equal(bounding.boundingPerimeter, L.perimeter, 'היקף ה-L שווה להיקף המלבן החוסם');

  const build = answers.find(a => a.id === 'p61-build30').expect;
  assert.equal(build.targetArea, 6 * 6 - 2 * 3);
});

test('עמוד 62: היקף המדרגות שווה להיקף המלבן החוסם, והשטח לחלוקה לשלושה מלבנים', () => {
  const stairs = derive(answers.find(a => a.id === 'p62-stairs'));
  assert.equal(stairs.perimeter, 36);
  assert.equal(stairs.area, 54);
  const insight = answers.find(a => a.id === 'p62-insight').expect;
  assert.equal(insight.boundingRectPerimeter, 2 * (10 + 8));
  assert.equal(insight.boundingRectPerimeter, stairs.perimeter);
  const parts = answers.find(a => a.id === 'p62-areaParts').expect;
  assert.equal(parts.bottomRect, 10 * 3);
  assert.equal(parts.middleRect, 6 * 3);
  assert.equal(parts.topRect, 3 * 2);
  assert.equal(parts.bottomRect + parts.middleRect + parts.topRect, stairs.area);
  const build = answers.find(a => a.id === 'p62-build').expect;
  assert.equal(build.fixedPerimeter, 2 * (9 + 6));
  assert.equal(build.areaDeterminedInAdvance, false);
});

test('עמוד 63: שלוש צורות שטח 24, והזוג שווה השטח ושווה ההיקף', () => {
  const a = derive(answers.find(r => r.id === 'p63-rectA'));
  const b = derive(answers.find(r => r.id === 'p63-rectB'));
  const c = derive(answers.find(r => r.id === 'p63-LC'));
  const d = derive(answers.find(r => r.id === 'p63-LD'));
  assert.equal(a.area, 24); assert.equal(b.area, 24);
  assert.equal(c.area, 24); assert.equal(d.area, 24);
  assert.ok(a.perimeter < c.perimeter && c.perimeter < b.perimeter, 'סדר ההיקפים 20 < 22 < 28');
  assert.equal(d.perimeter, b.perimeter, 'הזוג חייב לחלוק היקף');
  assert.equal(d.area, b.area, 'הזוג חייב לחלוק גם שטח');
  // צורה לא-מלבנית בהיקף 24: שטחה קטן משטח הריבוע 6×6 מחקר עמוד 28.
  const lp = derive(answers.find(r => r.id === 'p63-Lperim24'));
  assert.equal(lp.perimeter, 24);
  assert.equal(lp.area, 20);
  assert.ok(lp.area < 6 * 6, 'צורת ה-L חייבת להפסיד לריבוע');
});

test('עמוד 64: מבדק — מקבילית, טרפז, דלתון, בית ושאלה הפוכה', () => {
  const para = answers.find(a => a.id === 'p64-parallelogram');
  const dp = derive(para);
  assert.equal(dp.baseLength, 5);
  assert.equal(dp.height, 3);
  assert.equal(dp.area, 15);
  assert.equal(dp.shoelace, 15);
  const [P, Q, R] = para.vertices;
  assert.deepEqual([P[0] + R[0] - Q[0], P[1] + R[1] - Q[1]], para.vertices[3], 'S = P + R − Q');

  const dt = derive(answers.find(a => a.id === 'p64-trapezoid'));
  assert.equal(dt.baseBig, 9);
  assert.equal(dt.baseSmall, 3);
  assert.equal(dt.height, 4);
  assert.equal(dt.area, 24);
  assert.equal(dt.legAD, 5);
  assert.equal(dt.legBC, 5);
  assert.equal(dt.perimeter, 22);

  const dk = derive(answers.find(a => a.id === 'p64-kite'));
  assert.equal(dk.diagonalAC, 10);
  assert.equal(dk.diagonalBD, 6);
  assert.equal(dk.area, 30);

  const comp = answers.find(a => a.id === 'p64-composite').expect;
  assert.equal(comp.rectPart, 6 * 3);
  assert.equal(comp.roofTriangle, 6 * 2 / 2);
  assert.equal(comp.sumWay, comp.rectPart + comp.roofTriangle);
  assert.equal(comp.boundingRect, 6 * 5);
  assert.equal(comp.subtractWay, comp.boundingRect - comp.cutTriangles);
  assert.equal(comp.sumWay, comp.subtractWay);
  const houseOutline = [[1, 1], [7, 1], [7, 4], [4, 6], [1, 4]];
  assert.equal(shoelaceArea(houseOutline), comp.sumWay, 'שרוכי הבית חייבים להסכים');

  const inv = answers.find(a => a.id === 'p64-inverse').expect;
  assert.equal(inv.givenSide * inv.missingSide, inv.rectArea);
});

test('כיסוי תשובות: לכל עמוד 59–64 יש לפחות רשומה אחת', () => {
  for (let n = 59; n <= 64; n++) {
    assert.ok(answers.some(a => a.page === n), `עמוד ${n} ללא רשומת תשובה`);
  }
});
