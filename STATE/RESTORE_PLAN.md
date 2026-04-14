# RESTORE PLAN — parabula-next

מטרת המסמך: להגדיר מסלול שחזור בטוח, מתועד, ולא הרסני.

## 1. מה מותר לשחזר בזהירות

### שכבות utility / infrastructure
מותר לשחזר בזהירות, לאחר בדיקה:
- `preview/`
- `STATE/`
- `meta/system-state.json`
- `meta/audit/*`
- `scripts/recovery-audit.mjs`
- `scripts/rules-sync-check.mjs`
- workflow files תחת `.github/workflows/`

### שכבות reference / backup
מקורות עזר לשחזור:
- `sources/legacy/`
- `sources/backups/`

## 2. מה אסור לשחזר אוטומטית

אין לשחזר אוטומטית בלי בדיקה ואישור מפורש:
- דפי עבודה קנוניים `עמוד-N.html`
- `styles/pages/`
- `styles/a4-base.css`
- כל קובץ שמשנה ישירות תוכן לימודי או עיצוב קנוני של דף עבודה

## 3. סדר שחזור מומלץ

1. להריץ `scripts/recovery-audit.mjs`
2. לבדוק את `meta/audit/recovery-audit.json`
3. לבדוק את `meta/audit/rules-sync-check.json`
4. לוודא האם החסר הוא בשכבת utility / state / workflow או בשכבת content קנונית
5. רק אם מדובר בשכבת utility/state, לשחזר ממקורות עזר
6. אם מדובר בדפי עבודה קנוניים, לעצור ולבדוק ידנית לפני כל שחזור

## 4. כלל ברזל

שחזור לא נועד למחוק היסטוריה, לאחד נושאים, או “לנקות” את הריפו.
שחזור נועד להחזיר שכבות תפעוליות/תיעודיות חסרות בלי לפגוע בדפי העבודה עצמם.

## 5. המשך עתידי

אפשר בעתיד להוסיף workflow או סקריפט restore חכם, אבל רק אם הוא:
- לא נוגע אוטומטית בדפי העבודה הקנוניים
- מתועד מראש ב-`PROJECT_RULES.md`
- מדווח בדיוק מה הוא שחזר
