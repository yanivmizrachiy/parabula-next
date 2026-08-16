import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, content) => {
  const full = path.join(ROOT, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
};

const FOOTER = '<footer class="gz-footer"><div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div><div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div></footer>';
const TOPIC_LINK = '<div class="preview-nav-topics"><a class="topic-link is-active" href="עמוד-634.html" aria-current="page">משפט פיתגורס</a></div>';

const foundationOrder = [634,635,636,637,638,639,640,641,651,642,652,643,644,645,646,647,653,648,649,650];
const foundationTitles = [
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
const titleByGlobal = new Map(foundationOrder.map((n, i) => [n, foundationTitles[i]]));
const legacyVisible = [...Array.from({length:22},(_,i)=>9+i),41];
const advancedRelated = [375,376,377,378,379,380];
const fullVisible = [...foundationOrder, ...legacyVisible];
const TOTAL = fullVisible.length;
if (foundationOrder.length !== 20 || legacyVisible.length !== 23 || TOTAL !== 43) throw new Error('ספירת דפי פיתגורס אינה תואמת לחוזה');
for (const n of [...legacyVisible, ...advancedRelated]) {
  if (!fs.existsSync(path.join(ROOT, `עמוד-${n}.html`))) throw new Error(`אסור לאבד דף פיתגורס ותיק: עמוד-${n}.html`);
}

function pageShell({global, local, prev, next, pageTitle, body}) {
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>עמוד ${local} — ${pageTitle}</title><link rel="stylesheet" href="vendor/fonts/rubik.css"/><script>MathJax={tex:{inlineMath:[["\\\\(","\\\\)"]]},chtml:{fontURL:'vendor/mathjax/tex-font/chtml/woff2'}};</script><script id="MathJax-script" async src="vendor/mathjax/tex-mml-chtml.js"></script><link rel="stylesheet" href="styles/a4-base.css"/><link rel="stylesheet" href="styles/pages/עמוד-${global}.css"/></head><body><nav class="preview-nav"><div class="preview-nav-top"><div class="nav-side"><a class="nav-link" href="${prev}">הקודם</a></div><div class="nav-meta">משפט פיתגורס — עמוד ${local} / ${TOTAL}</div><div class="nav-side"><a class="nav-link" href="${next}">הבא</a></div></div>${TOPIC_LINK}</nav><main class="a4-page page-${global} pythagoras pyt-foundation"><header class="header-container"><h1 class="page-title">${pageTitle}</h1><div class="page-number">${local}</div></header><div class="question-block">${body}</div>${FOOTER}</main></body></html>`;
}

write('עמוד-651.html', pageShell({
  global:651, local:9, prev:'עמוד-641.html', next:'עמוד-642.html', pageTitle:titleByGlobal.get(651),
  body:`<div class="foundation-note">כאשר \\(x\\) מייצג אורך של צלע ונתון \\(x^2=n\\), מוציאים שורש ריבועי כדי למצוא את האורך. מכיוון שמדובר באורך, בוחרים בשורש החיובי.</div><div class="worked-example"><div class="example-label">דוגמה</div><div class="solution-stack"><div class="solution-step">\\(x^2=81\\)</div><div class="solution-step">\\(x=\\sqrt{81}\\)</div><div class="final-answer">\\(x=9\\)</div></div></div><div class="q-main"><div class="bullet-container"><div class="bullet-large"></div></div><div class="q-text">פתרו בדרך מלאה. בכל תרגיל רדו שורה, כתבו את פעולת השורש, ובשורה האחרונה כתבו את ערך \\(x\\).</div></div><div class="equation-practice-grid"><div class="equation-practice-card"><div class="practice-equation">\\(x^2=25\\)</div><div class="work-lines short"></div></div><div class="equation-practice-card"><div class="practice-equation">\\(x^2=36\\)</div><div class="work-lines short"></div></div><div class="equation-practice-card"><div class="practice-equation">\\(x^2=49\\)</div><div class="work-lines short"></div></div><div class="equation-practice-card"><div class="practice-equation">\\(x^2=64\\)</div><div class="work-lines short"></div></div><div class="equation-practice-card"><div class="practice-equation">\\(x^2=100\\)</div><div class="work-lines short"></div></div><div class="equation-practice-card"><div class="practice-equation">\\(x^2=121\\)</div><div class="work-lines short"></div></div></div>`
}));

write('עמוד-652.html', pageShell({
  global:652, local:11, prev:'עמוד-642.html', next:'עמוד-643.html', pageTitle:titleByGlobal.get(652),
  body:`<div class="foundation-note">גם כאשר השורש אינו מספר שלם, הדרך נשארת זהה: קודם כותבים את השורש המדויק ורק אחר כך, אם צריך, קירוב עשרוני.</div><div class="worked-example"><div class="example-label">דוגמה</div><div class="solution-stack"><div class="solution-step">\\(x^2=20\\)</div><div class="solution-step">\\(x=\\sqrt{20}\\)</div><div class="final-answer">\\(x\\approx4.47\\)</div></div></div><div class="q-main"><div class="bullet-container"><div class="bullet-large"></div></div><div class="q-text">פתרו בדרך מלאה. השאירו תחילה תשובה מדויקת עם שורש, ואז כתבו קירוב לשתי ספרות אחרי הנקודה.</div></div><div class="equation-practice-grid"><div class="equation-practice-card"><div class="practice-equation">\\(x^2=10\\)</div><div class="work-lines"></div></div><div class="equation-practice-card"><div class="practice-equation">\\(x^2=18\\)</div><div class="work-lines"></div></div><div class="equation-practice-card"><div class="practice-equation">\\(x^2=30\\)</div><div class="work-lines"></div></div><div class="equation-practice-card"><div class="practice-equation">\\(x^2=50\\)</div><div class="work-lines"></div></div></div>`
}));

write('עמוד-653.html', pageShell({
  global:653, local:17, prev:'עמוד-647.html', next:'עמוד-648.html', pageTitle:titleByGlobal.get(653),
  body:`<div class="foundation-note">בפתרון פיתגורס כותבים כל שינוי בשורה חדשה. כך אפשר לראות איפה הצבנו, איפה חישבנו ריבועים, ואיפה הוצאנו שורש.</div><div class="worked-example worked-example-wide"><div class="example-label">דוגמה</div><div class="solution-stack"><div class="solution-step">\\(3^2+4^2=x^2\\)</div><div class="solution-step">\\(9+16=x^2\\)</div><div class="solution-step">\\(25=x^2\\)</div><div class="solution-step">\\(\\sqrt{25}=x\\)</div><div class="final-answer">\\(5=x\\)</div></div></div><div class="q-main"><div class="bullet-container"><div class="bullet-large"></div></div><div class="q-text">פתרו באותה דרך. השאירו מקום לכל שורה, ובשורה האחרונה מסגרו את התשובה הסופית.</div></div><div class="equation-practice-grid"><div class="equation-practice-card"><div class="practice-equation">\\(5^2+12^2=x^2\\)</div><div class="work-lines"></div></div><div class="equation-practice-card"><div class="practice-equation">\\(6^2+8^2=x^2\\)</div><div class="work-lines"></div></div><div class="equation-practice-card"><div class="practice-equation">\\(8^2+15^2=x^2\\)</div><div class="work-lines"></div></div><div class="equation-practice-card"><div class="practice-equation">\\(5^2+3^2=x^2\\)</div><div class="work-lines"></div></div></div>`
}));
for (const n of [651,652,653]) write(`styles/pages/עמוד-${n}.css`, '@import url("../topics/pythagoras-foundations.css");\n');

const cssPath = 'styles/topics/pythagoras-foundations.css';
let css = read(cssPath);
if (!css.includes('/* pythagoras-foundations-v2 */')) {
  css += `\n/* pythagoras-foundations-v2 */\n.pyt-foundation .worked-example { border: 1.5px solid var(--accent-dark); border-radius: 10px; background: var(--bg-paper); padding: 12px 18px; display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: start; }\n.pyt-foundation .worked-example-wide { padding-block: 10px; }\n.pyt-foundation .example-label { font-weight: 700; font-size: 18px; padding-top: 3px; }\n.pyt-foundation .solution-stack { direction: ltr; unicode-bidi: isolate; display: grid; justify-items: center; gap: 7px; width: 100%; }\n.pyt-foundation .solution-step { font-size: 21px; line-height: 1.35; min-height: 26px; }\n.pyt-foundation .final-answer { direction: ltr; unicode-bidi: isolate; display: inline-block; border: 2px solid var(--accent-dark); border-radius: 5px; padding: 4px 16px; font-size: 21px; font-weight: 700; }\n.pyt-foundation .equation-practice-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }\n.pyt-foundation .equation-practice-card { border: 1px solid var(--border-light); border-radius: 9px; background: var(--bg-paper); padding: 9px; }\n.pyt-foundation .practice-equation { direction: ltr; unicode-bidi: isolate; text-align: center; font-size: 20px; font-weight: 600; margin-bottom: 7px; }\n.pyt-foundation .work-lines.short { min-height: 64px; }\n.pyt-foundation .length-rule-check { display: grid; gap: 8px; margin-top: 4px; }\n.pyt-foundation .length-rule-check .statement { background: var(--bg-paper); }\n.pyt-foundation .worked-example.compact { padding: 9px 14px; margin-bottom: 4px; }\n.pyt-foundation .worked-example.compact .solution-step, .pyt-foundation .worked-example.compact .final-answer { font-size: 18px; }\n@media print { .pyt-foundation .worked-example, .pyt-foundation .equation-practice-card { break-inside: avoid; } }\n`;
  write(cssPath, css);
}

function insertBeforeQuestionBlockEnd(html, fragment) {
  const marker = '</div><footer class="gz-footer">';
  if (!html.includes(marker)) throw new Error('לא נמצא גבול question-block לפני footer');
  return html.replace(marker, `${fragment}</div><footer class="gz-footer">`);
}

let p638 = read('עמוד-638.html');
if (!p638.includes('data-pyt-v2="length-rule"')) {
  const fragment = `<div class="length-rule-check" data-pyt-v2="length-rule"><div class="q-main"><div class="bullet-container"><div class="bullet-large"></div></div><div class="q-text">השתמשו גם בכלל: במשולש ישר־זווית היתר הוא הצלע הארוכה ביותר.</div></div><div class="statement">במשולש ישר־זווית שאורכי צלעותיו 6, 8, 10 — אורך היתר: <span class="response-line"></span></div><div class="statement">במשולש ישר־זווית שאורכי צלעותיו 5, 12, 13 — אורך היתר: <span class="response-line"></span></div></div>`;
  p638 = insertBeforeQuestionBlockEnd(p638, fragment);
  write('עמוד-638.html', p638);
}

let p649 = read('עמוד-649.html');
if (!p649.includes('data-pyt-v2="leg-example"')) {
  const fragment = `<div class="worked-example compact" data-pyt-v2="leg-example"><div class="example-label">דוגמה</div><div class="solution-stack"><div class="solution-step">\\(x^2+4^2=5^2\\)</div><div class="solution-step">\\(x^2+16=25\\)</div><div class="solution-step">\\(x^2=9\\)</div><div class="solution-step">\\(\\sqrt{9}=x\\)</div><div class="final-answer">\\(3=x\\)</div></div></div>`;
  const start = p649.indexOf('<div class="foundation-note">');
  const noteEnd = p649.indexOf('</div>', start);
  if (start < 0 || noteEnd < 0) throw new Error('לא נמצאה הערת פתיחה בעמוד-649');
  const at = noteEnd + 6;
  p649 = p649.slice(0, at) + fragment + p649.slice(at);
  write('עמוד-649.html', p649);
}

function setNavHref(html, label, target) {
  const re = new RegExp(`<a class="nav-link" href="[^"]+">${label}<\\/a>`,'u');
  if (!re.test(html)) throw new Error(`לא נמצא קישור ${label}`);
  return html.replace(re, `<a class="nav-link" href="${target}">${label}</a>`);
}

