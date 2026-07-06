# PROJECT_MEMORY — Parabula Next

_Last updated: 2026-07-06_

This file is the permanent working memory for the Parabula Next repository. It records the important product decisions, user requirements, workflow rules, current technical state, and recent upgrades so future AI sessions and maintainers do not lose context.

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
