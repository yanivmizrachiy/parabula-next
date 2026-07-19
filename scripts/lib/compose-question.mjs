// scripts/lib/compose-question.mjs — ממיר שאלה מתומללת (JSON) לבלוק HTML של דף עבודה.
//
// המרה דטרמיניסטית בלבד: המלל, המספרים והנתונים מועתקים כפי שהם מהמקור (§4).
// המלחין אינו משנה ניסוח, אינו מתקן שגיאות שבמקור ואינו משלים ערך חסר.
//
// שתי אחריות מרכזיות:
//   1. עטיפת LTR אוטומטית — בהקשר RTL, `(8;5)` או `m = -2` מתהפכים ויוצרים
//      טקסט שגוי לתלמיד. כל ריצה לא־עברית עם ספרה/אות לועזית נעטפת ב-.ltr (§4.3).
//   2. מקום מענה תואם למבנה התשובה — תיבה לכל ערך, אופרטור מודפס (§4.3).

import { axesSvg } from './coord-svg.mjs';
import { q, vtable, ctable, linesBlock, wline, wexpr, wpoint, weqOpen } from './linear-page.mjs';

const HEB = /[֐-׿]/;

/** האם המחרוזת כולה לא־עברית ומכילה תוכן מתמטי? */
function isMathRun(s) {
  return !HEB.test(s) && /[0-9A-Za-z]/.test(s);
}

/**
 * עוטף ריצות מתמטיות ב-<span class="ltr"> כדי למנוע היפוך bidi.
 * שמרני: ריצה חייבת להתחיל ולהסתיים בתו אלפאנומרי או בסוגר סוגר.
 */
export function autoLtr(text) {
  if (!text) return '';
  const esc = String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // סורקים מקטעים שלמים של תוכן לא־עברי. גרסה קודמת דרשה שהריצה תתחיל בתו
  // אלפאנומרי, ולכן הסוגר הפותח של `(0 , 8)` נשאר מחוץ למכל ה-LTR וה-RTL העיף
  // אותו לסוף — התלמיד ראה `((8 , 0.`. כאן המקטע נלקח במלואו, כולל סוגריים.
  const parts = esc.split(/([֐-׿]+)/);
  return parts.map((seg) => {
    if (!seg || HEB.test(seg) || !/[0-9A-Za-z]/.test(seg)) return seg;

    // פיסוק שמסיים משפט עברי נשאר מחוץ למכל; נקודה בתוך מספר (0.5) נשארת בפנים.
    // מקף־חיבור עברי ("ו- A(5;2)") אינו סימן מינוס — הוא נשאר מחוץ למכל.
    // מינוס צמוד לספרה ("-4") כן נכנס, כי הוא חלק מהערך.
    // פיסוק פותח (":" אחרי "נתונה הפונקציה:") שייך למשפט העברי ונשאר מחוץ למכל.
    const lead = seg.match(/^\s*[:;,]?\s*(?:[-–]\s+)?/)[0];
    let core = seg.slice(lead.length);
    let tail = '';
    const m = core.match(/[\s.,;:!?]+$/);
    if (m) { tail = m[0]; core = core.slice(0, -m[0].length); }
    if (!core || !/[0-9A-Za-z]/.test(core)) return seg;

    // איזון סוגריים: סוגר סוגר יתום בקצה שייך לטקסט העברי שעוטף אותו.
    let open = 0;
    for (const ch of core) { if (ch === '(') open++; else if (ch === ')') open--; }
    while (open < 0 && core.endsWith(')')) { tail = ')' + tail; core = core.slice(0, -1); open++; }

    return `${lead}<span class="ltr">${core}</span>${tail}`;
  }).join('');
}

/** מקום המענה המתאים לצורת התשובה (§4.3). */
export function answerWidget(shape, opt = {}) {
  switch (shape) {
    case 'point': return wpoint(opt.name || '');
    case 'ratio': return wexpr(2, [':']);
    case 'expr2': return wexpr(2, [opt.op || '+']);
    case 'expr3': return wexpr(3, [opt.op || '+', opt.op2 || '+']);
    case 'equation': return weqOpen('y =');
    case 'lines': return '';
    case 'graph': return '';
    case 'table': return '';
    case 'choice': return '';
    case 'circle': return '';
    case 'single':
    default: return wline(opt.w || 'w90');
  }
}

