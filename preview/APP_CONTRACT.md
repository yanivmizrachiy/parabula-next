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
- רשאי לקבל בחירת דפים דרך URL כדי לתמוך ב-preview-before-print ממסלולי גישה אחרים כמו `mobile-app.html`.
- כאשר נפתח דרך `mobile-app.html`, עליו להציג הקשר מפורש לכך שזהו שלב preview-before-print.

### `preview/install.html`
- מסך עזר להסבר התקנה/הוספה למסך הבית.
- אינו מחליף את מסלול המובייל הקנוני.
- צריך להפנות קודם כל ל-`../mobile-app.html`, ורק משם לשמור גם גישה לשכבת compat הישנה.

## מצב מובייל / טלפון

### מסלול מובייל קנוני
- `mobile-app.html`
- `mobile-app.js`
- `mobile-app.css`
- `mobile-app.webmanifest`
- `mobile-app-install.html`
- `mobile-app-install.js`
- `mobile-topics.json`

### חוזה runtime של המובייל
- `mobile-app.*` הוא מסלול המימוש הקנוני במובייל.
- מנוע הקריאה במובייל נשאר **iframe-based**.
- דפי `עמוד-N.html` נשארים מקור האמת היחיד של התוכן.
- שיפורי מובייל חדשים צריכים לקרות בשכבת reader/runtime של `mobile-app.*`, לא דרך שכפול דפים.
- הקריאה במובייל צריכה להעדיף קריאות אמיתית על מסך צר; width-first scaling ו-scroll פנימי מבוקר מותרים כאשר הם משפרים משמעותית את הקריאה.
- אם real-device validation מגלה clipping בצד ימין, התיקון חייב לקרות ב-`mobile-app.*` דרך reader modes ו-runtime layout, לא דרך שינוי דפי העבודה.
- `עמוד מלא` חייב לשמור על כל רוחב ה-A4 גלוי בלי חיתוך צד לא צפוי.
- `קריאה מוגדלת` מותרת רק עם pan/scroll פנימי מוסבר שממשיך לאפשר גישה נוחה לתוכן בצד ימין.

### שכבת תאימות / legacy
- `preview/phone.html`
- `preview/phone.js`
- `preview/mobile.css`
- `preview/manifest.webmanifest`
- `preview/icon.svg`
- `preview/sw.js`

שכבת `preview/phone.*` נשמרת כרגע לתאימות / redirect / legacy, אך אינה המסלול הקנוני לשיפורי מובייל חדשים.

## כללים מחייבים

- אין להמציא דפים, נושאים או רשימות שאינם נגזרים מקבצים אמיתיים.
- אין להפוך את שכבת `preview/` למקור אמת של תוכן לימודי. מקור האמת של הדפים נשאר בדפי `עמוד-N.html` וב-`PROJECT_RULES.md`.
- `meta/topics.json` הוא עמוד השדרה הפעיל של הדפים עבור preview/print/mobile.
- `mobile-topics.json` הוא metadata תומך בלבד וחייב להישאר מסונכרן עם `meta/topics.json`.
- אם יש יותר מקובץ JS אחד לאותו אזור פונקציונלי, יש לתעד זאת במפורש עד לאיחוד.

## מצב פתוח נוכחי

- `print.js` הוא קובץ ההדפסה הקנוני הפעיל.
- `print-center.js` קיים עדיין ככפילות / legacy-adjacent file.
- `PROJECT_RULES.md` חייב להישאר מסונכרן עם שכבת האפליקציה, ההדפסה, ושכבות הגישה למובייל.
- handoff של PDF/print מהמובייל צריך לעבור דרך `preview/print.html` ולא לעקוף את שכבת ה-preview-before-print.
- האימות החזותי בפועל של `mobile-app.html` עדיין נדרש לפני שאפשר להכריז שהתצוגה הושלמה סופית; נכון לעכשיו כבר נמצא ממצא real-device אחד של clipping בצד ימין ותוקן בשכבת reader/runtime.
