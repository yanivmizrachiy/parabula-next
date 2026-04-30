# LIVE_STATUS — parabula-next

_Last updated: 2026-04-29_

## Purpose
This file is a short, non-historical snapshot of the **live canonical state** of the repository.
It does not replace `PROJECT_RULES.md`; `PROJECT_RULES.md` remains the source of truth.

---

## Canonical core

### Canonical worksheet source
- Root worksheet pages: `עמוד-N.html`
- Page CSS: `styles/pages/עמוד-N.css`
- Shared A4 base CSS: `styles/a4-base.css`

### Canonical rules and contract
- Source of truth: `PROJECT_RULES.md`
- Human-readable rules page: `rules.html`

### Canonical access paths
- Preview UI: `preview/index.html`
- Preview server: `preview/server.mjs`
- Print entry: `preview/print.js`
- Dedicated equations route: `preview/equations.html`
- Dedicated equations styles: `preview/equations.css`
- Dedicated equations logic: `preview/equations.js`
- Active metadata backbone: `meta/topics.json`
- Canonical mobile worksheet reader: `mobile-app.html`
- Canonical mobile reader logic: `mobile-app.js`
- Canonical mobile reader styles: `mobile-app.css`

---

## Equations design-pass live status

The non-quadratic equations family has a real scoped design pass applied on `main`.

Verified repository facts:
- Topic: `משוואות`
- Pages covered: 54
- Quadratic-equation pages touched: 0
- Design-pass output commit: `13b017a3f93bd025b3f4f5da9c86382e2fdcb172`
- Execution report: `STATE/EQUATIONS_DESIGN_PASS_APPLIED.md`
- Design rules: `STATE/EQUATIONS_DESIGN_PASS_RULES.md`
- Design script: `scripts/apply-equations-design-pass.mjs`
- Strict guard: `scripts/validate-equations-design-pass-strict.mjs`
- Dedicated route status: `STATE/EQUATIONS_APP_STATUS.md`

Design-pass contract:
- No educational worksheet content was changed.
- No root worksheet HTML was rewritten by the design pass.
- `styles/a4-base.css` remains untouched.
- Old global equations cleanup selectors were replaced by scoped `.page-N` selectors.
- Future regressions should be caught by `npm run validate:equations:strict`.

Public routes:
- `https://yanivmizrachiy.github.io/parabula-next/preview/equations.html`
- `https://yanivmizrachiy.github.io/parabula-next/preview/print.html?topic=%D7%9E%D7%A9%D7%95%D7%95%D7%90%D7%95%D7%AA&autoselect=topic`

Remaining verification before full completion:
- real browser preview after Pages cache refresh
- phone check for clipping and comfort
- browser print / Save as PDF for equations pages
- visible green CI/status confirmation

---

## Canonical mobile direction

- The dedicated mobile worksheet app is `mobile-app.*`.
- The mobile reader remains **iframe-based by design**.
- Root A4 worksheet pages remain the single source of truth for worksheet content.
- Mobile rendering fixes must happen in the mobile reader layer, not by duplicating or forking worksheet pages.
- `preview/phone.*` is compatibility / legacy-adjacent, not the canonical mobile runtime.

---

## Duplicated or legacy-adjacent

### Print layer
- Canonical active print entry: `preview/print.js`
- Known duplicate / legacy-adjacent file: `preview/print-center.js`

### Mobile / phone layer
- Canonical mobile app layer: `mobile-app.*`
- Compatibility / legacy-adjacent phone layer: `preview/phone.*`

No destructive cleanup should happen before explicit role mapping and user approval.

---

## Legacy to preserve
- `sources/legacy/*`
- `sources/backups/*`
- `STATE/backup_*`
- `meta/backup/*`

---

## No-touch guardrails for safe improvement work
The following must **not** be modified during documentation/alignment cleanup unless explicitly requested:
- The educational content of worksheet pages
- Canonical root worksheet pages `עמוד-N.html`
- `styles/a4-base.css`
- Canonical worksheet navigation behavior
- Backups / legacy material

---

## Current verified counts
- Root worksheet pages: 95
- Root worksheet page CSS files: 95
- Non-quadratic equations pages: 54

---

## Interpretation rule
If there is a contradiction between historical notes, backups, and the live repository behavior, prefer the **live canonical state** described here together with `PROJECT_RULES.md`, unless explicitly overridden by the user.
