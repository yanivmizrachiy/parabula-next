// חוזי יחידה 5 — הדלתון (עמודים 53–58).
// כל ערך נגזר מהקודקודים ומושווה ל-expect; רצף העמודים 1–58 נאכף כאן.

import test from 'node:test';
import assert from 'node:assert/strict';
import pages from '../src/pages/index.mjs';
import unit05 from '../src/pages/unit-05-kite.mjs';
import { answers } from '../src/all-answers.mjs';
import { derive } from '../src/teacher-key.mjs';
import { shoelaceArea } from '../src/coordinate-svg.mjs';
import { EXPECTED_PAGES } from './expected-pages.mjs';

const near = (a, b) => Math.abs(a - b) < 1e-9;

test(`רצף העמודים 1–${EXPECTED_PAGES} רציף, ללא חורים וללא כפילויות`, () => {
  const ns = pages.map(p => p.n);
  assert.equal(ns.length, EXPECTED_PAGES, `יש ${ns.length} עמודים במקום ${EXPECTED_PAGES}`);
  assert.deepEqual([...ns].sort((a, b) => a - b), Array.from({ length: EXPECTED_PAGES }, (_, i) => i + 1));
  assert.equal(new Set(ns).size, EXPECTED_PAGES, 'מספר עמוד כפול');
});

test('יחידה 5 מחוברת לרצף במלואה', () => {
  const tail = pages.filter(p => p.n >= 53 && p.n <= 58);
  assert.equal(tail.length, 6);
  for (const p of unit05) {
    assert.ok(pages.includes(p), `עמוד ${p.n} של unit-05 אינו ברצף`);
  }
});

test('כל רשומת דלתון: אלכסונים מקבילים לצירים ומאונכים, והשטח מסכים עם השרוכים', () => {
  const kites = answers.filter(r => r.kind === 'kite');
  assert.ok(kites.length >= 6, `רק ${kites.length} רשומות דלתון`);
  for (const r of kites) {
    const [A, B, C, D] = r.vertices;
    const acVertical = A[0] === C[0];
    assert.ok(
      acVertical ? B[1] === D[1] : A[1] === C[1] && B[0] === D[0],
      `האלכסונים ברשומה ${r.id} אינם מקבילים לשני הצירים`
    );
    const d = derive(r);
    assert.equal(d.area, d.diagonalAC * d.diagonalBD / 2, r.id);
    assert.equal(d.shoelace, d.area, `שרוכים ≠ מחצית מכפלת האלכסונים ברשומה ${r.id}`);
    const kitePairs = (near(d.sides.AB, d.sides.DA) && near(d.sides.BC, d.sides.CD))
      || (near(d.sides.AB, d.sides.BC) && near(d.sides.CD, d.sides.DA));
    assert.ok(kitePairs, `אין שני זוגות צלעות סמוכות שוות ברשומה ${r.id}`);
    if (r.expect.area !== undefined) assert.equal(r.expect.area, d.area, r.id);
  }
});

test('עמוד 53: BD נחצה על ידי AC, ו-AC אינו נחצה', () => {
  const r = answers.find(a => a.id === 'p53-ABCD');
  const d = derive(r);
  assert.deepEqual(d.cross, [6, 4]);
  const [A, B, C, D] = r.vertices;
  const [mx, my] = d.cross;
  assert.equal(Math.abs(B[0] - mx), Math.abs(D[0] - mx), 'BD חייב להיחצות');
  assert.notEqual(Math.abs(A[1] - my), Math.abs(C[1] - my), 'AC אינו אמור להיחצות');
  const b = answers.find(a => a.id === 'p53-bisection').expect;
  assert.equal(b.MB, Math.abs(B[0] - mx));
  assert.equal(b.MD, Math.abs(D[0] - mx));
  assert.equal(b.MA, Math.abs(A[1] - my));
  assert.equal(b.MC, Math.abs(C[1] - my));
});

test('עמוד 54: המלבן החוסם כפול מהדלתון בדיוק — בשני הדלתונים', () => {
  for (const id of ['p54-ABCD', 'p54-EFGH']) {
    const r = answers.find(a => a.id === id);
    const d = derive(r);
    const xs = r.vertices.map(v => v[0]);
    const ys = r.vertices.map(v => v[1]);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    assert.equal(width, r.expect.boundingWidth, id);
    assert.equal(height, r.expect.boundingHeight, id);
    assert.equal(width * height, r.expect.boundingArea, id);
    assert.equal(width * height / 2, d.area, id);
    assert.equal(r.expect.halfBounding, d.area, id);
  }
  const error = answers.find(a => a.id === 'p54-error').expect;
  const main = derive(answers.find(a => a.id === 'p54-ABCD'));
  assert.equal(error.claimed, main.diagonalAC * main.diagonalBD, 'הטעות היא המכפלה ללא חלוקה');
  assert.equal(error.correct, main.area);
});

