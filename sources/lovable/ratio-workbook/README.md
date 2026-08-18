# חוברת יחס ופרופורציה — כיתה ח׳

מקור React/TypeScript של 48 דפי העבודה בנושא יחס ופרופורציה.

## מקור התחזוקה של תוכן החוברת

תוכן החוברת נערך בקוד React/TypeScript שבתיקייה זו. דפי האתר ותוצרי הרינדור נגזרים ממנו ואינם משטח לעריכת תוכן לימודי.

## מבנה

- `src/data/worksheetPages.tsx` — מפת 48 העמודים והסדר הפדגוגי.
- `src/components/worksheet/pages/` — דפי המקור ההיסטוריים.
- `src/components/worksheet/corrected/` — רכיבי עמודים מתוקנים.
- `src/lib/ratioMath.ts` — פונקציות חישוב ואימות של יחסים.
- `src/ratio-v2.css` — שכבת העיצוב של החוברת.
- `src/ratio-layout-fixes.css` — התאמות פריסה ייעודיות.
- `src/ratio-canonical-fit.css` — התאמות ממוקדות למעבר הקנוני ל־HTML חי.
- `src/pages/RenderPage.tsx` — מסלול רינדור נקי לבדיקת העמודים.
- `src/test/` — בדיקות מתמטיות ומבניות.

## פקודות שימושיות

מתוך תיקיית החוברת:

```bash
npm ci
npm run dev
npm test
npm run build
```

משורש הריפו:

```bash
npm run ratio:test
npm run ratio:build
npm run ratio:render
npm run ratio:import:check
npm run ratio:audit
node scripts/export-ratio-workbook-live.mjs
```

`ratio:import:check` נשאר כלי בדיקה למסלול ה־PNG ההיסטורי. כתיבה במסלול הישן חסומה כאשר ה־exporter הסמנטי קיים. המעבר הקנוני נעשה רק דרך `scripts/export-ratio-workbook-live.mjs`, שמבצע preflight של כל 48 העמודים לפני אפשרות כתיבה.

## מצב נוכחי

- מקור התוכן כולל 48 עמודים.
- קיים exporter סמנטי ל־`עמוד-272.html` עד `עמוד-319.html`.
- תמונות `assets/ratio/page-001.png` עד `page-048.png` נשמרות כ־visual baseline ותוצר רינדור.
- אין להכריז על השלמת המעבר הקנוני לפני שכל 48 מועמדי ה־HTML עוברים A4, overflow, footer ושאר שערי הריפו.

כל ההוראות והכללים המחייבים נמצאים אך ורק ב־`CLAUDE.md` בשורש הריפו.
