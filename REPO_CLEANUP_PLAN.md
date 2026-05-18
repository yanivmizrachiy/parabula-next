# Repo Cleanup Plan — Parabula Next

_תוכנית ניקוי וארגון. נוצר: 2026-05-18._
_אין למחוק או להזיז קבצים ללא אישור מפורש של Yaniv._
_כל מחיקה חייבת לעבור: זיהוי → אישור → ביצוע → תיעוד._

---

## כלל ברזל

```
DO NOT DELETE OR MOVE anything listed here without explicit approval from Yaniv.
This document is an AUDIT PLAN, not an execution plan.
```

---

## קטגוריה 1 — ACTIVE (לא לגעת בשום תנאי)

קבצים אלה פעילים ומוגנים לחלוטין:

| קובץ / תיקייה | סיבה |
|---|---|
| `עמוד-*.html` (95 קבצים) | תוכן חינוכי קנוני |
| `styles/a4-base.css` | בסיס A4, לא לגעת |
| `styles/pages/*.css` | CSS לדפי עבודה |
| `styles/topics/*.css` | CSS משותף לנושאים |
| `meta/topics.json` | מטא-דאטה קנוני |
| `mobile-topics.json` | עותק קנוני לנייד |
| `mobile-app.*` (5 קבצים) | אפליקציית נייד קנונית |
| `preview/index.html`, `preview/server.mjs` | Preview reader קנוני |
| `preview/topics.html`, `preview/all-pages.*` | גישה לדפים |
| `preview/print.html`, `preview/print.js` | הדפסה קנונית |
| `preview/app.html` | Hub קנוני |
| `tests/` | חוזים ובדיקות |
| `scripts/verify.mjs`, `scripts/validate-access-layer.mjs` | validation |
| `scripts/recovery-audit.mjs`, `scripts/doctor.mjs` | audit tools |
| `.github/workflows/deploy-pages.yml` | CI/CD |
| `.github/workflows/recovery-audit.yml` | CI/CD |
| `package.json` | לא לגעת |
| `PROJECT_RULES.md`, `CLAUDE.md` | source of truth |
| `.claude/` (כל התוכן) | Claude helper layer |
| `STATE/LIVE_STATUS.md` | מצב חי |
| `STATE/ARCHITECTURE_MAP.md` | מפת ריפו |
| `STATE/PROJECT_MISSION_AND_WORKFLOW.md` | מטרה ואסטרטגיה |
| `sources/legacy/*`, `sources/backups/*` | שימור ארכיון |
| `meta/backup/*` | גיבויי מטא-דאטה |

---

## קטגוריה 2 — INSPECT BEFORE CLEANING (נדרשת בדיקה לפני החלטה)

### 2a — קבצי שורש עם תפקיד לא ברור

| קובץ | מה זה | סטטוס |
|---|---|---|
| `mobile.css` | dark theme CSS — מופיע ב-preview/phone.html ועוד | **active legacy** — לא למחוק |
| `ux-polish.css` | UX polish CSS — מופיע ב-preview files | **active** — לא למחוק |
| `style.css` + `main.js` + `index.html` | Vite entry point | **active** — Vite build entry |
| `redirects.json` | URL map מ-2026-03-05 | **ישן** — בדוק אם preview/server.mjs משתמש בו |
| `rules.md` | סיכום כללים קצר | **ישן** — שקול מיזוג ל-PROJECT_RULES.md |
| `rules.html` | דף HTML של כללים (506 שורות) | **active** — מוצג בדפדפן |
| `CHANGELOG.md` | 95 bytes, כמעט ריק | **stale** — אין תועלת, שקול מחיקה |
| `icon.svg` | SVG icon | **active** — בדוק אם בשימוש |
| `sw.js` | Service Worker בשורש | **known dup** — יש גם `preview/sw.js` |
| `vite.config.js` | Vite config | **active** |

### 2b — תיקיות שורש עם סטטוס לא ברור

