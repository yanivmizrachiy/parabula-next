# חוברת אלגברה לכיתה ז׳ — תוכנית סיום V2

> תוכנית זו מחליפה ומבטלת את תוכנית העבודה הקודמת. כל כללי הפרויקט נשארים כפופים ל־`CLAUDE.md`, שהוא מקור הכללים היחיד.

## יעד סופי
להפוך את החוברת בת 15 העמודים למוצר ציבורי יציב בתוך `parabula-next`, ללא תלות ב־Google Drive, עם דפדוף נוח במחשב ובנייד, הורדה והדפסה ישירות מהאתר, שתי גרסאות PDF מאומתות, לוגו וקרדיט מחוזי, בדיקות אוטומטיות, פריסה אוטומטית ויכולת שחזור מהירה.

## עקרונות ביצוע
1. **מקור אמת יחיד** — קובצי המקור, הפלטים והמטא־דאטה נשמרים תחת `assets/workbooks/algebra-z/` ו־`meta/algebra-z-workbook.json`.
2. **אפס תלות חיצונית קריטית** — אין Drive, אין iframe חיצוני, אין לוגו מרוחק ואין קישור הורדה שאינו מתוך GitHub Pages.
3. **בנייה דטרמיניסטית** — אותו מקור מייצר תמיד אותם פלטים; לכל קובץ נשמר SHA-256.
4. **אימות במדידה** — ספירת עמודים, גודל A4, קישורים, תצוגה, הדפסה, נייד ו־offline נבדקים אוטומטית.
5. **שחרור אטומי** — כל השינוי נכנס בענף ייעודי, PR אחד, שערי CI מלאים ויכולת rollback לקומיט קודם.
6. **אין דיווחי השלמה חלקיים** — כל שלב מקבל ראיות: קובץ, hash, צילום, דוח בדיקה או קישור חי.

## ארכיטקטורת היעד

### קבצים קנוניים
- `assets/workbooks/algebra-z/source/algebra-z-source.pdf`
- `assets/workbooks/algebra-z/downloads/algebra-z-color.pdf`
- `assets/workbooks/algebra-z/downloads/algebra-z-bw.pdf`
- `assets/workbooks/algebra-z/logo.png`
- `meta/algebra-z-workbook.json`
- `algebra-z-workbook.html`
- `algebra-z-workbook.css`
- `algebra-z-workbook.js`

### מנוע תצוגה
- קובצי PDF מוגשים ישירות מ־GitHub Pages.
- viewer פנימי עם מעבר צבעוני/שחור־לבן, עמוד קודם/הבא, מספר עמוד, thumbnails, זום, מסך מלא והדפסה.
- fallback אוטומטי לפתיחה בדפדפן כאשר מנוע התצוגה אינו זמין.
- מצב נייד מותאם מגע, safe-area ו־orientation change.

### מטא־דאטה
`meta/algebra-z-workbook.json` יכיל:
- שם החוברת והנושא.
- מספר עמודים צפוי: 15.
- נתיבי שתי הגרסאות.
- SHA-256 לכל PDF.
- גודל קובץ.
- תאריך build.
- גרסת release.
- נוסח הקרדיט המדויק.

## אוטומציות חדשות

### 1. בנייה והפקה
- `scripts/algebra-z-build.mjs`
  - מאמת את קובץ המקור.
  - מפיק או מעתיק באופן מבוקר את גרסת הצבע ואת גרסת השחור־לבן.
  - מייצר manifest ו־SHA-256.
  - נכשל אם חסר קובץ, אם מספר העמודים אינו 15 או אם הפלטים זהים בטעות.

### 2. בדיקת חוזים
- `tests/contracts/algebra-z-workbook.test.mjs`
  - אין מחרוזות `drive.google.com` או `raw.githubusercontent.com` בקורא.
  - כל הנכסים מקומיים וקיימים.
  - שני קובצי PDF רשומים במטא־דאטה.
  - הקרדיט המחוזי והלוגו קיימים.
  - הקטלוג והנייד מכילים קישור לחוברת.

### 3. בדיקת PDF
- `scripts/algebra-z-pdf-audit.mjs`
  - ספירת 15 עמודים בכל גרסה.
  - A4 לכל עמוד.
  - בדיקת תקינות פתיחה.
  - hash מול manifest.
  - בדיקת גודל חריג וקובץ ריק.

### 4. בדיקה חזותית
- `scripts/algebra-z-visual-audit.mjs`
  - Playwright במחשב, Android ו־iPhone.
  - צילום cover, עמוד אמצעי ועמוד אחרון בכל גרסה.
  - בדיקת overflow, כפתורים, thumbnails, מסך מלא ומעבר גרסה.
  - שמירת דוח JSON וצילומי כשל תחת `meta/audit/algebra-z/`.

### 5. בדיקת הדפסה והורדה
- `scripts/algebra-z-print-smoke.mjs`
  - פתיחת כל PDF ישירות.
  - אימות response `200`, MIME של PDF ו־Content-Length.
  - בדיקת פעולת הורדה והדפסה ללא Drive.

