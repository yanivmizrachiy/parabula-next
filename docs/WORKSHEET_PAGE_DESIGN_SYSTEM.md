# Worksheet Page Design System — Parabula Next

_מסמך עיצוב מערכת דפי עבודה. נוצר: 2026-05-18._
_קרא לפני כל יצירה או עריכה של דף עבודה._
_מקור אמת משלים את: `PROJECT_RULES.md`, `CLAUDE.md`, `WORKSHEET_BOOK_PLATFORM_VISION.md`._

---

## 1. מטרה ותחום

מסמך זה מגדיר את **מערכת העיצוב המלאה** לדפי עבודה A4 בפרויקט Parabula Next.

כל דף עבודה חייב לעמוד בכל הכללים המפורטים כאן.
**אין חריגות ללא אישור מפורש של Yaniv.**

---

## 2. חוזה ה-A4 — עקרון ראשון

### ממדים מדויקים
```css
.a4-page {
  width: 210mm;
  height: 297mm;
  padding: 10mm 18mm;
  overflow: hidden;           /* מסך: לא לשנות */
}

@media print {
  @page { size: A4; margin: 0; }
  .a4-page { overflow: visible; box-shadow: none; margin: 0; }
  .preview-nav { display: none; }
  -webkit-print-color-adjust: exact;
}
```

### כלל ה-Overflow
- **מסך:** `overflow: hidden` — תמיד
- **הדפסה:** `overflow: visible` — תמיד
- **אסור לחלוטין:** `overflow: auto`, `overflow: scroll`
- **לא להשתמש ב-**`overflow: auto` כדי "לתקן" גובה

### בדיקת A4
לפני כל commit — הרץ את השרת וודא שאין overflow ב-A4.
שגיאת overflow מופיעה בטרמינל: `[CRITICAL ERROR] A4 overflow: <file>`

---

## 3. מבנה HTML — תבנית מחייבת

כל `עמוד-N.html` חייב להכיל **בדיוק** את המבנה הבא:

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>עמוד X — שם הנושא</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500&display=swap" rel="stylesheet">

    <script>
        MathJax = { tex: { inlineMath: [['\\(', '\\)']] } };
    </script>
    <script id="MathJax-script" async
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <link rel="stylesheet" href="styles/a4-base.css">
    <link rel="stylesheet" href="styles/pages/עמוד-N.css">
</head>
<body>

    <nav class="preview-nav" aria-label="ניווט בין עמודים">
        <div class="preview-nav-top">
            <div class="nav-side">
                <!-- prev link OR: <span class="nav-link is-disabled" aria-disabled="true">הקודם</span> -->
                <a class="nav-link" href="עמוד-PREV.html">הקודם</a>
            </div>
            <div class="nav-meta">שם הנושא — עמוד X / Y</div>
            <div class="nav-side">
                <!-- next link OR: <span class="nav-link is-disabled" aria-disabled="true">הבא</span> -->
                <a class="nav-link" href="עמוד-NEXT.html">הבא</a>
            </div>
        </div>
        <div class="preview-nav-topics" aria-label="מעבר בין נושאים">
            <a class="topic-link" href="עמוד-FIRST_OF_TOPIC.html">שם נושא</a>
            <a class="topic-link is-active" href="עמוד-N.html"
               aria-current="page">הנושא הנוכחי</a>
        </div>
    </nav>

    <main class="a4-page page-N [topic-css-class]">
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

### כללים קשיחים למבנה
| כלל | פירוט |
|---|---|
| `page-number` | מספר **בתוך הנושא** — לא מספר הקובץ הגלובלי |
| `<title>` | `עמוד X — שם הנושא` (X = מיקום בנושא) |
| inline CSS | **אסור לחלוטין** — לא `style=""`, לא `<style>` |
| כל CSS | ב-`styles/pages/עמוד-N.css` בלבד |
| RTL | `lang="he" dir="rtl"` על `<html>` תמיד |
| nav-meta | `{נושא} — עמוד {i} / {סה"כ בנושא}` |
| topic-link | `.is-active` + `aria-current="page"` על הנושא הנוכחי |

---

## 4. טיפוגרפיה RTL

