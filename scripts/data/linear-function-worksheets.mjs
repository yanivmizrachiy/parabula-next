// scripts/data/linear-function-worksheets.mjs
// הגדרות דפי העבודה של הנושא "פונקציה קווית" (כיתה ח), בסדר תוכנית הלימודים.
//
// מקורות התוכן:
//   [תל]  תוכנית הלימודים במתמטיקה לכיתות ז-ט, כיתה ח, סבב 1, תחום אלגברי,
//         "פונקציה קווית, אי-שוויון" — עמודים 53-55 (הדגשים והדוגמאות).
//   [מקור] חוברות המקור שסיפק יניב (פונקציה2 / פונקציות3 / פונקציות4 / פונקציה5 /
//         סיכום פונקציה קווית), שתומללו בנאמנות מלאה.
//
// כל שאלה כאן מקורה במקור מתומלל. אין המצאה, אין ניחוש (§1, §4).

import fs from 'node:fs';
import path from 'node:path';
import { axesSvg } from '../lib/coord-svg.mjs';
import {
  q, def, rules, chapterBar, vtable, ctable, linesBlock,
  wline, wexpr, wpoint, weq, weqOpen,
} from '../lib/linear-page.mjs';
import { SUBTOPICS, buildSubtopicPages } from '../lib/pack-pages.mjs';

/** מספר הקובץ הראשון שיוקצה לדפים חדשים (ממשיך את המספור הגלובלי של הריפו). */
export const FIRST_NEW_FILE = 395;

/* ══════════════════════════════════════════════════════════════════════
   תת־נושא 1 — קצב השתנות אחיד וזיהוי פונקציה קווית   [תל דגשים 1-3]
   ══════════════════════════════════════════════════════════════════════ */

const page_rate1 = () => [
  chapterBar('קצב השתנות אחיד', 'הדרך אל הפונקציה הקווית'),

  def(`<b>פונקציה קווית</b> היא פונקציה שבה קצב ההשתנות הוא <b>אחיד</b>: לשינוי קבוע ב־\\(x\\) מתאים תמיד אותו שינוי ב־\\(y\\). הגרף שלה הוא <b>קו ישר</b>, והייצוג האלגברי שלה הוא מהצורה \\(y = mx + b\\).`),

  q({
    stem: `לפניכם ייצוג של פונקציה \\(g\\) כטבלת ערכים חלקית:`,
    fig: vtable([
      { head: '\\(x\\)', cells: ['1', '2', '3', '4', '5', '6', '7'] },
      { head: '\\(g(x)\\)', cells: ['4', '7', '10', '13', '16', '19', '22'] },
    ]),
    figFirst: true,
    subs: [
      { l: 'א.', t: `האם פונקציה זו מתארת קצב השתנות אחיד? נמקו את תשובתכם. ${wline('w160')}` },
      { l: 'ב.', t: `מהו קצב ההשתנות של הפונקציה? ${wline('w40')}` },
    ],
    // רצף האותיות חייב לרוץ א→ב→ג→ד על הדף. הסעיף שדורש סרטוט מוצב במקומו
    // ברצף, והגרף מתחתיו — ולא אחרי הסעיפים שבאים אחריו.
    tail: `<div class="subs"><div class="sub"><span class="subl">ג.</span><span class="subt">שרטטו את הגרף של פונקציה זו.</span></div></div>` +
      `<div class="figure">` +
      axesSvg({
        id: 'r1a', xMin: 0, xMax: 8, yMin: 0, yMax: 24,
        xUnit: 17, yUnit: 5.2, padL: 26, pad: 14,
        xGridStep: 1, yGridStep: 2, xTickStep: 1, yTickStep: 4,
        showZero: true, ariaLabel: 'מערכת צירים ריקה לשרטוט הגרף, ציר x מ־0 עד 8 וציר y מ־0 עד 24',
      }) + `</div>` +
      `<div class="subs"><div class="sub"><span class="subl">ד.</span><span class="subt">מהו ערך הפונקציה בנקודות: <span class="ltr">\\(g(8) =\\)</span> ${wline('w40')} &nbsp; <span class="ltr">\\(g(12) =\\)</span> ${wline('w40')} &nbsp; <span class="ltr">\\(g(100) =\\)</span> ${wline('w40')}</span></div></div>`,
  }),

  q({
    stem: `נתונה הפונקציה <span class="ltr">\\(y = 2x + 4\\)</span>`,
    // א ו-ב דורשים טבלה וגרף ולכן מוצבים ראשונים בשורת עבודה; ג-ה אחריהם.
    tail: `<div class="workrow top">` +
      `<div class="figure"><div class="figcap">א. בנו טבלת ערכים חלקית שבה 5 נקודות.</div>` +
      vtable([
        { head: '\\(x\\)', cells: [null, null, null, null, null] },
        { head: '\\(y\\)', cells: [null, null, null, null, null] },
      ], { wide: true }) + `</div>` +
      `<div class="figure"><div class="figcap">ב. שרטטו את הגרף של פונקציה זו.</div>` +
      axesSvg({
        id: 'r1b', xMin: -4, xMax: 4, yMin: -4, yMax: 12,
        xUnit: 15, yUnit: 7.5, padL: 24, pad: 14,
        xGridStep: 1, yGridStep: 1, xTickStep: 1, yTickStep: 2,
        ariaLabel: 'מערכת צירים ריקה לשרטוט, ציר x מ־מינוס 4 עד 4 וציר y מ־מינוס 4 עד 12',
      }) + `</div></div>` +
      `<div class="subs">` +
      `<div class="sub"><span class="subl">ג.</span><span class="subt">מהו קצב ההשתנות (השיפוע) של הפונקציה? ${wline('w40')}</span></div>` +
      `<div class="sub"><span class="subl">ד.</span><span class="subt">מהו ערך הפונקציה כש־\\(x = 0\\)? ${wline('w40')}</span></div>` +
      `<div class="sub"><span class="subl">ה.</span><span class="subt">עבור איזה ערך של \\(x\\) ערך הפונקציה הוא אפס? ${wline('w40')}</span></div>` +
      `</div>`,
  }),
];

