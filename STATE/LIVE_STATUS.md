# LIVE_STATUS — parabula-next

_Last updated: 2026-07-10_

This file is the short current snapshot of the live canonical state of the repository. It does not replace `PROJECT_RULES.md` or `PROJECT_MEMORY.md`.

---

## Canonical core

### Canonical worksheet source

- Root worksheet pages: `עמוד-N.html`.
- Page CSS: `styles/pages/עמוד-N.css`.
- Shared A4 base CSS: `styles/a4-base.css`.

### Canonical rules and memory

- Main source of truth: `PROJECT_RULES.md`.
- Permanent project memory: `PROJECT_MEMORY.md`.
- Claude entry file: `CLAUDE.md`.
- Continuity file: `STATE/PROJECT_CONTINUITY.md`.

### Canonical access paths

- Root entry: `index.html`, `index.js`, `index.css`.
- Root behavior: desktop opens `catalog.html`; mobile opens `mobile-app.html`.
- Desktop reader: `catalog.html`, `catalog.css`, `catalog.js`.
- Mobile reader: `mobile-app.html`, `mobile-app.js`, `mobile-app.css`.
- Preview UI: `preview/index.html`.
- Preview server: `preview/server.mjs`.
- Active metadata backbone: `meta/topics.json`.
- Generated metadata registry: `meta/pages.json`.

---

## Current verified counts

Latest verified state:

- Root worksheet pages: 98.
- Root worksheet page CSS files: 98.
- Topics: 8.
- Tests: 99 passed, 0 failed.
- `verify`: passed.
- `validate:meta`: passed.
- `health:report`: passed.
- `build`: passed.
- Playwright A4 visual audit: passed for all 98 pages.
- PDF sample export: passed for key sample pages.

Current topics:

- גיאומטריה: 2.
- פילוג מורחב: 2.
- משוואות: 54.
- משפט פיתגורס: 23.
- סדרות וחוקיות: 4.
- פונקציות: 4.
- גרף עולה, יורד ושיפוע: 3.
- משוואות ריבועיות: 6.

---

## Current technology pipeline

Core:

- Static HTML + CSS A4 pages.
- MathJax.
- SVG.
- Vite.
- GitHub Pages.
- Vercel static deployment support.
- Node validation scripts.
- PowerShell automation.

Quality gates:

- `npm run ci:all` — test, verify, metadata validation, health report, build.
- `npm run tech:max` — `ci:all` plus Playwright A4 visual audit plus PDF sample export.
- `scripts/a4-visual-audit.mjs` — browser-based A4 screenshot/overflow audit.
- `scripts/export-pdf-sample.mjs` — PDF export for key sample pages.
- `scripts/repo-health-report.mjs` — validates counts, duplicate page numbers, HTML presence, CSS presence.

Static deployment:

- `vercel.json` configures Vercel to install with `npm ci`, build with `npm run build`, and serve `dist`.
- `postbuild` copies worksheet/static assets into `dist` through `scripts/copy-static-site.mjs`.
- GitHub Pages still deploys through `.github/workflows/deploy-pages.yml`.

---

## Recent completed changes

- 2026-07-10 (improvement round 2): added `scripts/sync-mobile-topics.mjs` with `npm run topics:sync` / `topics:check`; the check now gates both `ci:all` and the deploy workflow, so the mirror can never silently diverge again. Added `npm run doctor` alias.
- 2026-07-10 (improvement round 2): moved the repudiated prototype `עמוד-95-editable.html` (+ its CSS) to `STATE/internal-drafts/` per the documented public-cleanup decision (it was being published to the live site by the copy wildcard); retired the contradictory `validate-page-95-editable.mjs`; aligned `validate:equations:public-clean` with page 95's final live-MathJax state.
- 2026-07-10 (improvement round 2): added the binding Hebrew requirements summary (section 0) to `PROJECT_MEMORY.md` — the smart memory layer for all future sessions.

- 2026-07-10 repo cleanup: removed dead Next.js remnants (`next.config.js`, `next-env.d.ts`, `tsconfig.json`, `app/`, `components/`, `lib/`, `server/`), the stale `docs/` site mirror (documentation `.md` files kept), dead Vite scaffold (`main.js`, `style.css`), orphaned `redirects.json`, placeholder workflow `pages.yml`, and a dangling gitlink `_stray_parabula_next_*`.
- 2026-07-10: `mobile-topics.json` re-synced from `meta/topics.json` (now 8 topics / 98 pages; was frozen at 6 / 95).
- 2026-07-10: deploy fix — `pages/` (equations SVG assets referenced by `עמוד-42+`) is now copied into `dist/` by both `scripts/copy-static-site.mjs` and `deploy-pages.yml`; previously those images were broken on the live site.
- 2026-07-10: `scripts/app-layer-check.mjs` aligned with current reality (`preview/app.html` redirects to `topics.html`, `preview/phone.html` redirects to `mobile-app.html`) — `node scripts/doctor.mjs` is green again.
- 2026-07-10: `preview/index.html` inline `<style>` extracted to `preview/reader.css` (no-inline-CSS rule).
- Added permanent project memory file: `PROJECT_MEMORY.md`.
- Added pages 96–98 and topic `גרף עולה, יורד ושיפוע`.
- Added Playwright A4 visual audit and PDF sample export (PR #26).
- Added Vercel static deployment support.
- Replaced mobile-only root redirect with smart root entry.

---

## No-touch guardrails

Do not modify without explicit user instruction:

- Educational worksheet content.
- Existing root worksheet pages `עמוד-N.html`.
- Existing topic classification.
- `styles/a4-base.css`.
- Backups and legacy material.

No destructive cleanup should happen before explicit role mapping and user approval.

---

## Interpretation rule

If older documentation says 95 pages or 7 topics, treat it as outdated unless current validation proves otherwise. The current verified state is 98 pages and 8 topics.
