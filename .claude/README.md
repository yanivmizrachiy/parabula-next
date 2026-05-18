# Claude Helper Layer — Parabula Next

מדריך תפעולי מלא לשכבת Claude Code בריפו זה.
קרא את `CLAUDE.md` קודם — הוא מכיל את כל כללי הפרויקט.

---

## תזרים עבודה אוטומטי

לכל משימה עתידית, Claude חייב לפעול לפי הכללים הבאים **אוטומטית**:

| מצב | כלי שמופעל אוטומטית |
|---|---|
| לפני שינוי קבצים | `/safety` + `git-safety-manager` |
| מצב ריפו לא ברור | `/repo` + קריאת STATE/ |
| עבודה על mobile-app | `/mobile` + `mobile-preview-auditor` |
| עבודה על A4 / הדפסה / CSS | `/print` + `a4-print-guardian` |
| עבודה על תוכן דפי עבודה / מתמטיקה | `/math` + `math-graphics-reviewer` |
| עבודה על UI / RTL / עיצוב | `/ui` + `mobile-preview-auditor` + `editing-architecture-reviewer` |
| לפני הצהרת "גמרנו" | `/verify` + `test-validation-runner` |
| אחרי שינויים אמיתיים | עדכון `STATE/LIVE_STATUS.md` |
| לפני פתיחת PR | `/pr-pack` + `git-safety-manager` |
| תחילת שיחה חדשה | `/continue` |

---

## Commands — `/` (Slash Commands)

| פקודה | מה עושה | מצב |
|---|---|---|
| `/safety` | בדיקת שער בטיחות מהיר לפני שינויים | קריאה בלבד |
| `/repo` | מפת ריפו + פעולה בטוחה הבאה | קריאה בלבד |
| `/audit` | audit מלא של הריפו (doctor + recovery + overlap) | קריאה בלבד |
| `/verify` | npm test + verify + validate:access | קריאה בלבד |
| `/print` | בדיקת CSS הדפסה + A4 overflow | קריאה בלבד |
| `/mobile` | בדיקת mobile-app + סנכרון topics | קריאה בלבד |
| `/math` | בדיקת MathJax + SVG + איכות גרפית | קריאה בלבד |
| `/ui` | בדיקת UI + RTL + עיצוב ויזואלי | קריאה בלבד |
| `/next` | פעולה בטוחה אחת הבאה בלבד | קריאה בלבד |
| `/rules` | סקירה / עדכון PROJECT_RULES.md | מאושר שלב-שלב |
| `/worksheet` | הוספת דף עבודה חדש | מאושר שלב-שלב |
| `/pr-pack` | חבילת סיכום PR לפני פתיחה | קריאה בלבד |
| `/continue` | המשך עבודה מהמצב הנוכחי | קריאה בלבד |
| `/hygiene` | audit ניקוי וארגון ריפו | קריאה בלבד |

---

## Agents — סוכנים

| סוכן | תפקיד | מתי להפעיל |
|---|---|---|
| `git-safety-manager` | שמירה על בטיחות git | לפני כל שינוי / commit / push |
| `source-of-truth-guardian` | אכיפת PROJECT_RULES.md + CLAUDE.md | לפני כל שינוי שעלול לסתור כללים |
| `a4-print-guardian` | שמירת איכות A4 + הדפסה | לכל שינוי CSS / HTML / print |
| `mobile-preview-auditor` | שמירת mobile + desktop preview | לכל שינוי mobile-app / preview |
| `math-graphics-reviewer` | איכות MathJax + SVG | לכל שינוי בתוכן מתמטי / גרפי |
| `editing-architecture-reviewer` | ארכיטקטורת עריכה עתידית | לכל שינוי מבני / ארגוני |
| `test-validation-runner` | הרצת בדיקות + פרשנות | לפני/אחרי כל שינוי מאושר |

---

## קבצי מצב שחייבים לקרוא

```
STATE/LIVE_STATUS.md         ← תמונת מצב חיה (קרא לפני כל שיחה)
STATE/ARCHITECTURE_MAP.md    ← מפת שכבות
STATE/PROJECT_CONTINUITY.md  ← רצף עבודה בין שיחות
PROJECT_RULES.md             ← מקור אמת ראשי
CLAUDE.md                    ← הוראות Claude Code (קרא תמיד ראשון)
```

---

## קבצים מוגנים — אסור לשנות

```
עמוד-N.html          ← תוכן חינוכי קנוני (95 דפים)
styles/a4-base.css   ← בסיס A4 — לא לגעת
meta/topics.json     ← מטא-דאטה (עריכה רק לפי תהליך /worksheet)
sources/legacy/*     ← ארכיון
sources/backups/*    ← גיבויים
STATE/backup_*       ← גיבויי מצב
meta/backup/*        ← גיבויי מטא-דאטה
```

---

## אסור בהחלט

```
git add .              git push --force        git reset --hard
git rebase             rm -rf                  מחיקת legacy/backup
שינוי עמוד-N.html     שינוי a4-base.css       fake buttons
placeholder UI         demo content            כתיבה מחדש של מה שעובד
```

---

## סדר קריאה בתחילת שיחה

```
1. CLAUDE.md                         ← כללי פרויקט (חובה)
2. PROJECT_RULES.md                  ← מקור אמת (חובה)
3. STATE/LIVE_STATUS.md              ← מצב נוכחי (חובה)
4. STATE/PROJECT_CONTINUITY.md       ← מה היה בתהליך (כדאי)
5. git log --oneline -5              ← מה קרה לאחרונה (כדאי)
```

---

_עודכן: 2026-05-18_
