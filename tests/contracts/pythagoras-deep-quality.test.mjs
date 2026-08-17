import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FOUNDATION = [634,635,636,637,638,639,640,641,651,642,652,643,644,645,646,647,653,648,649,650];
const TITLES = [
  ...Array(5).fill('מושגים בסיסיים'),
  ...Array(7).fill('חזקות ושורשים'),
  ...Array(8).fill('משפט פיתגורס')
];
const read = (file) => fs.readFileSync(path.join(ROOT,file),'utf8');
const meta = JSON.parse(read('meta/topics.json'));
const pythagorasTopic = meta.topics.find((topic) => topic.name === 'משפט פיתגורס');
if (!pythagorasTopic) throw new Error('הנושא משפט פיתגורס חסר מ-meta/topics.json');
const VISIBLE = pythagorasTopic.pages.map((page) => page.number);
const TOTAL = VISIBLE.length;
const htmlOf = (n) => read(`עמוד-${n}.html`);
const textOf = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/giu,' ')
  .replace(/<style\b[\s\S]*?<\/style>/giu,' ')
  .replace(/<nav\b[\s\S]*?<\/nav>/giu,' ')
  .replace(/<footer\b[\s\S]*?<\/footer>/giu,' ')
  .replace(/<[^>]+>/gu,' ')
  .replace(/&nbsp;|&#160;/gu,' ')
  .replace(/&quot;/gu,'"')
  .replace(/&amp;/gu,'&')
  .replace(/\s+/gu,' ')
  .trim();

const exactFooter1 = 'יניב רז - מדריך מחוזי חט"ב בעיר ירושלים';
const exactFooter2 = 'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין';

test('כל דפי פיתגורס הרשומים במטא עומדים בחוזה המבני והטיפוגרפי', () => {
  const issues = [];
  assert.deepEqual(VISIBLE.slice(0, FOUNDATION.length), FOUNDATION, 'רצף דפי היסוד בתחילת הנושא השתנה');
  VISIBLE.forEach((n,index) => {
    const file = `עמוד-${n}.html`;
    if (!fs.existsSync(path.join(ROOT,file))) { issues.push(`${file}: חסר`); return; }
    const html = htmlOf(n);
    const local = index + 1;
    if (!/<html\s+lang="he"\s+dir="rtl"/u.test(html)) issues.push(`${file}: חסר RTL קנוני`);
    if ((html.match(/<h1\b/gu)||[]).length !== 1) issues.push(`${file}: חייב להיות h1 יחיד`);
    if ((html.match(/<h[2-6]\b/gu)||[]).length !== 0) issues.push(`${file}: אסורות כותרות h2-h6 לשאלות`);
    if (!html.includes(`משפט פיתגורס — עמוד ${local} / ${TOTAL}`)) issues.push(`${file}: מספור מקומי אינו ${local}/${TOTAL}`);
    if (!html.includes(exactFooter1) || !html.includes(exactFooter2)) issues.push(`${file}: footer אינו קנוני`);
    if (/\sstyle\s*=\s*["']/u.test(html)) issues.push(`${file}: inline style אסור`);
    if (/(?:שאלה|תרגיל)\s*\d+/u.test(textOf(html))) issues.push(`${file}: מספור שאלות גלוי אסור`);
  });
  assert.deepEqual(issues,[],'\n'+issues.join('\n'));
});

test('כתיב, מונחים וסימן הכפל נקיים בכל הרצף', () => {
  const issues = [];
  const forbiddenText = [
    [/פיטגורס/u,'פיטגורס → פיתגורס'],
    [/זוית/u,'זוית → זווית'],
    [/ישר זווית/u,'ישר זווית → ישר־זווית'],
    [/\.\.+/u,'ריבוי נקודות'],
    [/,\s*,/u,'פסיק כפול']
  ];
  for (const n of VISIBLE) {
    const html = htmlOf(n);
    const text = textOf(html);
    for (const [re,label] of forbiddenText) if (re.test(text)) issues.push(`עמוד-${n}.html: ${label}`);
    if (/ישר זווית/u.test(html)) issues.push(`עמוד-${n}.html: מונח לא תקני גם במטא/נגישות`);
    if (/(?:יתר[^.]{0,45}אלכסונ|אלכסונ[^.]{0,45}יתר)/u.test(text)) issues.push(`עמוד-${n}.html: אין לכנות יתר "אלכסון"`);
    if (/×/u.test(html)) issues.push(`עמוד-${n}.html: סימן כפל × אסור — יש להשתמש בנקודה`);
    if (/\\times\b/u.test(html)) issues.push(`עמוד-${n}.html: \\times אסור — יש להשתמש ב-\\cdot`);
    if (/\d\s*[xX]\s*\d/u.test(text)) issues.push(`עמוד-${n}.html: x/X בין מספרים אסור כסימן כפל`);
  }
  assert.deepEqual(issues,[],'\n'+issues.join('\n'));
});

test('20 דפי היסוד משתמשים בשלוש כותרות קבוצתיות בלבד', () => {
  const issues = [];
  FOUNDATION.forEach((n,index) => {
    const html = htmlOf(n);
    const match = html.match(/<h1 class="page-title">([^<]+)<\/h1>/u);
    if (match?.[1] !== TITLES[index]) issues.push(`עמוד-${n}.html: כותרת ${match?.[1] ?? 'חסרה'} במקום ${TITLES[index]}`);
  });
  assert.deepEqual(issues,[],'\n'+issues.join('\n'));
});

test('העקרונות המתמטיים הקריטיים של פיתגורס אינם נשחקים', () => {
  const p4 = htmlOf(637);
  assert.ok(p4.includes('מול הזווית הישרה'),'היתר חייב להיות מוגדר כמול הזווית הישרה');
  assert.ok(p4.includes('foundation-fill-medium') && p4.includes('ביותר במשולש'),'היתר חייב להילמד גם כצלע הארוכה ביותר');

  const powers = htmlOf(639) + htmlOf(640);
  assert.match(powers,/(?:\^2|²)/u,'לפני פיתגורס חייב להופיע כתיב חזקה שנייה');
  assert.ok(htmlOf(639).includes('\\cdot'),'הדגמת חזקה שנייה חייבת להציג כפל בנקודה');

  const roots = htmlOf(641) + htmlOf(642);
  assert.ok(roots.includes('\\sqrt'),'לפני פיתגורס חייב להופיע שורש ריבועי');
  assert.ok(htmlOf(642).includes('\\approx') || htmlOf(642).includes('≈'),'שורשים שאינם שלמים חייבים לכלול קירוב');

  for (const n of [651,652]) {
    const html = htmlOf(n);
    assert.match(html,/(?:x\^2|x²)/u,`עמוד ${n}: חסרה משוואת x בריבוע`);
    assert.ok(html.includes('\\sqrt'),`עמוד ${n}: חסר מעבר לשורש`);
    assert.doesNotMatch(html,/±/u,`עמוד ${n}: בהקשר של אורך אין להציג ± כתשובת אורך`);
  }

  assert.ok(htmlOf(646).includes('a^2+b^2=c^2'),'עמוד הנוסחה חייב לכלול a²+b²=c²');

  const canonical = htmlOf(653);
  for (const step of ['3^2+4^2=x^2','9+16=x^2','25=x^2','\\sqrt{25}=x','5=x']) {
    assert.ok(canonical.includes(step),`עמוד 653: חסרה שורת הדרך ${step}`);
  }
  assert.match(canonical,/class="final-answer"/u,'עמוד 653: התשובה הסופית חייבת להיות ממוסגרת');

  const leg = htmlOf(649);
  assert.ok(leg.includes('x^2+4^2=5^2'),'עמוד 649: חסרה דוגמה מלאה למציאת ניצב');
  assert.ok(leg.includes('3=x'),'עמוד 649: חסרה תשובה סופית בדוגמת הניצב');
});

test('הוראה חדשה נשענת על מקבצים ושומרת משימות מועילות קיימות', () => {
  const p1 = htmlOf(634);
  assert.match(p1,/בחרו זווית ישרה אחת מהסרטוטים וכתבו את מידתה/u);
  assert.match(p1,/הוסיפו בסרטוט סימון של זווית ישרה/u);
  assert.equal((p1.match(/aria-label="כתבו ישרה או לא ישרה"/gu)||[]).length,3);
  assert.equal((p1.match(/class="guided-ray-svg"/gu)||[]).length,2);
  assert.equal((p1.match(/marker-end="url\(#ray-arrow-[ab]\)"/gu)||[]).length,2,'קרן חייבת להיות מצוירת כקרן עם ראש חץ');

  const p3 = htmlOf(636);
  assert.ok((p3.match(/class="foundation-card concept-check"/gu)||[]).length >= 3,'עמוד 3: מקבץ ההשלמות קצר מדי');
  const p4 = htmlOf(637);
  assert.ok((p4.match(/data-required-reason-lines="2"/gu)||[]).length >= 6,'עמוד 4: זיהוי היתר חייב לכלול נימוק אמיתי לכל פריט');
  const p5 = htmlOf(638);
  assert.ok((p5.match(/aria-label="כתבו את אורך היתר"/gu)||[]).length >= 2,'עמוד 5: זיהוי היתר לפי אורכים חייב להישמר');
});

test('תיבת סגנון 5 והיחידות נשמרות לפי סוג התשובה', () => {
  const css = read('styles/topics/pythagoras-foundations.css');
  assert.match(css,/\.foundation-fill \{[^}]*border: 1\.35px solid #1f2a44;[^}]*border-radius: 8px;[^}]*box-shadow:/u);
  for (const [cls,width] of [['number',58],['short',82],['term',118],['medium',112]]) {
    assert.match(css,new RegExp(`\\.foundation-fill-${cls} \\{ width: ${width}px; \\}`,'u'));
  }
  for (const n of [634,635]) {
    const html = htmlOf(n);
    assert.match(html,/foundation-fill-number/u);
    assert.match(html,/foundation-unit">°<\/span>/u,'סימן המעלות חייב להיות מחוץ לתיבה');
  }

  const liveCss = read('styles/topics/pythagoras-live.css');
  assert.match(liveCss,/\.pyt-final-answer \{[^}]*height: 30px;[^}]*border: 1\.35px solid #1f2a44;[^}]*border-radius: 8px;[^}]*box-shadow:/u);
});

test('עמוד 33 מקצה דרך מלאה ותשובה סופית לשני סעיפי המלבן', () => {
  const html = htmlOf(21);
  const css = read('styles/pages/עמוד-21.css');
  assert.equal((html.match(/class="solution-space"/gu)||[]).length,2,'נדרשים שני אזורי פתרון נפרדים');
  assert.equal((html.match(/class="pyt-final-answer"/gu)||[]).length,2,'נדרשות שתי תיבות תשובה סופית');
  assert.equal((html.match(/הַציגו את דרך הפתרון:/gu)||[]).length,2,'כל סעיף חישובי חייב לדרוש דרך');
  assert.match(html,/חשבו את היקף הטרפז/u,'הכתיב היקף חייב להיות תקין');
  assert.doesNotMatch(html,/הקיף הטרפז/u,'הטעות הקיף אסורה');
  assert.match(css,/\.page-21 \.solution-space \{[^}]*min-height: 110px;[^}]*flex: 0 0 110px;/u,'כל סעיף חייב לקבל כחמש שורות כתיבה שימושיות');
});

test('הרצף והניווט של כל דפי הנושא נשארים רציפים', () => {
  const issues = [];
  VISIBLE.forEach((n,index) => {
    const html = htmlOf(n);
    if (index > 0 && !html.includes(`href="עמוד-${VISIBLE[index-1]}.html"`)) issues.push(`עמוד-${n}: חסר קודם ${VISIBLE[index-1]}`);
    if (index < VISIBLE.length-1 && !html.includes(`href="עמוד-${VISIBLE[index+1]}.html"`)) issues.push(`עמוד-${n}: חסר הבא ${VISIBLE[index+1]}`);
  });
  assert.deepEqual(issues,[],'\n'+issues.join('\n'));
});
