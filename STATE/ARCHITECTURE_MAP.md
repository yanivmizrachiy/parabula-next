# ARCHITECTURE_MAP — parabula-next

מסמך זה מתאר את ההיררכיה החיה של הריפו בצורה קצרה ותפעולית.
הוא אינו מחליף את `PROJECT_RULES.md`, אלא עוזר להבין במה נוגעים ובמה לא נוגעים.

---

## 1. Canonical core — הלב שלא שוברים

### Worksheet source
- `עמוד-N.html`
- `styles/pages/עמוד-N.css`
- `styles/a4-base.css`

### Authority
- `PROJECT_RULES.md`

זהו התוכן הקנוני של הריפו.
אין לגעת בו במסגרת cleanup תיעודי / preview / mobile / print אלא אם המשתמש ביקש במפורש.

---

## 2. Metadata backbone — שכבת השליטה מעל הדפים

### Primary metadata
- `meta/topics.json`

### Supporting metadata
- `mobile-topics.json`
- `schemas/page-meta.schema.json`

שכבה זו צריכה להישאר עמוד השדרה של כל מסלולי הגישה לדפים.
Preview, print, mobile, search, filtering, and future booklet assembly should consume metadata instead of inventing parallel truth.

---

## 3. Access surfaces — ערוצי גישה לדפים

### Canonical preview
- `preview/index.html`
- `preview/server.mjs`

### Canonical print
- `preview/print.html`
- `preview/print.js`

### Canonical mobile app
- `mobile-app.html`
- `mobile-app.js`
- `mobile-app.css`
- `mobile-app.webmanifest`
- `mobile-app-install.html`
- `mobile-app-install.js`

### Mobile reader runtime contract
- The canonical mobile reader remains `mobile-app.*`.
- The canonical mobile reader remains **iframe-based**.
- The root worksheet pages remain the single worksheet source.
- Mobile fixes must happen in the reader layer, not by duplicating worksheet pages.

### Legacy / compatibility mobile path
- `preview/phone.html`
- `preview/phone.js`
- `preview/mobile.css`
- `preview/manifest.webmanifest`
- `preview/icon.svg`
- `preview/sw.js`
- `preview/install.html`

### Known duplication / legacy-adjacent utilities
- `preview/print-center.js`

---

## 4. State and control layer — שכבת מצב ותפעול

### Human-readable continuity
- `STATE/README.md`
- `STATE/LIVE_STATUS.md`
- `STATE/PROJECT_CONTINUITY.md`

### Machine-readable state
- `meta/system-state.json`
- `storage/system-state.json`
- `storage/audit-log.jsonl`

### Safety / audit
- `scripts/recovery-audit.mjs`
- `.github/workflows/recovery-audit.yml`
- `tests/contracts/root-pages.test.mjs`
- `scripts/verify.mjs`

שכבה זו מתארת מצב, בודקת, ומתעדת.
היא לא אמורה להפוך למקור תוכן מקביל לדפי העבודה.

---

## 5. Growth layer — שכבת צמיחה

- `scripts/new-page.mjs`
- `scripts/sync-rules.mjs`

זו שכבה שאמורה לעזור להוסיף דפים חדשים בלי לשבור את החוזה הקנוני.

---

## 6. Legacy / preservation layer — שכבת שימור

- `sources/legacy/*`
- `sources/backups/*`
- `STATE/backup_*`
- `meta/backup/*`

אין למחוק או לערבב שכבה זו עם ההפעלה החיה לפני מיפוי וקיבוע תפקיד.

---

## 7. Safe improvement principle

הכיוון הנכון לשיפור הריפו הוא:
1. preserve canonical worksheet source
2. strengthen metadata backbone
3. align all access surfaces to the same metadata truth
4. treat `mobile-app.*` as the canonical mobile runtime
5. improve UX for discovery, filtering, print, PDF, and strong phone reading

כלומר:
- לא משפרים את הריפו דרך שינוי דפי המקור
- משפרים את הריפו דרך חיזוק שכבת התיווך מעל הדפים

---

## 8. Immediate future target

היעד המיידי הבטוח הוא:
- יישור מלא של תיעוד חי למצב המובייל הקנוני
- חיזוק metadata כעמוד שדרה
- שיפור reader engine במובייל בלי לשכפל דפים
- שמירה על מסלולי legacy כ-compat בלבד עד החלטת cleanup מפורשת
