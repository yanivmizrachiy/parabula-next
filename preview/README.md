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
- `../mobile-topics.json`

### חוזה runtime של המובייל
- `mobile-app.*` הוא מסלול המובייל הקנוני לשיפורים חדשים.
- מנוע הקריאה במובייל נשאר **iframe-based**.
- דפי `עמוד-N.html` נשארים מקור האמת היחיד של התוכן.
- שיפורי מובייל צריכים לקרות בשכבת reader/runtime של `mobile-app.*`, לא דרך שכפול דפים.
- ניווט הבא/הקודם במובייל צריך להרגיש כמו ספר ולנוע לפי סדר הספר הגלובלי, גם במעבר בין נושאים.
- real-device validation הראה ש-width-first לבדו לא מספיק אם צד ימין של דף ה-A4 עדיין מרגיש clipped.
- לכן `mobile-app.*` צריך להציע `עמוד מלא` בלי חיתוך צד, לצד `קריאה מוגדלת` עם pan/scroll פנימי מוסבר.

### שכבת טלפון / legacy / תאימות
- `phone.html`
- `phone.js`
- `mobile.css`
- `manifest.webmanifest`
- `icon.svg`
- `sw.js`

שכבת `preview/phone.*` נשמרת כרגע כשכבת compat / legacy-adjacent, ולא כמסלול המימוש הראשי.

### הדפסה / PDF handoff
- `print.html`
- `print.js`
- `print-center.js` עדיין קיים ככפילות / legacy-adjacent
- `print.html` הוא שכבת preview-before-print החיה, ויכול לקבל בחירת דפים דרך URL ממסלולים אחרים
- כאשר `print.html` נפתח מהמובייל, הוא צריך להסביר שזהו שלב preview-before-print לפני PDF/הדפסה.

### שער כניסה
- `app.html`

## עקרונות מחייבים

- שכבת `preview/` היא שכבת utility סביב דפי העבודה, לא תחליף לדפים הקנוניים.
- אין להמציא דפים או נושאים. כל הרשימות חייבות להישען על `meta/topics.json`.
- אין לגעת ב-`עמוד-N.html` כחלק מעבודות preview/app/print/mobile אלא אם המשתמש ביקש במפורש.
- כאשר יש פער בין `preview/` לבין `PROJECT_RULES.md`, יש ליישר את שכבת `preview/` לכיוון הקנוני ולא להפך.

## מצב נוכחי אמיתי

- קיים שער כניסה `app.html`.
- קיים מרכז הדפסה פעיל.
- `print.js` הוא קובץ ההדפסה הקנוני הפעיל בשכבת ההדפסה.
- `print-center.js` עדיין קיים ככפילות / legacy-adjacent file.
- `mobile-app.html` הוא מסלול המובייל הקנוני היחיד לשיפורי מובייל חדשים.
- `preview/phone.html` נשאר שכבת compat / redirect / legacy לתאימות לאחור.
- `preview/install.html` צריך להוביל קודם כל ל-`../mobile-app.html`, לא ל-`preview/phone.html` כמסלול ראשי.
- `mobile-app-install.html` צריך להישאר מסך התקנה קנוני, נוח, וטופ-אליינד במובייל בלי empty gray area גדול.
- שכבת המובייל והאייקון לנייד הם חלק רשמי מהמערכת החיה, ו-`PROJECT_RULES.md` חייב להישאר מסונכרן איתם.
- האימות החזותי בפועל של `mobile-app.html` עדיין נדרש לפני הכרזה על השלמה מלאה; הממצא האחרון מהטלפון היה right-edge clipping, ולכן בוצע pass נוסף ממוקד ב-reader modes וב-iframe anti-clipping layout.

## המשך בטוח

1. לשמור על מסלולי הכניסה הקיימים יציבים.
2. לאחד בהמשך את שכבת ההדפסה בלי לשבור את `print.html`.
3. לשמור על `mobile-app.*` כמסלול המובייל הקנוני.
4. להמשיך לשפר מובייל ו-PDF בלי לגעת בדפי העבודה עצמם.

## התקנה / אייקון לנייד

- מסלולי ההתקנה והאייקונים הם חלק רשמי משכבת הגישה לנייד.
- המטרה של שכבה זו היא לאפשר כניסה קבועה, חיה, ומעודכנת לדפי העבודה מהטלפון.
