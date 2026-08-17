import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TOTAL = 43;
const FOUNDATION = [634,635,636,637,638,639,640,641,651,642,652,643,644,645,646,647,653,648,649,650];
const LEGACY_VISIBLE = [...Array.from({length:22},(_,i)=>9+i),41];
const ADVANCED_RELATED = [375,376,377,378,379,380];
const ALL_VISIBLE = [...FOUNDATION,...LEGACY_VISIBLE];
const read = (file) => fs.readFileSync(path.join(ROOT,file),'utf8');
const foundationNote = (html) => html.match(/<div class="foundation-note">([\s\S]*?)<\/div>/u)?.[1] ?? '';

const PAGE_TITLES = [
  'זווית ישרה',
  'משולש ישר־זווית',
  'ניצבים',
  'היתר',
  'זיהוי ניצבים ויתר',
  'חזקה שנייה',
  'ריבועי מספרים',
  'שורש ריבועי',
  'מציאת אורך מתוך x² = n',
  'שורשים שאינם שלמים',
  'מציאת אורך כאשר השורש אינו שלם',
  'ריבוע על צלע',
  'הקשר בין ריבועי הצלעות',
  'משפט פיתגורס',
  'נוסחת משפט פיתגורס',
  'כתיבת משוואת פיתגורס',
  'דרך פתרון באמצעות משפט פיתגורס',
  'מציאת היתר באמצעות משפט פיתגורס',
  'מציאת ניצב באמצעות משפט פיתגורס',
  'בחירת דרך הפתרון במשפט פיתגורס',
];

test('כל דפי פיתגורס הוותיקים נשמרים ואינם מוחלפים', () => {
  for (const n of [...LEGACY_VISIBLE, ...ADVANCED_RELATED]) {
    assert.ok(fs.existsSync(path.join(ROOT, `עמוד-${n}.html`)), `דף פיתגורס ותיק חסר: ${n}`);
  }
});

