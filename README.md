# Parabula Next — דפי עבודה במתמטיקה A4

מערכת לייצור, ניהול ותצוגה של דפי עבודה במתמטיקה בעברית RTL, באיכות הדפסה מלאה.

**האתר החי:** https://yanivmizrachiy.github.io/parabula-next/
(נייח → קטלוג ספר דיגיטלי, נייד → אפליקציית קריאה)

## מה יש כאן

- **98 דפי עבודה** קנוניים בשורש (`עמוד-N.html`) ב-8 נושאים — A4 מדויק, MathJax, SVG וקטורי
- **catalog.html** — ספר לימוד דיגיטלי לנייח
- **mobile-app.html** — אפליקציית קריאה לנייד (PWA)
- **preview/** — סביבת עבודה מקומית עם live-reload וזיהוי חריגות A4
- **meta/topics.json** — מקור האמת של הנושאים והדפים

## עבודה מקומית

```bash
npm install
npm run preview     # שרת מקומי: http://127.0.0.1:5179/preview
npm test            # בדיקות חוזה על כל הדפים
npm run doctor      # 6 בדיקות בריאות מלאות
npm run ci:all      # כל שערי האיכות + build
```

Windows: אפשר גם `./preview.ps1` (עם `-Lan` לשיתוף ברשת המקומית).

## הדפסה

בכל דף: Print → A4 → ללא שוליים (ה-CSS כבר מגדיר `@page margin: 0`).

## מסמכי אמת (לקרוא לפני כל שינוי)

1. `PROJECT_RULES.md` — הכללים המחייבים
2. `PROJECT_MEMORY.md` — זיכרון הפרויקט + דרישות יניב (סעיף 0 בעברית)
3. `STATE/LIVE_STATUS.md` — תמונת מצב חיה
4. `CLAUDE.md` — נקודת כניסה לעבודה עם AI
5. `docs/WORKSHEET_CREATION_RULES.md` — איך יוצרים דף עבודה חדש
