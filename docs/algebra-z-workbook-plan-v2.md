# חוברת אלגברה לכיתה ז׳ — תוכנית סיום V2

מסמך זה הוא תוכנית ביצוע ומעקב לפרויקט בלבד. הוראות העבודה של הריפו נמצאות ב־[`CLAUDE.md`](../CLAUDE.md).

## יעד
חוברת ציבורית בת 15 עמודי A4 בתוך `parabula-next`, עם דפדוף נוח, גרסה צבעונית וגרסת שחור־לבן, הורדה והדפסה, תמיכה במחשב ובנייד, בדיקות אוטומטיות ופריסה מאומתת.

## מצב פתיחה
- הושלמו עיצוב בסיסי, שתי גרסאות PDF, קורא ראשוני וכפתור בקטלוג.
- הקורא המקורי היה תלוי ב־Google Drive.
- חסרו manifest, בדיקות ייעודיות, אימות PDF ושער פריסה חי.

## מסלול הביצוע

### 1. שכבת נתונים ונכסים
- [x] manifest קנוני: `meta/algebra-z-workbook.json`.
- [x] רישום 15 עמודים, גדלים ו־SHA-256 לשתי הגרסאות.
- [x] נתיבי יעד מקומיים תחת `assets/workbooks/algebra-z/downloads/`.
- [x] מנגנון דטרמיניסטי להרכבת PDF מחלקי base64 דחוסים.
- [ ] חלקי המקור של שני קובצי ה־PDF נמצאים תחת `assets/workbooks/algebra-z/chunks/`.
- [ ] שני קובצי PDF מאומתים מופקים אוטומטית בנתיבים המקומיים.
- [ ] לוגו מקומי מחליף את הנכס המרוחק.

### 2. קורא דיגיטלי
- [x] מעבר צבעוני/שחור־לבן.
- [x] קודם/הבא וקפיצה למספר עמוד.
- [x] בחירת זום, מקלדת ומסך מלא.
- [x] הורדה ופתיחה להדפסה.
- [x] local-first עם fallback מבוקר בזמן ההגירה.
- [ ] thumbnails וניווט מגע מלא לאחר הכנסת הנכסים המקומיים.

### 3. אוטומציה ואימות
- [x] `scripts/audit-algebra-z-workbook.mjs`.
- [x] חוזה `tests/contracts/algebra-z-workbook.test.mjs`.
- [x] `scripts/build-algebra-z-local-assets.mjs` להרכבה, gunzip, SHA-256, גודל, כותרת PDF, EOF וספירת 15 עמודים.
- [x] פקודות `algebra-z:assets`, `algebra-z:assets:check`, `algebra-z:assets:strict`.
- [x] פקודות `algebra-z:audit`, `algebra-z:audit:report`, `algebra-z:audit:strict`.
- [x] workflow ממוקד: `.github/workflows/algebra-z-guard.yml`.
- [x] דוח artifact ל־hybrid audit ולמוכנות strict-local.
- [ ] בדיקה חזותית ב־desktop, Android ו־iPhone.
- [ ] smoke test להורדה, הדפסה וקישור חי.

### 4. שילוב ופריסה
- [x] קישור בקטלוג המחשב.
- [x] הקורא המחוזק והאוטומציות מוזגו ל־`main` בקומיט `2df45912`.
- [x] כל שערי ה־PR של השדרוג המחוזק הסתיימו בירוק.
- [ ] קישור שקול בקורא הנייד.
- [ ] cache/offline לשני קובצי ה־PDF.
- [ ] הפקת הנכסים המקומיים ב־GitHub Actions.
- [ ] GitHub Pages לאחר שלב strict-local ירוק.
- [ ] בדיקה אנונימית של הקישור הציבורי.

## שערי סיום מדידים
- `npm run algebra-z:assets:strict` עובר.
- `npm run algebra-z:audit:strict` עובר אחרי ההרכבה.
- `npm run ci:all` עובר.
- האתר החי מחזיר 200 לעמוד, ל־CSS, ל־JS, ל־manifest ולשני קובצי ה־PDF.
- כל אחת משתי הגרסאות נפתחת, מדפדפת, יורדת ומודפסת בנייד ובמחשב.
- אין שימוש בפועל ב־Drive לאחר מעבר הנכסים המקומיים.

## נקודת העבודה הנוכחית
שלב הקורא המחוזק הושלם ומוזג. העבודה הפעילה עברה לענף `agent/algebra-z-strict-local`. מנגנון ההרכבה המקומי כבר מחובר אוטומטית ל־`prebuild`; החסם שנותר הוא הוספת חלקי שני קובצי ה־PDF המאומתים, ואז הפעלת שני שערי strict-local ובדיקות הפריסה החיה.
