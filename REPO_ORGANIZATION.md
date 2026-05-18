# Repo Organization Standard — Parabula Next

_מסמך סטנדרט ארגון הריפו. נוצר: 2026-05-18._
_קרא אחרי CLAUDE.md ו-PROJECT_RULES.md._
_לפרטי ניקוי: ראה REPO_CLEANUP_PLAN.md._

---

## 1. עקרון על — ריפו נקי ומקצועי

הריפו חייב להישאר:
- **נקי** — ללא קבצים מיותרים, זמניים, או כפולים
- **מקצועי** — כל קובץ ידוע מטרתו
- **ניתן להרחבה** — מבנה שתומך באלפי דפים בעתיד
- **ניתן לאיתור** — Claude / GPT / בני אדם מוצאים כל קובץ בקלות
- **מתועד** — כל שינוי חשוב מתועד ב-SOURCE OF TRUTH

---

## 2. שכבות הריפו — מפת שכבות מלאה

### שכבה 1 — תוכן קנוני (לא לגעת)
```
עמוד-N.html              ← 95 דפי עבודה A4 (שורש הריפו)
styles/pages/עמוד-N.css  ← CSS ייעודי לכל דף
styles/a4-base.css        ← בסיס A4 בלתי ניתן לשינוי
```
**כלל:** אין לשנות ללא אישור מפורש. אין inline styles. אין CSS ב-HTML.

### שכבה 2 — מטא-דאטה (backbone)
```
meta/topics.json          ← מקור אמת של נושאים ודפים
mobile-topics.json        ← עותק לאפליקציית הנייד (חייב להיות מסונכרן!)
meta/pages.json           ← דאטה נוספת
schemas/page-meta.schema.json ← schema לאימות
```
**כלל:** `meta/topics.json` = מקור אמת. `mobile-topics.json` = עותק מסונכרן בלבד.

### שכבה 3 — ממשקי גישה (access surfaces)
```
preview/index.html        ← Preview Reader (desktop, sidebar + iframe)
preview/server.mjs        ← שרת מקומי, port 5179
preview/app.html          ← Hub (redirect → topics.html)
preview/topics.html       ← דפדוף לפי נושאים
preview/all-pages.html    ← כל הדפים עם חיפוש
preview/print.html        ← מרכז הדפסה
preview/print.js          ← לוגיקת הדפסה קנונית
mobile-app.html           ← אפליקציית נייד ראשית (PWA, canonical)
mobile-app.js             ← לוגיקה: fetch mobile-topics.json, iframe, scale
mobile-app.css            ← עיצוב נייד
mobile-app.webmanifest    ← PWA manifest
mobile-app-install.html   ← עמוד התקנה
```
**legacy / compat (לא לשנות, לא להשתמש לפיתוח חדש):**
```
preview/phone.*           ← legacy mobile path
preview/print-center.js  ← legacy print utility
```

### שכבה 4 — בדיקות ואוטומציה
```
tests/contracts/          ← contract tests (npm test)
scripts/verify.mjs        ← basic structure check
scripts/validate-access-layer.mjs ← access layer check
scripts/recovery-audit.mjs ← repo integrity audit
scripts/doctor.mjs        ← מריץ כל הבדיקות ברצף
scripts/validate-equations-design-pass-strict.mjs ← equations guard
```
**כלל:** לא לשנות scripts ללא בדיקת השפעה על CI.

### שכבה 5 — CI/CD
```
.github/workflows/deploy-pages.yml    ← build + test + deploy
.github/workflows/recovery-audit.yml  ← audit בכל push
.github/workflows/preview-guard.yml   ← guard preview
.github/workflows/repository-health.yml ← health check
```

### שכבה 6 — Claude helper
```
.claude/commands/         ← 13 slash commands
.claude/agents/           ← 7 specialized agents
.claude/README.md         ← מדריך תפעולי
```

