# CLAUDE.md — Parabula Next

הקובץ הזה הוא נקודת הכניסה של Claude Code לריפו Parabula Next.
קרא אותו לפני כל פעולה. הוא לא מחליף את `PROJECT_RULES.md` — הוא משלים אותו.

---

## 1. זהות הפרויקט

**Parabula Next** הוא מערכת ארוכת טווח לייצור, ניהול, ותצוגה של דפי עבודה במתמטיקה בעברית RTL.

### המוצר המרכזי
דפי עבודה איכותיים להדפסה ב-A4 — HTML + CSS + SVG + MathJax.
לא אפליקציה דיגיטלית. לא אתר. **דפי עבודה להדפסה.**

### שכבות התמיכה
- **תצוגת נייח:** סקירה, עריכה, ניווט, בדיקה — לא תחליף לדפי ההדפסה
- **תצוגת נייד:** צפייה, ניווט, הדפסה — לא תחליף לדפי ההדפסה
- **CI/CD:** בדיקות, audit, פרסום — שמירה על שלמות

### יעד סופי
אפליקציה/ספרייה שמציגה את כל הדפים הקיימים כמו ספר/חוברת דיגיטלית נוחה מאוד —
עם ניווט נוח, תצוגה מיטבית, הדפסה קלה, וגישה לפי נושא/כיתה/מיומנות.

### מה Yaniv עושה
מביא חומרי לימוד (PDF, תמונות, טקסט), מעביר אותם לדפי HTML מאורגנים, ומוסיף אותם למערכת.
**המערכת חייבת לתמוך בהמשך במאות ואלפי דפי עבודה.**

---

## 2. עקרון על — מה לא לגעת בו

```
קבצים מוגנים — אסור לשנות ללא אישור מפורש של Yaniv:

עמוד-N.html          ← תוכן חינוכי קנוני (כל 95 הדפים)
styles/a4-base.css   ← בסיס A4 בלתי ניתן לשינוי
meta/topics.json     ← עמוד שדרה של מטא-דאטה
sources/legacy/*     ← ארכיון לשימור בלבד
sources/backups/*    ← גיבויים לשימור בלבד
STATE/backup_*       ← גיבויי מצב
meta/backup/*        ← גיבויי מטא-דאטה
```

---

## 3. מקורות אמת — קרא תמיד לפני שינויים

קרא לפי הסדר הזה בתחילת כל שיחה:

1. `PROJECT_RULES.md` — מקור האמת הראשי (**חובה**)
2. `STATE/LIVE_STATUS.md` — תמונת מצב חיה קצרה (**חובה**)
3. `STATE/ARCHITECTURE_MAP.md` — מפת שכבות (**כדאי**)
4. `STATE/PROJECT_CONTINUITY.md` — רצף עבודה בין שיחות (**כדאי**)
5. `WORKSHEET_BOOK_PLATFORM_VISION.md` — חזון המוצר לטווח ארוך (**כשרלוונטי**)
6. `REPO_ORGANIZATION.md` — סטנדרט ארגון הריפו (**כשמוסיפים קבצים**)
7. `REPO_CLEANUP_PLAN.md` — ממצאי hygiene + תוכנית ניקוי (**כשעובדים על ארגון**)

אם יש סתירה בין מסמכים — `PROJECT_RULES.md` + `STATE/LIVE_STATUS.md` גוברים.

---

## 4. מבנה הריפו — מה קיים

### שכבת תוכן קנונית
```
עמוד-N.html                    ← 95 דפי עבודה A4 (שורש הריפו)
styles/pages/עמוד-N.css        ← CSS ייעודי לכל דף
styles/a4-base.css             ← בסיס CSS משותף + print CSS
styles/topics/pythagoras.css   ← CSS משותף לנושא (נטען ב-@import)
```

### שכבת מטא-דאטה
```
meta/topics.json        ← מקור אמת של נושאים ודפים (95 דפים, 7 נושאים)
mobile-topics.json      ← עותק נפרד לאפליקציית הנייד (חייב להיות מסונכרן!)
schemas/                ← schemas של מטא-דאטה
```

### שכבת גישה (access surfaces)
```
preview/app.html        ← Hub — שער כניסה לכל המסכים
preview/index.html      ← Preview Reader (נייח, dark sidebar + iframe)
preview/topics.html     ← דפדוף לפי נושאים
preview/all-pages.html  ← כל הדפים עם חיפוש וסינון
preview/print.html      ← מרכז הדפסה
preview/server.mjs      ← שרת מקומי, port 5179, live-reload SSE

mobile-app.html         ← אפליקציית נייד ראשית (PWA)
mobile-app.js           ← לוגיקה: fetch mobile-topics.json, iframe, scale
mobile-app.css          ← עיצוב
mobile-app.webmanifest  ← PWA manifest
mobile-app-install.html ← עמוד התקנה

preview/phone.*         ← legacy/compat — לא הנתיב הקנוני לנייד
```

