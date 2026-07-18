# שילוב חוברת יחס ב־Parabula Next

מקור החוברת נשמר בתיקייה זו ונבנה ל־48 דפי A4.

- מפת העמודים: `src/data/worksheetPages.tsx`.
- דפים היסטוריים: `src/components/worksheet/pages/`.
- דפים מתוקנים: `src/components/worksheet/corrected/`.
- מנוע חישוב ובדיקות: `src/lib/ratioMath.ts` ו־`src/test/`.
- עיצוב: `src/index.css`,‏ `src/ratio-v2.css`,‏ `src/workbench.css`.
- מסלול צילום: `/render/:pageId`.
- תוצרי האתר: `assets/ratio/page-001.png` עד `page-048.png`.
- דפי Parabula הקנוניים: `עמוד-272.html` עד `עמוד-319.html`.
- דוח רינדור: `assets/ratio/audit-v2.json`.

תהליך העדכון האוטומטי מריץ בדיקות, בונה את אפליקציית המקור, מצלם את כל הדפים ב־Playwright, מאמת A4 והיעדר גלישה ומעדכן את תמונות האתר.

כל כללי העבודה המחייבים נמצאים אך ורק ב־`CLAUDE.md` בשורש הריפו.