test('עמוד 55: שני הפירוקים למשולשים מסתכמים לשטח הנגזר', () => {
  const r = answers.find(a => a.id === 'p55-ABCD');
  const d = derive(r);
  const four = answers.find(a => a.id === 'p55-fourTriangles').expect;
  assert.equal(2 * four.lowerTriangle + 2 * four.upperTriangle, d.area);
  assert.equal(four.sumFour, d.area);
  const two = answers.find(a => a.id === 'p55-twoTriangles').expect;
  assert.equal(two.belowBD + two.aboveBD, d.area);
  assert.equal(two.formulaCheck, d.area);
  // האלכסון האנכי חוצה את ציר X: קצותיו משני עברי הציר.
  const [A, , C] = r.vertices;
  assert.ok(A[1] < 0 && C[1] > 0, 'AC חייב לחצות את ציר X');
  const inverse = answers.find(a => a.id === 'p55-inverse').expect;
  assert.equal(inverse.lowerPart + inverse.upperPart, inverse.diagonalAC);
  assert.equal(inverse.diagonalAC * 6 / 2, inverse.area);
});

test('עמוד 53: הניצבים שנרשמו משחזרים את אורכי הצלעות הנגזרים', () => {
  const legs = answers.find(a => a.id === 'p53-legs').expect;
  const d = derive(answers.find(a => a.id === 'p53-ABCD'));
  const fromLegs = pair => Math.hypot(...pair.split(',').map(Number));
  assert.equal(fromLegs(legs.legsAB), d.sides.AB);
  assert.equal(fromLegs(legs.legsAD), d.sides.DA);
  assert.equal(fromLegs(legs.legsCB), d.sides.BC);
  assert.equal(fromLegs(legs.legsCD), d.sides.CD);
});

test('עמוד 56: מכפלת האלכסונים 48 בכל האפשרויות, והשאלה ההפוכה נותנת 7', () => {
  const build = answers.find(a => a.id === 'p56-build24').expect;
  assert.equal(build.diagonalProduct, 48);
  const options = answers.find(a => a.id === 'p56-options').expect;
  assert.equal(6 * options.pairFor6, 2 * 24);
  assert.equal(4 * options.pairFor4, 2 * 24);
  assert.equal(2 * options.pairFor2, 2 * 24);
  const inverse = answers.find(a => a.id === 'p56-inverse21').expect;
  assert.equal(6 * inverse.missingDiagonal / 2, 21);
  const twoKites = answers.find(a => a.id === 'p56-twoKites').expect;
  assert.equal(twoKites.sameArea, true);
  assert.equal(twoKites.areaEach, 6 * 8 / 2);
});

test('עמוד 57: מעוין 3-4-5 — צלעות 5 והיקף 20; הדלתון המוזז שומר שטח בלבד', () => {
  const rhombus = derive(answers.find(a => a.id === 'p57-rhombus'));
  for (const side of Object.values(rhombus.sides)) assert.equal(side, 5);
  assert.equal(rhombus.perimeter, 20);
  assert.equal(rhombus.area, 24);
  const shifted = derive(answers.find(a => a.id === 'p57-sameDiagonals'));
  assert.equal(shifted.area, rhombus.area, 'אותם אלכסונים — אותו שטח');
  assert.notEqual(shifted.perimeter, rhombus.perimeter, 'ההיקף חייב להיות שונה');
});

test('עמוד 58: סכומי הסביבון נכונים, והמרובע הנגדי אינו דלתון אך הנוסחה תקפה', () => {
  const body = derive(answers.find(a => a.id === 'p58-body'));
  const dreidel = answers.find(a => a.id === 'p58-dreidel').expect;
  assert.equal(dreidel.rhombusArea, body.area);
  assert.equal(dreidel.rhombusPerimeter, body.perimeter);
  assert.equal(dreidel.squareArea, 2 * 2);
  assert.equal(dreidel.squarePerimeter, 4 * 2);
  assert.equal(dreidel.totalArea, dreidel.rhombusArea + dreidel.squareArea);
  assert.equal(dreidel.totalPerimeter, dreidel.rhombusPerimeter + dreidel.squarePerimeter);

  // המרובע הנגדי: אלכסונים מאונכים ונחתכים, אך אין זוגות צלעות סמוכות שוות.
  const Q = [[1, 4], [4, 8], [9, 4], [4, 1]];
  const side = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  const sides = [side(Q[0], Q[1]), side(Q[1], Q[2]), side(Q[2], Q[3]), side(Q[3], Q[0])];
  const adjacentEqual = sides.some((s, i) => near(s, sides[(i + 1) % 4]));
  assert.equal(adjacentEqual, false, 'המרובע הנגדי אינו אמור להיות דלתון');
  const notKite = answers.find(a => a.id === 'p58-notKite').expect;
  assert.equal(notKite.isKite, false);
  assert.equal(notKite.areaByDiagonals, 8 * 7 / 2);
  assert.equal(notKite.areaByDiagonals, shoelaceArea(Q), 'הנוסחה חייבת להסכים עם השרוכים');
  assert.equal(notKite.sideAB, sides[0]);
});

test('כיסוי תשובות: לכל עמוד 53–58 יש לפחות רשומה אחת', () => {
  for (let n = 53; n <= 58; n++) {
    assert.ok(answers.some(a => a.page === n), `עמוד ${n} ללא רשומת תשובה`);
  }
});