### שכבת אוטומציה
```
scripts/verify.mjs              ← בדיקת מבנה בסיסית
scripts/recovery-audit.mjs      ← audit שלמות הריפו
scripts/validate-access-layer.mjs ← בדיקת קבצים קנוניים
scripts/audit-preview-overlaps.mjs ← בדיקת כפילויות
scripts/doctor.mjs              ← מריץ כל הבדיקות ברצף
scripts/new-page.mjs            ← ⚠️ שבור — קורא ל-/api/toc שלא קיים בשרת
scripts/sync-rules.mjs          ← סנכרון כללים
```

### שכבת בדיקות
```
tests/contracts/root-pages.test.mjs       ← בדיקות בסיסיות
tests/a4-pages.rules.test.mjs             ← מבנה, ניווט, נושאים
tests/a4-numbering-ui.rules.test.mjs      ← badge numbering
tests/preview.rules.test.mjs              ← preview rules
tests/topic-pages.*.test.mjs              ← topic pages
```

### שכבת CI
```
.github/workflows/deploy-pages.yml         ← build + test + deploy ל-GitHub Pages
.github/workflows/recovery-audit.yml       ← audit בכל push
.github/workflows/preview-guard.yml        ← guard preview
.github/workflows/repository-health.yml    ← health check
```

---

## 5. כיצד עובדת A4 / הדפסה

```css
/* עיקרי מ-styles/a4-base.css */
.a4-page {
  width: 210mm;
  height: 297mm;
  overflow: hidden;           /* לא auto! */
  padding: 10mm 18mm;
}

@media print {
  @page { size: A4; margin: 0; }
  .a4-page { overflow: visible; box-shadow: none; margin: 0; }
  .preview-nav { display: none; }
}
```

**כללים קריטיים להדפסה:**
- A4 = 210mm × 297mm בדיוק — לא לשנות
- `overflow: hidden` במסך, `overflow: visible` בהדפסה
- אין `overflow: auto` — אסור בהחלט
- `@page margin: 0` — גיליון ללא שוליים
- `-webkit-print-color-adjust: exact` — שמירת צבעים
- גופן Rubik + MathJax טוענים מ-CDN — הדפסה ללא אינטרנט לא תעבוד מיטבית

---

## 6. כיצד עובד מבנה דף עבודה

כל `עמוד-N.html` חייב להכיל בדיוק:

```html
<nav class="preview-nav">               ← ניווט (נסתר בהדפסה)
  <div class="preview-nav-top">
    <div class="nav-side"><a class="nav-link" href="...">הקודם</a></div>
    <div class="nav-meta">נושא — עמוד X / Y</div>
    <div class="nav-side"><a class="nav-link" href="...">הבא</a></div>
  </div>
  <div class="preview-nav-topics">
    <a class="topic-link" href="...">נושא א</a>
    <a class="topic-link is-active" href="..." aria-current="page">נושא ב</a>
  </div>
</nav>

<main class="a4-page page-N [topic-class]">
  <header class="header-container">
    <h1 class="page-title">שם הנושא</h1>
    <div class="page-number">X</div>    ← X = מספר בתוך הנושא (לא גלובלי)
  </header>
  <div class="question-block">
    <!-- תוכן הדף -->
  </div>
</main>
```

**חוקים קשיחים:**
- `page-number` = מספר בתוך הנושא (לא מספר הקובץ!)
- `<title>` = `עמוד X — שם הנושא`
- אפס inline CSS (`style="..."` או `<style>` אסורים)
- כל CSS ב-`styles/pages/עמוד-N.css` בלבד
- MathJax: `\(...\)` inline, `$$...$$` display — **לא `$...$`**
- RTL בכל מקום; LTR רק ב-CSS (`direction: ltr; unicode-bidi: isolate`)

---

## 7. כיצד עובדת גרפיקה מתמטית

**כלים קיימים ומאושרים:**

| כלי | שימוש |
|---|---|
| MathJax 3 | כל הנוסחאות המתמטיות |
| SVG inline | גיאומטריה, משולשים, מקביליות, שרטוטים |
| CSS coordinate-system | ציר קואורדינטות (440px × 440px, grid 22px) |
| CSS background-image | נייר משבצות לאזורי כתיבה |

**כללי SVG:**
```css
vector-effect: non-scaling-stroke;   /* חובה בכל stroke */
shape-rendering: geometricPrecision; /* חובה ב-SVG גיאומטרי */
```

