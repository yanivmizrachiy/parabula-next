# חוברת יחס ופרופורציה — כיתה ח׳

מקור React/TypeScript של 48 דפי העבודה בנושא יחס ופרופורציה המשולבים ב־Parabula Next.

## מקור אמת

מקור התחזוקה של תוכן החוברת הוא קוד React/TypeScript בתיקייה זו. תמונות הרינדור ודפי Parabula הם תוצרים נגזרים ואינם מקור לעריכת תוכן.

## מבנה

- `src/data/worksheetPages.tsx` — מפת 48 העמודים והסדר הפדגוגי.
- `src/components/worksheet/pages/` — דפי המקור ההיסטוריים.
- `src/components/worksheet/corrected/` — עמודים שעברו תיקון מתמטי, פדגוגי וחזותי.
- `src/lib/ratioMath.ts` — פונקציות חישוב ואימות של יחסים.
- `src/ratio-v2.css` — שכבת עיצוב A4 אחידה.
- `src/pages/RenderPage.tsx` — מסלול רינדור נקי לבדיקת העמודים.
- `src/test/` — בדיקות מתמטיות ומבניות.
- `COMPLIANCE-PLAN.md` — תוכנית ההתאמה המלאה לחוזי Parabula Next.

## עבודה מקומית

```bash
npm ci
npm run dev
npm test
npm run build
```

מהשורש של `parabula-next`:

```bash
npm run ratio:test
npm run ratio:build
npm run ratio:render
npm run ratio:import:check
npm run ratio:audit
```

## כללי בטיחות

- `npm run ratio:import:check` הוא preflight בלבד ואינו משנה קבצים.
- כתיבה מתבצעת רק באמצעות `npm run ratio:import:write` ולאחר בקשה מפורשת ובדיקת התוכנית המוצגת.
- `npm run ratio:audit` הוא audit לקריאה בלבד ומחזיר קוד כשל כאשר קיימת חריגה קריטית.
- `npm run ratio:audit:report` כותב דוח JSON רק כאשר יש צורך מפורש בתוצר דוח.
- CI בודק ומדווח בלבד; הוא אינו מבצע commit או push.

## מצב התאמה נוכחי

תשתית הבטיחות, הניווט וה־CI הוקשחה. עם זאת, דפי Parabula הקנוניים עדיין מציגים תמונות PNG מלאות של העמודים. לכן אין להכריז על התאמה מלאה לפני השלמת ההמרה ל־HTML סמנטי, SVG ו־MathJax לפי הצורך ובדיקת כל 48 העמודים מול המקור.

הרינדור מפיק מחדש את `assets/ratio/page-001.png` עד `page-048.png` ובודק שכל עמוד הוא A4 וללא גלישה. תמונות אלה משמשות כרגע גם כתוצר תצוגה וכ־visual baseline, אך היעד המתועד הוא להפסיק להשתמש בהן כתוכן הקנוני של הדף.

כל ההוראות והכללים המחייבים נמצאים אך ורק ב־`CLAUDE.md` בשורש הריפו.
