# WORKSHEET AUTHORING GUIDE — Parabula Next

מדריך אחד, מלא ומחייב, ליצירת דף עבודה במתמטיקה בפרויקט **Parabula Next**.
המטרה: שכל אדם — או כל בינה מלאכותית — שקורא/ת את הריפו יֵדע/תדע **בדיוק** איך לבנות
דף עבודה חדש לפי כללי הפרויקט, בלי לשבור שום דבר קיים ובלי לנחש.

> קדימות מקורות אמת: `PROJECT_RULES.md` + `STATE/LIVE_STATUS.md` גוברים על כל מסמך אחר.
> `CLAUDE.md` הוא נקודת הכניסה. המדריך הזה הוא ה"איך לבנות דף", ומשלים אותם — לא מחליף.

---

## 0. עקרון-על (לקרוא לפני הכל)

- המוצר = **דף עבודה A4 להדפסה** בעברית RTL: HTML + CSS + SVG + MathJax. לא אתר, לא אפליקציה.
- **נאמנות למקור:** תוכן לימודי מועתק ממקור אמת (PDF/תמונה/טקסט) בתמלול נאמן. **לעולם לא להמציא** תרגילים/מספרים, ולא "לתקן" את המקור. אם עמוד מקור לא קריא — לסמן BLOCKED, לא לנחש.
- **לא לשבור מה שעובד:** קבצים מוגנים (למטה) לא משתנים בלי אישור מפורש של Yaniv.
- **הכול חייב לעבור בדיקות** (סעיף 9). "גמור" = כל הבדיקות ירוקות + אימות ויזואלי.

---

## 1. קבצים מוגנים — אסור לשנות ללא אישור מפורש

```
עמוד-N.html            ← תוכן חינוכי קנוני (שינוי/המרה = דורש אישור מפורש)
styles/a4-base.css     ← בסיס A4 בלתי ניתן לשינוי
meta/topics.json       ← עמוד שדרה של מטא-דאטה
sources/legacy/*       ← ארכיון לשימור בלבד (אין למחוק)
sources/backups/*, STATE/backup_*, meta/backup/* ← גיבויים
```
אסור בהחלט: `git add .`, `git push --force`, `git reset --hard`/`rebase` ללא אישור,
`rm -rf`, מחיקת legacy/backup, fake buttons, placeholder UI, demo content,
כתיבה-מחדש של מה שעובד.

---

## 2. חוזה A4 / הדפסה (קשיח — לא לשנות)

- `.a4-page` = **210mm × 297mm בדיוק** (≈ 793.7px × 1122.5px ב-96dpi).
- מסך: `overflow: hidden`. הדפסה: `overflow: visible`. **לעולם לא `overflow: auto`** כ"תיקון" גובה.
- `@page { size: A4; margin: 0; }` — גיליון ללא שוליים. `-webkit-print-color-adjust: exact`.
- כל הכללים האלה כבר ב-`styles/a4-base.css` — **לא נוגעים בו**. פשוט משתמשים ב-`.a4-page`.
- אם התוכן לא נכנס: מקטינים גופן/מרווחים דרך ה-CSS של הדף, **לא** מסתירים overflow.

---

## 3. אנטומיה של דף עבודה — `עמוד-N.html`

מבנה מחייב (ראה `CLAUDE.md §6` למקור). כל דף כולל בדיוק:

```html
<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>עמוד X — שם הנושא</title>          <!-- X = מספר בתוך הנושא, לא מספר הקובץ -->
  <!-- Rubik מ-Google Fonts + MathJax config + loader (רק אם יש נוסחאות) -->
  <script>MathJax = { tex: { inlineMath: [["\\(", "\\)"]] } };</script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <link rel="stylesheet" href="styles/a4-base.css" />
  <link rel="stylesheet" href="styles/topics/<topic>.css" />   <!-- אם קיים CSS משותף לנושא -->
  <link rel="stylesheet" href="styles/pages/עמוד-N.css" />
</head>
<body>
  <nav class="preview-nav" aria-label="ניווט בין עמודים">
    <div class="preview-nav-top">
      <div class="nav-side"><a class="nav-link" href="<prev>">הקודם</a></div>
      <div class="nav-meta">שם-הנושא — עמוד X / Y</div>       <!-- Y = סך דפי הנושא -->
      <div class="nav-side"><a class="nav-link" href="<next>">הבא</a></div>
    </div>
    <div class="preview-nav-topics" aria-label="מעבר בין נושאים">
      <!-- topic-link לכל נושא; is-active + aria-current="page" לנושא הנוכחי -->
    </div>
  </nav>

  <main class="a4-page page-N <topic-class>">
    <header class="header-container">
      <h1 class="page-title">שם הנושא</h1>
      <div class="page-number">X</div>
    </header>
    <div class="question-block">
      <!-- תוכן הדף -->
    </div>
  </main>
</body>
</html>
```

