# APP CONTRACT — preview layer

מסמך זה מגדיר מה כל entry point בשכבת `preview/` אמור לעשות, כדי למנוע כפילויות וסתירות.

## כניסות קנוניות

### `preview/index.html`
- reader קנוני למחשב / preview קיים של הריפו.
- נשען על דפי העבודה האמיתיים ועל `meta/topics.json`.

### `preview/app.html`
- שער הכניסה המרוכז לשכבת האפליקציה.
- אמור להפנות בצורה ברורה לנתיבי הגישה הפעילים, למרכז ההדפסה, ולתיעוד תחת `STATE/`.

### `preview/print.html`
- מרכז הדפסה לבחירת דפים אמיתיים מהריפו.
- אינו מייצר PDF בשרת.
- יוצר רצף הדפסה מתוך הדפים האמיתיים, והשלב האחרון של Print / Save as PDF נעשה דרך הדפדפן.

### `preview/install.html`
- מסך עזר להסבר התקנה/הוספה למסך הבית.
- אינו מחליף את מסלול המובייל הקנוני.

## מצב מובייל / טלפון

### מסלול מובייל קנוני
- `mobile-app.html`
- `mobile-app.js`
- `mobile-app.css`
- `mobile-app.webmanifest`
- `mobile-app-install.html`
- `mobile-app-install.js`
- `mobile-topics.json` — mirror מסונכרן של `meta/topics.json` עבור מסלול המובייל שבשורש

### שכבת תאימות / legacy
- `preview/phone.html`
- `preview/phone.js`
- `preview/mobile.css`
- `preview/manifest.webmanifest`
- `preview/icon.svg`
- `preview/sw.js`

שכבת `preview/phone.*` נשמרת כרגע לתאימות / redirect / legacy, אך אינה המסלול הקנוני לשיפורי מובייל חדשים. `preview/phone.html` רשאי להיות redirect-only entry כל עוד הוא מפנה ל-`mobile-app.html`.

## כללים מחייבים

- אין להמציא דפים, נושאים או רשימות שאינם נגזרים מקבצים אמיתיים.
- אין להפוך את שכבת `preview/` למקור אמת של תוכן לימודי. מקור האמת של הדפים נשאר בדפי `עמוד-N.html` וב-`PROJECT_RULES.md`.
- `meta/topics.json` הוא עמוד השדרה הפעיל של הדפים עבור preview/print.
- `mobile-topics.json` חייב להיות מסונכרן מ-`meta/topics.json` ולא להחזיק אמת נפרדת.
- אם יש יותר מקובץ JS אחד לאותו אזור פונקציונלי, יש לתעד זאת במפורש עד לאיחוד.

## מצב פתוח נוכחי

- `print.js` הוא קובץ ההדפסה הקנוני הפעיל.
- `print-center.js` קיים עדיין ככפילות / legacy-adjacent file.
- `PROJECT_RULES.md` חייב להישאר מסונכרן עם שכבת האפליקציה, ההדפסה, ושכבות הגישה למובייל.
