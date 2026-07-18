# חוברת יחס ופרופורציה — כיתה ח׳

מקור React/TypeScript של 48 דפי העבודה בנושא יחס ופרופורציה המשולבים ב־Parabula Next.

## מבנה

- `src/data/worksheetPages.tsx` — מפת 48 העמודים והסדר הפדגוגי.
- `src/components/worksheet/pages/` — דפי המקור ההיסטוריים.
- `src/components/worksheet/corrected/` — עמודים שעברו תיקון מתמטי, פדגוגי וחזותי.
- `src/lib/ratioMath.ts` — פונקציות חישוב ואימות של יחסים.
- `src/ratio-v2.css` — שכבת עיצוב A4 אחידה.
- `src/pages/RenderPage.tsx` — מסלול רינדור נקי לצילום העמודים.
- `src/test/` — בדיקות מתמטיות ומבניות.

## עבודה מקומית

```bash
npm ci
npm run dev
npm test
npm run build
```

מהשורש של `parabula-next` אפשר להריץ:

```bash
npm run ratio:test
npm run ratio:build
npm run ratio:render
```

הרינדור מפיק מחדש את `assets/ratio/page-001.png` עד `page-048.png` ובודק שכל עמוד הוא A4 וללא גלישה.

כל ההוראות והכללים המחייבים נמצאים אך ורק ב־`CLAUDE.md` בשורש הריפו.