/* ══════════════════════════════════════════════════════════════════════
   תת־נושא — משוואת ישר לפי שתי נקודות, ומקבילים   [תל דוגמאות 4-5, דגש 5,9]
   ══════════════════════════════════════════════════════════════════════ */

const page_twoPoints = () => [
  chapterBar('מציאת משוואת הישר', 'לפי שתי נקודות · ישרים מקבילים'),

  def(`השיפוע הוא <b>היחס בין השתנות \\(y\\) לבין השתנות \\(x\\)</b>: <span class="ltr">\\(m = \\dfrac{y_2 - y_1}{x_2 - x_1}\\)</span>. לשני ישרים <b>מקבילים</b> יש <b>אותו שיפוע</b>.`),

  q({
    stem: `נתון שגרף של פונקציה קווית עובר דרך הנקודות <span class="ltr">\\((1,-2)\\)</span> ו־<span class="ltr">\\((2,3)\\)</span>.`,
    subs: [
      { l: 'א.', t: `מהו קצב ההשתנות של הפונקציה? <span class="ltr">\\(m =\\)</span> ${wline('w40')}` },
      { l: 'ג.', t: `מהו ערך הפונקציה כש־\\(x = 0\\)? ${wline('w40')} &nbsp; כש־\\(x = 5\\)? ${wline('w40')}` },
      { l: 'ד.', t: `מהו הייצוג האלגברי של פונקציה זו? ${weq()}` },
    ],
    tail: `<div class="workrow top"><div class="figure"><div class="figcap">ב. שרטטו את גרף הפונקציה.</div>` +
      axesSvg({
        id: 'tp1', xMin: -3, xMax: 5, yMin: -8, yMax: 8,
        xUnit: 15, yUnit: 7.5, padL: 24, pad: 14,
        xGridStep: 1, yGridStep: 1, xTickStep: 1, yTickStep: 2,
        points: [{ x: 1, y: -2, name: '', r: 2.6 }, { x: 2, y: 3, name: '', r: 2.6 }],
        ariaLabel: 'מערכת צירים ובה שתי הנקודות (1,-2) ו-(2,3) לשרטוט הישר',
      }) + `</div></div>`,
  }),

  q({
    stem: `מהו הייצוג האלגברי של הגרף הישר העובר דרך הנקודה <span class="ltr">\\((5,3)\\)</span> ומקביל לישר העובר דרך הנקודות <span class="ltr">\\((4,2)\\)</span> ו־<span class="ltr">\\((6.5,3)\\)</span>?`,
    subs: [
      { l: 'א.', t: `מהו שיפוע הישר העובר דרך <span class="ltr">\\((4,2)\\)</span> ו־<span class="ltr">\\((6.5,3)\\)</span>? <span class="ltr">\\(m =\\)</span> ${wline('w40')}` },
      { l: 'ב.', t: `מהו שיפוע הישר המבוקש? נמקו. ${wline('w120')}` },
      { l: 'ג.', t: `כתבו את משוואת הישר המבוקש: ${weq()}` },
    ],
  }),
];

