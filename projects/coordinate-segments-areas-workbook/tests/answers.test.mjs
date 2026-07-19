// בדיקות נתוני התשובות ומילון המושגים.
// כל ערך מספרי מחושב מחדש מהגאומטריה ומושווה למה שנרשם ידנית.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pages from '../src/pages/index.mjs';
import { answers, glossary } from '../src/all-answers.mjs';
import { derive, buildTeacherKey } from '../src/teacher-key.mjs';
import { axisParallelLength, shoelaceArea } from '../src/coordinate-svg.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pageNumbers = new Set(pages.map(page => page.n));

test('לכל רשומת תשובה יש מזהה ייחודי', () => {
  const ids = answers.map(record => record.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual(duplicates, [], `מזהים כפולים: ${duplicates.join(', ')}`);
});

test('כל רשומת תשובה מפנה לעמוד קיים', () => {
  for (const record of answers) {
    assert.ok(pageNumbers.has(record.page), `רשומה ${record.id} מפנה לעמוד ${record.page} שאינו קיים`);
  }
});

test('לכל עמוד קיימת לפחות רשומת תשובה אחת', () => {
  const covered = new Set(answers.map(record => record.page));
  const missing = [...pageNumbers].filter(n => !covered.has(n));
  assert.deepEqual(missing, [], `עמודים בלי תשובות: ${missing.join(', ')}`);
});

test('kind חוקי בכל רשומה', () => {
  const allowed = new Set(['segment', 'rectangle', 'triangle', 'triangleArea', 'pointTriangle', 'line', 'value', 'parallelogram', 'trapezoid', 'kite', 'rectilinear']);
  for (const record of answers) {
    assert.ok(allowed.has(record.kind), `kind לא חוקי ברשומה ${record.id}: ${record.kind}`);
    assert.ok(record.expect && typeof record.expect === 'object', `חסר expect ברשומה ${record.id}`);
  }
});

test('אורכי הקטעים שנרשמו תואמים לחישוב מהשיעורים', () => {
  const segments = answers.filter(record => record.kind === 'segment');
  assert.ok(segments.length >= 25, `רק ${segments.length} רשומות קטע`);
  for (const record of segments) {
    assert.equal(record.expect.length, axisParallelLength(record.a, record.b), `אורך שגוי ברשומה ${record.id}`);
  }
});

test('כיוון הקטע ומשוואת הישר תואמים לשיעורים', () => {
  for (const record of answers.filter(r => r.kind === 'segment')) {
    const derived = derive(record);
    assert.equal(record.expect.axis, derived.axis, `כיוון שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.equation, derived.equation, `משוואה שגויה ברשומה ${record.id}`);
  }
});

test('חיתוך צירים שנרשם תואם לסימני השיעורים', () => {
  for (const record of answers.filter(r => r.kind === 'segment')) {
    const derived = derive(record);
    if ('crossesY' in record.expect) assert.equal(record.expect.crossesY, derived.crossesY, `crossesY שגוי ברשומה ${record.id}`);
    if ('crossesX' in record.expect) assert.equal(record.expect.crossesX, derived.crossesX, `crossesX שגוי ברשומה ${record.id}`);
  }
});

test('פיצול קטע החוצה ציר מסתכם באורך הקטע', () => {
  for (const record of answers.filter(r => r.kind === 'segment' && r.expect.split)) {
    assert.equal(record.expect.split.reduce((a, b) => a + b, 0), record.expect.length, `סכום החלקים שגוי ברשומה ${record.id}`);
  }
});

test('מידות המלבנים, השטח וההיקף תואמים לשיעורי הקודקודים', () => {
  const rectangles = answers.filter(record => record.kind === 'rectangle');
  assert.ok(rectangles.length >= 35, `רק ${rectangles.length} רשומות מלבן`);
  for (const record of rectangles) {
    const derived = derive(record);
    assert.equal(record.expect.width, derived.width, `רוחב שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.height, derived.height, `גובה שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.area, derived.area, `שטח שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.perimeter, derived.perimeter, `היקף שגוי ברשומה ${record.id}`);
    const [[x1, y1], [x2, y2]] = record.corners;
    assert.equal(shoelaceArea([[x1, y1], [x2, y1], [x2, y2], [x1, y2]]), record.expect.area, `שטח השרוכים שונה ברשומה ${record.id}`);
    assert.equal(record.expect.area, record.expect.width * record.expect.height);
    assert.equal(record.expect.perimeter, 2 * (record.expect.width + record.expect.height));
  }
});

test('שטחי משולשים ישרי זווית ואורכי הניצבים מחושבים מחדש', () => {
  const triangles = answers.filter(record => record.kind === 'triangle');
  assert.ok(triangles.length >= 12, `רק ${triangles.length} רשומות משולש ישר זווית`);
  for (const record of triangles) {
    assert.equal(record.vertices.length, 3, `מספר קודקודים שגוי ברשומה ${record.id}`);
    const derived = derive(record);
    assert.equal(record.expect.area, shoelaceArea(record.vertices), `שטח שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.area, derived.area, `שטח נגזר שגוי ברשומה ${record.id}`);
    assert.deepEqual(record.expect.legs, derived.legs, `אורכי ניצבים שגויים ברשומה ${record.id}`);
    assert.equal(record.expect.area, (record.expect.legs[0] * record.expect.legs[1]) / 2, `נוסחת בסיס×גובה÷2 נכשלה ברשומה ${record.id}`);
  }
});

test('שטחי משולשים כלליים מחושבים מחדש מבסיס אופקי או אנכי וגובה', () => {
  const triangles = answers.filter(record => record.kind === 'triangleArea');
  assert.ok(triangles.length >= 18, `רק ${triangles.length} רשומות triangleArea`);
  for (const record of triangles) {
    const derived = derive(record);
    assert.equal(record.expect.baseLength, derived.baseLength, `בסיס שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.height, derived.height, `גובה שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.baseAxis, derived.baseAxis, `כיוון בסיס שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.area, derived.area, `שטח נגזר שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.area, shoelaceArea(record.vertices), `שטח השרוכים שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.area, (record.expect.baseLength * record.expect.height) / 2, `בסיס×גובה÷2 נכשל ברשומה ${record.id}`);
  }
});

test('סיווג נקודה ביחס למשולש נגזר מסכום שלושת שטחי המשנה', () => {
  const records = answers.filter(record => record.kind === 'pointTriangle');
  assert.ok(records.length >= 3, `רק ${records.length} רשומות pointTriangle`);
  for (const record of records) {
    const derived = derive(record);
    assert.equal(record.expect.classification, derived.classification, `סיווג שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.mainArea, derived.mainArea, `שטח משולש ראשי שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.subAreaSum, derived.subAreaSum, `סכום שטחי משנה שגוי ברשומה ${record.id}`);
    if (record.expect.classification === 'מחוץ') {
      assert.ok(derived.subAreaSum > derived.mainArea, `נקודה חיצונית לא הגדילה את סכום השטחים ברשומה ${record.id}`);
    } else {
      assert.equal(derived.subAreaSum, derived.mainArea);
    }
  }
});

test('דלתונים: השטח מחצית מכפלת האלכסונים, ושני זוגות צלעות סמוכות שוות', () => {
  const kites = answers.filter(record => record.kind === 'kite');
  assert.ok(kites.length >= 6, `רק ${kites.length} רשומות דלתון`);
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  for (const record of kites) {
    const derived = derive(record);
    assert.equal(derived.shoelace, derived.diagonalAC * derived.diagonalBD / 2, `שרוכים ≠ אלכסונים ברשומה ${record.id}`);
    assert.equal(derived.shoelace, shoelaceArea(record.vertices));
    const pairs = (near(derived.sides.AB, derived.sides.DA) && near(derived.sides.BC, derived.sides.CD))
      || (near(derived.sides.AB, derived.sides.BC) && near(derived.sides.CD, derived.sides.DA));
    assert.ok(pairs, `אין שני זוגות צלעות סמוכות שוות ברשומה ${record.id}`);
    if (record.expect.area !== undefined) {
      assert.equal(record.expect.area, derived.area, `שטח שגוי ברשומה ${record.id}`);
    }
  }
});

test('משוואות הישרים שנרשמו תואמות לנקודות שדרכן הם עוברים', () => {
  for (const record of answers.filter(r => r.kind === 'line')) {
    const derived = derive(record);
    assert.equal(record.expect.equation, derived.equation, `משוואה שגויה ברשומה ${record.id}`);
    assert.equal(record.expect.parallelTo, derived.parallelTo);
    assert.equal(record.expect.perpendicularTo, derived.perpendicularTo);
  }
});

test('כל המלבנים ששטחם 24 אכן נותנים 24, וההיקף המינימלי הוא של 4 על 6', () => {
  const pairs = answers.filter(r => r.id.startsWith('p25-pairs-'));
  assert.equal(pairs.length, 4);
  pairs.forEach(record => assert.equal(record.expect.area, 24));
  const minimal = pairs.reduce((best, record) => record.expect.perimeter < best.expect.perimeter ? record : best);
  assert.deepEqual([minimal.expect.width, minimal.expect.height, minimal.expect.perimeter], [4, 6, 20]);
});

test('חקר שטח 36: הריבוע 6 על 6 בעל ההיקף המינימלי', () => {
  const pairs = answers.filter(r => /^p27-\d+x\d+$/.test(r.id));
  assert.equal(pairs.length, 5);
  pairs.forEach(record => assert.equal(record.expect.area, 36));
  const minimal = pairs.reduce((best, record) => record.expect.perimeter < best.expect.perimeter ? record : best);
  assert.deepEqual([minimal.expect.width, minimal.expect.height, minimal.expect.perimeter], [6, 6, 24]);
});

test('חקר היקף 24: הריבוע 6 על 6 בעל השטח המרבי', () => {
  const pairs = answers.filter(r => /^p28-\d+x\d+$/.test(r.id));
  assert.equal(pairs.length, 6);
  pairs.forEach(record => assert.equal(record.expect.perimeter, 24));
  const maximal = pairs.reduce((best, record) => record.expect.area > best.expect.area ? record : best);
  assert.deepEqual([maximal.expect.width, maximal.expect.height, maximal.expect.area], [6, 6, 36]);
});

test('אותו בסיס ואותו גובה נותנים שטחים שווים בעמודים 39 ו־43', () => {
  const ids = ['p39-ABP', 'p39-ABQ', 'p43-ABP', 'p43-ABQ', 'p43-ABR', 'p43-S'];
  const selected = ids.map(id => answers.find(record => record.id === id));
  selected.forEach(record => assert.ok(record, `חסרה רשומה ${record?.id}`));
  assert.deepEqual(selected.map(record => derive(record).area), [24, 24, 24, 24, 24, 24]);
});

test('התיכון בעמוד 44 מחלק את שטח המשולש לשני חלקים שווים', () => {
  const total = answers.find(record => record.id === 'p44-ABC');
  const left = answers.find(record => record.id === 'p44-ACM');
  const right = answers.find(record => record.id === 'p44-BCM');
  assert.equal(derive(total).area, 24);
  assert.equal(derive(left).area, 12);
  assert.equal(derive(right).area, 12);
  assert.equal(derive(left).area + derive(right).area, derive(total).area);
});

test('יחס הבסיסים בעמוד 45 שווה ליחס השטחים', () => {
  const left = derive(answers.find(record => record.id === 'p45-ACD'));
  const right = derive(answers.find(record => record.id === 'p45-BCD'));
  assert.equal(left.baseLength / right.baseLength, left.area / right.area);
  assert.equal(left.area / right.area, 1 / 2);
});

test('מילון המושגים תואם למסמך המקור ואין בו כפילויות', () => {
  const source = fs.readFileSync(path.join(root, 'research', 'source-map.md'), 'utf8');
  assert.equal(glossary.length, 12);
  assert.equal(new Set(glossary).size, glossary.length);
  for (const term of glossary) {
    const key = term.replace(/[`]/g, '').split(' ').slice(-1)[0];
    assert.ok(source.includes(key), `המושג "${term}" אינו מופיע במסמך המקור`);
  }
});

test('מפתח המורה כולל את כל המזהים, המושגים והערכים המחושבים', () => {
  const meta = JSON.parse(fs.readFileSync(path.join(root, 'project-metadata.json'), 'utf8'));
  const key = buildTeacherKey({ meta, answers, glossary });
  assert.match(key, /<html lang="he" dir="rtl">/);
  answers.forEach(record => assert.ok(key.includes(record.id), `מפתח המורה חסר את ${record.id}`));
  glossary.forEach(term => assert.ok(key.includes(term), `מפתח המורה חסר את ${term}`));
  assert.ok(key.includes('p45-BCD'));
  assert.ok(key.includes('pointTriangle'));
  assert.ok(key.includes('18'), 'שטח המשולש בעמוד 45 אינו מופיע במפתח');
});
