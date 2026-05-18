# PROJECT_CONTINUITY — parabula-next

מסמך זה נועד לשמור רצף עבודה ברור בין שיחות ובין כלי AI, בלי לגעת בדפי העבודה עצמם ובלי לערבב נושאים.

## 1. עיקרון עליון

- `PROJECT_RULES.md` הוא מקור האמת הראשי של הריפו.
- `STATE/LIVE_STATUS.md` הוא תמונת המצב החיה, הקצרה והלא־היסטורית של המערכת הפעילה.
- המסמך הנוכחי הוא שכבת רצף ותיעוד בין שיחות, ואינו מחליף את מקור האמת.
- אין לשנות דפי עבודה קיימים (`עמוד-N.html`) במסגרת עבודות סדר, תיעוד, הדפסה או תצוגה, אלא אם המשתמש ביקש במפורש.
- אין לערבב בין נושאים קיימים ואין לשנות סיווגי נושאים בלי הוראה מפורשת.

## 2. מה כבר קיים ועובד בריפו

- דפי העבודה הקנוניים נשארים בשורש בשם `עמוד-N.html`.
- ה-CSS הקנוני נשאר תחת `styles/pages/`.
- בסיס A4 נשאר `styles/a4-base.css`.
- Preview קנוני נשאר תחת `preview/index.html` עם `preview/server.mjs`.
- מסלול ההדפסה הקנוני הוא `preview/print.js`.
- מטא-דאטה של דפים מונעת מתוך `meta/topics.json`.
- GitHub Pages פעיל דרך `.github/workflows/deploy-pages.yml`.
- נכון לעכשיו יש 95 דפי שורש ו-95 קבצי CSS תואמים.
- שכבת המובייל הקנונית היא `mobile-app.*`.
- מנוע הקריאה הקנוני במובייל נשאר iframe-based.

## 3. מה קיים חי אבל עדיין דורש יישור

- `preview/phone.*` עדיין קיים כשכבת compat / legacy-adjacent לצד `mobile-app.*`.
- `preview/print-center.js` עדיין קיים לצד `preview/print.js`.
- קיימות שכבות מצב פעילות: `STATE/*`, `meta/system-state.json`, `storage/system-state.json`.
- מסמכי STATE נוספים עדיין עלולים לדרוש יישור נקודתי כשמתבצע שינוי קנוני חדש.

## 4. שכבת בטיחות / התאוששות

- `scripts/recovery-audit.mjs`
- `.github/workflows/recovery-audit.yml`

שכבה זו מזהה חוסרים מבניים, inline CSS, חוסר ב-`styles/a4-base.css`, חוסר ב-`page-N`, ומפיקה דוח audit.

## 5. מה עדיין לא הושלם

- אימות חזותי מלא של חוויית הקריאה במובייל אחרי עדכוני `mobile-app.*` עדיין לא הושלם.
- שכבת restore אוטומטית מלאה עדיין לא קיימת; כרגע יש detection/audit בלבד.
- שכבת print עדיין דורשת יישור תיעודי מלא סביב `preview/print.js` מול קבצי compat ישנים.
- cleanup מבוקר של שכבות legacy/compat עדיין לא אושר לביצוע.

## 6. סדר העבודה הבא

1. לאמת בפועל את תצוגת `mobile-app.html` בטלפון.
2. לתקן רק מה שנשאר שבור ב-reader engine, בלי לגעת בדפי ה-A4 עצמם.
3. לשמור בכל מקום ש-`mobile-app.*` הוא מסלול המובייל הקנוני ו-`preview/phone.*` הוא compat בלבד.
4. רק לאחר ייצוב המובייל לעבור לשיפורי UX נוספים ולשכבות גישה נוחות יותר לכל הדפים.

## 7. כללי עבודה מחייבים להמשך

- כל שדרוג חדש חייב להיות מתועד.
- כל שדרוג חייב להיות שכבת תשתית סביב הדפים, לא שינוי בדפים עצמם.
- אין למחוק backups או legacy לפני מיפוי וקיבוע תפקיד.
- כל שיחה עתידית צריכה להתחיל מבדיקה של `PROJECT_RULES.md`, `STATE/LIVE_STATUS.md`, ו-`STATE/PROJECT_CONTINUITY.md`.
- כאשר יש סתירה בין תיעוד ישן לבין הכיוון החדש של `PROJECT_RULES.md`, יש ליישר את מסמכי ה-STATE לכיוון הקנוני ולא להפך.

---

## 8. עדכון 2026-05-18 — Claude helper layer מלא + תיעוד חזון

### מה נוסף בשיחה זו

**Claude helper layer (branch: work/parabula-claude-skills-continue):**
- 14 commands פעילים (ראה `.claude/README.md` למפה מלאה)
- 7 agents פעילים
- תזרים עבודה אוטומטי מתועד ב-CLAUDE.md סעיף 16
- `.claude/README.md` — מדריך תפעולי מלא

**מסמכי חזון וארגון (root level):**
- `WORKSHEET_BOOK_PLATFORM_VISION.md` — חזון מוצר לטווח ארוך
- `REPO_ORGANIZATION.md` — סטנדרט ארגון ריפו
- `REPO_CLEANUP_PLAN.md` — תוכנית ניקוי עם ממצאי audit

**ממצאי ה-hygiene audit:**
ראה `REPO_CLEANUP_PLAN.md` לפירוט מלא. תיקיות/קבצים שנמצאו כמועמדים לבדיקה:
- `app/` — Next.js automation system נפרד (לא חלק מ-parabula worksheets)
- `components/`, `lib/`, `server/`, `storage/` — קשורים ל-app/ הנ"ל
- `next.config.js`, `next-env.d.ts` — artifacts של Next.js (פרויקט עבר ל-Vite)
- `_stray_parabula_next_20260415_120247/` — תיקייה זמנית מ-April 2026
- `STATE/` — עשרות קבצים היסטוריים, מתועדים ב-REPO_CLEANUP_PLAN.md

**לא נעשה (ממתין לאישור Yaniv):**
- לא נמחק שום קובץ
- לא הוזז שום קובץ
- לא נגע בקבצי ייצור

### מה פתוח

1. PR מ-`work/parabula-claude-skills-continue` → `main` (מוכן)
2. cleanup בפועל של `app/`, `_stray_*`, `next.config.js` — ממתין לאישור
3. בדיקת state sync: `mobile-topics.json` מוקפא מ-19.03.2026 (קריטי)
4. תיקון `scripts/new-page.mjs` שבור (`/api/toc` לא קיים)
5. פתרון כפילות `sw.js` + `preview/sw.js`