for (let i=0;i<FOUNDATION.length;i+=1) {
  const global = FOUNDATION[i];
  const file = `עמוד-${global}.html`;
  const local = i+1;
  const css = `styles/pages/עמוד-${global}.css`;
  test(`${file}: חוזה דף יסודות פיתגורס`,()=>{
    assert.ok(fs.existsSync(path.join(ROOT,file)));
    const html = read(file);
    assert.match(html,/<html\s+lang="he"\s+dir="rtl"/u);
    assert.match(html,new RegExp(`משפט פיתגורס — עמוד ${local} \/ ${TOTAL}`,'u'));
    assert.match(html,new RegExp(`<div class="page-number">${local}<\/div>`,'u'));
    assert.match(html,new RegExp(`<h1 class="page-title">${PAGE_TITLES[i].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}<\/h1>`,'u'));
    assert.equal((html.match(/<h1\b/gu) || []).length, 1, 'בכל עמוד יש כותרת עמוד אחת בלבד');
    assert.equal((html.match(/<h[2-6]\b/gu) || []).length, 0, 'אין כותרות נפרדות לשאלות');
    assert.doesNotMatch(html,/(?:שאלה|תרגיל)\s*\d+/u);
    assert.ok(fs.existsSync(path.join(ROOT,css)));
    assert.match(read(css),/@import url\("\.\.\/topics\/pythagoras-foundations\.css"\);/u);
    assert.match(html,/class="a4-page[^"]*pythagoras[^"]*pyt-foundation/u);
    assert.match(html,/<footer class="gz-footer">/u);
    assert.doesNotMatch(html,/\sstyle\s*=\s*["']/u);
    const prev = i===0 ? 'עמוד-530.html' : `עמוד-${FOUNDATION[i-1]}.html`;
    const next = i===FOUNDATION.length-1 ? 'עמוד-9.html' : `עמוד-${FOUNDATION[i+1]}.html`;
    assert.match(html,new RegExp(`href="${prev}"`,'u'));
    assert.match(html,new RegExp(`href="${next}"`,'u'));
  });
}

test('עמודי היסוד 1-4 מנצלים A4 בלי בלוקים ושרטוטים מנופחים',()=>{
  for (const n of [634,635,636,637]) {
    const css = read(`styles/pages/עמוד-${n}.css`);
    const minHeights = [...css.matchAll(/min-height:\s*(\d+)px/gu)].map((m)=>Number(m[1]));
    const fixedHeights = [...css.matchAll(/(?<!min-)height:\s*(\d+)px/gu)].map((m)=>Number(m[1]));
    assert.ok(Math.max(0,...minHeights) <= 180, `עמוד ${n}: אין להחזיר בלוקי תרגול ענקיים`);
    assert.ok(Math.max(0,...fixedHeights) <= 120, `עמוד ${n}: אין להחזיר שרטוטי SVG ענקיים`);
  }
  const p1=read('עמוד-634.html');
  assert.match(p1,/angle-choice-grid/u);
  assert.match(p1,/quick-practice-grid/u);
  assert.equal((p1.match(/class="foundation-card drawing-card\b/gu)||[]).length,2,'עמוד 1 צריך שתי משימות ציור מרווחות');
  const p2=read('עמוד-635.html');
  assert.match(p2,/triangle-choice-grid/u);
  assert.match(p2,/mark-angle-grid/u);
  assert.equal((p2.match(/class="foundation-card drawing-card\b/gu)||[]).length,2,'עמוד 2 צריך שתי משימות ציור מרווחות');
  const p3=read('עמוד-636.html');
  assert.equal((p3.match(/הניצבים:/gu)||[]).length,4,'עמוד 3 צריך לכלול ארבעה פריטי תרגול של שמות ניצבים');
  assert.match(p3,/concept-check-grid/u,'עמוד 3 צריך מקבץ השלמות קצר לאחר זיהוי הניצבים');
  assert.equal((p3.match(/class="foundation-card concept-check"/gu)||[]).length,3,'עמוד 3 צריך שלושה סעיפי השלמה מקבילים');
  assert.match(p3,/synthesis-drawing-card/u,'עמוד 3 צריך משימת סינתזה פתוחה');
  const p4=read('עמוד-637.html');
  assert.equal((p4.match(/היתר:/gu)||[]).length,3,'עמוד 4 צריך לכלול זיהוי היתר לפי שמות קודקודים');
  assert.match(p4,/length-check-grid/u,'עמוד 4 צריך מקבץ זיהוי יתר לפי אורכי צלעות');
  assert.equal((p4.match(/aria-label="כתבו את אורך היתר"/gu)||[]).length,3,'זיהוי יתר לפי אורכים חייב להופיע בשלושה סעיפים מקבילים');
  for (const triple of ['3, 4, 5','6, 8, 10','5, 12, 13']) assert.ok(p4.includes(triple));
  assert.match(p4,/synthesis-drawing-card/u,'עמוד 4 צריך משימת סינתזה פתוחה');
});

test('עמודים 1, 3 ו-4 אינם מציגים פורמט חדש כפריט בודד',()=>{
  const p1=read('עמוד-634.html');
  assert.match(p1,/קבעו בכל סרטוט: ישרה או לא ישרה/u);
  assert.equal((p1.match(/aria-label="כתבו ישרה או לא ישרה"/gu)||[]).length,3,'סיווג ישרה/לא ישרה חייב להופיע לפחות בשלושה סעיפים מקבילים');
  assert.doesNotMatch(p1,/בחרו זווית ישרה אחת מהסרטוטים/u,'אין לערבב במקבץ הסיווג משימת יחיד מסוג אחר');
  const p3=read('עמוד-636.html');
  assert.equal((p3.match(/class="foundation-card concept-check"/gu)||[]).length,3,'השלמות מושגי הניצבים צריכות להופיע כמקבץ של שלושה');
  const p4=read('עמוד-637.html');
  assert.equal((p4.match(/aria-label="כתבו את אורך היתר"/gu)||[]).length,3,'זיהוי היתר לפי אורכים צריך להופיע כמקבץ של שלושה');
});

test('ההסבר העליון בעמודים 1-4 הוא השלמה מודרכת עם תיבה שמתאימה לסוג התשובה',()=>{
  const p1 = foundationNote(read('עמוד-634.html'));
  const p2 = foundationNote(read('עמוד-635.html'));
  const p3 = foundationNote(read('עמוד-636.html'));
  const p4 = foundationNote(read('עמוד-637.html'));

  for (const note of [p1,p2]) {
    assert.match(note,/foundation-fill-number/u,'מספר המעלות צריך תיבה מספרית קצרה');
    assert.match(note,/foundation-unit">°<\/span>/u,'סימן המעלות צריך להיות נתון לתלמיד מחוץ לתיבה');
    assert.doesNotMatch(note,/90/u,'אין לחשוף בהסבר העליון את המספר שהתלמיד משלים');
  }
  assert.match(p3,/foundation-fill-term/u,'המושג ניצבים צריך תיבה רחבה יותר ממספר');
  assert.doesNotMatch(p3,/ניצבים/u,'אין לחשוף בתוך משפט ההשלמה את המושג שהתלמיד משלים');
  assert.match(p4,/foundation-fill-short/u,'המושג יתר צריך תיבה קצרה');
  assert.match(p4,/foundation-fill-medium/u,'התיאור הארוכה צריך תיבה בינונית');
  assert.doesNotMatch(p4,/יתר|הארוכה/u,'אין לחשוף בתוך משפט ההשלמה את המילים שהתלמיד משלים');

  const sharedCss = read('styles/topics/pythagoras-foundations.css');
  assert.match(sharedCss,/\.foundation-fill \{[^}]*border: 1\.35px solid #1f2a44;[^}]*border-radius: 8px;[^}]*box-shadow:/u,'תיבת סגנון 5 חייבת להישאר יוקרתית ותלת-ממדית בעדינות');
  assert.match(sharedCss,/\.foundation-fill-number \{ width: 58px; \}/u);
  assert.match(sharedCss,/\.foundation-fill-short \{ width: 82px; \}/u);
  assert.match(sharedCss,/\.foundation-fill-term \{ width: 118px; \}/u);
  assert.match(sharedCss,/\.foundation-fill-medium \{ width: 112px; \}/u);
  assert.doesNotMatch(read('עמוד-635.html'),/>90°<\/text>/u,'תרגול עמוד 2 לא יחשוף את התשובה של ההשלמה העליונה');
});

test('מדידת ניצול A4 אינה נסמכת על הפוטר ושומרת על טווח מאוזן בעמודים 1-4',()=>{
  const audit=read('scripts/a4-utilization-audit.mjs');
  assert.match(audit,/footer\.contains\(el\)/u,'הפוטר חייב להיות מוחרג מחישוב ניצול התוכן');
  for (const n of [634,635,636,637]) {
    assert.ok(audit.includes(`'עמוד-${n}.html': { min: 80, max: 93 }`),`עמוד ${n} חייב להישאר בטווח 80-93%`);
  }
});

test('רצף פיתגורס הגלוי הוא 1-43 והחומר הוותיק ממשיך אחרי היסודות',()=>{
  for (let i=0;i<ALL_VISIBLE.length;i+=1) {
    const html=read(`עמוד-${ALL_VISIBLE[i]}.html`);
    assert.match(html,new RegExp(`משפט פיתגורס — עמוד ${i+1} \/ 43`,'u'));
  }
  assert.equal(ALL_VISIBLE[20], 9, 'הדף הוותיק הראשון חייב להישאר ולהתחיל אחרי 20 דפי היסוד');
});

test('היתר נלמד גם כמול הזווית הישרה וגם כצלע הארוכה ביותר',()=>{
  const html=read('עמוד-637.html');
  assert.match(html,/הצלע שמול הזווית הישרה נקראת <span class="foundation-fill foundation-fill-short"/u);
  assert.match(html,/היא גם הצלע <span class="foundation-fill foundation-fill-medium"[^>]*><\/span> ביותר במשולש/u);
  assert.match(html,/אורכי הצלעות: 6, 8, 10/u);
});

test('x בריבוע נפתר בדרך מלאה לפני פיתגורס',()=>{
  const perfect=read('עמוד-651.html');
  assert.match(perfect,/x\^2=81/u);
  assert.match(perfect,/x=\\sqrt\{81\}/u);
  assert.match(perfect,/class="final-answer"/u);
  const nonPerfect=read('עמוד-652.html');
  assert.match(nonPerfect,/x\^2=20/u);
  assert.match(nonPerfect,/x\\approx4\.47/u);
});

test('דוגמת פיתגורס נכתבת שורה-שורה והתשובה הסופית ממוסגרת',()=>{
  const html=read('עמוד-653.html');
  for (const text of ['3^2+4^2=x^2','9+16=x^2','25=x^2','\\sqrt{25}=x','5=x']) {
    assert.ok(html.includes(text), `חסרה שורת דרך: ${text}`);
  }
  assert.match(html,/class="final-answer"/u);
  assert.ok(html.includes('5^2+3^2=x^2'));
});

test('מציאת ניצב כוללת דוגמה מלאה לפני שאלות החישוב',()=>{
  const html=read('עמוד-649.html');
  assert.match(html,/data-pyt-v2="leg-example"/u);
  assert.ok(html.includes('x^2+4^2=5^2'));
  assert.ok(html.includes('3=x'));
});