/** מערכת צירים מתוך שדה figure — רק אם הנתונים מספיקים. אחרת null. */
export function figureSvg(fig, id, opt = {}) {
  if (!fig) return null;
  const kind = fig.kind || 'none';
  if (kind === 'none' || kind === 'picture') return null;

  const pts = (fig.points || []).filter((p) => p.x !== null && p.x !== undefined && p.y !== null && p.y !== undefined);
  const lns = (fig.lines || []).filter((l) => Array.isArray(l.through) && l.through.length === 2
    && l.through.every((p) => Array.isArray(p) && p.length === 2 && p.every((v) => typeof v === 'number')));
  // מקטע נשמר בשני כתיבים: {from,to} וגם {through:[[x,y],[x,y]]}. סינון לפי
  // from/to בלבד זרק בשקט את כל המקטעים שנרשמו בכתיב השני — וכך שאלות מילוליות
  // שכל כולן "קראו מהגרף" הודפסו **בלי גרף**. מנרמלים לפני הסינון.
  const num2 = (p) => Array.isArray(p) && p.length === 2 && p.every((v) => typeof v === 'number');
  const segs = (fig.segments || []).map((s) => {
    if (num2(s.from) && num2(s.to)) return s;
    if (Array.isArray(s.through) && s.through.length === 2 && s.through.every(num2)) {
      return { ...s, from: s.through[0], to: s.through[1] };
    }
    return null;
  }).filter(Boolean);

  let [xMin, xMax] = fig.xRange || [];
  let [yMin, yMax] = fig.yRange || [];
  const hasRange = [xMin, xMax, yMin, yMax].every((v) => typeof v === 'number');

  // מערכת צירים **ריקה** היא סרטוט תקף: המקור מדפיס אותה כדי שהתלמיד ישרטט בה.
  // בלי המקרה הזה כל שאלת "שרטטו את הגרף" איבדה את מערכת הצירים שלה.
  const blank = !pts.length && !lns.length && !segs.length;
  if (blank && !hasRange) return null;

  // תחום: אם המקור לא ציין — נגזר מהנתונים עצמם עם שוליים, ומעוגל למספר שלם.
  if (!hasRange) {
    const xs = [...pts.map((p) => p.x), ...lns.flatMap((l) => l.through.map((p) => p[0])), ...segs.flatMap((s) => [s.from[0], s.to[0]]), 0];
    const ys = [...pts.map((p) => p.y), ...lns.flatMap((l) => l.through.map((p) => p[1])), ...segs.flatMap((s) => [s.from[1], s.to[1]]), 0];
    xMin = Math.floor(Math.min(...xs) - 1); xMax = Math.ceil(Math.max(...xs) + 1);
    yMin = Math.floor(Math.min(...ys) - 1); yMax = Math.ceil(Math.max(...ys) + 1);
  }
  const spanX = xMax - xMin, spanY = yMax - yMin;
  if (!(spanX > 0) || !(spanY > 0)) return null;
  const maxW = opt.maxW || 235, maxH = opt.maxH || 195;

  // קנה מידה עצמאי לכל ציר. בשאלות מילוליות טווח ה-y יכול להיות 0..9000 מול
  // x של 0..9 — יחידה משותפת הייתה מייצרת SVG בגובה עשרות אלפי פיקסלים.
  const xUnit = maxW / spanX;
  const yUnit = maxH / spanY;

  // צעד סימון "יפה" (1/2/5 × 10^k) שנותן 4–10 סימונים לציר — בלי זה טווח גדול
  // מייצר אלפי קווי רשת ותוויות חופפות.
  const nice = (span) => {
    const raw = span / 7;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const n = raw / mag;
    return (n <= 1.5 ? 1 : n <= 3 ? 2 : n <= 7 ? 5 : 10) * mag;
  };
  const tsX = nice(spanX), tsY = nice(spanY);

  // צעד הרשת שנמדד במקור גובר על החישוב האוטומטי — הוא הנתון האמיתי, ובלעדיו
  // רשת של יחידה אחת הייתה מתרנדרת בקפיצות 2 ומאבדת נאמנות לסרטוט המקורי.
  // נשמר רק כשהוא נותן מספר קווים סביר, כדי לא לשחזר את באג אלפי-הקווים.
  const src = fig.gridStep;
  const srcOk = typeof src === 'number' && src > 0
    && spanX / src <= 30 && spanY / src <= 30;
  const gsX = srcOk ? src : tsX;
  const gsY = srcOk ? src : tsY;

  const hebLabels = /[֐-׿]/.test(`${fig.axisLabels?.x || ''}${fig.axisLabels?.y || ''}`);

  return axesSvg({
    id, xMin, xMax, yMin, yMax, xUnit, yUnit, pad: 15, padL: 30,
    xGridStep: gsX, yGridStep: gsY, xTickStep: tsX, yTickStep: tsY,
    longLabels: hebLabels,
    xLabel: fig.axisLabels?.x || 'x', yLabel: fig.axisLabels?.y || 'y',
    lines: lns.map((l) => ({ through: l.through, label: l.label || null, dashed: l.style === 'dashed' })),
    points: pts.map((p) => ({ x: p.x, y: p.y, name: p.labeled === false ? '' : (p.name || '') })),
    segments: segs.map((s) => ({ from: s.from, to: s.to })),
    ariaLabel: (fig.description || 'מערכת צירים').slice(0, 180),
  });
}