### 6. בדיקה חיה לאחר פריסה
- `scripts/algebra-z-live-smoke.mjs`
  - בודק את הקישור החי לאחר GitHub Pages.
  - מאמת HTML, CSS, JS, לוגו ושני PDF.
  - בודק שאין redirect או 404.
  - מפרסם דוח CI ו־artifact.

### 7. פקודת־על אחת
הוספת פקודות:
- `npm run algebra-z:build`
- `npm run algebra-z:audit`
- `npm run algebra-z:visual`
- `npm run algebra-z:live`
- `npm run algebra-z:ship`

`algebra-z:ship` תריץ ברצף: build → contracts → PDF audit → visual audit → full repository CI → production build.

## תוכנית ביצוע מהירה

### שלב 0 — איפוס ובידוד — 5%
- עצירת התוכנית הקודמת.
- נטישת הענף הניסיוני `agent/algebra-z-direct-pdf` ללא מיזוג.
- פתיחת ענף נקי מ־`main`.
- מחיקת קובצי probe/test זמניים מהעבודה החדשה.

**שער יציאה:** diff נקי ומכיל רק קבצים רלוונטיים.

### שלב 1 — נכסים מקומיים ומניפסט — 20%
- הכנסת שני PDF והלוגו לריפו.
- יצירת manifest עם hashes ו־15 עמודים.
- החלפת כל כתובות Drive בנתיבים מקומיים.

**שער יציאה:** בדיקה אוטומטית מחזירה אפס תלות ב־Drive או בנכסים מרוחקים.

### שלב 2 — קורא מתקדם — 25%
- viewer פנימי, thumbnails, קודם/הבא, זום, מסך מלא ומעבר גרסאות.
- direct download ו־print.
- fallback לדפדפן.
- התאמת נייד מלאה.

**שער יציאה:** כל הפעולות עובדות בשלושה גדלי מסך.

### שלב 3 — אוטומציות ובדיקות — 25%
- build script, manifest, contract tests, PDF audit, visual audit ו־print smoke.
- חיבור ל־`package.json` ול־CI.

**שער יציאה:** `npm run algebra-z:ship` ירוק מקצה לקצה.

### שלב 4 — שילוב מלא בפרויקט — 15%
- קטלוג מחשב ונייד.
- service worker ו־offline cache לשני PDF.
- cache-busting וגרסת release.
- תיעוד קצר בלבד שמפנה ל־`CLAUDE.md`.

**שער יציאה:** parity מלאה בין מחשב לנייד.

### שלב 5 — פריסה, אימות ו־rollback — 10%
- PR מסודר עם דוחות ו־screenshots.
- מיזוג רק לאחר CI ירוק.
- live smoke אחרי deploy.
- בדיקת קישור ציבורי בגלישה אנונימית.
- שמירת נקודת rollback.

**שער יציאה:** האתר החי מחזיר 200, שתי הגרסאות נפתחות ומודפסות, והדוח החי ירוק.

## מנגנוני האצה
- עבודה בענף נקי אחד ו־PR אחד.
- יצירת קבצים באמצעות generator במקום עריכה ידנית חוזרת.
- בדיקות path-scoped כדי לא להריץ בדיקות כבדות כשאין שינוי רלוונטי.
- cache ל־npm ול־Playwright ב־CI.
- matrix מקבילי: desktop / Android / iPhone.
- hash-based skip: בדיקות PDF כבדות מדולגות כאשר hashes לא השתנו.
- fail-fast בשערים זולים; בדיקות חזותיות כבדות רק לאחר חוזים בסיסיים.
- artifact אחד מאוחד עם manifest, screenshots ודוחות.

## קריטריוני השלמה קשיחים
הפרויקט ייחשב גמור רק כאשר כל התנאים מתקיימים:
- [ ] אין תלות ב־Google Drive או בנכס מרוחק קריטי.
- [ ] PDF צבעוני ו־PDF שחור־לבן נמצאים באתר ונפתחים ישירות.
- [ ] 15/15 עמודים בכל גרסה.
- [ ] viewer עובד במחשב ובנייד.
- [ ] הורדה, הדפסה, זום, thumbnails ומסך מלא עובדים.
- [ ] הקטלוג והנייד מקשרים לחוברת.
- [ ] הלוגו ושתי שורות הקרדיט נכונים.
- [ ] `npm run algebra-z:ship` ירוק.
- [ ] CI ו־GitHub Pages ירוקים.
- [ ] live smoke אנונימי ירוק.
- [ ] קישור ציבורי סופי נמסר ונבדק בפועל.

## מצב פתיחה של V2
- הושלם מהגרסה הקודמת: עיצוב בסיסי, שתי גרסאות PDF, דף קורא ראשוני וכפתור קטלוג.
- לא הושלם: אחסון מקומי, viewer מתקדם, אוטומציות ייעודיות, בדיקות live ו־offline.
- נקודת פתיחה אמיתית: **70% מתוצר התוכן, אך 0% משערי הסיום החדשים**.