| תיקייה | מה יש שם | סטטוס מוצע |
|---|---|---|
| `app/` | Next.js automation app עם layout.tsx, page.tsx, automations/, n8n/, openai/ | **candidate for archive** — זה לא חלק מ-parabula, תהליך עבודה נפרד שהיה ב-repo |
| `components/` | Next.js components (actions/, cards/) — משמשים את app/ | **candidate for archive** — קשור ל-app/ |
| `lib/` | Next.js lib (state/, types/) | **candidate for archive** — קשור ל-app/ |
| `server/` | `index.js` אחד | **candidate for archive** — בדוק אם בשימוש |
| `storage/` | `audit-log.jsonl`, `system-state.json` | **candidate for archive** — data ישן |
| `_stray_parabula_next_20260415_120247/` | `assets/`, `editable/` — תיקייה זמנית מ-April 2026 | **candidate for deletion** — stray temp dir |
| `tools/` | PowerShell + Python scripts | **inspect** — חלקם אולי עדיין נדרשים |
| `pages/` | `משוואות/` topic directory | **active** — topic pages (ראה PROJECT_RULES.md 3.1) |
| `dist/` | Vite build output | **build output** — אין לגעת |
| `docs/` | GitHub Pages deploy output + `docs/next-session.md` stale file | **build output** — `docs/next-session.md` stale |

### 2c — קבצי Next.js artifacts (פרויקט עבר ל-Vite)

| קובץ | סטטוס |
|---|---|
| `next.config.js` | Next.js config — פרויקט עבר ל-Vite. **candidate for archive** |
| `next-env.d.ts` | Next.js TypeScript env — **candidate for archive** |
| `tsconfig.json` | TypeScript config — בדוק אם Vite משתמש בו |

---

## קטגוריה 3 — STATE/ היסטורי (לשמור, לא לנקות ללא אישור)

STATE/ מכיל קבצים היסטוריים רבים. המחולקים:

### 3a — קבצים חיים ב-STATE/ (לא לגעת)
```
STATE/LIVE_STATUS.md
STATE/ARCHITECTURE_MAP.md
STATE/PROJECT_MISSION_AND_WORKFLOW.md
STATE/PROJECT_CONTINUITY.md
STATE/CLAUDE_LAYER_STATUS.md
STATE/RESTORE_PLAN.md
STATE/EQUATIONS_DESIGN_PASS_RULES.md
STATE/EQUATIONS_DESIGN_PASS_APPLIED.md
STATE/EQUATIONS_APP_STATUS.md
```

### 3b — קבצים היסטוריים ב-STATE/ (לשמור, אין דחיפות לניקוי)
כל הקבצים הבאים הם תיעוד היסטורי שניתן לשמור כ-ארכיון פנימי.
**אין למחוק ללא אישור Yaniv** — הם מספקים הקשר לעבודה שנעשתה.
```
STATE/MOBILE_APP_*.md (10+ קבצים מ-April 2026)
STATE/EQUATIONS_*.md/json (6+ קבצים)
STATE/FULL_SYSTEM_AUDIT_*.md/json
STATE/CHANGELOG_2026_04_14*.md
STATE/MASTER_*.md/json
STATE/MEGA_REPO_AUDIT.md
STATE/backup_* (4+ subdirs)
STATE/mobile_* (5+ subdirs)
STATE/release_backup_* (subdirs)
STATE/final_reader_compact_*/
STATE/focus_reader_*/
STATE/a4_fullfit_*/
STATE/a4fit_backup_*/
STATE/ui_cleanup_*/
STATE/runtime-fix-backups/
STATE/mobile_release_backups_*/
STATE/audit_backup_*/
STATE/validation_backup_*/
STATE/live_ux_backup_*/
STATE/all_pages_backup_*/
STATE/print_ux_backup_*/
STATE/*.bak, *.txt, *.patch, *.sh (loose files)
```