for (let i=0;i<fullVisible.length;i+=1) {
  const n = fullVisible[i];
  const file = `עמוד-${n}.html`;
  let html = read(file);
  const local = i+1;
  const pageTitle = titleByGlobal.get(n) || 'משפט פיתגורס';
  html = html.replace(/<title>עמוד \d+ — [^<]+<\/title>/u, `<title>עמוד ${local} — ${pageTitle}</title>`);
  html = html.replace(/משפט פיתגורס — עמוד \d+ \/ \d+/u, `משפט פיתגורס — עמוד ${local} / ${TOTAL}`);
  html = html.replace(/<div class="page-number">\d+<\/div>/u, `<div class="page-number">${local}</div>`);
  if (titleByGlobal.has(n)) html = html.replace(/<h1 class="page-title">[^<]+<\/h1>/u, `<h1 class="page-title">${pageTitle}</h1>`);
  if (i>0) html = setNavHref(html,'הקודם',`עמוד-${fullVisible[i-1]}.html`);
  if (i<fullVisible.length-1) html = setNavHref(html,'הבא',`עמוד-${fullVisible[i+1]}.html`);
  write(file,html);
}

const metaPath = 'meta/topics.json';
const meta = JSON.parse(read(metaPath));
const pyt = meta.topics.find((t)=>t.name==='משפט פיתגורס');
if (!pyt) throw new Error('לא נמצא נושא משפט פיתגורס ב-meta/topics.json');
const oldPages = new Map(pyt.pages.map((p)=>[Number(p.number),p]));
pyt.pages = fullVisible.map((number,i)=>{
  const old = oldPages.get(number) || {};
  const local = i+1;
  const pageTitle = titleByGlobal.get(number) || 'משפט פיתגורס';
  return {
    ...old,
    number,
    file:`עמוד-${number}.html`,
    title:`עמוד ${local} — ${pageTitle}`,
    h1:pageTitle,
    topic:'משפט פיתגורס',
    previewPath:`/עמוד-${number}.html`,
    siteUrl:`https://yanivmizrachiy.github.io/razpages/עמוד-${number}.html`,
    curriculumId:'g7.geo.pythagoras',
  };
});
pyt.count = pyt.pages.length;
meta.totalPages = meta.topics.reduce((sum,topic)=>sum+topic.pages.length,0);
meta.generatedAt = new Date().toISOString();
write(metaPath,`${JSON.stringify(meta,null,2)}\n`);