/* ══════════════════════════════════════════════════════════════════════
   תת־נושא — נקודת חיתוך בין שתי פונקציות קוויות   [תל דוגמה 6]
   ══════════════════════════════════════════════════════════════════════ */

const page_intersection = () => [
  chapterBar('נקודת חיתוך בין שתי פונקציות', 'פתרון גרפי ואלגברי'),

  def(`בנקודת החיתוך של שני גרפים <b>שני ערכי \\(y\\) שווים</b>. לכן כדי למצוא אותה פותרים את המשוואה \\(f(x) = g(x)\\), ומציבים את הפתרון באחת הפונקציות כדי לקבל את שיעור ה־\\(y\\).`),

  q({
    stem: `נתונות שתי הפונקציות: &nbsp; <span class="ltr">\\(f(x) = 3x + 5\\)</span> &nbsp;&nbsp; <span class="ltr">\\(g(x) = -2x - 10\\)</span>`,
    subs: [
      { l: 'ב.', t: `מהם שיעורי נקודת החיתוך של שני הגרפים? ${wpoint()}` },
      { l: 'ג.', t: `מהו הערך של \\(x\\) שעבורו <span class="ltr">\\(f(x) = g(x)\\)</span>? ${wline('w40')}` },
    ],
    tail: `<div class="workrow top"><div class="figure"><div class="figcap">א. שרטטו את הגרפים של שתי הפונקציות במערכת צירים משותפת.</div>` +
      axesSvg({
        id: 'int1', xMin: -7, xMax: 4, yMin: -14, yMax: 10,
        xUnit: 15, yUnit: 6.4, padL: 28, pad: 14,
        xGridStep: 1, yGridStep: 2, xTickStep: 1, yTickStep: 4,
        ariaLabel: 'מערכת צירים ריקה לשרטוט שני הגרפים',
      }) + `</div>` +
      `<div class="pairs-col"><span>דרך הפתרון:</span>${linesBlock(4)}</div></div>`,
  }),
];

/* ══════════════════════════════════════════════════════════════════════
   תת־נושא — ייצוג תופעות באמצעות פונקציות קוויות   [תל "ייצוג תופעות"]
   ══════════════════════════════════════════════════════════════════════ */