### 3c — קבצי STATE/ לבדיקה
```
STATE/EXTERNAL_LINK_AUDIT.md/json — ישן? לבדוק רלוונטיות
STATE/LIVE_MAIN_SNAPSHOT.json — מ-2026-03-22, אולי מיושן
STATE/auto_write_probe.txt — probe file, ניתן למחיקה
STATE/pages_rebuild_touch.txt — temp file, ניתן למחיקה
STATE/mobile_release_current.txt — ישן
STATE/PUBLISH_DOCS_PAGES_parabula-next.txt — ישן
STATE/docs_publish_report.txt — ישן
STATE/MOBILE_APP_PUBLISH_parabula-next.json — ישן
```

---

## קטגוריה 4 — scripts/ — מיפוי מצב

| סקריפט | סטטוס |
|---|---|
| `verify.mjs`, `validate-access-layer.mjs` | **active** |
| `recovery-audit.mjs`, `doctor.mjs` | **active** |
| `validate-equations-design-pass-strict.mjs` | **active** |
| `new-page.mjs` | **broken** — קורא ל-/api/toc שלא קיים |
| `validate-equations-suite.mjs` | **active** |
| `validate-mobile-runtime.mjs` | **active** |
| `apply-equations-design-pass.mjs` | **one-time** — כבר הופעל |
| `upgrade-mobile-app.mjs` | **one-time** — כבר הופעל |
| `generate-system-state.mjs`, `generate-system-state-auto.mjs` | **unclear** — כפילות? |
| `ship_mobile_release.sh` | **operational** — לבדוק אם עדיין נדרש |
| `strict-preview-cleanup.mjs` | **unclear** |
| `duplicate-audit.mjs` | **audit tool** |
| `worksheet-intake-guard.mjs` | **active** — ב-workflow |

---

## קטגוריה 5 — .github/workflows/ — מיפוי מצב

| workflow | סטטוס |
|---|---|
| `deploy-pages.yml` | **active** — CI/CD ראשי |
| `recovery-audit.yml` | **active** |
| `preview-guard.yml` | **active** |
| `repository-health.yml` | **active** |
| `equations-app-validation.yml` | **active** |
| `worksheet-intake-guard.yml` | **active** |
| `pages.yml` | **active** — GitHub Pages |
| `strict-preview-cleanup.yml`, `strict-preview-cleanup-force.yml` | **unclear** — בדוק אם פעיל |
| `apply-equations-design-pass.yml` | **one-time** — כבר הופעל |
| `audit-equations-svg-captions.yml` | **audit** |
| `sync-equations-rules-section.yml` | **sync** |
| `system-state-generation.yml` | **unclear** |
| `preview-health.yml` | **active** |

---

## סדר ביצוע מוצע (כשיאושר)

### שלב 1 — בדיקה (ללא מחיקה)
1. בדוק אם `app/`, `components/`, `lib/` מוזכרים בקובץ כלשהו מחוץ לעצמם
2. בדוק אם `next.config.js` משפיע על Vite build
3. בדוק אם `tsconfig.json` משפיע על Vite
4. בדוק אם `storage/system-state.json` מוגדר בקוד חי
5. בדוק אם `_stray_parabula_next_20260415_120247/` ריק לחלוטין

### שלב 2 — אישור Yaniv
לפני כל שלב ביצוע — דיון ואישור מפורש.

### שלב 3 — ביצוע מבוקר
- archive ל-`sources/legacy/` לפני מחיקה
- commit עם תיאור ברור
- בדיקת CI לאחר כל שלב

---

## איך להשתמש במסמך זה

- `/hygiene` — הפעל audit על הריפו ופרש ממצאים
- כל ממצא חדש → עדכן מסמך זה
- כל אישור מ-Yaniv → סמן "approved" ועבור לשלב 3

---

_נוצר: 2026-05-18 | עדכן כשממצאים מתווספים או כשניקוי מאושר_