חוקים קשיחים למבנה:
- `page-number` = מספר **בתוך הנושא** (topic-local), לא מספר הקובץ הגלובלי.
- `<title>` בפורמט המדויק `עמוד X — שם הנושא` (הבדיקות מסתמכות עליו).
- **אפס inline CSS:** אין `style="..."` ואין בלוקי `<style>`. כל CSS ב-`styles/pages/עמוד-N.css` בלבד.
- **RTL בכל מקום.** LTR רק ב-CSS לנוסחאות/מספרים: `direction: ltr; unicode-bidi: isolate`.
- **MathJax:** מפרידי inline הם `\( ... \)` בלבד; display הוא `$$ ... $$`. **לעולם לא `$...$`**.
- אין להזכיר נושא אחר בטעות (למשל דף "משוואות" לא מזכיר "משוואות ריבועיות").

---

## 4. CSS — שכבות והיקף

- `styles/a4-base.css` — **immutable**. בסיס A4 + print + מחלקות משותפות (`answer-box`, `box-sm/md`,
  `bullet-container`, `bullet-large/small`, `question-block`, `header-container`, `page-title`, `page-number`).
- `styles/topics/<topic>.css` — CSS משותף לנושא (נטען אם קיים).
- `styles/pages/עמוד-N.css` — CSS ייעודי לדף. **חייב** להיות scoped ל-`.page-N`.
  - אסור override גלובלי: אין `^.header-container{}`, `^.page-title{}`, `^.page-number{}`,
    `^body,html,.a4-page{}`. תמיד `.page-N .something { ... }`.
  - אין `<style>` ואין inline. אין `overflow:auto`.
- גרפיקה מתמטית (SVG inline): `vector-effect: non-scaling-stroke` בכל stroke;
  `shape-rendering: geometricPrecision` ב-SVG גיאומטרי. וקטור בלבד — לא raster.

---

## 5. מטא-דאטה — `meta/topics.json` (+ סנכרון נייד)

- `meta/topics.json` = מקור האמת של נושאים ודפים. כל דף: `{ number, file, title, h1, topic, previewPath, siteUrl }`.
- לנושא: `{ name, count, pages: [...] }`. `count` **חייב** להיות שווה ל-`pages.length`.
- ⚠️ `mobile-topics.json` הוא עותק לנייד ש**חייב** להישאר מסונכרן עם `meta/topics.json` (אין סנכרון אוטומטי).
  אם מוסיפים/משנים דפים — לעדכן את שניהם.
- מיפוי לוגי↔קובץ יכול להיות לא-רציף (למשל בנושא משוואות: לוגי 1 = `עמוד-95`, לוגי N≥2 = `עמוד-(40+N)`).
  **תמיד לסמוך על ה-master-map / meta, לא על מספרי הקבצים.**

---

## 6. נושא "משוואות" — הצינור מונחה-הנתונים (התבנית המומלצת)

נושא המשוואות (single-unknown) נבנה מ-**מקור אמת יחיד** (`sources/equations/משוואות-52.pdf`, 52 עמודים)
דרך צינור אוטומטי ובר-שחזור. כך בונים/מעדכנים דף משוואות:

