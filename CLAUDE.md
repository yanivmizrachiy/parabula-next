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

עמוד-N.html          ← תוכן חינוכי קנוני (כל 98 הדפים)
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

אם יש סתירה בין מסמכים — `PROJECT_RULES.md` + `STATE/LIVE_STATUS.md` גוברים.

---

## 4. מבנה הריפו — מה קיים

### שכבת תוכן קנונית
```
עמוד-N.html                    ← 98 דפי עבודה A4 (שורש הריפו)
styles/pages/עמוד-N.css        ← CSS ייעודי לכל דף
styles/a4-base.css             ← בסיס CSS משותף + print CSS
styles/topics/*.css            ← CSS משותף לנושא (נטען ב-@import)
pages/משוואות/assets/          ← נכסי SVG שדפי המשוואות (עמוד-42+) מטמיעים — חייב להיות מועתק ל-dist בפריסה
```

### שכבת מטא-דאטה
```
meta/topics.json        ← מקור אמת של נושאים ודפים (98 דפים, 8 נושאים)
meta/pages.json         ← רישום מיוצר אוטומטית — לא לערוך ידנית, לא בקומיט
mobile-topics.json      ← עותק-ראי היסטורי (סונכרן מחדש 2026-07-10). הרנטיים כבר לא קורא אותו —
                          mobile-app.js קורא meta/topics.json. בכל שינוי topics.json יש לסנכרן:
                          cp meta/topics.json mobile-topics.json
schemas/                ← schemas של מטא-דאטה
```

### שכבת הספר הדיגיטלי (catalog layer)
```
catalog.html            ← ממשק ספר לימוד דיגיטלי (ניתן לערוך חופשי)
catalog.css             ← עיצוב פרימיום — dark sidebar, card grid, viewer
catalog.js              ← לוגיקה: fetch meta/topics.json, חיפוש, URL state
```

**כל 3 הקבצים קוראים מ-meta/topics.json בלבד — לא כותבים אליו.**
ראה `docs/DIGITAL_TEXTBOOK_ARCHITECTURE.md` + `STATE/CATALOG_STATUS.md`

### כניסה חכמה (root entry)
```
index.html + index.js + index.css  ← נקודת הכניסה: נייח → catalog.html, נייד → mobile-app.html
```

### שכבת גישה (access surfaces)
```
preview/app.html        ← redirect ל-topics.html (הבית הוא topic-first)
preview/index.html      ← Preview Reader (נייח, dark sidebar + iframe)
preview/topics.html     ← דפדוף לפי נושאים
preview/all-pages.html  ← כל הדפים עם חיפוש וסינון
preview/print.html      ← מרכז הדפסה
preview/server.mjs      ← שרת מקומי, port 5179, live-reload SSE

mobile-app.html         ← אפליקציית נייד ראשית (PWA)
mobile-app.js           ← לוגיקה: fetch meta/topics.json, iframe, scale
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
scripts/doctor.mjs              ← מריץ 6 בדיקות ברצף (test, verify, recovery, rules-sync, app-layer, duplicates)
scripts/new-page.mjs            ← יצירת דף חדש (Playwright + meta/topics.json)
scripts/generate-pages-registry.mjs ← מייצר meta/pages.json
scripts/repo-health-report.mjs  ← דוח בריאות (ספירות, כפילויות)
scripts/a4-visual-audit.mjs     ← audit חזותי A4 בדפדפן (Playwright)
scripts/export-pdf-sample.mjs   ← ייצוא PDF לדפי דגימה
scripts/copy-static-site.mjs    ← postbuild: מעתיק נכסים סטטיים ל-dist (כולל pages/)
scripts/sync-rules.mjs          ← מייצר rules.md מ-PROJECT_RULES.md
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
1. מבצע `fetch('./meta/topics.json')` — מקור האמת הקנוני (עודכן; בעבר קרא mobile-topics.json)
2. בונה רשימת נושאים ודפים, זוכר מיקום אחרון ב-localStorage
3. מציג דף נבחר ב-iframe עם scale transform
4. מסיר `.preview-nav` בתוך ה-iframe (ניווט מובנה)
5. רושם את `sw.js` (שכבת PWA)

**הערה על `mobile-topics.json`:**
עותק-ראי היסטורי בלבד. סונכרן מחדש ב-2026-07-10 (8 נושאים / 98 דפים).
הרנטיים לא תלוי בו יותר, אבל `validate:mobile` וה-deploy עדיין מפנים אליו —
בכל שינוי `meta/topics.json` הריצו `cp meta/topics.json mobile-topics.json`.

**נתיב לגאצי:** `preview/phone.*` — קיים אבל לא הנתיב הרשמי.

---

## 9. פקודות זמינות

```bash
npm run preview          # שרת מקומי http://127.0.0.1:5179/preview
npm test                 # בדיקות חוזה (tests/contracts/)
npm run verify           # בדיקת מבנה בסיסית
npm run validate:access  # בדיקת קבצים קנוניים
npm run validate:meta    # מייצר pages.json + מאמת סכימה
npm run validate:mobile  # בדיקת רנטיים נייד + סנכרון mobile-topics.json
npm run health:report    # דוח בריאות
npm run rules:sync       # מייצר rules.md מ-PROJECT_RULES.md
npm run topics:sync      # מסנכרן mobile-topics.json מ-meta/topics.json
npm run topics:check     # נכשל אם הראי לא מסונכרן (רץ ב-ci:all וב-deploy)
npm run doctor           # doctor מלא (6 בדיקות)
npm run page:new         # יצירת דף חדש (דורש שרת preview רץ)

