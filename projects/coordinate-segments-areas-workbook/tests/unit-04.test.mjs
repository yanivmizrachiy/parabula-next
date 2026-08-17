// חוזי יחידה 4 — מקבילית וטרפז (עמודים 47–52).
// כל ערך נגזר מהקודקודים ומושווה ל-expect; רצף העמודים 1–58 נאכף כאן.

import test from 'node:test';
import assert from 'node:assert/strict';
import pages from '../src/pages/index.mjs';
import unit04 from '../src/pages/unit-04-parallelogram-trapezoid.mjs';
import { answers } from '../src/all-answers.mjs';
import { derive } from '../src/teacher-key.mjs';
import { EXPECTED_PAGES } from './expected-pages.mjs';

test(`רצף העמודים 1–${EXPECTED_PAGES} רציף, ללא חורים וללא כפילויות`, () => {
  const ns = pages.map(p => p.n);
  assert.equal(ns.length, EXPECTED_PAGES, `יש ${ns.length} עמודים במקום ${EXPECTED_PAGES}`);
  assert.deepEqual([...ns].sort((a, b) => a - b), Array.from({ length: EXPECTED_PAGES }, (_, i) => i + 1));
  assert.equal(new Set(ns).size, EXPECTED_PAGES, 'מספר עמוד כפול');
});

test('יחידה 4 מחוברת לרצף דרך המודול הנקי', () => {
  const tail = pages.filter(p => p.n >= 47 && p.n <= 52);
  assert.equal(tail.length, 6);
  for (const p of unit04) {
    assert.ok(pages.includes(p), `עמוד ${p.n} של unit-04 אינו ברצף`);
  }
});

test('מקבילית עמוד 47: בסיס, גובה ושטח נגזרים מהקודקודים', () => {
  const r = answers.find(a => a.id === 'p47-ABCD');
  const d = derive(r);
  assert.equal(d.baseLength, 7);
  assert.equal(d.height, 5);
  assert.equal(d.area, 35);
  assert.equal(d.shoelace, 35, 'שטח השרוכים חייב להסכים');
  assert.equal(r.expect.area, d.area);
});

test('מקבילית עמוד 47: הצלעות הנגדיות מקבילות באמת', () => {
  const [A, B, C, D] = answers.find(a => a.id === 'p47-ABCD').vertices;
  assert.deepEqual([B[0] - A[0], B[1] - A[1]], [C[0] - D[0], C[1] - D[1]], 'AB ∦ DC');
  assert.deepEqual([D[0] - A[0], D[1] - A[1]], [C[0] - B[0], C[1] - B[1]], 'AD ∦ BC');
});

test('עמוד 48: הקודקוד הרביעי לפי הסדר ABCD הוא (12,7), ושלוש האפשרויות נכונות', () => {
  const A = [2, 2], B = [9, 2], D = [5, 7];
  const cABD = [D[0] + (B[0] - A[0]), D[1] + (B[1] - A[1])];
  assert.deepEqual(cABD, [12, 7]);
  // סדר שונה = זוג סמוכים שונה: הרביעי הוא סכום הסמוכים פחות הנגדי.
  const other1 = [A[0] + B[0] - D[0], A[1] + B[1] - D[1]];
  const other2 = [A[0] + D[0] - B[0], A[1] + D[1] - B[1]];
  assert.deepEqual(other1, [6, -3]);
  assert.deepEqual(other2, [-2, 7]);
  const rec = answers.find(a => a.id === 'p48-complete');
  assert.deepEqual(rec.vertices[2], [12, 7]);
  assert.equal(derive(rec).area, 35);
});

test('עמוד 49: הפירוק תואם את השרטוט ומסכם לשטח', () => {
  const r = answers.find(a => a.id === 'p49-decomposition');
  // מלבן מרכזי בין x=4 ל-x=8 בגובה 5, ושני משולשים 3×5÷2.
  assert.equal(r.expect.centralRect, 4 * 5);
  assert.equal(r.expect.sideTriangle, (3 * 5) / 2);
  assert.equal(r.expect.centralRect + 2 * r.expect.sideTriangle, r.expect.decompositionSum);
  assert.equal(r.expect.decompositionSum, r.expect.baseTimesHeight);
  assert.equal(r.expect.boundingShearRect, 7 * 5);
});

test('טרפז עמוד 50: בסיסים, גובה ושטח נגזרים ומוסכמים עם השרוכים', () => {
  const r = answers.find(a => a.id === 'p50-ABCD');
  const d = derive(r);
  assert.equal(d.baseBig, 9);
  assert.equal(d.baseSmall, 5);
  assert.equal(d.height, 5);
  assert.equal(d.area, 35);
  assert.equal(d.shoelace, 35);
});

test('עמוד 51: שלוש הדרכים נותנות אותו שטח', () => {
  const r = answers.find(a => a.id === 'p51-threeWays').expect;
  assert.equal(r.methodFormula, (9 + 5) * 5 / 2);
  assert.equal(r.centralRect + r.leftTriangle + r.rightTriangle, r.methodDecompose);
  assert.equal(r.boundingRect - r.cutTriangles, r.methodSubtract);
  assert.equal(new Set([r.methodFormula, r.methodDecompose, r.methodSubtract]).size, 1);
});

test('טרפז עמוד 52: שוקי 3-4-5 שלמות והיקף נגזר', () => {
  const r = answers.find(a => a.id === 'p52-ABCD');
  const d = derive(r);
  assert.equal(d.baseBig, 10);
  assert.equal(d.baseSmall, 4);
  assert.equal(d.height, 4);
  assert.equal(d.area, 28);
  assert.equal(d.legAD, 5, 'שוק AD חייבת להיות שלמה (3-4-5)');
  assert.equal(d.legBC, 5);
  assert.equal(d.perimeter, 24);
  assert.equal(Number.isInteger(d.perimeter), true);
});

test('כיסוי תשובות: לכל עמוד 47–52 יש לפחות רשומה אחת', () => {
  for (let n = 47; n <= 52; n++) {
    assert.ok(answers.some(a => a.page === n), `עמוד ${n} ללא רשומת תשובה`);
  }
});