### גופן
- **Rubik** בלבד — `wght@400;500`
- טוען מ-Google Fonts CDN
- הדפסה ללא אינטרנט: אפשרית אבל הגופן ייפול ל-fallback

### כיווניות
- `dir="rtl"` על `<html>` — ירוש לכל האלמנטים
- כתיבה ימין לשמאל בכל התוכן העברי
- **LTR רק בתוך CSS** לאלמנטים מתמטיים:
  ```css
  .answer-field { direction: ltr; unicode-bidi: isolate; }
  ```

### גדלי גופן (מ-a4-base.css — לא לדרוס)
- `h1.page-title` — ממוקם ב-header, גופן גדול, `font-weight: 500`
- `.page-number` — badge עגול בפינת ה-header
- גוף הטקסט — מתאים לקריאה בהדפסה A4

---

## 5. היררכיה ויזואלית

### מבנה תוכן הדף
```
header-container
  h1.page-title        ← שם הנושא
  .page-number         ← מספר בנושא (badge)

question-block
  .q-main              ← שאלה ראשית
    .bullet-container  ← bullet גדול שחור
    .q-text            ← טקסט השאלה
  
  .visual-container    ← ייצוג ויזואלי (ציור, גרף, טבלה)
  
  .q-sub               ← שאלות משנה
    [bullet שחור קטן]
    [טקסט תת-שאלה]
  
  .solution-space      ← מקום לתשובה (אם נדרש)
  .eq-solutions        ← footer תשובות (אם נדרש)
```

### כללי spacing
- בלוקי שאלות מרוחקים זה מזה (white space בין blocks)
- בלוקים לא נוגעים זה בזה
- אזורי כתיבה מתרחבים למלא גובה A4 זמין

### תת-שאלות
- מופרדות ב-bullet שחור בלבד
- **אסור** מספור ידני (לא `א.`, לא `1.`) אלא אם Yaniv ביקש במפורש

---

## 6. כתיבה מתמטית בעברית — כללים מחייבים

### מספרים שליליים
```
נכון:  "מינוס 4" / \(-4\)
שגוי: "4 מינוס"
```

### פתרונות כפולים
```
נכון:  \(x_1 = 3\) ו-\(x_2 = -2\)
שגוי: x1=3, x2=-2
```

### זוג ערכים (parentheses)
```
נכון:  \((x_1,\,x_2)\) = \((3,\,-2)\)
```

### שלמות המשפט המתמטי
כל ביטוי מתמטי חייב להיות שלם ומדויק.
אין לחסוך סוגריים שמשנים משמעות.
אין לכתוב ביטויים לא חד-משמעיים.

---

## 7. MathJax — כללים מחייבים

### delimiters מאושרים
| שימוש | כתיב נכון | כתיב אסור |
|---|---|---|
| inline | `\(...\)` | `$...$`, `` `...` `` |
| display | `$$...$$` | `\[...\]`, `$...$` |

### config בכל דף
```html
<script>
    MathJax = { tex: { inlineMath: [['\\(', '\\)']] } };
</script>
```

### דוגמאות נכונות
```html
<p>מצא את \(x\) כך ש: \(2x + 3 = 7\)</p>
$$x = \frac{7 - 3}{2} = 2$$
<p>הפתרונות הם \(x_1 = 3\) ו-\(x_2 = -5\)</p>
```

### מה לא לעשות
- לא `$x^2$` — לא יעבוד עם ה-config הנוכחי
- לא `<math>` HTML — לא בשימוש בפרויקט
- לא LaTeX commands ישנים: `\frac{a}{b}` נכון, `{a \over b}` — לא להעדיף

---

## 8. גרפיקה — עץ החלטה

### מתי להשתמש במה

```
צריך ציור?
  ↓
האם זה תרשים גיאומטרי / קואורדינטות / גרף?
  ↓ כן                        ↓ לא
SVG inline               האם זו תמונה אמיתית מ-Yaniv?
(REQUIRED)                 ↓ כן            ↓ לא
                        <img> מוגבל     SVG/CSS
                        (לא להעדיף)     (מועדף)
```

### כלל ברזל
**לא להשתמש ב-raster images (PNG/JPG) לגיאומטריה, גרפים, או ציורים מתמטיים.**
רק SVG, רק vector, רק קוד.

