# משוואות — שלושת הדפים הראשונים — סטטוס שיפור חזותי

תאריך: 2026-05-26

## Scope

- פרק: משוואות בלבד.
- דפים: 1–3 בלבד.
- קבצים עיקריים:
  - `עמוד-95.html`
  - `styles/pages/עמוד-95.css`
  - `עמוד-42.html`
  - `styles/pages/עמוד-42.css`
  - `עמוד-43.html`
  - `styles/pages/עמוד-43.css`
  - `preview/equations-first3.html`
  - `preview/equations-first3.css`
  - `preview/print.js`

לא נוגעים במשוואות ריבועיות ולא משנים את `styles/a4-base.css`.

## מה בוצע

### עמוד 1 — `עמוד-95.html`

- לא שונה תוכן מתמטי.
- ה־CSS הותאם למבנה האמיתי של הדף: `eq-body`, `eq-grid`, `problem-block`, `solution-space`.
- נוצרה פריסת 2×6 לדף עם 12 תרגילים.
- כל תרגיל מוצג בכרטיס עצמאי.
- אזור הפתרון עבר לתיבה גדולה ועדינה מתחת למשוואה.
- אזור `x = ___` הקטן הוסתר כדי למנוע דחיסה ולהשאיר מקום פתרון אמיתי.
- הרשת באזור הפתרון הוחלשה.

### עמוד 2 — `עמוד-42.html`

- לא שונה תוכן מתמטי.
- רשימת המשוואות נשארה לפי הדוח המאומת `STATE/EQUATIONS_PAGE_42_FIX_REPORT.md`.
- ה־CSS הותאם לתקן חזותי קרוב לעמוד 1.
- המספור דרך CSS מבוטל.
- הרשת באזור הפתרון הוחלשה.
- מסגרות וריווחים שופרו להדפסה.

### עמוד 3 — `עמוד-43.html`

- התוכן נשאר SVG מקור, כדי לא להמציא משוואות ללא חילוץ מאומת.
- בוטל crop/translateY.
- ה־SVG מוצג ב־`object-fit: contain`.
- נוספו padding ומסגרת עדינה יותר כדי להפחית חיתוך בהדפסה.

## קישורים לבדיקה

- תצוגה: `https://yanivmizrachiy.github.io/parabula-next/preview/equations-first3.html`
- הדפסה: `https://yanivmizrachiy.github.io/parabula-next/preview/print.html?topic=%D7%9E%D7%A9%D7%95%D7%95%D7%90%D7%95%D7%AA&autoselect=topic&maxLocalPage=3`
- עמוד 1: `https://yanivmizrachiy.github.io/parabula-next/%D7%A2%D7%9E%D7%95%D7%93-95.html`
- עמוד 2: `https://yanivmizrachiy.github.io/parabula-next/%D7%A2%D7%9E%D7%95%D7%93-42.html`
- עמוד 3: `https://yanivmizrachiy.github.io/parabula-next/%D7%A2%D7%9E%D7%95%D7%93-43.html`

## סטטוס אמת

- עמוד 1: HTML + MathJax, שופר עמוק, דרוש אישור חזותי סופי.
- עמוד 2: HTML + MathJax, שופר חזותית, דרוש אישור חזותי סופי.
- עמוד 3: SVG מקור משופר להצגה/הדפסה, לא הומר ל־HTML + MathJax.

## אחוז התקדמות

- מוכנות שימוש/בדיקה לשלושת הדפים: כ־92%.
- מוכנות מלאה לפי יעד HTML + MathJax לכל הדפים: כ־78%, בגלל עמוד 3 שנשאר SVG מקור.

## המשך מומלץ

1. יניב בודק בעין את שלושת הדפים בקישור התצוגה.
2. אם עמודים 1–2 מאושרים, לא לגעת בהם יותר חוץ משינויים קטנים.
3. אם רוצים שלמות מלאה, השלב הבא הוא חילוץ מאומת של תוכן עמוד 3 מהמקור והמרתו ל־HTML + MathJax.