/** משקל משוער לצורך אריזת עמודים (נבדק אחר כך במדידה אמיתית). */
export function weight(qq) {
  let w = 12;
  w += (qq.stem || '').length / 18;
  w += (qq.parts?.length || 0) * 7;
  if (qq.table) w += 10 + (qq.table.rows?.length || 0) * 5;
  if (qq.choices?.length) w += 10;
  if (qq._svg) w += 46;
  if (qq.answerShape === 'lines') w += 12;
  return Math.round(w);
}

/** בונה את בלוק ה-HTML של השאלה. */
export function composeQuestion(qq, id) {
  // פריט שנבנה ידנית (דוגמה מתוכנית הלימודים) מגיע כ-HTML מוכן ונארז ככל שאלה
  // אחרת, כדי שלא יקבל דף לעצמו בניצול 45%.
  if (qq._html) return qq._html;

  const svg = figureSvg(qq.figure, id);
  const parts = qq.parts || [];

  const subs = parts.map((p) => {
    const widget = answerWidget(p.answerShape || qq.answerShape);
    // חלק מהסעיפים במקור אינם נושאים אות (המשך שאלה, רשימה לא ממוספרת).
    // אסור להמציא להם אות (§4) — ואסור גם להדפיס "null." כפי שקרה קודם.
    // חלק מהמקורות כבר כוללים את הנקודה/הסוגר בתווית ("ה." או "ד)") — אין לכפול.
    const raw = p.letter == null ? '' : String(p.letter).trim();
    const letter = raw === '' ? '·' : (/[.)\]]$/.test(raw) ? raw : `${raw}.`);
    return { l: letter, t: autoLtr(p.text) + (widget ? ' ' + widget : '') };
  });

  // נתונים שאינם חלק מהמלל (given) מוצגים כשורת נתון, רק אם אינם כבר בתוך ה-stem.
  const stemTxt = qq.stem || '';
  const extraGiven = (qq.given || []).filter((g) => g && !stemTxt.includes(g));
  const givenHtml = extraGiven.length
    ? `<div class="subs">${extraGiven.map((g) => `<div class="sub"><span class="subl">·</span><span class="subt">${autoLtr(g)}</span></div>`).join('')}</div>`
    : '';

  let tableHtml = '';
  if (qq.table) {
    const t = qq.table;
    const isValueTable = (t.headers || []).length > 3 || (t.rows || []).some((r) => r.length > 3);
    if (isValueTable && (t.rows || []).length <= 3 && t.headers?.length) {
      // באג שתוקן: שורת ה-headers מעולם לא נפלטה, וכל שורה קיבלה את headers[0]
      // ככותרת שלה. התוצאה: ערכי ה-x נעלמו לגמרי וכל השורות תויגו זהה, כך
      // ש"מלאו את הטבלה" היה בלתי אפשרי. נמדד ב-11 שאלות על 11 דפים.
      const cell = (c) => (c === null || c === undefined || c === '' ? null : autoLtr(String(c)));
      tableHtml = vtable([
        { head: autoLtr(String(t.headers[0] ?? 'x')), cells: t.headers.slice(1).map(cell) },
        ...(t.rows || []).map((r) => ({ head: autoLtr(String(r[0] ?? '')), cells: r.slice(1).map(cell) })),
      ]);
    } else {
      tableHtml = ctable((t.headers || []).map((h) => autoLtr(String(h ?? ''))),
        (t.rows || []).map((r) => r.map((c) => (c === null || c === '' ? '' : autoLtr(String(c))))));
    }
  }

  const mc = qq.choices?.length && qq.answerShape === 'choice'
    ? { cols: qq.choices.length > 3 ? 4 : qq.choices.length, opts: qq.choices.map((c) => autoLtr(String(c))) }
    : null;

  const circleRow = qq.answerShape === 'circle' && qq.choices?.length
    ? `<div class="subs"><div class="sub"><span class="subl">·</span><span class="subt">הקיפו: <span class="circ">${qq.choices.map((c) => autoLtr(String(c))).join(' / ')}</span></span></div></div>`
    : '';

  const tail = [
    givenHtml,
    tableHtml,
    circleRow,
    qq.answerShape === 'lines' && !parts.length ? linesBlock(2) : '',
    qq.answerShape === 'graph' && !svg ? '' : '',
  ].filter(Boolean).join('');

  const directAnswer = !parts.length && !mc && !circleRow && qq.answerShape
    && !['lines', 'graph', 'table', 'choice', 'circle'].includes(qq.answerShape)
    ? `<div class="ansrow">${answerWidget(qq.answerShape)}</div>` : '';

  return q({
    stem: autoLtr(stemTxt),
    subs,
    fig: svg,
    mc,
    tail: tail + directAnswer,
    layout: svg && subs.length > 2 ? 'work' : 'stack',
    top: true,
    figFirst: !subs.length,
  });
}
