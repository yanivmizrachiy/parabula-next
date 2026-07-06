# LIVE_STATUS — parabula-next

_Last updated: 2026-07-06_

This file is the short, current, non-historical snapshot of the live canonical state of the repository. It does not replace `PROJECT_RULES.md` or `PROJECT_MEMORY.md`.

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

- Preview UI: `preview/index.html`.
- Preview server: `preview/server.mjs`.
- Active metadata backbone: `meta/topics.json`.
- Generated metadata registry: `meta/pages.json`.
- Digital textbook catalog: `catalog.html`, `catalog.css`, `catalog.js`.
- Canonical mobile worksheet reader: `mobile-app.html`, `mobile-app.js`, `mobile-app.css`.

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
- Node validation scripts.
- PowerShell automation.

Quality gates:

- `npm run ci:all` — test, verify, metadata validation, health report, build.
- `npm run tech:max` — `ci:all` plus Playwright A4 visual audit plus PDF sample export.
- `scripts/a4-visual-audit.mjs` — browser-based A4 screenshot/overflow audit.
- `scripts/export-pdf-sample.mjs` — PDF export for key sample pages.
- `scripts/repo-health-report.mjs` — validates counts, duplicate page numbers, HTML presence, CSS presence.

---

## Recent completed changes

- Added permanent project memory file: `PROJECT_MEMORY.md`.
- Added pages 96–98.
- Added topic: `גרף עולה, יורד ושיפוע`.
- Added Playwright A4 visual audit.
- Added PDF sample export.
- Merged PR #26: `tech: add Playwright A4 visual audit and PDF export pipeline`.

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
