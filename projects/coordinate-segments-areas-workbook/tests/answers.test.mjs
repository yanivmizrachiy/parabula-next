// בדיקות נתוני התשובות ומילון המושגים.
// כל ערך מספרי מחושב מחדש מהגאומטריה ומושווה למה שנרשם ידנית.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pages from '../src/pages/index.mjs';
import { answers, glossary } from '../src/answers.mjs';
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
  const allowed = new Set(['segment', 'rectangle', 'line', 'value']);
  for (const record of answers) {
    assert.ok(allowed.has(record.kind), `kind לא חוקי ברשומה ${record.id}: ${record.kind}`);
    assert.ok(record.expect && typeof record.expect === 'object', `חסר expect ברשומה ${record.id}`);
  }
});

test('אורכי הקטעים שנרשמו תואמים לחישוב מהשיעורים', () => {
  const segments = answers.filter(record => record.kind === 'segment');
  assert.ok(segments.length >= 25, `רק ${segments.length} רשומות קטע`);
  for (const record of segments) {
    const computed = axisParallelLength(record.a, record.b);
    assert.equal(record.expect.length, computed, `אורך שגוי ברשומה ${record.id}`);
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
    if ('crossesY' in record.expect) {
      assert.equal(record.expect.crossesY, derived.crossesY, `crossesY שגוי ברשומה ${record.id}`);
    }
    if ('crossesX' in record.expect) {
      assert.equal(record.expect.crossesX, derived.crossesX, `crossesX שגוי ברשומה ${record.id}`);
    }
  }
});

test('פיצול קטע החוצה ציר מסתכם באורך הקטע', () => {
  for (const record of answers.filter(r => r.kind === 'segment' && r.expect.split)) {
    const sum = record.expect.split.reduce((a, b) => a + b, 0);
    assert.equal(sum, record.expect.length, `סכום החלקים ברשומה ${record.id} אינו שווה לאורך`);
  }
});

test('מידות המלבנים, השטח וההיקף תואמים לשיעורי הקודקודים', () => {
  const rectangles = answers.filter(record => record.kind === 'rectangle');
  assert.ok(rectangles.length >= 25, `רק ${rectangles.length} רשומות מלבן`);
  for (const record of rectangles) {
    const derived = derive(record);
    assert.equal(record.expect.width, derived.width, `רוחב שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.height, derived.height, `גובה שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.area, derived.area, `שטח שגוי ברשומה ${record.id}`);
    assert.equal(record.expect.perimeter, derived.perimeter, `היקף שגוי ברשומה ${record.id}`);
  }
});

test('שטח המלבן מאומת גם בנוסחת השרוכים', () => {
  for (const record of answers.filter(r => r.kind === 'rectangle')) {
    const [[x1, y1], [x2, y2]] = record.corners;
    const polygon = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
    assert.equal(shoelaceArea(polygon), record.expect.area, `שטח השרוכים שונה ברשומה ${record.id}`);
  }
});

test('שטח והיקף מקיימים את הקשר לאורך ולרוחב', () => {
  for (const record of answers.filter(r => r.kind === 'rectangle')) {
    const { width, height, area, perimeter } = record.expect;
    assert.equal(area, width * height, `שטח אינו אורך×רוחב ברשומה ${record.id}`);
    assert.equal(perimeter, 2 * (width + height), `היקף אינו 2(א+ר) ברשומה ${record.id}`);
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
  assert.equal(pairs.length, 4, 'צריכים להיות בדיוק ארבעה זוגות שלמים');
  for (const record of pairs) assert.equal(record.expect.area, 24);
  const minimal = pairs.reduce((best, r) => (r.expect.perimeter < best.expect.perimeter ? r : best));
  assert.equal(minimal.expect.width, 4);
  assert.equal(minimal.expect.height, 6);
  assert.equal(minimal.expect.perimeter, 20);
});

test('מילון המושגים תואם למילון המחייב שב־research/source-map.md', () => {
  const source = fs.readFileSync(path.join(root, 'research', 'source-map.md'), 'utf8');
  assert.equal(glossary.length, 12, 'המילון המחייב מונה 12 מושגים');
  for (const term of glossary) {
    const core = term.replace(/[`]/g, '');
    const key = core.split(' ').slice(-1)[0];
    assert.ok(source.includes(key), `המושג "${term}" אינו מופיע במסמך המקור`);
  }
});

test('אין מושג כפול במילון', () => {
  assert.equal(new Set(glossary).size, glossary.length);
});

test('מפתח המורה נבנה, כולל את כל המזהים ואת כל המושגים', () => {
  const meta = JSON.parse(fs.readFileSync(path.join(root, 'project-metadata.json'), 'utf8'));
  const key = buildTeacherKey({ meta, answers, glossary });
  assert.match(key, /<html lang="he" dir="rtl">/);
  for (const record of answers) {
    assert.ok(key.includes(record.id), `מפתח המורה חסר את ${record.id}`);
  }
  for (const term of glossary) {
    assert.ok(key.includes(term), `מפתח המורה חסר את המושג ${term}`);
  }
});

test('מפתח המורה מציג את הערכים המחושבים ולא רק את הרשומים', () => {
  const meta = JSON.parse(fs.readFileSync(path.join(root, 'project-metadata.json'), 'utf8'));
  const record = answers.find(r => r.id === 'p23-ABCD');
  const key = buildTeacherKey({ meta, answers: [record], glossary: [] });
  assert.ok(key.includes('81'), 'השטח המחושב אינו מופיע במפתח');
  assert.ok(key.includes('36'), 'ההיקף המחושב אינו מופיע במפתח');
});
