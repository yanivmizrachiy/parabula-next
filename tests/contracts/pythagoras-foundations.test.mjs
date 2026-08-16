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

test('רצף פיתגורס הגלוי הוא 1-43 והחומר הוותיק ממשיך אחרי היסודות',()=>{
  for (let i=0;i<ALL_VISIBLE.length;i+=1) {
    const html=read(`עמוד-${ALL_VISIBLE[i]}.html`);
    assert.match(html,new RegExp(`משפט פיתגורס — עמוד ${i+1} \/ 43`,'u'));
  }
  assert.equal(ALL_VISIBLE[20], 9, 'הדף הוותיק הראשון חייב להישאר ולהתחיל אחרי 20 דפי היסוד');
});

test('היתר נלמד גם כמול הזווית הישרה וגם כצלע הארוכה ביותר',()=>{
  assert.match(read('עמוד-637.html'),/הצלע שמול הזווית הישרה/u);
  assert.match(read('עמוד-637.html'),/הצלע הארוכה ביותר/u);
  assert.match(read('עמוד-638.html'),/אורכי צלעותיו 6, 8, 10/u);
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