const curriculumPath = 'scripts/curriculum-map.mjs';
let curriculum = read(curriculumPath);
const oldAssignment = "'g7.geo.pythagoras': ['634-650', '9-30', 41, '375-380'],";
const newAssignment = "'g7.geo.pythagoras': ['634-653', '9-30', 41, '375-380'],";
if (!curriculum.includes(oldAssignment) && !curriculum.includes(newAssignment)) throw new Error('לא נמצא שיוך פיתגורס במפת תכנית הלימודים');
curriculum = curriculum.replace(oldAssignment,newAssignment);
write(curriculumPath,curriculum);

const claudePath = 'CLAUDE.md';
let claude = read(claudePath);
const sectionRe = /### 4\.2א חוזה נושא „משפט פיתגורס” \(מצב „יסודות חדשים \+ רצף קיים”\)[\s\S]*?(?=\n### 4\.3)/u;
if (!sectionRe.test(claude)) throw new Error('לא נמצא חוזה פיתגורס ב-CLAUDE.md');
const newSection = String.raw`### 4.2א חוזה נושא „משפט פיתגורס” (מצב „יסודות חדשים + רצף קיים”)

הוראה מפורשת של יניב (2026-08-16) לנושא זה בלבד:

- **מקור אמת יחיד:** כל דרישות פיתגורס המחייבות נכתבות רק כאן, בתוך `CLAUDE.md`. אין ליצור מסמך כללים, memory, contract או brief מקביל. בדיקות אוטומטיות רשאיות לאכוף את הכללים אך אינן מקור אמת נוסף.
- **כל החומר הקיים נשמר:** דפי פיתגורס הוותיקים `עמוד-9.html` עד `עמוד-30.html` ו־`עמוד-41.html` נשארים חלק קבוע מהנושא ואינם חומר זמני או מועמד למחיקה. גם דפי היישום המתקדמים `עמוד-375.html` עד `עמוד-380.html`, המשויכים לצומת פיתגורס בתכנית הלימודים, נשמרים. דפי יסוד חדשים מצטרפים אליהם; אין להחליף את הפרויקט הוותיק בחוברת חדשה.
- **שיפור תוספתי כברירת מחדל:** מותר ליצור, להוסיף ולשפר תוכן יסודות חדש ומדורג. אין למחוק דף תקין, שאלה מועילה או מיומנות קיימת רק כדי להכניס הוראה חדשה; מוסיפים, משפרים ומתקנים, ורק תוכן שגוי או סותר מוחלף. העריכות העתידיות חלות באופן אחיד על כל רצף פיתגורס לפי כללי הפרויקט.
- **סדר היסודות המחייב:** זווית ישרה → משולש ישר־זווית → ניצבים → יתר → זיהוי ניצבים ויתר גם בסיבוב → חזקה שנייה וריבועי מספרים → שורש ריבועי מושלם → פתרון משוואות אורך מהצורה \(x^2=n\) במספרים בעלי שורש שלם → שורשים שאינם שלמים וקירוב → פתרון \(x^2=n\) במספרים שאינם בעלי שורש שלם → משמעות גאומטרית של ריבוע הצלע → גילוי וניסוח משפט פיתגורס → \(a^2+b^2=c^2\) → כתיבת משוואה → דרך פתרון מלאה למציאת יתר → מציאת יתר במשולש → דרך פתרון למציאת ניצב → תרגול משולב. מספר הדפים נגזר מאיכות ההוראה ואינו מכסה קשיחה.
- **מושגים בסיסיים לפני חישוב:** התלמיד חייב להכיר ולתרגל זווית ישרה, משולש ישר־זווית, ניצבים, יתר, חזקת 2, ריבועים, שורש ריבועי והקשר בין ריבוע לאורך צלע לפני פתרון מלא של משפט פיתגורס.
- **היתר — שתי עובדות שחייבים ללמד ולתרגל:** היתר נמצא מול הזווית הישרה והוא הצלע הארוכה ביותר במשולש ישר־זווית. התלמיד מתרגל זיהוי יתר במשולשים בכיוונים שונים וגם מתוך אורכי צלעות, כדי שלא יזהה יתר לפי „צלע אלכסונית” או מיקום קבוע בציור.
- **שאלות מגוונות:** הרצף כולל זיהוי וסימון, בחירה, השלמה, התאמה, חישוב, כתיבת משוואה, פתרון מלא, הבחנה בין יתר לניצב ושאלות משולבות. אין להפוך את כל דפי היסוד לאותו סוג תרגיל חוזר.
- **כותרת אחת לכל עמוד, בלי כותרות לשאלות:** לכל עמוד יסוד יש כותרת לימודית אחת בראש העמוד המתארת את המושג או המיומנות, לדוגמה „זווית ישרה”, „מושגים בסיסיים”, „מציאת היתר באמצעות משפט פיתגורס” או „מציאת ניצב באמצעות משפט פיתגורס”. בתוך העמוד אין כותרת לכל שאלה ואין `h2`–`h6`; יש רק הוראה/הנחיה קצרה, דוגמה כאשר נדרשת ושאלות. אין „שאלה 1”, „תרגיל 2” או כותרות קושי/שלב גלויות.
- **חזקות ושורשים לפני פיתגורס:** יש תרגול רחב של ריבועים, שורשים ופתרון \(x^2=n\). קודם מספרים עם שורש שלם, ורק אחר כך מספרים עם שורש שאינו שלם. כאשר \(x\) מייצג אורך צלע משתמשים בשורש החיובי בלבד; אין ללמד בטעות שהמשוואה האלגברית הכללית \(x^2=n\) כוללת רק פתרון חיובי מחוץ להקשר של אורך.
- **דוגמה לפני דרך חדשה:** לפני שהתלמיד נדרש לבצע סוג פתרון חדש מוצגת דוגמה מלאה, וכל מעבר נכתב בשורה נפרדת בלי דילוגים. לדוגמה בפתרון \(x^2=81\): \(x^2=81\) → \(x=\sqrt{81}\) → \(x=9\). השורה האחרונה היא התשובה הסופית וממוסגרת במלבן ברור.
- **דרך פתרון קנונית בפיתגורס:** בדוגמה למציאת יתר הדרך מוצגת כרצף שורות, למשל \(3^2+4^2=x^2\) → \(9+16=x^2\) → \(25=x^2\) → \(\sqrt{25}=x\) → \(5=x\). השורה האחרונה ממוסגרת. גם בתרגילים עצמם נשמר שטח כתיבה מספיק לכל שורות הדרך, ולא רק קו לתשובה.
- **מספרים נקיים לפני מספרים לא־שלמים:** בתחילת כל מיומנות חדשה משתמשים בדוגמאות שנותנות ריבועים ושורשים שלמים כדי לבודד את הרעיון. רק לאחר שליטה בדרך מופיעים שורשים לא־שלמים, כתיב מדויק עם סימן שורש וקירוב עשרוני כשנדרש.
- **רצף הדפים:** 20 דפי היסוד הם `עמוד-634.html` עד `עמוד-653.html`, בסדר הפדגוגי הקנוני שמוגדר ב־`meta/topics.json` ולא לפי סדר המספר הגלובלי בלבד. אחריהם ממשיכים 23 הדפים הוותיקים. המספור המקומי של הרצף הגלוי הוא 1–43; זהות הקובץ הגלובלית אינה משתנה.
- **עיצוב ושרטוט:** A4, RTL ו־SVG וקטורי חד ובר־עריכה לפי §3–§4. שכבת היסודות המשותפת היא `styles/topics/pythagoras-foundations.css`; כל דף קנוני מקשר דרך `styles/pages/עמוד-N.css`. אין inline CSS.
- **שרשרת הניווט:** הדף שלפני פיתגורס מוביל אל דף היסודות הראשון; דף יסודות 20 מוביל אל הדף הוותיק הראשון; משם הרצף הוותיק נמשך ללא שינוי בזהויות הקבצים.
- **בדיקות:** הרצף, שמירת כל הדפים הוותיקים, המושגים, כותרת עמוד יחידה, היעדר כותרות שאלה, דוגמאות הדרך, מלבן התשובה הסופית, מקום הכתיבה, ה־footer, ה־RTL, היעדר inline CSS והמעבר לדפים הוותיקים נאכפים בבדיקת חוזה ייעודית.
`;
claude = claude.replace(sectionRe,newSection);
write(claudePath,claude);

for (const cleanup of ['scripts/extend-pythagoras-foundations-v2-once.mjs','.github/workflows/pythagoras-foundations-v2-sync.yml']) {
  const full = path.join(ROOT,cleanup);
  if (fs.existsSync(full)) fs.rmSync(full);
}
console.log('[OK] Pythagoras v2: additive 20-page foundations + all legacy pages preserved.');