### שכבה 7 — מקור אמת (source of truth)
```
CLAUDE.md                 ← הוראות Claude Code
PROJECT_RULES.md          ← כללי הפרויקט (מקור אמת ראשי)
WORKSHEET_BOOK_PLATFORM_VISION.md ← חזון המוצר
REPO_ORGANIZATION.md      ← סטנדרט ארגון הריפו (קובץ זה)
REPO_CLEANUP_PLAN.md      ← תוכנית ניקוי הריפו
STATE/LIVE_STATUS.md      ← מצב חי
STATE/ARCHITECTURE_MAP.md ← מפת שכבות מלאה
README.md                 ← הוראות הרצה בסיסיות
```

### שכבה 8 — שימור / legacy
```
sources/legacy/*          ← ארכיון לשימור בלבד
sources/backups/*          ← גיבויים לשימור בלבד
STATE/backup_*            ← גיבויי STATE
meta/backup/*             ← גיבויי מטא-דאטה
```
**כלל:** שמור, לא לגעת, לא למחוק.

### שכבה 9 — Deploy output (לא לערוך ידנית)
```
docs/                     ← GitHub Pages deploy output (auto-generated)
dist/                     ← Vite build output (auto-generated)
```
**כלל:** אין לערוך קבצים ב-docs/ ב-dist/ ידנית. הם מיוצרים על ידי CI/CD.

---

## 3. כלל מיקום — איפה כל קובץ חדש

| סוג קובץ | מיקום |
|---|---|
| דף עבודה A4 חדש | שורש הריפו: `עמוד-N.html` |
| CSS לדף עבודה | `styles/pages/עמוד-N.css` |
| CSS נושאי משותף | `styles/topics/<topic>.css` |
| עדכון מטא-דאטה | `meta/topics.json` + `mobile-topics.json` |
| script חדש | `scripts/` + תיעוד ב-package.json |
| test חדש | `tests/` |
| workflow חדש | `.github/workflows/` |
| Claude command | `.claude/commands/` |
| Claude agent | `.claude/agents/` |
| תיעוד חזון/מדיניות | שורש הריפו (MD) |
| סטטוס חי/מצב | `STATE/` |
| קבצי גיבוי | `STATE/backup_*` או `sources/backups/` |

---

## 4. כלל נקיון — מה אסור לצבור

```
קבצי .bak / .backup     ← אסור בשורש (מותר ב-STATE/ בלבד)
קבצי TODO.md זמניים     ← אסור (השתמש ב-STATE/ לתיעוד)
קבצי temp_*             ← אסור
inline styles            ← אסור בכל מקום
demo / placeholder       ← אסור לנצח
קבצי לוג בשורש          ← אסור (מותר ב-storage/ בלבד)
קבצי system-state.json   ← מותר רק ב-storage/ ו-meta/
```

---

## 5. כלל עדכון — כל שינוי חשוב מתועד

לכל שינוי משמעותי יש לעדכן:

| שינוי | תיעוד |
|---|---|
| דף עבודה חדש | `meta/topics.json`, `mobile-topics.json`, git commit |
| שינוי ב-CSS | git commit עם תיאור |
| שינוי ב-preview | `STATE/LIVE_STATUS.md`, git commit |
| שינוי ב-mobile | `STATE/LIVE_STATUS.md`, git commit |
| שינוי ב-PROJECT_RULES.md | git commit + הסבר בגוף הקומיט |
| כלל Claude חדש | `.claude/README.md` + `STATE/CLAUDE_LAYER_STATUS.md` |
| cleanup שאושר | `REPO_CLEANUP_PLAN.md` + git commit |

---

## 6. כלל CI — בדיקות לפני PR

לפני כל PR חייב לעבור:
```
npm test                  ← contract tests
npm run verify            ← basic structure
npm run validate:access   ← access layer
git diff --name-only      ← confirm no protected files changed
```

**אין PR בלי ירוק ב-npm test.**

---

## 7. כלל ענף עבודה

```
main                      ← ענף קנוני (GitHub Pages)
work/<short-description>  ← ענפי עבודה (Draft PR → merge)
```
- אין לעבוד ישירות על `main` לשינויים לא-טריוויאליים
- אין `git push --force` לעולם
- אין `git add .` — רק git add לקבצים ספציפיים

---

_נוצר: 2026-05-18_
