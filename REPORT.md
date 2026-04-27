# REPORT.md — דוח שיפורים ועדכונים

**תאריך:** 2026-04-27
**ענף:** `copilot/deep-dive-into-repo-structure`
**מאחזר:** ניתוח עמוק של הריפו + שיפורים

---

## 1. מה בחנתי (ניתוח מעמיק)

### מבנה הריפו

| רכיב | תיאור |
|------|-------|
| `עמוד-N.html` (95 קבצים) | דפי עבודה קנוניים A4 בעברית, עם MathJax |
| `styles/a4-base.css` | בסיס CSS משותף לכל הדפים — לא לגעת |
| `styles/pages/עמוד-N.css` | CSS ייחודי לכל דף |
| `meta/topics.json` | מקור האמת למטאדאטה: 7 נושאים, 95 דפים |
| `meta/pages.json` | רשימת דפים שטוחה (הייתה ריקה — תוקנה) |
| `mobile-app.html/js/css` | קורא הספר הראשי — עובד בנייד ובנייח |
| `preview/` | מערכת תצוגה מקדימה מקומית |
| `preview/topics.html` | ניווט לפי נושאים (desktop-first) |
| `preview/print.html` | מרכז הדפסה |
| `catalog.html` (חדש) | עמוד קטלוג לאתר החיצוני |
| `catalog.css` (חדש) | עיצוב קטלוג |
| `.github/workflows/deploy-pages.yml` | GitHub Pages deployment |
| `PROJECT_RULES.md` | מסמך כללים ראשי |
| `rules.md` | מדריך קצר מסונכרן |
| `tests/` | 96 בדיקות חוזה — כולן עוברות |
| `scripts/` | ≈18 סקריפטים: verify, sync, audit, generate |

### נושאים קיימים (7)
| נושא | מספר דפים |
|------|-----------|
| משוואות | 54 |
| משפט פיתגורס | 23 |
| משוואות ריבועיות | 6 |
| פונקציות | 4 |
| סדרות וחוקיות | 4 |
| גיאומטריה | 2 |
| כללי | 2 |

---

## 2. בעיות שזוהו לפני השיפורים