1. **תמלול נאמן** → `meta/equations-content.json`:
   - לכל עמוד לוגי: `{ sourcePage, columns?(1|2), fontSize?, equations: [...] }`.
   - סדר המשוואות = סדר קריאה: **טור ימני מלמעלה למטה, ואז טור שמאלי**.
   - נוסחאות ב-LaTeX (`\\frac{a}{b}`, `\\div`, `:` וכו'). תמלול בלבד — אף פעם לא המצאה/עריכה.
   - provenance ברמת הקובץ: `sourcePdf`, `sourcePdfSha256`, `sourcePdfPages`.
2. **גנרטור** → `node scripts/build-equations-pages.mjs [lo-hi]`:
   - כותב מחדש רק את גוף העבודה בין `</header>` ל-`</main>` ואת `styles/pages/עמוד-N.css`.
   - שומר nav/header/title כפי שהם. גופן נבחר לפי אורך-ויזואלי מודע-TeX (שברים לא מקטינים מדי).
3. **מפת אמת** → `node scripts/audit-equations-master-map.mjs`:
   - סורק את כל `עמוד-N.html`, מבודד נושא `משוואות` בלבד (לא ריבועית), וכותב
     `meta/equations-master-map.json` עם `total/counts/pages` + provenance (sha מחושב בזמן ריצה).

### חוזה עיצוב הכרטיס — משוואות בנעלם אחד (מחייב)
- **אין מספור תרגילים.** רק העמוד ממוספר (`.page-number`). אין `bullet-num`/`1.`/מונה ol.
- כל משוואה היא **המוקד, ממוקמת במרכז הכרטיס האפור** (`.problem-block`, רקע `--bg-subtle`):
  `.problem-equation` ממוקמת אופקית ואנכית, weight 500, גדולה מטקסט הגוף.
- מבנה v2: `main.a4-page.page-N.equations-page` → `.question-block` → `.eq-body` →
  `.q-main` (הוראה) + `.eq-grid` של כרטיסי `.problem-block`.
- כל כרטיס = `.problem-equation` (שטח אפור) + `.solution-space` (נייר משבצות לבן) + `.problem-answer` (`\(x\) = ` `.answer-box`).
- provenance חובה ולא-חזותי: `.eq-body[data-source="…"][data-source-page="N"]`, וכל `.problem-block[data-source-line="K"]`.
- שורה מנוונת שמופיעה במקור (למשל בלי נעלם) — מתומללת כפי שהיא, לא "מתוקנת".

---

## 7. הוספת דף עבודה חדש (נושא כללי, לא-משוואות)

1. קבע נושא, מספר topic-local X, וקובץ `עמוד-N.html` פנוי.
2. צור `עמוד-N.html` לפי §3 (העתק דף קיים תקין באותו נושא כתבנית — התאם title/nav/page-number/topic-class).
3. צור `styles/pages/עמוד-N.css` scoped ל-`.page-N` (§4).
4. הוסף את הדף ל-`meta/topics.json` **וגם** ל-`mobile-topics.json` (§5); ודא `count == pages.length`.
5. תוכן: תמלל מהמקור בלבד. נוסחאות ב-MathJax; גרפיקה ב-SVG וקטורי.
6. הרץ בדיקות (§9) + אימות ויזואלי (§8). אל תסמן "גמור" עד שהכול ירוק.

---

## 8. אימות ויזואלי (חובה לפני "גמור")

- הרץ preview מקומי והצג את הדף (למשל `preview/index.html` שטוען מ-localhost, או ישירות `עמוד-N.html`).
- לחלופין רינדור headless (Chrome `--headless=new --screenshot`) והורדת התמונה ל-≤2000px לפני קריאה.
- בדוק: A4 ללא חיתוך/overflow (scrollWidth==clientWidth), MathJax מרונדר, סדר טורים ימין→שמאל נכון,
  badge/nav/title נכונים, אין מספור תרגילים (במשוואות), הדפסה/PDF נקיים.

---

## 9. בדיקות ו-CI — חייב ירוק

הרץ תמיד לפני commit:
```
npm run verify                              # חוזי מבנה בסיסיים
npm run validate:equations:all              # master-map + live-design + access-layer (למשוואות)
node scripts/audit-equations-master-map.mjs # total/LIVE/WRAP עקביים
```
Workflows ב-GitHub (`Equations Guard`, `Equations App Validation`) חייבים לעבור.
`Equations Guard` כולל גם `npm ci` — לכן `package.json` ו-`package-lock.json` **חייבים להיות מסונכרנים**
(אם מוסיפים dependency: `npm install` ואז commit גם ל-lockfile).

**מאמת העיצוב החי** (`scripts/validate-equations-live.mjs`) בודק לכל דף משוואות חי:
RTL, קישור a4-base + CSS ייעודי, אפס inline CSS, wrapper v2, badge+nav נכונים,
MathJax `\(...\)` בלי `$...$`, מבנה `eq-body/problem-block/problem-equation/solution-space`,
provenance, ואיסור `img.pdf-page` כתוכן מרכזי.

---

## 10. Provenance ומקור אמת (משמעת)

- מקור התוכן חייב להיות **קובץ מחויב בריפו** עם זהות חד-משמעית (נתיב + sha256), לא שם עמום.
  דוגמה: `sources/equations/משוואות-52.pdf` + `sourcePdfSha256` ב-meta. מקורות ישנים/שונים → `sources/legacy/` ומסומנים superseded (לא נמחקים).
- כל טענת "נאמן למקור" חייבת להיות ניתנת לשחזור: אותו PDF → אותו תמלול → אותם דפים.

---

## 11. צ'ק-ליסט "גמור"

- [ ] `עמוד-N.html` תואם §3 (title/nav/page-number/topic-class, RTL, אפס inline CSS, MathJax תקין).
- [ ] `styles/pages/עמוד-N.css` scoped ל-`.page-N`, ללא override גלובלי.
- [ ] `meta/topics.json` + `mobile-topics.json` מעודכנים ומסונכרנים (`count == pages.length`).
- [ ] תוכן מתומלל מהמקור בלבד — אפס המצאה; שורות לא-קריאות סומנו BLOCKED.
- [ ] A4 מדויק, ללא overflow; אימות ויזואלי בוצע.
- [ ] `npm run verify` + `npm run validate:equations:all` + master-map + Guard — ירוקים.
- [ ] `package.json`/`package-lock.json` מסונכרנים אם נגעת בתלויות.
- [ ] לא נגעת בקבצים מוגנים ללא אישור; לא במשוואות ריבועיות; לא ב-a4-base.css.

---

_המסמך הזה הוא מקור האמת ל"איך בונים דף עבודה". עדכן אותו בכל שינוי אמיתי בתהליך, ותעד גם ב-`STATE/`._
