# MOBILE_READER_EXEC_STATUS

_Last updated: 2026-04-27_

## Purpose

מסמך ממוקד למצב שדרוג קורא המובייל, כדי שלא יהיה פיזור בין כמה קבצי STATE וכלי AI לא יתבלבלו מה בדיוק בוצע ומה עדיין לא אומת.

## What was completed

### Canonical direction locked
- `mobile-app.*` הוא מסלול המובייל הקנוני.
- `preview/phone.*` הוא compat / legacy-adjacent בלבד.
- מנוע הקריאה במובייל נשאר iframe-based.
- דפי `עמוד-N.html` נשארים מקור האמת היחיד של התוכן.

### Reader implementation advanced
- `mobile-app.js` עודכן כדי לחזק את התאמת ה-A4 בתוך iframe.
- נוספה לוגיקת התאמה יציבה יותר לגובה התצוגה, scale, centering, ו-progress copy ידידותי בעברית.
- `mobile-app.css` עודכן כדי לחזק את משטח הקריאה, frame layout, bottom nav spacing, ו-reader-first mobile surface.
- `mobile-app.js` הועבר לקריאה מתוך `meta/topics.json` כמקור הנתונים הקנוני, במקום להישען על `mobile-topics.json` כמקור runtime ראשי.
- בשורת המידע של האפליקציה מוצג עכשיו גם מקור הנתונים, כדי שהמצב יהיה גלוי ולא סמוי.
- `mobile-app.js` מנווט עכשיו קודם/הבא לפי סדר הספר הגלובלי, ולא נעצר בקצה הנושא הנוכחי.
- בחירת נושא במובייל חוזרת לעמוד הראשון של הנושא, כדי לשמור על behavior עקבי וברור.
- כפתור ה-PDF במובייל מעביר עכשיו ל-`preview/print.html` עם preview-before-print ממוקד לעמוד הנוכחי.
- `mobile-app.js` פותר עכשיו את דפי העבודה על אותו origin של הריפו הפעיל, כדי ש-local preview וה-site החי יתנהגו אותו דבר.
- ולידציה אמיתית על טלפון גילתה ש-width-first לבד עדיין לא הספיק: תוכן/דיאגרמות בצד ימין נשארו פגיעים ל-clipping או ליציאה מחוץ לאזור הנוח לקריאה.
- בעקבות זה נוספו לקורא שני מצבים מפורשים: `עמוד מלא` ו-`קריאה מוגדלת`.
- `עמוד מלא` מתאים את הדף כך שכל רוחב ה-A4 יישאר גלוי בלי חיתוך צד מפתיע.
- `קריאה מוגדלת` משתמשת עכשיו ב-stage/canvas פנימי ייעודי בתוך ה-iframe, עם pan/scroll פנימי מוסבר כדי לא להסתיר תוכן בצד ימין.
- אזור topic chips הודק כדי להישאר usable יותר על טלפון אמיתי.
- `mobile-app-install.html` קיבל layout קנוני עליון במקום מסך התקנה שמרגיש צף עם שטח אפור/ריק גדול מתחתיו.

### Repository validation improved
- נוסף סקריפט ממוקד: `scripts/validate-mobile-runtime.mjs`.
- נוסף command ייעודי: `npm run validate:mobile`.
- הסקריפט בודק שהמסלול הקנוני במובייל נשען על `meta/topics.json`, ש-`mobile-app.html` טוען את `mobile-app.js`, שיש handoff ל-`preview/print.html`, שיש book-order navigation, וששכבת `preview/phone.*` עדיין קיימת כ-compat עד cleanup audit נפרד.
- `mobile-topics.json` יושר מחדש ל-`meta/topics.json`, כדי למנוע drift ומיזוג שקט של נושאים נפרדים.
- הסקריפט בודק עכשיו גם current-origin page resolution, reader notice wiring, print handoff context, ו-install flow wiring/standalone feedback.
- הסקריפט בודק עכשיו גם נוכחות של reader-mode toggle מפורש ושל stage/canvas anti-clipping wrapper לקורא.

### Documentation aligned
הקבצים הבאים כבר מיושרים לכיוון החדש:
- `PROJECT_RULES.md`
- `STATE/LIVE_STATUS.md`
- `STATE/ARCHITECTURE_MAP.md`
- `STATE/PROJECT_CONTINUITY.md`
- `STATE/README.md`
- `preview/APP_CONTRACT.md`
- `preview/README.md`

## What is intentionally NOT done yet

- לא נגעו בדפי `עמוד-N.html` עצמם.
- לא בוצע cleanup מחיקתי של שכבות legacy / compat.
- לא נוסף continuous mode.
- לא נוספו swipe gestures.
- לא הוחלף מנוע ה-iframe בארכיטקטורה אחרת.

## Remaining real work

### Required before declaring success
- צילום מסך אמיתי מהטלפון שמראה `עמוד מלא` בלי חיתוך צד, או `קריאה מוגדלת` עם pan/scroll מכוון ולא מפתיע.
- בדיקה שאין עוד gray empty area מביך.
- בדיקה שהעמוד ממורכז, קריא, ושהמעבר בין דפים נוח באמת.
- בדיקה ש-print / open / PDF handoff לא נשברו.
- בדיקה ש-preview-before-print מהמובייל אכן פותח את `preview/print.html` עם העמוד הנכון.
- בדיקה ש-`mobile-app-install.html` נראה טוב בטלפון אמיתי ולא רק באמולציה.

### Only if visual check still fails
- fine-tuning נוסף ב-`mobile-app.js`
- fine-tuning נוסף ב-`mobile-app.css`

## Operational rule for future sessions

אם המובייל עדיין לא נראה נכון בטלפון, ממשיכים לתקן רק את:
- `mobile-app.js`
- `mobile-app.css`
- ורק אם צריך ממש מעט גם `mobile-app.html`

אין לעבור לעריכה של דפי ה-A4 עצמם בלי הוראה מפורשת.

## Current execution status

- תיעוד ויישור קנוני: הושלם.
- איחוד מקור הנתונים הקנוני למובייל: בוצע.
- שדרוג reader engine: בוצע חלק משמעותי.
- validator ייעודי למובייל: בוצע.
- book-order navigation + preview-before-print handoff: בוצעו.
- current-origin local preview support + install-screen cleanup: בוצעו.
- אימות חזותי חי: בוצע חלקית, מצא clipping בצד ימין, ולכן בוצע pass נוסף עם mode toggle ו-anti-clipping wrapper; עדיין נדרש צילום אישור סופי מטלפון אמיתי.

## Progress snapshot

הערכת מצב אמיתית כרגע: ~97%

הפער שנותר הוא אישור real-device סופי שה-pass החדש אכן פותר את clipping בצד ימין ושומר על נוחות קריאה אמיתית בטלפון.