### מתי `<img>` מותר
- תמונה שסופקה על ידי Yaniv מתוך חומר מקור
- בסימון ברור שהתמונה היא הדגמה ולא ציור מדויק
- לא ליצור `<img>` מ-AI generation

---

## 9. SVG — כללים מחייבים

### CSS חובה לכל SVG גיאומטרי
```css
/* בקובץ styles/pages/עמוד-N.css */
.page-N svg { shape-rendering: geometricPrecision; }
.page-N svg * { vector-effect: non-scaling-stroke; }
```

### אלמנטים גיאומטריים
```svg
<!-- קו -->
<line x1="..." y1="..." x2="..." y2="..."
      stroke="#222" stroke-width="1.5"/>

<!-- משולש -->
<polygon points="..." fill="none" stroke="#222" stroke-width="1.5"/>

<!-- ריבוע לזווית ישרה (right-angle marker) -->
<rect x="..." y="..." width="8" height="8"
      fill="none" stroke="#222" stroke-width="1.2"/>

<!-- chevron מקביליות -->
<!-- single: > על הקטע, double: >> על הקטע השני -->
```

### labels
- מחוץ לצורה הגיאומטרית
- padding ~5px מהקצה
- לא חופפים עם קווים
- בעברית: `<text>` עם `direction="rtl"` אם נדרש

### גדלים
- SVG container: מותאם לגוף הדף (לא קבוע)
- גיאומטריה: stroke-width 1.5px בסיסי, 2px להדגשה

---

## 10. ציר קואורדינטות

### מפרט קנוני
```css
.coordinate-system {
  width: 440px;
  height: 440px;
  position: relative;
}
/* grid: 22px = 1 יחידה, 20 יחידות לציר */
```

### דרישות ויזואליות
- חצים בקצות הצירים (SVG arrowhead)
- labels מחוץ לגריד (לא על קווי הגריד)
- origin (0,0) מסומן בבירור
- קווי עזר (grid) בצבע בהיר

### axis labels
```html
<span class="axis-label" style="left: Xpx; top: Ypx;">ערך</span>
```
מיקום עם absolute positioning יחסית ל-.coordinate-system.

---

## 11. ציורים — מדוד vs. משוער

**כלל חובה:** כל ציור חייב להיות מסומן בבירור.

### ציור לפי קנה מידה (measurable)
- ניתן להסיק ממנו מידות
- יחס המידות נכון
- קנה מידה מצוין (אם רלוונטי)
- סימון: `<!-- ציור לפי קנה מידה -->`

### ציור סכמטי (approximate)
- להמחשה בלבד
- לא בקנה מידה
- לא להסיק ממנו מידות
- סימון: `<!-- ציור סכמטי — לא בקנה מידה -->`
- הוסף הערה בטקסט הדף: "לא לפי קנה מידה" אם יש חשש לאי-בהירות

---

## 12. פדגוגיה — כללי הוראה

### בניית שאלה תקינה
1. **הוראה ברורה** — מה לחשב / מה לבצע
2. **נתונים שלמים** — כל המידע הנדרש לפתרון
3. **פורמט תשובה מוגדר** — "מצא את x", "חשב את השטח", "רשום את הפתרון"
4. **קושי הולם** — מתאים לרמה ולכיתה שצוינה במטא-דאטה

### רצף קושי בדף
- שאלות בתחילת הדף — בסיסיות יותר
- שאלות בסוף — מאתגרות יותר
- לא לדלג מקושי בסיסי לקושי גבוה ללא מעבר

### שפה מתמטית עברית
- כתיבה ברורה, לא עמומה
- מונחים עקיביים לכל הדף (לא "משולש" פעם ו"תלת-צלע" פעם)
- הנחיות קצרות וממוקדות

### מה אסור בפדגוגיה
- שאלות בלתי פתירות (נתונים סותרים)
- שאלות עם פרשנות כפולה
- ביטויים לא מוגדרים
- נתונים מיותרים שמבלבלים

---

## 13. מפתח תשובות ורובריקה

### מצב נוכחי
95 הדפים הקיימים **אינם** כוללים מפתח תשובות מובנה.

