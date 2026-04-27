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

### Repository validation improved
- נוסף סקריפט ממוקד: `scripts/validate-mobile-runtime.mjs`.
- נוסף command ייעודי: `npm run validate:mobile`.
- הסקריפט בודק שהמסלול הקנוני במובייל נשען על `meta/topics.json`, ש-`mobile-app.html` טוען את `mobile-app.js`, וששכבת `preview/phone.*` עדיין קיימת כ-compat עד cleanup audit נפרד.

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
- אימות חזותי אמיתי של `mobile-app.html` בטלפון.
- בדיקה שאין עוד gray empty area מביך.
- בדיקה שהעמוד ממורכז, קריא, ושהמעבר בין דפים נוח באמת.
- בדיקה ש-print / open / PDF handoff לא נשברו.

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
- אימות חזותי חי: עדיין חסר.

## Progress snapshot

הערכת מצב אמיתית כרגע: ~99%

הפער שנותר הוא בעיקר אימות חזותי חי ותיקון נקודתי אחרון אם יידרש.