**רמת איכות נדרשת:**
- גרפים ברמת ספרי לימוד — לא screenshots, לא blurry
- כל SVG חייב להיות vector — לא raster images
- גיאומטריה: קווים נקיים, label מיקום מדויק, זווית ישרה עם ריבוע
- קואורדינטות: grid 22px, arrows, labels מחוץ לציר

**מה חסר לעתיד (לא לייצר עכשיו — לתכנן):**
- כלי לגרפי פונקציות (פרבולה, קו ישר, פונקציה עלייה/ירידה)
- templates לסוגי דף שונים

---

## 8. כיצד עובד הנייד

**הנתיב הקנוני:** `mobile-app.html` + `mobile-app.js` + `mobile-app.css`

**איך `mobile-app.js` עובד:**
1. מבצע `fetch('./mobile-topics.json')` — **לא** `meta/topics.json`!
2. בונה רשימת נושאים ודפים
3. מציג דף נבחר ב-iframe עם scale transform
4. מסיר `.preview-nav` בתוך ה-iframe (ניווט מובנה)

**⚠️ בעיה קריטית ידועה:**
`mobile-topics.json` הוא עותק **מוקפא** של `meta/topics.json` מ-19.03.2026.
אם יוסיפו דפים ל-`meta/topics.json` — חייבים לעדכן גם את `mobile-topics.json`.
**עדיין אין סנכרון אוטומטי.**

**נתיב לגאצי:** `preview/phone.*` — קיים אבל לא הנתיב הרשמי.

---

## 9. פקודות זמינות

```bash
npm run preview          # שרת מקומי http://127.0.0.1:5179/preview
npm test                 # בדיקות חוזה (tests/contracts/)
npm run verify           # בדיקת מבנה בסיסית
npm run validate:access  # בדיקת קבצים קנוניים
npm run rules:sync       # סנכרון כללים

# ⚠️ שבור כרגע:
npm run page:new         # קורא ל-/api/toc שלא קיים בשרת
```

**להרצת doctor מלא:**
```bash
node scripts/doctor.mjs
```

---

## 10. תהליך עבודה מחייב

```
לימוד → כללים → תוכנית → ביצוע קטן → בדיקה → תיעוד
```

לפני **כל** ביצוע גדול:
1. קרא `PROJECT_RULES.md` + `STATE/LIVE_STATUS.md`
2. הצג: קבצים שיושפעו, סיכונים, מה ייחשב הצלחה
3. קבל אישור מ-Yaniv
4. בצע בשינויים קטנים
5. הרץ `npm test` + `npm run verify`
6. תעד ב-STATE/

**אין להתחיל תיקוני קוד לפני שיש כללי עבודה מסודרים.**

---

## 11. מה אסור בהחלט

```
git add .               ← אסור — רק git add לקבצים ספציפיים
git push --force        ← אסור
git reset --hard        ← אסור ללא אישור מפורש
git rebase              ← אסור ללא אישור מפורש
rm -rf                  ← אסור
מחיקת קבצים legacy/backup ← אסור
שינוי עמוד-N.html       ← אסור ללא אישור מפורש
שינוי styles/a4-base.css ← אסור ללא אישור מפורש
יצירת fake buttons       ← אסור
יצירת placeholder UI     ← אסור
demo content             ← אסור
כתיבה מחדש של מה שעובד  ← אסור
```

---

## 12. בעיות ידועות (שצריכות תיקון — לא פתרו עדיין)

| בעיה | קובץ | חומרה |
|---|---|---|
| `new-page.mjs` קורא ל-`/api/toc` שלא קיים בשרת | `scripts/new-page.mjs:448` | קריטי |
| `Puppeteer` לא ב-`package.json` | `package.json` | קריטי |
| `mobile-topics.json` מוקפא מ-19.03.2026 | `mobile-topics.json` | קריטי |
| `preview/print.html` עם `<style>` inline | `preview/print.html:9` | בינוני |
| `preview/index.html` עם `<style>` inline | `preview/index.html:7` | בינוני |
| שני Service Workers (`sw.js` + `preview/sw.js`) | שורש + preview/ | בינוני |
| `docs/` — עותק סטטי שאולי לא מעודכן | `docs/` | נמוך |
| ניווט הקודם/הבא קשיח ב-HTML | כל 95 דפים | נמוך (ידוע, מכוון) |

---

## 13. חזון עתידי — ספר/ספרייה דיגיטלית

### המטרה
כל הדפים הקיימים מוצגים כמו ספר/חוברת דיגיטלית נוחה:
- דפדוף נוח בין דפים ונושאים
- חיפוש לפי נושא, כיתה, מיומנות, סוג משימה
- הדפסה קלה (דף בודד / חוברת שלמה)
- ניתן להרחיב לאלפי דפים בעתיד

