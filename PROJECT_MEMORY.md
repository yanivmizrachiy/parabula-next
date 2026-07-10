# PROJECT_MEMORY — Parabula Next

_Last updated: 2026-07-10_

This file is the permanent working memory for the Parabula Next repository. It records the important product decisions, user requirements, workflow rules, current technical state, and recent upgrades so future AI sessions and maintainers do not lose context.

---

## 0. הדרישות של יניב — תמצית מחייבת (עברית)

זהו קובץ הזיכרון החכם של הפרויקט. כל סשן AI חייב לקרוא את הסעיף הזה קודם. אם יש סתירה — `PROJECT_RULES.md` גובר.

### מהות המוצר
1. **המוצר הוא דפי עבודה במתמטיקה להדפסה ב-A4** — עברית RTL, איכות ספר לימוד. לא אתר, לא אפליקציה. התצוגות (נייח/נייד/catalog) הן שכבות תמיכה בלבד.
2. A4 מדויק: **210mm × 297mm**, `overflow: hidden` במסך, `visible` בהדפסה. לעולם לא `overflow: auto`.
3. המערכת חייבת להתרחב ל**מאות ואלפי דפים** — הכול topic-first: קודם נושא, ואז דפי הנושא בלבד.
4. יעד: ספר/חוברת דיגיטלית נוחה — דפדוף, חיפוש (נושא/כיתה/מיומנות), הדפסה קלה של דף או חוברת.

### כללי עיצוב דפים (בכל דף חדש)
5. **אפס CSS מוטמע** — אין `<style>` ואין `style="..."` בשום מקום. כל עיצוב דף ב-`styles/pages/עמוד-N.css` בלבד.
6. MathJax: `\(...\)` inline, `$$...$$` display. **אסור `$...$`**. שורשים כפולים כ-`\(x_1\), \(x_2\)` עם סוגריים נכונים לזוגות.
7. גרפיקה **וקטורית בלבד** (SVG inline) — לא צילומי מסך, לא raster. כל stroke עם `vector-effect: non-scaling-stroke`. מערכת צירים: 440px × 440px, grid 22px.
8. RTL בכל מקום; LTR רק דרך CSS (`direction: ltr; unicode-bidi: isolate`). מספרים שליליים בסדר מתמטי נכון ("מינוס 4", לא "4 מינוס").
9. `page-number` = מספר בתוך הנושא (לא מספר הקובץ). עיצוב ה-badge אחיד בכל הפרויקט — לא לדרוס אותו ב-CSS של דף.
10. תוכן הדף חייב לנצל את כל שטח ה-A4 — בלי אזורים ריקים גדולים; בלוקי תרגילים מופרדים ברווח לבן; פתרונות בתחתית פרוסים על כל רוחב השורה.

### קבצים מוגנים — לא לגעת בלי אישור מפורש של יניב
11. `עמוד-N.html` (תוכן חינוכי), `styles/a4-base.css`, סיווגי נושאים, `sources/legacy/*`, `sources/backups/*`, `STATE/backup_*`, `meta/backup/*`.
12. אסור: `git add .`, force push, מחיקת legacy/גיבויים בלי ראיות ואישור, demo content, כפתורים מזויפים, placeholder UI, שכתוב של מה שעובד.

### תהליך עבודה
13. **לימוד → כללים → תוכנית → ביצוע קטן → בדיקה → תיעוד.** אחרי כל שינוי: `npm test` + `npm run verify` (מלא: `npm run ci:all`, מקסימום: `npm run tech:max`).
14. כל שינוי ב-`meta/topics.json` מחייב `npm run topics:sync` (נאכף אוטומטית ב-CI דרך `topics:check`).
15. עדכון מסמכי זיכרון: כל שינוי מהותי מתועד ב-`PROJECT_MEMORY.md` + `STATE/LIVE_STATUS.md`. CLAUDE.md ו-PROJECT_RULES.md חייבים להישאר מסונכרנים עם המציאות.
16. **GitHub (origin/main) הוא מקור האמת** — התיקייה המקומית `C:\Users\yaniv\parabula-next` מסונכרנת אליו.

