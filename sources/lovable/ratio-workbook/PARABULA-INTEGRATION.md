# שילוב חוברת יחס ב־Parabula Next

מקור החוברת נשמר בתיקייה זו ונבנה ל־48 דפי A4.

- מפת העמודים: `src/data/worksheetPages.tsx`.
- דפים היסטוריים: `src/components/worksheet/pages/`.
- דפים מתוקנים: `src/components/worksheet/corrected/`.
- מנוע חישוב ובדיקות: `src/lib/ratioMath.ts` ו־`src/test/`.
- עיצוב מקור: `src/index.css`,‏ `src/ratio-v2.css`,‏ `src/ratio-layout-fixes.css`,‏ `src/ratio-canonical-fit.css`.
- מסלול רינדור מקור: `/render/:pageId`.
- visual baseline: `assets/ratio/page-001.png` עד `page-048.png`.
- דפים קנוניים מיועדים: `עמוד-272.html` עד `עמוד-319.html`.
- exporter קנוני: `scripts/export-ratio-workbook-live.mjs`.
- דוח רינדור: `assets/ratio/audit-v2.json`.

ה־exporter בונה מועמד HTML חי מתוך מקור ה־React, מאמת את כל 48 העמודים לפני כתיבה, ודוחה full-page PNG, גלישה, חפיפת footer ושגיאות דפדפן. מסלול ה־PNG ההיסטורי נשאר לבדיקות ול־visual baseline ואינו מסלול הכתיבה הקנוני החדש.

כל כללי העבודה המחייבים נמצאים אך ורק ב־`CLAUDE.md` בשורש הריפו.
