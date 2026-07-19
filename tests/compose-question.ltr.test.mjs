// עטיפת LTR אוטומטית — הגנה מפני היפוך bidi במלל השאלה (CLAUDE.md §4.3).
//
// רגרסיה שנתפסה במדידה: `(0 , 8)` התרנדר לתלמיד כ-`((8 , 0.` כי הסוגר הפותח
// נשאר מחוץ למכל ה-LTR. כל ביטוי מתמטי חייב להיכנס במלואו, כולל סוגריים.

import test from 'node:test';
import assert from 'node:assert/strict';
import { autoLtr, answerWidget } from '../scripts/lib/compose-question.mjs';

const ltrOf = (s) => [...autoLtr(s).matchAll(/<span class="ltr">([^<]*)<\/span>/g)].map((m) => m[1]);

test('זוג שיעורים נעטף במלואו כולל הסוגריים', () => {
  assert.deepEqual(ltrOf('בנקודה (0 , 8).'), ['(0 , 8)']);
  assert.deepEqual(ltrOf('הנקודה (-4,0) נמצאת על הפונקציה'), ['(-4,0)']);
  assert.deepEqual(ltrOf('הנקודה (–2 , –5) נמצאת'), ['(–2 , –5)']);
});

test('נקודה שמסיימת משפט עברי נשארת מחוץ למכל', () => {
  const html = autoLtr('ערך הפונקציה הוא 5.');
  assert.deepEqual(ltrOf('ערך הפונקציה הוא 5.'), ['5']);
  assert.ok(html.endsWith('.'), 'הנקודה חייבת להישאר אחרי המכל');
});

test('נקודה עשרונית בתוך מספר נשארת בפנים', () => {
  assert.deepEqual(ltrOf('השיפוע הוא 0.5 בלבד'), ['0.5']);
});

test('סוגר סוגר יתום אינו נכנס למכל', () => {
  // "(ראו סעיף y=2x)" — הסוגר הפותח שייך לעברית
  assert.deepEqual(ltrOf('נתון y=2x) ראו'), ['y=2x']);
});

test('ביטוי אלגברי שלם נעטף כיחידה אחת', () => {
  assert.deepEqual(ltrOf('נתונה הפונקציה f(x) = 3x + 5 ונשאל'), ['f(x) = 3x + 5']);
  assert.deepEqual(ltrOf('מצאו את השיפוע של B(8;5) ו- A(5;2) .'), ['B(8;5)', 'A(5;2)']);
});

test('טקסט עברי בלבד אינו נעטף', () => {
  assert.deepEqual(ltrOf('האם הגרף עולה או יורד?'), []);
});

test('תווי HTML מסוכנים עוברים escaping', () => {
  const h = autoLtr('נתון x < 5 ו-<script>');
  assert.equal(h.includes('<script>'), false, 'תג script לא עבר escaping');
  assert.ok(h.includes('&lt;'), 'הסימן < לא הומר');
});

test('מקום המענה תואם למבנה התשובה הנדרשת (§4.3)', () => {
  // זוג שיעורים -> תיבה נפרדת לכל שיעור עם סוגריים ופסיק מודפסים
  const pt = answerWidget('point');
  assert.equal((pt.match(/class="wline/g) || []).length, 2, 'זוג שיעורים דורש שתי תיבות');
  assert.ok(pt.includes('('), 'חסרים סוגריים מודפסים');

  // יחס -> שתי תיבות עם נקודתיים ביניהן
  const ratio = answerWidget('ratio');
  assert.equal((ratio.match(/class="wline/g) || []).length, 2);
  assert.ok(ratio.includes(':'));

  // ערך יחיד -> תיבה אחת בלבד; תיבה מיותרת מבלבלת כמו תיבה חסרה
  assert.equal((answerWidget('single').match(/class="wline/g) || []).length, 1);

  // סכום של שלושה ערכים -> שלוש תיבות ושני אופרטורים
  const e3 = answerWidget('expr3');
  assert.equal((e3.match(/class="wline/g) || []).length, 3);
  assert.equal((e3.match(/class="wop"/g) || []).length, 2);
});

test('כל מכל LTR מאוזן מבחינת סוגריים', () => {
  for (const s of ['הנקודה (0,8) על הישר', 'נתון (a+b) = 5', 'ראו (x)']) {
    for (const core of ltrOf(s)) {
      let n = 0;
      for (const ch of core) { if (ch === '(') n++; else if (ch === ')') n--; }
      assert.ok(n >= 0, `סוגריים לא מאוזנים במכל "${core}"`);
    }
  }
});

test('פיסוק פותח שייך למשפט העברי ולא למכל המתמטי', () => {
  // רגרסיה: "נתונה הפונקציה: f(x) = 2x – 1 ." התרנדר "נתונה הפונקציה1 – f(x) = 2x . :"
  const out = autoLtr('נתונה הפונקציה: f(x) = 2x – 1 .');
  assert.deepEqual(ltrOf('נתונה הפונקציה: f(x) = 2x – 1 .'), ['f(x) = 2x – 1']);
  assert.ok(out.indexOf(':') < out.indexOf('<span'), 'הנקודתיים חייבות להופיע לפני המכל');
});