### מפה מדויקת — מה קיים בפרויקט (נכון ל-2026-07-10)
- **תוכן:** 98 דפי `עמוד-N.html` בשורש, 8 נושאים, CSS-לדף תחת `styles/pages/`, בסיס `styles/a4-base.css`, CSS-לנושא תחת `styles/topics/`, נכסי SVG של משוואות תחת `pages/משוואות/assets/`.
- **מטא-דאטה:** `meta/topics.json` (מקור אמת) → ראי `mobile-topics.json` (מסונכרן ע"י `npm run topics:sync`, נאכף ב-CI) → `meta/pages.json` (מיוצר, לא בקומיט).
- **גישה:** `index.html` (כניסה חכמה) → `catalog.html` (נייח) / `mobile-app.html` (נייד, PWA). `preview/` = סביבת עבודה מקומית (פורט 5179). `preview/phone.*` = legacy בלבד.
- **טכנולוגיות:** HTML סטטי + CSS + SVG inline + MathJax 3 (CDN) + גופן Rubik (CDN) | Vite 8 build | Node 22 ESM scripts | Playwright (אודיט חזותי + PDF) | GitHub Actions → GitHub Pages (מ-`dist/` בלבד) | Vercel (vercel.json) | PowerShell לאוטומציה מקומית.
- **שערי איכות:** `npm test` (99 בדיקות חוזה) · `npm run verify` · `npm run validate:meta` · `npm run topics:check` · `npm run health:report` · `npm run doctor` (6 בדיקות) · `npm run ci:all` · `npm run tech:max` (+ אודיט A4 חזותי + PDF).
- **איך יוצרים דף חדש:** לפי `docs/WORKSHEET_CREATION_RULES.md` (מבנה HTML מחייב, CSS scoped ל-`.page-N`, MathJax, SVG, עדכון topics.json, topics:sync, בדיקות). מדריך מלא בעברית — `WORKSHEET_AUTHORING_GUIDE.md` (מגיע עם מיזוג PR #28). כלי עזר: `npm run page:new`.

### סגנון עבודה מול יניב
17. תקשורת בעברית. יניב מצפה לביצוע עצמאי מקצה לקצה ("אל תעצור עד לסיום") — לא הסברים בלי ביצוע.
18. יניב מביא חומרי לימוד (PDF/תמונות/טקסט); ה-AI ממיר אותם לדפי HTML מאורגנים לפי הכללים למעלה ומוסיף למערכת (דף + CSS + עדכון topics.json + סנכרון + בדיקות).
19. דוחות התקדמות בעבודה רב-שלבית כוללים `נותרו X% לסיום.`
20. ב-2026-07-10 יניב העניק הרשאות עבודה מלאות לסבב שיפור-וארגון, כולל פרסום ל-GitHub, בתנאי מוחלט: לא לקלקל שום דבר עובד.

---

## 1. User intent and working style

- Yaniv wants a long-term, professional system for Hebrew RTL math worksheets.
- The system should let Yaniv do minimum manual work while the repo automation does maximum validation and protection.
- Work style: practical, automatic, PowerShell-friendly, GitHub-based, and safe.
- Preferred local path: `C:\Users\yaniv\parabula-next`.
- Preferred commands: one strong PowerShell command/script when possible.
- Avoid fake/demo content. Every page, topic, link, test, and report should be real.
- Do not make broad destructive changes without explicit approval.
- Preserve backups and legacy material until its role is mapped and approved for cleanup.
- Yaniv wants the project to stay permanently deployable from GitHub to both GitHub Pages and Vercel.

---

## 2. Product definition

Parabula Next is a self-validating Hebrew RTL A4 digital textbook and worksheet system for mathematics.

Primary product:

- Printable A4 worksheet pages.
- Each canonical worksheet is a root file named `עמוד-N.html`.
- Each worksheet has page CSS under `styles/pages/עמוד-N.css`.
- Shared A4 print foundation is `styles/a4-base.css`.
- Math rendering uses MathJax.
- Diagrams use SVG.
- Layout must preserve RTL and high-quality print output.

The project is not primarily a heavy web app. It is a printable A4 worksheet library with digital navigation, preview, print, PDF, and quality gates around it.

---

## 3. Current verified state

As of the latest verified run:

- Root worksheet HTML files: 98.
- Page CSS files: 98.
- Topics: 8.
- Tests: 99 passed, 0 failed.
- `verify`: passed.
- `validate:meta`: passed.
- `health:report`: passed.
- `build`: passed.
- Playwright A4 visual audit: passed for all 98 pages.
- PDF sample export: passed for pages 1, 9, 31, 42, 95, 96, 97, 98.

Current topics:

- גיאומטריה: 2 pages.
- פילוג מורחב: 2 pages.
- משוואות: 54 pages.
- משפט פיתגורס: 23 pages.
- סדרות וחוקיות: 4 pages.
- פונקציות: 4 pages.
- גרף עולה, יורד ושיפוע: 3 pages.
- משוואות ריבועיות: 6 pages.

---

## 4. Current technology stack

Core stack:

- Static HTML worksheet pages.
- CSS per page and shared A4 base CSS.
- SVG diagrams.
- MathJax math rendering.
- Vite build.
- GitHub Pages deployment.
- Vercel static deployment support.
- Node.js validation scripts.
- GitHub Actions deployment workflow.
- PowerShell local automation scripts.

Main page display technology:

- Root `index.html` is now a smart entry page, not a mobile-only hard redirect.
- `index.js` routes desktop users to `catalog.html` and mobile/narrow-screen users to `mobile-app.html`.
- `index.css` styles the fallback entry card and manual links without inline CSS.
- `catalog.html` is the richer desktop/topic-first reader.
- `mobile-app.html` remains the current mobile reader.
- `mobile-app.js` loads `meta/topics.json`, renders topic buttons and page cards, remembers last page/topic in `localStorage`, and displays the selected worksheet inside an iframe.
- `mobile-app.css` controls the mobile-reader layout, bottom navigation, topic panel, page cards, and iframe container.
- `sw.js` is registered by `mobile-app.js` for the PWA/service-worker layer.

Recent advanced additions:

- Playwright via `@playwright/test`.
- `scripts/a4-visual-audit.mjs` for browser-based A4 visual and overflow audit.
- `scripts/export-pdf-sample.mjs` for Chromium PDF export of important sample pages.
- `npm run tech:max` for consolidated maximum validation: core CI + A4 visual audit + PDF sample export.

Vercel deployment support:

- `vercel.json` declares Vercel deployment settings.
- Vercel output directory is `dist`.
- Vercel build command currently runs `npm run build`.
- `postbuild` runs `scripts/copy-static-site.mjs`, so the static worksheet files, metadata, styles, preview files, and app files are copied into `dist` after Vite builds.
- One-time Vercel dashboard/GitHub import may still be required outside the repo. After that, each push to GitHub can trigger a Vercel deployment.

---

## 5. Important commands

Full local bootstrap sync from GitHub raw script:

```powershell
$u="https://raw.githubusercontent.com/yanivmizrachiy/parabula-next/main/scripts/bootstrap-local-sync.ps1"; $p="$env:TEMP\bootstrap-local-sync.ps1"; Invoke-WebRequest $u -OutFile $p; powershell -ExecutionPolicy Bypass -File $p
```

Strong validation after editing pages:

```powershell
Set-Location "C:\Users\yaniv\parabula-next"; git pull --ff-only; npm run tech:max; powershell -ExecutionPolicy Bypass -File ".\scripts\clean-local-generated.ps1"; git status --short
```

Core validation only:

```powershell
Set-Location "C:\Users\yaniv\parabula-next"; npm run ci:all
```

Vercel-ready local build:

```powershell
Set-Location "C:\Users\yaniv\parabula-next"; npm run build
```

Preview server:

```powershell
Set-Location "C:\Users\yaniv\parabula-next"; npm run preview
```

---

## 6. Canonical files and responsibilities

Primary source of truth:

- `PROJECT_RULES.md` — non-negotiable product and repo rules.
- `PROJECT_MEMORY.md` — permanent working memory and user requirements.
- `STATE/LIVE_STATUS.md` — short current status snapshot.
- `STATE/PROJECT_CONTINUITY.md` — continuity between AI sessions.
- `CLAUDE.md` — entry file for Claude Code.

Content and layout:

- `עמוד-N.html` — canonical worksheet content.
- `styles/pages/עמוד-N.css` — page-specific styling.
- `styles/a4-base.css` — immutable A4 foundation.
- `styles/topics/*.css` — shared topic styling where relevant.

Metadata and catalog:

- `meta/topics.json` — active metadata backbone.
- `meta/pages.json` — generated metadata registry, not hand-edited.
- `catalog.html`, `catalog.css`, `catalog.js` — digital textbook catalog layer.

Preview and mobile:

- `index.html`, `index.js`, `index.css` — smart root entry: desktop to catalog, mobile to mobile reader.
- `mobile-app.*` — current main mobile reader and canonical mobile reader layer.
- `preview/index.html` — canonical preview reader.
- `preview/server.mjs` — local preview server.
- `preview/print.html` / print scripts — print surface.
- `preview/phone.*` — compatibility / legacy-adjacent, not canonical.

Automation:

- `scripts/bootstrap-local-sync.ps1` — strong sync from origin/main.
- `scripts/sync-main-and-check.ps1` — local sync and validation.
- `scripts/clean-local-generated.ps1` — clean generated local outputs.
- `scripts/repo-health-report.mjs` — repo health report.
- `scripts/a4-visual-audit.mjs` — Playwright A4 audit.
- `scripts/export-pdf-sample.mjs` — PDF sample export.
- `scripts/copy-static-site.mjs` — copies static app/worksheet assets into `dist` for static hosting providers such as Vercel.
- `vercel.json` — Vercel static deployment configuration.

---

## 7. Protected / no-touch rules

Do not modify without explicit user instruction:

- Educational content inside `עמוד-N.html`.
- Existing worksheet classification between topics.
- `styles/a4-base.css`.
- Backups under `sources/backups/*`.
- Legacy material under `sources/legacy/*`.
- `STATE/backup_*`.
- `meta/backup/*`.

Generated outputs should not be committed unless explicitly required:

- `dist/`.
- `meta/pages.json`.
- `STATE/reports/a4-visual-audit/`.
- `STATE/reports/pdf-export/`.
- `playwright-report/`.
- `test-results/`.

---

## 8. Page creation and editing workflow

When adding or editing a worksheet:

1. Work on a branch unless the change is pure documentation or an approved direct change.
2. Add or edit `עמוד-N.html` only when the user explicitly asks to edit worksheet content.
3. Add or edit `styles/pages/עמוד-N.css` for page design.
4. Update `meta/topics.json` when adding a page or changing metadata.
5. Run `npm run tech:max`.
6. Run `scripts/clean-local-generated.ps1`.
7. Confirm `git status --short` is clean except intended source changes.
8. Commit and push.
9. Open PR for meaningful changes.
10. Merge only after validation passes.

---

## 9. Design requirements

- A4 is exact: 210mm × 297mm.
- Do not use inline CSS in worksheet pages.
- Do not use `overflow: auto` to hide layout problems.
- Preserve RTL everywhere.
- MathJax delimiters: inline `\( ... \)`, display `$$ ... $$`.
- Do not use `$...$` math delimiters.
- SVG strokes should be non-scaling where relevant.
- Geometry diagrams must be clean, printable, high contrast, and label-safe.
- Page-specific design must live in page CSS.
- Printable result is more important than flashy web behavior.

---

## 10. Recent completed upgrades

- Project moved from 95 pages / 7 topics to 98 pages / 8 topics.
- Added topic: `גרף עולה, יורד ושיפוע`.
- Added pages: `עמוד-96.html`, `עמוד-97.html`, `עמוד-98.html`.
- Added topic CSS: `styles/topics/graph-slope.css`.
- Added metadata generator: `scripts/generate-pages-registry.mjs`.
- Added metadata schema validation: `scripts/validate-meta-schema.mjs`.
- Strengthened `ci:all`.
- Added `scripts/repo-health-report.mjs`.
- Added local generated cleanup scripts.
- Added bootstrap sync scripts.
- Added Playwright A4 visual audit.
- Added PDF sample export.
- Merged PR #26: `tech: add Playwright A4 visual audit and PDF export pipeline`.
- Added Vercel static deployment support with `vercel.json` and `scripts/copy-static-site.mjs`.
- Added smart root entry with `index.html`, `index.js`, and `index.css`.
- Recorded main page display technology and Vercel sync requirement in `PROJECT_MEMORY.md`.

2026-07-10 comprehensive cleanup (all removals recoverable from git history):

- Removed dead Next.js remnants: `next.config.js`, `next-env.d.ts`, `tsconfig.json`, and the orphaned Next dashboard (`app/`, `components/`, `lib/`, `server/`) — it could not run (next/react were never in package.json) and contradicted the no-Next-migration decision. `storage/` was kept.
- Removed the stale `docs/` static site mirror (95-page copy frozen at 2026-05-28); the six real documentation `.md` files in `docs/` were kept. GitHub Pages deploys only from `dist/` via Actions — the `/docs` mirror rule in PROJECT_RULES §25 was updated accordingly.
- Removed dead Vite scaffold (`main.js`, `style.css`), orphaned `redirects.json`, placeholder workflow `.github/workflows/pages.yml`, and a dangling gitlink `_stray_parabula_next_20260415_120247`.
- Re-synced `mobile-topics.json` from `meta/topics.json` (was frozen at 6 topics / 95 pages; now 8 / 98). The runtime no longer reads it (`mobile-app.js` reads `meta/topics.json`), but deploy and `validate:mobile` still reference it — copy it again on every topics.json change until it is fully retired.
- Fixed deploy gap: `pages/משוואות/assets/*.svg` (embedded by עמוד-42+) is now copied into `dist/` by both `scripts/copy-static-site.mjs` and `deploy-pages.yml`; those images were broken on the live site before.
- Fixed `scripts/new-page.mjs` and `scripts/preview-check.mjs`: ported from missing puppeteer to the installed Playwright, and replaced the nonexistent `/api/toc` endpoint with reading `meta/topics.json` directly. Both now load and run.
- Aligned `scripts/app-layer-check.mjs` with current reality (app.html → topics.html redirect; phone.html → mobile-app.html redirect). `node scripts/doctor.mjs` is fully green again.
- Extracted the inline `<style>` block from `preview/index.html` into `preview/reader.css` (no-inline-CSS rule).

2026-07-10 improvement round 2 (expert pass with full permissions from Yaniv):

- Added `scripts/sync-mobile-topics.mjs` + `npm run topics:sync` / `topics:check`; the check gates `ci:all` and the deploy workflow — the mirror can never silently diverge again.
- Added `npm run doctor` alias for `node scripts/doctor.mjs`.
- Moved the repudiated prototype `עמוד-95-editable.html` + `styles/pages/עמוד-95-editable.css` into `STATE/internal-drafts/` (the documented decision in `STATE/EQUATIONS_PUBLIC_CLEANUP_STATUS.md` said this should have happened; the file was even shipping to the live site via the copy wildcard). Retired the contradictory `scripts/validate-page-95-editable.mjs` and its npm script/suite entry.
- Updated `validate:equations:public-clean` to assert page 95's achieved final state (live HTML/MathJax worksheet, no `<img class="pdf-page">` source) instead of the obsolete temporary-overlay era requirements. It passes again.
- Added section 0 to this file: the binding Hebrew summary of all of Yaniv's requirements.

Content issues surfaced on 2026-07-10 that require Yaniv's decision (protected files, NOT touched):

- ~33 equations pages (עמוד-62 … עמוד-94) embed `<img class="pdf-page">` raster images that overflow ~29px above the A4 top edge (detected by the ported preview-check guardrail). Raster images also conflict with the vector-only graphics rule.
- Topic-name mismatch: `עמוד-36.html` nav-meta says "משוואה ריבועית" while `meta/topics.json` names the topic "משוואות ריבועיות" — this makes `page:new` fail its resolve step.

---

## 11. Known future improvements

Highest-value next upgrades:

- TypeScript for scripts and metadata tooling.
- Strong schema validation with a real schema library.
- Full PDF export per topic and all pages.
- Visual snapshot baselines for important pages.
- More robust GitHub Actions workflow for `npm run tech:max`.
- Better page generator that creates HTML + CSS + metadata safely.
- Content-authoring assistant for new worksheet pages.
- Mobile reader verification on a real phone.
- Improve the desktop catalog UI further only when it helps real navigation, search, print, or page authoring.
- Vercel project import/linking in the Vercel dashboard, if not already done.

Do not migrate the whole project to Next.js or Astro unless there is a clear benefit and migration plan. The current static Vite architecture is appropriate for printable A4 worksheet delivery.

---

## 12. How future AI sessions should begin

Before making changes, read:

1. `PROJECT_RULES.md`.
2. `PROJECT_MEMORY.md`.
3. `STATE/LIVE_STATUS.md`.
4. `STATE/PROJECT_CONTINUITY.md`.
5. `CLAUDE.md` if working with Claude Code.

Then verify the current repo state before changing files.

---

## 13. Interpretation rule

If old documentation says 95 pages or 7 topics, treat it as outdated unless current checks prove otherwise. The current verified state is 98 pages and 8 topics.

If there is a contradiction:

1. `PROJECT_RULES.md` controls non-negotiable product rules.
2. `PROJECT_MEMORY.md` controls long-term working memory and user preferences.
3. `STATE/LIVE_STATUS.md` controls current short status.
4. Live validation output controls factual counts.
