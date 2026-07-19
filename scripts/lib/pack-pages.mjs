// scripts/lib/pack-pages.mjs — אריזת שאלות לדפי A4 לפי סדר תוכנית הלימודים.
//
// סדר תתי־הנושאים נגזר מעשרת הדגשים של תוכנית הלימודים לכיתה ח (עמוד 53):
//   1-3  קצב השתנות אחיד → הגרף כקו ישר → y = mx + b
//   4    משמעות השיפוע כיחס בין השתנות y להשתנות x
//   5    ישרים בעלי אותו שיפוע הם מקבילים
//   6    סימן השיפוע מול עלייה/ירידה; שיפוע פונקציה קבועה הוא 0
//   7    המקדם החופשי b, ערך הפונקציה ב-x=0, וחיתוך עם ציר y
//   8    חיתוך עם ציר x (חזרה על משוואה ממעלה ראשונה)
//   9    מציאת ייצוג אלגברי: מגרף / משתי נקודות / מנקודה ושיפוע
//   10   אומדן השיפוע מתוך התבוננות בגרף
// ולאחריהם: נקודת חיתוך בין שתי פונקציות, וייצוג תופעות בשאלות מילוליות.

import fs from 'node:fs';
import path from 'node:path';
import { composeQuestion, weight } from './compose-question.mjs';
import { chapterBar } from './linear-page.mjs';

/** תת־נושא: slug, שם הפרק, כותרת המשנה של הדף, ותקציב גובה לדף. */
export const SUBTOPICS = [
  { slug: 'rate-of-change', chapter: 'קצב השתנות אחיד', sub: 'טבלת ערכים · הגרף כקו ישר', subtitle: 'קצב השתנות אחיד · זיהוי פונקציה קווית' },
  { slug: 'coordinate-system', chapter: 'מערכת הצירים', sub: 'שיעורי נקודות', subtitle: 'מערכת צירים · שיעורי נקודות' },
  { slug: 'graph-from-table', chapter: 'מטבלה אל הגרף', sub: 'בניית גרף · השלמת טבלה', subtitle: 'טבלת ערכים · בניית גרף הפונקציה' },
  { slug: 'point-on-line', chapter: 'נקודה על הישר', sub: 'הצבה במשוואה', subtitle: 'האם הנקודה על הישר · השלמת שיעורים' },
  { slug: 'increasing-decreasing', chapter: 'גרף עולה, יורד או קבוע', sub: 'סימן השיפוע', subtitle: 'עולה · יורד · קבוע · סימן השיפוע' },
  { slug: 'slope-meaning', chapter: 'משמעות השיפוע', sub: 'היחס בין השתנות y להשתנות x', subtitle: 'משמעות השיפוע · חישובו ואומדנו מתוך גרף' },
  { slug: 'slope-two-points', chapter: 'שיפוע לפי שתי נקודות', sub: 'נוסחת השיפוע', subtitle: 'חישוב שיפוע לפי שתי נקודות' },
  { slug: 'b-yintercept', chapter: 'המקדם החופשי', sub: 'ערך הפונקציה ב-x=0 · חיתוך עם ציר y', subtitle: 'תפקידי m ו-b · נקודת החיתוך עם ציר y' },
  { slug: 'x-intercept', chapter: 'חיתוך עם ציר x', sub: 'פתרון משוואה ממעלה ראשונה', subtitle: 'מציאת נקודת החיתוך עם ציר x' },
  { slug: 'parallel-lines', chapter: 'ישרים מקבילים', sub: 'אותו שיפוע', subtitle: 'ישרים מקבילים · אותו שיפוע' },
  { slug: 'special-lines', chapter: 'ישרים מיוחדים', sub: 'מקבילים לצירים · דרך ראשית הצירים', subtitle: 'ישרים מקבילים לצירים · ישר דרך הראשית' },
  { slug: 'equation-slope-point', chapter: 'מציאת משוואת הישר', sub: 'לפי שיפוע ונקודה', subtitle: 'מציאת משוואת הישר לפי שיפוע ונקודה' },
  { slug: 'equation-two-points', chapter: 'מציאת משוואת הישר', sub: 'לפי שתי נקודות', subtitle: 'מציאת משוואת הישר לפי שתי נקודות' },
  { slug: 'equation-from-graph', chapter: 'מציאת משוואת הישר', sub: 'מתוך גרף נתון', subtitle: 'מציאת הייצוג האלגברי מתוך גרף' },
  { slug: 'intersection', chapter: 'נקודת חיתוך בין שתי פונקציות', sub: 'פתרון גרפי ואלגברי', subtitle: 'נקודת חיתוך בין שתי פונקציות קוויות' },
  { slug: 'word-problems', chapter: 'ייצוג תופעות', sub: 'שאלות מילוליות · קריאת גרף', subtitle: 'ייצוג תופעות באמצעות פונקציות קוויות' },
];

