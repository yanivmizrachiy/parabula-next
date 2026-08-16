# מערכת צירים — רביע ראשון

[![Build Status](https://github.com/yanivmizrachiy/parabula-next/actions/workflows/build-coordinate-first-quadrant.yml/badge.svg)](https://github.com/yanivmizrachiy/parabula-next/actions/workflows/build-coordinate-first-quadrant.yml)

חוברת לכיתה ז: 15 יחידות מדורגות, שני עמודים לכל יחידה, ובסך הכל 30 דפי A4.

## קישורים מהירים

- [צפייה אונליין](https://yanivmizrachiy.github.io/razpages/catalog.html)
- [הורדת PDF](downloads/coordinate-first-quadrant-workbook.pdf)
- [קוד מקור (ZIP)](downloads/coordinate-first-quadrant-source.zip)
- [GitHub Actions CI](https://github.com/yanivmizrachiy/parabula-next/actions/workflows/build-coordinate-first-quadrant.yml)

## מבנה

- `workbook/` — עשרת מקטעי המקור הקריאים, המכילים את כל 30 העמודים.
- `src/build.mjs` — מריץ אימותים PDF ו-ZIP, מפריד CSS inline, מרכיב מקור מלא.
- `dist/` — אתר מוכן להפעלה, נוצר אוטומטית.
- `downloads/` — בן 30 עמודים וחבילת מקור, נוצרים אוטומטית.
- `preview/` — תצוגה מקדימה.
- `audit/generated-audit.json` ו- `SHA256SUMS.txt` — אימות מבני וחתימות.

## CI/CD

ה-workflow `build-coordinate-first-quadrant.yml` רץ אוטומטית:
- בכל push ל-`main` (כשיש שינויים ב-`src/` או `workbook/`)
- בכל PR ל-`main`
- ניתן גם להפעיל ידנית דרך `workflow_dispatch`

ה-CI בונה HTML, PDF ו-ZIP עם Playwright (chromium-headless-shell), ומאמת:
- 30 עמודי HTML
- 30 עמודי PDF
- 46 מערכות צירים SVG
- 133 שאלות
- RTL מלא
- SHA-256 checksums

הבנייה נדרשת לעבור בדיקה של 30 עמודי HTML, 30 עמודי PDF ו-46 מערכות צירים וקטוריות לפני שמירת הפלטים.