const page_trucks = () => [
  chapterBar('ייצוג תופעות באמצעות פונקציות קוויות', 'קריאת גרף מהחיים'),

  q({
    stem: `משאית יצאה בשעה <span class="ltr">6:00</span> מאילת לקריית שמונה (המרחק בין הערים כ־600 ק"מ). באותה השעה יצאה משאית אחרת מקריית שמונה לכיוון אילת. האיור מציג גרפים המתארים את המרחק מאילת של שתי המשאיות בזמנים שונים.`,
    fig: axesSvg({
      id: 'tr1', xMin: 0, xMax: 16, yMin: 0, yMax: 640,
      xUnit: 26, yUnit: 0.42, padL: 40, padR: 60, pad: 16, longLabels: true,
      showGrid: false, xTickStep: 2, yTickStep: 200, showZero: true,
      xLabel: 'זמן בשעות', yLabel: 'מרחק מאילת בק"מ',
      lines: [
        { through: [[0, 600], [7.5, 0]], width: 1.7 },
        { through: [[0, 0], [15, 600]], width: 1.7, color: '#b91c1c' },
      ],
      points: [
        { x: 0, y: 600, name: '(0,600)', dx: 6, dy: -7, color: '#1f2a44', r: 2.6 },
        { x: 15, y: 600, name: '(15,600)', dx: 7, dy: 4, anchor: 'start', color: '#1f2a44', r: 2.6 },
        { x: 7.5, y: 0, name: '(7.5,0)', dx: 4, dy: 15, color: '#1f2a44', r: 2.6 },
      ],
      ariaLabel: 'שני גרפים קוויים: ישר יורד מהנקודה (0,600) אל (7.5,0), וישר עולה מראשית הצירים אל (15,600)',
    }),
    figFirst: true,
    subs: [
      { l: 'א.', t: `בגרף מסומנות נקודות. הסבירו מה מתארות נקודות אלה. ${wline('w160')}` },
      { l: 'ב.', t: `מה הייתה מהירותה של המשאית שיצאה מאילת? ${wline('w90')}` },
      { l: 'ג.', t: `באיזו שעה ובאיזה מרחק מאילת נפגשו המשאיות? &nbsp; שעה: ${wline('w40')} &nbsp; מרחק: ${wline('w40')}` },
      { l: 'ד.', t: `איזו משתי המשאיות נסעה מהר יותר, וכיצד ניתן לדעת זאת? ${wline('w160')}` },
      { l: 'ה.', t: `כתבו שני ביטויים אלגבריים המתאימים לשתי הפונקציות בגרף:` },
    ],
    answers: [
      `המשאית שיצאה מאילת: ${weqOpen('y =')}`,
      `המשאית שיצאה מקריית שמונה: ${weqOpen('y =')}`,
    ],
  }),
];

/* ══════════════════════════════════════════════════════════════════════
   הרכבת סדר הנושא — דוגמאות תוכנית הלימודים + מאגר המקור המתומלל
   ══════════════════════════════════════════════════════════════════════ */

const BANK = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'sources', 'linear-function', 'bank.json'), 'utf8'));

/** דפים שנבנו ידנית מדוגמאות תוכנית הלימודים, ומיקומם בתוך תת־הנושא. */
const CURRICULUM_PAGES = {
  'rate-of-change': [
    { chapter: 'קצב השתנות אחיד', subtitle: 'קצב השתנות אחיד · טבלת ערכים · הגרף כקו ישר', blocks: page_rate1 },
  ],
  'equation-two-points': [
    { chapter: 'מציאת משוואת הישר', subtitle: 'משוואת ישר לפי שתי נקודות · ישרים מקבילים', blocks: page_twoPoints },
  ],
  intersection: [
    { chapter: 'נקודת חיתוך בין שתי פונקציות', subtitle: 'פתרון גרפי ואלגברי של \\(f(x)=g(x)\\)', blocks: page_intersection },
  ],
  'word-problems': [
    { chapter: 'ייצוג תופעות', subtitle: 'קריאת גרף מהחיים · מהירות כשיפוע', blocks: page_trucks },
  ],
};

/** דפים קיימים בריפו שכבר מכסים תת־נושא — משולבים במקומם ולא משוכפלים. */
const EXISTING_PAGES = {
  'increasing-decreasing': [96, 97, 98],
};

export const TOPIC_ORDER = SUBTOPICS.flatMap((st) => [
  ...(CURRICULUM_PAGES[st.slug] || []).map((p) => ({ kind: 'new', slug: st.slug, ...p })),
  ...(EXISTING_PAGES[st.slug] || []).map((file) => ({ kind: 'existing', file, slug: st.slug, chapter: st.chapter })),
  ...buildSubtopicPages(st, BANK[st.slug] || []),
]);