// גבהים שנמדדו בדפדפן האמיתי (scripts/calibrate-linear-pages.mjs). אריזה לפי
// מדידה ולא לפי הערכה — אחרת מתקבלים עמודים בניצול 35% או עמודים חורגים (§4.3).
let M = null;
try {
  M = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'sources', 'linear-function', 'heights.json'), 'utf8'));
} catch { M = null; }

/** הגובה הנמדד של שאלה; נפילה חזרה להערכה אם עדיין לא כויל. */
export function heightOf(qq) {
  const h = M?.heights?.[qq.id];
  return typeof h === 'number' ? h : weight(qq) * 1.9;
}

/**
 * אורז את שאלות תת־הנושא לעמודים לפי גובה נמדד.
 * שאלה שגבוהה מהתקציב מקבלת עמוד לעצמה — לא מכווצים גופן ולא מוחקים תוכן (§4.3).
 */
export function packSubtopic(questions, slug) {
  const avail = (M?.availH ?? 945) * 0.985;
  const gap = M?.gap ?? 6;
  const budget = avail - (M?.chapterH?.[slug] ?? 34) - gap;

  // אריזת מכלים First-Fit Decreasing. אריזה סדרתית פשוטה השאירה עמודים בניצול
  // ~55% (שאלה מילולית גבוהה לבדה בעמוד); FFD מזווג שאלה גבוהה עם קצרות ומעלה
  // את הניצול בלי לכווץ תוכן. הסדר בתוך תת־נושא אינו פדגוגי — כולן אותה מיומנות.
  const items = questions.map((qq, i) => ({ qq, h: heightOf(qq), i }))
    .sort((a, b) => b.h - a.h || a.i - b.i);

  // שלב 1 — FFD קובע את מספר העמודים המינימלי.
  const ffd = [];
  for (const it of items) {
    let best = null, bestLeft = Infinity;
    for (const b of ffd) {
      const left = budget - (b.h + gap + it.h);
      if (left >= 0 && left < bestLeft) { best = b; bestLeft = left; }
    }
    if (best) { best.items.push(it); best.h += gap + it.h; }
    else ffd.push({ items: [it], h: it.h });
  }

  // שלב 2 — איזון. FFD ממלא עמודים עד הסוף ומשאיר עמוד־שארית בניצול 11%.
  // פיזור מחדש על אותו מספר עמודים נותן ניצול אחיד (כל העמודים ~90%) בלי
  // להוסיף עמוד ובלי לכווץ תוכן.
  const K = ffd.length;
  const bins = Array.from({ length: K }, () => ({ items: [], h: 0 }));
  for (const it of items) {
    const open = bins.filter((b) => b.h + (b.items.length ? gap : 0) + it.h <= budget);
    const pool = open.length ? open : bins;
    const target = pool.reduce((a, b) => (b.h < a.h ? b : a));
    target.h += (target.items.length ? gap : 0) + it.h;
    target.items.push(it);
  }

  // בתוך כל עמוד — חזרה לסדר המקור, כדי לשמור רצף טבעי לתלמיד
  return bins.filter((b) => b.items.length)
    .map((b) => b.items.sort((a, z) => a.i - z.i).map((x) => x.qq));
}

/** בונה רשומות עמוד עבור תת־נושא. */
export function buildSubtopicPages(st, questions) {
  return packSubtopic(questions, st.slug).map((group, i, all) => ({
    kind: 'new',
    chapter: st.chapter,
    subtitle: st.subtitle,
    slug: st.slug,
    blocks: () => [
      chapterBar(st.chapter, all.length > 1 ? `${st.sub} · ${i + 1} מתוך ${all.length}` : st.sub),
      ...group.map((qq, k) => composeQuestion(qq, `${st.slug.replace(/[^a-z]/g, '')}${i}${k}`)),
    ],
  }));
}