### מטא-דאטה עתידי (לא לממש עכשיו — לתכנן)
```json
{
  "topics": [{
    "name": "משפט פיתגורס",
    "grade": "ט",
    "pages": [{
      "number": 9,
      "file": "עמוד-9.html",
      "skill": "חישוב צלע חסרה",
      "difficulty": "בסיסי",
      "worksheetType": "תרגול"
    }]
  }]
}
```

### כיצד חומרים חדשים יתווספו (תהליך מוצע)
1. Yaniv מביא חומר (PDF / תמונה / טקסט)
2. Claude בונה HTML מ-template ייעודי לנושא
3. SVG גיאומטרי / גרפי נוצר inline
4. MathJax מוסיף למשוואות
5. סקריפט מייצר דף + CSS + מעדכן meta/topics.json + mobile-topics.json
6. CI מריץ tests + deploys

---

## 14. GitHub Pages

```
URL:        https://yanivmizrachiy.github.io/parabula-next/
Workflow:   .github/workflows/deploy-pages.yml
תהליך:     npm test → npm run verify → npm run build (Vite) → copy assets → deploy dist/
base path:  /parabula-next/ (מוגדר ב-vite.config.js)
```

**דף ה-mobile app הציבורי:** `mobile-app.html`
**דף ההתקנה הציבורי:** `mobile-app-install.html`

---

## 15. תכנות Claude Code לריפו זה

### פקודות פעילות ב-`.claude/commands/`

| פקודה | תפקיד |
|---|---|
| `/safety` | שער בטיחות מהיר לפני שינויים |
| `/repo` | מפת ריפו + פעולה בטוחה הבאה |
| `/audit` | audit מלא: doctor + recovery + overlap |
| `/verify` | npm test + verify + validate:access |
| `/print` | בדיקת CSS הדפסה + A4 overflow |
| `/mobile` | בדיקת mobile-app + סנכרון topics |
| `/math` | בדיקת MathJax + SVG + איכות גרפית |
| `/ui` | בדיקת UI + RTL + עיצוב ויזואלי |
| `/next` | פעולה בטוחה אחת הבאה |
| `/rules` | סקירה / עדכון PROJECT_RULES.md |
| `/worksheet` | הוספת דף עבודה חדש (תהליך מאושר) |
| `/pr-pack` | חבילת סיכום PR לפני פתיחה |
| `/continue` | המשך עבודה מהמצב הנוכחי |

### סוכנים פעילים ב-`.claude/agents/`
- `git-safety-manager` — שמירת בטיחות git
- `source-of-truth-guardian` — אכיפת PROJECT_RULES.md + CLAUDE.md
- `a4-print-guardian` — שמירת A4 / הדפסה / RTL
- `mobile-preview-auditor` — mobile + desktop preview
- `math-graphics-reviewer` — MathJax + SVG + גרפיקה
- `editing-architecture-reviewer` — ארכיטקטורת עריכה עתידית
- `test-validation-runner` — הרצת בדיקות ופרשנות

**מדריך תפעולי מלא: `.claude/README.md`**

---

## 16. תזרים עבודה אוטומטי — כלל מחייב

**לכל משימה עתידית בפרויקט, Claude חייב לפעול לפי הכלל הבא אוטומטית:**

| מצב | כלי שמופעל אוטומטית |
|---|---|
| לפני שינוי קבצים | `/safety` → `git-safety-manager` |
| מצב ריפו לא ברור | `/repo` → קריאת `STATE/LIVE_STATUS.md` |
| עבודה על mobile-app | `/mobile` → `mobile-preview-auditor` |
| עבודה על A4 / הדפסה / CSS / PDF | `/print` → `a4-print-guardian` |
| עבודה על תוכן / מתמטיקה / דיאגרמות | `/math` → `math-graphics-reviewer` |
| עבודה על UI / RTL / עיצוב | `/ui` → `mobile-preview-auditor` + `editing-architecture-reviewer` |
| לפני הצהרת "גמרנו" | `/verify` → `test-validation-runner` |
| אחרי שינויים אמיתיים | עדכן `STATE/LIVE_STATUS.md` |
| לפני פתיחת PR | `/pr-pack` → `git-safety-manager` |
| תחילת שיחה חדשה | `/continue` → קרא `STATE/PROJECT_CONTINUITY.md` |

### עקרון על
- אין לדלג על שער הבטיחות לפני שינויים.
- אין להצהיר "גמרנו" לפני `/verify`.
- אין לפתוח PR לפני `/pr-pack`.
- אין לשנות קבצים מוגנים בלי אישור מפורש — גם אם הכלי מאפשר זאת.

---

_CLAUDE.md נוצר: 2026-05-12 | עודכן: 2026-05-18_
_לא נוגע בדפי עבודה, CSS הדפסה, mobile-app.*, package.json, או קוד אפליקציה._