### עתידי — כשנוסיף מפתח
- מפתח תשובות שמור בנפרד (לא על דף הסטודנט)
- שדה `hasAnswerKey: true` במטא-דאטה
- פורמט קנוני עתידי (PENDING — לא לממש עדיין)

### solutions footer (קיים בדפים מסוימים)
- `.eq-solutions` — footer עם תשובות קצרות
- פרוס על כל רוחב הדף (CSS grid)
- תשובות זוגיות: `\((x_1,\,x_2)\)` עם סוגריים נכונים

---

## 14. מטא-דאטה וtagging

### שדות חובה ב-meta/topics.json
```json
{
  "number": 9,
  "file": "עמוד-9.html",
  "topic": "משפט פיתגורס",
  "topicIndex": 1,
  "grade": "ט",
  "skill": "חישוב צלע חסרה",
  "worksheetType": "תרגול",
  "status": "published"
}
```

### שדות רצויים
```json
{
  "unit": "גיאומטריה",
  "difficulty": "בסיסי",
  "keywords": ["משולש ישר זווית", "פיתגורס"],
  "hasAnswerKey": false,
  "diagramType": "svgGeometry",
  "provenance": "scan_2025_01"
}
```

### worksheetType ערכים
- `תרגול` — תרגול רגיל
- `הסבר` — דף הסבר + תרגול
- `בחינה` — בחינה / מבחן
- `הכנה` — הכנה לבחינה
- `חזרה` — חזרה על חומר

### difficulty ערכים
- `בסיסי` — שאלות פתיחה
- `ביניים` — שאלות רגילות
- `מתקדם` — שאלות מאתגרות

---

## 15. מיקום קבצים — כלל מחייב

| קובץ | מיקום |
|---|---|
| HTML של דף עבודה | שורש הריפו: `עמוד-N.html` |
| CSS של דף עבודה | `styles/pages/עמוד-N.css` |
| CSS נושאי משותף | `styles/topics/<topic>.css` |
| CSS בסיסי A4 | `styles/a4-base.css` (לא לגעת) |
| SVG assets (אם חיצוני) | `sources/` לפי נושא |
| תמונות מקור | `sources/legacy/` או `sources/backups/` |
| מטא-דאטה | `meta/topics.json` + `mobile-topics.json` |
| תיעוד דף | שדות ב-meta/topics.json |
| עדות לשינוי | git commit message + STATE/ |

### מה אסור
- CSS ב-HTML (לא `<style>`, לא `style=""`)
- קבצים זמניים בשורש הריפו
- assets ישירות בשורש

---

## 16. רשימת בדיקה לפני commit

לפני כל commit של דף עבודה חדש או ערוך:

```
[ ] לא overflow ב-A4 (בדוק בשרת מקומי)
[ ] אפס inline CSS
[ ] MathJax תקין (delimiters \( \) בלבד)
[ ] RTL נכון על כל הדף
[ ] nav-meta נכון (נושא — עמוד X / Y)
[ ] page-number = מספר בתוך הנושא (לא מספר קובץ)
[ ] כל SVG עם vector-effect: non-scaling-stroke
[ ] ציורים: מדוד/משוער מסומן בבירור
[ ] meta/topics.json מעודכן
[ ] mobile-topics.json מעודכן
[ ] npm test ירוק
[ ] npm run verify ירוק
```

---

## 17. איכות ברמת ספר לימוד

**הסטנדרד המינימלי הוא ספר לימוד מקצועי, לא "מספיק טוב".**

דף עבודה טוב:
- ניתן להדפסה ושימוש ישיר בכיתה
- ברור, נקי, ומקצועי ויזואלית
- ללא שגיאות מתמטיות
- ללא שגיאות שפה
- עקיב עם שאר הדפים בנושא

דף עבודה לא מקובל:
- overflow ב-A4
- inline CSS
- SVG מטושטש / לא מדויק
- שגיאות MathJax
- כתיבה מתמטית לא נכונה בעברית
- ציורים לא ברורים
- מטא-דאטה חסרה

---

_נוצר: 2026-05-18 | מקור אמת לעיצוב דפי עבודה_
_סמכות: `PROJECT_RULES.md` גוברת במקרה סתירה_
