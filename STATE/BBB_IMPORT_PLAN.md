# BBB IMPORT PLAN — ייבוא 4 ספרים מריפו bbb

_דוח עבודה (לא קובץ כללים — CLAUDE.md גובר). נוצר 2026-07-10._

## המשימה (הוראת יניב)
לייבא את כל דפי https://github.com/yanivmizrachiy/bbb כדפי עבודה **חדשים** בפרויקט,
מעוצבים לפי כללי CLAUDE.md, בנושאים חדשים, **בלי לגעת ב-98 הדפים הקיימים**,
**בלי לשנות מלל ונתונים** — העתקה מדויקת של השאלות. אסור לקלקל את ריפו bbb (קריאה בלבד).

## מקור האמת לתמלול
ריפו bbb מייצר כל ספר מקוד Python → `worksheet.html` (טקסט השאלות המדויק, HTML סמנטי).
הופק מקומית מ-clone (bbb לא שונה!) ונשמר יחד עם ה-PDF תחת `sources/bbb/<book>/`.

| ספר | key | שאלות | פרקים | דפי מקור |
|---|---|---|---|---|
| אלגברה לכיתה ז' | algebra | 61 | 6 | 29 |
| אלגברה לכיתה ח' | algebra8 | 92 | 12 | 70 |
| גאומטריה לכיתה ח' | geometry8 | 55 | 14 | 41 |
| תחום אי־וודאות | uncertainty | 55 | 7 | 44 |

## מבנה worksheet.html (זהה בכל הספרים)
- `.section` = פרק (כותרת פרק). `.q` = שאלה: `.qhead > .qnum + .qtags`, `.qbody`.
- בתוך qbody: `.parts > .plab/.ptext` (סעיפים), `.mc > .opt > .ol/.ot` (רב-ברירה),
  `.ansrow/.abox/.alab` (שורות תשובה), `.lines/.ln` (שורות כתיבה), `table.wtbl`,
  `svg.chart` (גרפים וקטוריים inline), `img.embed src="assets/*.png"` (איורי מקור).

## תכנון היעד
- **4 נושאים חדשים** ב-meta/topics.json (אחרי הקיימים, שמות = כותרות הספרים המקוריות).
- מספור גלובלי חדש: עמוד-99 ואילך (אין נגיעה בעמוד-1..98).
- כל דף: התבנית הקנונית המלאה (CLAUDE.md §5) — vendor Rubik+MathJax, preview-nav,
  `main.a4-page.page-N`, badge מקומי-לנושא, CSS ייעודי scoped `.page-N` + CSS משותף לנושא
  `styles/topics/bbb-<key>.css`.
- אריזת שאלות לדפים: מדידה אמיתית בדפדפן (Playwright) — ממלאים דף עד שהשאלה הבאה לא
  נכנסת, בלי overflow ועם ניצול ≥50% (שערי audit קיימים אוכפים).
- `svg.chart` נשאר וקטורי inline; `img.embed` — האיורים מועתקים ל-`pages/bbb/<key>/assets/`
  ומוטמעים יחסית; שני מסלולי הפריסה כבר מעתיקים `pages/`.
- טקסט: העתקה 1:1 מ-worksheet.html. מספור שאלות מקורי נשמר. אסור לנסח מחדש.

## צנרת הביצוע (סקריפט חד-פעמי `scripts/import-bbb.mjs` — יימחק בסיום)
1. parse worksheet.html → רשימת פרקים ושאלות (HTML גולמי לכל שאלה).
2. סניטציה: התאמת מחלקות לקונבנציות שלנו בלי לגעת בטקסט; נתיבי איורים ל-pages/bbb.
3. אריזה לדפים במדידת דפדפן; פליטת עמוד-N.html + styles/pages/עמוד-N.css.
4. עדכון meta/topics.json (נושא חדש לכל ספר) + סנכרון.
5. שערים אחרי כל ספר: npm test, verify, validate:meta/schema/html, rules:check,
   audit:a4:visual, audit:a4:utilization, validate:mobile:all-pages (מלא).
6. קומיט לכל ספר בנפרד; push; deploy; אימות חי.

## סדר: פיילוט = algebra (61 שאלות) → algebra8 → geometry8 → uncertainty.

## סטטוס
- [x] bbb נחקר; worksheet.html הופק ל-4 הספרים (bbb לא שונה)
- [x] חומרי מקור נשמרו ב-sources/bbb/
- [ ] ממיר import-bbb.mjs
- [ ] פיילוט אלגברה ז' + שערים מלאים
- [ ] שלושת הספרים הנותרים
- [ ] עדכון CLAUDE.md §3 (מונים) + קומיטים + deploy + אימות חי
