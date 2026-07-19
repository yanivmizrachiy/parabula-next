# CURRENT_STATE.md — חוברת משוואות ריבועיות כיתה ט׳

**עודכן:** 19 ביולי 2026  
**Repository:** yanivmizrachiy/parabula-next  
**נתיב PDF:** `output/pdf/משואות-ריבועיות-כיתה-ט-246-תרגילים.pdf`

---

## מצב פרויקט

### מבנה קבצי מקור

| קובץ | תיאור | סטטוס |
|------|--------|--------|
| `sources/quadratic-equations/workbook-data.mjs` | נתוני כל 246 התרגילים ב-16 נושאים | פעיל |
| `scripts/generate-quadratic-equations-workbook.mjs` | יוצר 50 עמודי HTML | פעיל |
| `scripts/export-quadratic-equations-workbook.mjs` | ממיר HTML ל-PDF עם Playwright | פעיל |
| `tests/contracts/quadratic-equations-workbook.test.mjs` | בדיקות אוטומטיות מקיפות | פעיל |
| `sources/equations/52-משוואות.pdf` | PDF מקור מקורי 52 עמודים | שמור |

---

## נתוני חוברת

- **246 תרגילים** ב-16 נושאים (x2 מ-123 מקוריים)
- **50 עמודי A4** (209.89 x 297.01 mm)
- **4 רמות קושי** לכל תרגיל
- **RTL עברית מלאה** + MathJax למתמטיקה

### 16 הנושאים

1. משוואה ריבועית חסרה (c=0) — רמה בסיסית
2. משוואה ריבועית חסרה (c=0) — עם שברים
3. משוואה ריבועית חסרה (b=0) — שורש ריבועי
4. משוואה ריבועית חסרה (b=0) — עם שברים
5. משוואה ריבועית חסרה (b=0) — עם פרמטרים
6. משוואה ריבועית מלאה — נוסחת הפתרון
7. משוואות ריבועיות עם סוגריים
8. משוואות מהצורה: a(x+b)^2=c
9. משוואות ריבועיות עם פרמטרים (x כמחלק)
10. משוואות ריבועיות עם פרמטרים (אחר)
11. משוואות ריבועיות עם מכנה מספרי
12. משוואות ריבועיות עם X במכנה
13. משוואות ריבועיות עם X במכנה (מורכב)
14. משוואות ריבועיות עם שברים ופירוקים
15. נוסחת הכפל המקוצר: a^2-b^2=(a+b)(a-b)
16. נוסחאות הכפל המקוצר: (a+/-b)^2

---

## שיפורים שבוצעו (19.07.2026)

### 1. תיקון `chromium.launch()` — בעיית headless-shell

**בעיה:** `export-quadratic-equations-workbook.mjs` השתמש ב-`chromium.launch()` ברירת מחדל
שמשתמש ב-`chromium-headless-shell` ועלול לכשול בסביבות CI/CD מסוימות.

**תיקון (commit f8f9a5e בברנץ' yanivmizrachiy-patch-2):**
```javascript
// לפני:
browser = await chromium.launch();

// אחרי:
browser = await chromium.launch({ headless: false, args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'] });
```

### 2. הוספת GitHub Actions workflow

**workflow:** `.github/workflows/build-quadratic-equations-workbook.yml`

מפעיל אוטומטית כאשר:
- שינוי ב-`sources/quadratic-equations/**`
- שינוי ב-`scripts/export-quadratic-equations-workbook.mjs`
- שינוי ב-`scripts/generate-quadratic-equations-workbook.mjs`

מבצע:
1. התקנת Playwright + Chromium
2. התקנת pypdf לייצוא PDF
3. הרצת generate + export
4. אימות שה-PDF מכיל **בדיוק 50 עמודים**
5. העלאת ה-PDF כ-artifact עם retention 90 ימים

---

## מצב בדיקות

| בדיקה | תוצאה |
|-------|--------|
| sections.length === 16 | OK |
| exerciseCount === 246 | OK |
| sourceExerciseCount === 123 | OK |
| pageCount === 50 | OK |
| pages.length === 50 | OK |
| כל נושא — 4 רמות קושי | OK |
| כל תרגיל — equation לא ריק | OK |
| כל תרגיל — answer תקין | OK |

---

## פקודות עבודה

```bash
# יצירת עמודי HTML
node scripts/generate-quadratic-equations-workbook.mjs

# ייצוא PDF
npm run quadratics:export

# הרצת בדיקות
node --test tests/contracts/quadratic-equations-workbook.test.mjs

# ביקורת מסטר מפ
node scripts/audit-equations-master-map.mjs
```

---

## PRs פעילים רלוונטיים

- **yanivmizrachiy-patch-2**: תיקון headless=new לשני scripts (ייצוא coordinate + ייצוא quadratic)
- **yanivmizrachiy-patch-4**: הוספת CI workflow לחוברת המשוואות
