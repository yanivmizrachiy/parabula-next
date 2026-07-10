# PROJECT_CONTINUITY — parabula-next

מסמך זה נועד לשמור רצף עבודה ברור בין שיחות ובין כלי AI, בלי לגעת בדפי העבודה עצמם ובלי לערבב נושאים.

## 1. עיקרון עליון

- **`CLAUDE.md` הוא מקור הכללים היחיד והמחייב של הריפו** (החלטת יניב, 2026-07-10; `PROJECT_RULES.md` ו-`PROJECT_MEMORY.md` בוטלו ונמחקו).
- `STATE/LIVE_STATUS.md` הוא דוח מצב בלבד.
- המסמך הנוכחי הוא שכבת רצף ותיעוד היסטורית בין שיחות, ואינו קובע כללים.
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
- נכון לעכשיו יש 98 דפי שורש ו-98 קבצי CSS תואמים (8 נושאים).
- שכבת המובייל הקנונית היא `mobile-app.*`.
- מנוע הקריאה הקנוני במובייל נשאר iframe-based.

## 3. מה קיים חי אבל עדיין דורש יישור

- `preview/phone.*` עדיין קיים כשכבת compat / legacy-adjacent לצד `mobile-app.*`.
- `preview/print-center.js` עדיין קיים לצד `preview/print.js`.
- קיימות שכבות מצב פעילות: `STATE/*`, `meta/system-state.json`, `storage/system-state.json`.
- בניקוי 2026-07-10 הוסרו: שרידי Next.js (`next.config.js`, `next-env.d.ts`, `tsconfig.json`, `app/`, `components/`, `lib/`, `server/`), עותק אתר מיושן תחת `docs/` (נשמרו רק מסמכי ה-MD), `main.js`+`style.css` (שלד Vite מת), `redirects.json`, workflow פלייסהולדר `pages.yml`, ו-gitlink תלוי `_stray_parabula_next_*`. הכול ניתן לשחזור מהיסטוריית git.
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
