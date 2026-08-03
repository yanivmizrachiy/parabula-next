# אימות השחרור החי — חוברת אלגברה לכיתה ז׳

מסמך זה הוא runbook תפעולי בלבד. כל כללי הפרויקט והעבודה המחייבים נמצאים ב־`CLAUDE.md`, שהוא מקור הכללים היחיד.

## מה נוסף

- `scripts/verify-algebra-z-live.mjs` בודק את עמוד החוברת, ה־manifest ושני קובצי ה־PDF באתר החי.
- הבדיקה מאמתת HTTP, מבנה PDF, מספר עמודים, גודל, SHA-256, קרדיטים והיעדר תלות ב־Google Drive.
- מצב `--browser` מפעיל Chromium, בודק את פקדי ה־viewer, מעבר בין צבעוני לשחור־לבן, קישורי פתיחה והורדה, שגיאות console וכשלי רשת.
- `.github/workflows/algebra-z-live-smoke.yml` מריץ את הבדיקה לאחר פריסה מוצלחת, בהפעלה ידנית ובבדיקה יומית.

## הפעלה מקומית

```powershell
npm run algebra-z:live
npm run algebra-z:live:browser
```

ניתן לשמור ראיות מחוץ לריפו:

```powershell
node scripts/verify-algebra-z-live.mjs --browser --out=C:\Temp\algebra-z-live.json --screenshot=C:\Temp\algebra-z-live.png
```

## תנאי הצלחה

הפקודה מחזירה exit code ‏0 רק כאשר כל הבדיקות עברו. דוח JSON כולל את ה־URLs שנבדקו, נתוני ה־PDF, תוצאות הדפדפן ורשימת שגיאות מדויקת.