### בעיה 1: כתובת שורש GitHub Pages — ריקה
- URL: `https://yanivmizrachiy.github.io/parabula-next/`
- מה קרה: Vite בנה `dist/index.html` עם אפליקציה ריקה (div#app + "Use canonical preview")
- האתר החיצוני לא היה ניתן לשימוש ישיר

### בעיה 2: mobile-app.js לא עבד ב-preview מקומי
- פונקציית `pageUrl()` תמיד החזירה `page.siteUrl` (כתובת GitHub Pages)
- בעת עבודה מקומית עם `npm run preview` הדפים לא נטענו מ-localhost

### בעיה 3: meta/pages.json הייתה ריקה
- הקובץ `meta/pages.json` הכיל `[]`
- לא היה אפשר לקבל רשימה שטוחה של כל הדפים

### בעיה 4: אין קישור `?topic=` ב-mobile-app.html
- לא ניתן היה לפתוח את הקורא עם נושא מסוים דרך URL

### בעיה 5: sync-rules.mjs כתב תבנית קבועה
- הסקריפט לא באמת סנכרן מ-PROJECT_RULES.md
- rules.md לא שיקפה את הכללים המעודכנים

### בעיה 6: אין "front cover" לאתר
- לא היה עמוד נחיתה יפה שמציג את כל הנושאים
- משתמש שפתח את האתר לא ידע איפה להתחיל

---

## 3. שיפורים שבוצעו

### שיפור א: catalog.html — עמוד קטלוג חדש
**קבצים חדשים:** `catalog.html`, `catalog.css`

- עמוד נחיתה יפה ורספונסיבי לאתר החיצוני
- מציג את כל הנושאים כקלפים עם מספר הדפים
- כל קלף נושא כולל: כפתור קריאה, ניווט, פתיחת דף ראשון
- "צ'יפים" של מספרי הדפים עם לינקים ישירים
- עיצוב מותאם לנייד ולנייח (grid responsive)
- טוען מ-`meta/topics.json` בזמן ריצה
- Skeleton loading בזמן טעינה
- שימוש ב-Rubik font + design tokens של הריפו

### שיפור ב: main.js — entry point תקין
**קובץ:** `main.js`

- לפני: הציג הודעת "Use canonical preview at /preview"
- אחרי: `window.location.replace('./catalog.html')`
- Vite יבנה `dist/index.html` שמפנה לקטלוג

### שיפור ג: deploy-pages.yml — index.html תקין
**קובץ:** `.github/workflows/deploy-pages.yml`

- הוסף שלב: `cp catalog.html dist/index.html`
- Root URL של GitHub Pages כעת מציג את הקטלוג
- הקטלוג קורא data מ-`meta/topics.json` ומציג בזמן אמת

### שיפור ד: mobile-app.js — תמיכה ב-localhost
**קובץ:** `mobile-app.js`

- הוספת `IS_LOCAL` detection (`hostname === 'localhost' || '127.0.0.1'`)
- פונקציית `pageUrl()` מעודכנת:
  - **מקומי:** `new URL(page.file, BASE_URL).href` — עובד עם `npm run preview`
  - **GitHub Pages:** `page.siteUrl` — הכתובת הרשמית
- מעתה הקורא עובד בשני הסביבות

### שיפור ה: תמיכה ב-`?topic=` ב-mobile-app.js
**קובץ:** `mobile-app.js`

- הקורא עכשיו בודק `new URL(window.location.href).searchParams.get('topic')`
- אם נמצא נושא תקין ב-URL, פותח ישירות לנושא הזה
- מאפשר לינקים כמו `mobile-app.html?topic=משוואות` מהקטלוג

### שיפור ו: meta/pages.json — מאוכלסת
**קובץ:** `meta/pages.json`

- הייתה ריקה `[]`
- כעת מכילה 95 דפים ממוינים לפי מספר
- נוצרה מ-`meta/topics.json` ע"י script Node.js

### שיפור ז: scripts/sync-rules.mjs — תוכן אמיתי
**קובץ:** `scripts/sync-rules.mjs`

- לפני: כתב תבנית קבועה שאינה משקפת כלום
- אחרי: כותב `rules.md` מקיף עם:
  - כל כללי הליבה
  - כללי math
  - כללי layout
  - נקודות כניסה לאתר החיצוני
  - פקודות פיתוח
  - כללי בטיחות
  - תאריך סנכרון

### שיפור ח: PROJECT_RULES.md — סעיפים חדשים
**קובץ:** `PROJECT_RULES.md`

הוספו 3 סעיפים חדשים (28, 29, 30):

- **סעיף 28**: GitHub Pages deployment contract
  - URL של האתר החיצוני
  - `catalog.html` כ-entry point
  - עותק `meta/topics.json` ל-dist
- **סעיף 29**: Catalog page contract
  - חוקי `catalog.html` ו-`catalog.css`
  - אי-שימוש ב-inline styles
- **סעיף 30**: Local URL resolution contract
  - `IS_LOCAL` detection
  - `?topic=` query param

---

## 4. מה לא שונה (בכוונה)

- **אין שינוי בדפי העבודה** (`עמוד-N.html`) — לא נגעתי בשום דף
- **אין שינוי ב-`styles/a4-base.css`** — הבסיס נשאר שלם
- **אין שינוי ב-`meta/topics.json`** — מקור האמת לא השתנה
- **אין שינוי בבדיקות** — כל 96 הבדיקות עוברות
- **אין שינוי ב-preview system** — preview/server.mjs ו-topics.html נשארו

---

## 5. מצב לאחר השיפורים

```
npm test    → ✅ 96/96 עוברות
npm run verify → ✅ OK
npm run build  → ✅ מצליח
```

### זרימת משתמש חיצוני (GitHub Pages)
```
https://yanivmizrachiy.github.io/parabula-next/
    ↓ (index.html = catalog.html)
📚 קטלוג נושאים
    ↓ לחיצה "▶ קרא"
mobile-app.html?topic=<TOPIC>
    ↓ קורא ספר עם כל הדפים
```

### זרימת עריכה מקומית (VS Code)
```
npm run preview → http://127.0.0.1:5179/preview
    ↓ topics.html (ניווט)
    ↓ mobile-app.html (קורא — כעת עובד גם עם URLs מקומיים)
```

---

## 6. המלצות להמשך (לא בוצעו)

1. **הוסף `npm run gen:pages`** — סקריפט שמחדש `meta/pages.json` כשמוסיפים דפים חדשים
2. **שפר desktop layout ב-mobile-app.html** — כשגודל המסך גדול מ-1200px אפשר להציג sidebar קבוע
3. **הוסף Service Worker עם cache** — לעבודה offline ב-GitHub Pages
4. **צור `npm run page:new` שמעדכן גם topics.json** — כרגע צריך לעדכן ידנית
5. **הוסף breadcrumb navigation** בדפים — ניווט ישיר לנושא

---

_נוצר ע"י: GitHub Copilot Deep Analysis Session, 2026-04-27_
