# חוברת יחס ופרופורציה — כיתה ח׳

תיקייה זו מכילה את מקור ה־React/TypeScript של חוברת היחס ואת כלי הבדיקה והייצוא שלה.

## מבנה

- `src/data/worksheetPages.tsx` — מפת העמודים והסדר הפדגוגי.
- `src/components/worksheet/pages/` — רכיבי דפי המקור.
- `src/components/worksheet/corrected/` — רכיבים שעברו תיקונים מאושרים.
- `src/lib/ratioMath.ts` — פונקציות חישוב ואימות.
- `src/ratio-v2.css` ו־`src/ratio-layout-fixes.css` — שכבות העיצוב של החוברת.
- `scripts/export-semantic-pages.mjs` — ייצוא סמנטי לבדיקה.
- `src/test/` — בדיקות מתמטיות ומבניות.

## פקודות שימושיות

```bash
npm ci
npm test
npm run build
```

מהשורש של הריפו:

```bash
npm run ratio:test
npm run ratio:semantic:all:check
npm run ratio:render
npm run ratio:import:check
npm run ratio:audit
```

כל כללי העבודה, הבטיחות, ה־A4, התוכן, Git וה־CI נמצאים אך ורק ב־`CLAUDE.md` בשורש הריפו. מצב נוכחי, ספירות ותוצאות בדיקות נגזרים מהקוד ומה־CI בזמן אמת ואינם נשמרים במסמך זה.