npm run ci:all           # test + verify + validate:meta + health + build
npm run tech:max         # ci:all + audit חזותי A4 + ייצוא PDF (דורש Playwright browsers)
```

**להרצת doctor מלא (6 בדיקות):**
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

## 12. בעיות ידועות (עודכן 2026-07-10 אחרי ניקוי מקיף)

**נפתרו ב-2026-07-10:** new-page.mjs (הוסב ל-Playwright + meta/topics.json), puppeteer (לא נדרש יותר),
mobile-topics.json (סונכרן), inline style ב-preview/index.html (חולץ ל-reader.css) וב-preview/print.html (נוקה עוד קודם),
docs/ (העותק הסטטי המיושן נמחק, נשארו מסמכי MD), pages/ לא הועתק ל-dist (תוקן בשני מסלולי הפריסה),
app-layer-check מיושן (יושר; doctor ירוק).

**נפתרו נוסף (סבב שיפורים 2026-07-10):** סנכרון mobile-topics הפך אוטומטי (`npm run topics:sync` + גייט `topics:check` ב-ci:all וב-deploy); אב-הטיפוס `עמוד-95-editable` הועבר ל-`STATE/internal-drafts/` לפי ההחלטה המתועדת והוולידטור הסותר הוסר; `validate:equations:public-clean` יושר עם המצב הסופי של עמוד-95 (דף MathJax חי, בלי תמונת SVG).

| בעיה שעדיין פתוחה | קובץ | חומרה |
|---|---|---|
| ~33 דפי משוואות (עמוד-62…94) מכילים `<img class="pdf-page">` (raster!) שחורג ~29px מעל גבול ה-A4 — דורש החלטת Yaniv (קבצים מוגנים) | `עמוד-62.html` … `עמוד-94.html` | גבוה |
| אי-התאמת שם נושא: `עמוד-36.html` אומר "משוואה ריבועית" (יחיד) מול "משוואות ריבועיות" ב-topics.json — מפיל את page:new בשלב resolve; דורש החלטת Yaniv | `עמוד-36.html` / `meta/topics.json` | בינוני |
| 2 בדיקות ב-`tests/preview.rules.test.mjs` נכשלות (topic buttons, fitA4InHost) — מצפות לעיצוב Reader ישן; לא ב-CI | `tests/preview.rules.test.mjs` | בינוני |
| `preview/sw.js` הוא כמעט no-op (skipWaiting בלבד) לצד `sw.js` האמיתי | `preview/sw.js` | נמוך |
| `tools/` — כלי פרסום ישנים מעידן GitHub-Pages הידני; דורש החלטת Yaniv לפני הסרה | `tools/` | נמוך |
| ניווט הקודם/הבא קשיח ב-HTML | כל 98 הדפים | נמוך (ידוע, מכוון) |

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
5. סקריפט מייצר דף + CSS + מעדכן meta/topics.json (+ סנכרון mobile-topics.json)
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

### פקודות קיימות ב-`.claude/commands/`
- `/audit` — audit בטוח של הריפו ודיווח בלבד
- `/next` — הפעולה הבטוחה הבאה לפרויקט
- `/verify` — הרצת חבילת האימות המלאה

### סוכנים קיימים ב-`.claude/agents/`

| Agent | מטרה |
|---|---|
| `a4-print-guardian` | בדיקת A4 + print quality |
| `print-a4-guardian` | הגנת A4 בשכבות catalog + viewer |
| `source-of-truth-guardian` | בדיקת עמידה ב-RULES.md |
| `repo-governor` | guard על קבצים מוגנים + demo content |
| `digital-textbook-manager` | ניהול catalog.html/css/js |
| `premium-ui-designer` | שיפור עיצוב RTL, כרטיסים, מובייל |
| `worksheet-designer` | הנחיית יצירת דפי עבודה חדשים |
| `math-graphics-reviewer` | איכות SVG + MathJax |
| `mobile-preview-auditor` | preview נייד + דסקטופ |
| `editing-architecture-reviewer` | ארכיטקטורת עריכה ועתידית |
| `test-validation-runner` | הרצת + פרשנות בדיקות |
| `git-safety-manager` | בטיחות git |
| `live-site-verifier` | בדיקת האתר החי אחרי deploy |
| `release-manager` | הכנת commit/PR, בדיקות, עצירה לפני push |

---

_CLAUDE.md נוצר: 2026-05-12_
_עודכן: 2026-07-10 — ניקוי מקיף (Next.js remnants, docs mirror, dead files), סנכרון mobile-topics,
תיקון פריסת pages/, יישור app-layer-check, עדכון מונים ל-98 דפים / 8 נושאים._
_לא נוגע בדפי עבודה, CSS הדפסה, או styles/a4-base.css._
