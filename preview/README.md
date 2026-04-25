# PREVIEW — App and Viewing Layer

מסמך זה מתעד את שכבת התצוגה/אפליקציה של הריפו בלי לגעת בדפי העבודה עצמם.

## נקודות כניסה קיימות

- `preview/index.html` — תצוגה מקדימה קנונית למחשב / reader קיים.
- `preview/app.html` — שער כניסה מרוכז לשכבת האפליקציה.
- `preview/print.html` — מרכז הדפסה לבחירת דפים אמיתיים מהריפו.
- `preview/install.html` — מסך עזר למסלולי התקנה / הוספה למסך הבית.

## קבצים עיקריים בשכבת האפליקציה

### מובייל קנוני
- `../mobile-app.html`
- `../mobile-app.js`
- `../mobile-app.css`
- `../mobile-app.webmanifest`
- `../mobile-app-install.html`
- `../mobile-app-install.js`
- `../mobile-topics.json` — עותק מסונכרן של `meta/topics.json` לטובת מסלול המובייל בשורש

### שכבת טלפון / legacy / תאימות
- `phone.html` — redirect-only entry ל-`../mobile-app.html`
- `phone.js`
- `mobile.css`
- `manifest.webmanifest`
- `icon.svg`
- `sw.js`

### הדפסה / PDF handoff
- `print.html`
- `print.js`
 (כפילות / legacy-adjacent)

### שער כניסה
- `app.html`

## עקרונות מחייבים

- שכבת `preview/` היא שכבת utility סביב דפי העבודה, לא תחליף לדפים הקנוניים.
- אין להמציא דפים או נושאים. כל הרשימות חייבות להישען על `meta/topics.json`.
- אין לגעת ב-`עמוד-N.html` כחלק מעבודות preview/app/print אלא אם המשתמש ביקש במפורש.
- אם מתגלים פערים בין `preview/` לבין `PROJECT_RULES.md`, יש לתעד אותם במפורש עד לסנכרון מלא.

## מצב נוכחי אמיתי

- קיים שער כניסה `app.html`.
- קיים מרכז הדפסה פעיל.
- `print.js` הוא קובץ ההדפסה הקנוני הפעיל בשכבת ההדפסה.
- `print-center.js` עדיין קיים ככפילות / legacy-adjacent file.
- `mobile-app.html` הוא מסלול המובייל הקנוני היחיד לשיפורי מובייל חדשים.
- `preview/phone.html` נשאר שכבת legacy / redirect-only mobile entry לתאימות לאחור.
- `mobile-topics.json` חייב להישאר מסונכרן ל-`meta/topics.json` כדי שמסלול המובייל וה-preview יישענו על אותו מקור אמת.
- שכבת המובייל והאייקון לנייד הם חלק רשמי מהמערכת החיה, ו-`PROJECT_RULES.md` חייב להישאר מסונכרן איתם.

## המשך בטוח

1. לשמור על מסלולי הכניסה הקיימים יציבים.
2. לאחד בהמשך את שכבת ההדפסה בלי לשבור את `print.html`.
3. לסנכרן את `PROJECT_RULES.md` עם שכבת `preview/`.
4. להמשיך לשפר מובייל ו-PDF בלי לגעת בדפי העבודה עצמם.

## התקנה / אייקון לנייד

- מסלולי ההתקנה והאייקונים הם חלק רשמי משכבת הגישה לנייד.
- המטרה של שכבה זו היא לאפשר כניסה קבועה, חיה, ומעודכנת לדפי העבודה מהטלפון.

- `preview/catalog-shared.js` — מנוע נתונים/ניווט משותף למסכי all-pages, topics, reader ו-mobile-app כדי לשמור מקור אמת אחד לשדות, סדר ופתיחה.
