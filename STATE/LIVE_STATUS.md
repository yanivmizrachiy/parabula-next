# LIVE_STATUS — parabula-next

_Last updated: 2026-04-27_

## Purpose
This file is a short, non-historical snapshot of the **live canonical state** of the repository.
It exists to reduce ambiguity between canonical, active-but-needs-alignment, legacy, and duplicated layers.

This file does **not** replace `PROJECT_RULES.md`.
`PROJECT_RULES.md` remains the repository source of truth.

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
- Active metadata backbone: `meta/topics.json`
- Canonical mobile worksheet reader: `mobile-app.html`
- Canonical mobile reader logic: `mobile-app.js`
- Canonical mobile reader styles: `mobile-app.css`

---

## Canonical mobile direction

- The dedicated mobile worksheet app is `mobile-app.*`.
- The mobile reader remains **iframe-based by design**.
- Root A4 worksheet pages remain the single source of truth for worksheet content.
- Mobile rendering fixes must happen in the mobile reader layer, not by duplicating or forking worksheet pages.
- Mobile prev/next now follows the global book order, while topic entry still opens from the first page of the chosen topic.
- Mobile PDF now hands off into `preview/print.html` for preview-before-print instead of jumping straight to a raw worksheet page.
- The mobile reader now resolves worksheet pages on the current repository origin, so local preview and the published site use the same reader logic safely.
- Real-device phone validation found that width-first enlargement improved readability but still left right-edge worksheet content too fragile/clipped for approval.
- The mobile reader now exposes explicit `עמוד מלא` / `קריאה מוגדלת` modes, with a dedicated anti-clipping stage/canvas wrapper inside the iframe.
- In `עמוד מלא`, the reader keeps the entire A4 width visible without unexpected right-edge clipping.
- In `קריאה מוגדלת`, the reader intentionally allows internal pan/scroll and explains that behavior to the user instead of silently hiding right-side content.
- `mobile-app-install.html` is now top-aligned and no longer leaves a giant empty gray field below the main install card.
- The topic chip strip was tightened for real-phone usability instead of staying as a crowded wrap-constrained row.
- `preview/phone.*` is compatibility / legacy-adjacent, not the canonical mobile runtime.

---

## Active but needs alignment
- `STATE/README.md`
- `STATE/PROJECT_CONTINUITY.md`
- `preview/README.md`
- `preview/APP_CONTRACT.md`
- `meta/system-state.json`
- `storage/system-state.json`

These files are live and useful, but may still require wording and structural alignment with the canonical snapshot above.

---

## Recently aligned / verified
- `mobile-topics.json` was realigned to `meta/topics.json` so distinct topics remain distinct.
- `scripts/app-layer-check.mjs` now reflects the current canonical-vs-compat mobile architecture.
- `scripts/validate-mobile-runtime.mjs` now checks preview-before-print handoff, book-order navigation, and URL-driven print selection.
- The stray empty gitlink `_stray_parabula_next_20260415_120247` was removed because it was breaking checkout/deployment workflows.
- Live second-pass checks confirmed cross-topic next/previous behavior, explicit print handoff context, and improved install-page layout.

---

## Duplicated or legacy-adjacent

### Print layer
- Canonical active print entry: `preview/print.js`
- Known duplicate / legacy-adjacent file: `preview/print-center.js`

### Mobile / phone layer
- Canonical mobile app layer: `mobile-app.*`
- Compatibility / legacy-adjacent phone layer: `preview/phone.*`

This repository still contains more than one phone-oriented access surface, but they are **not equal**.
The canonical direction is `mobile-app.*`.
No destructive cleanup should happen before explicit role mapping and user approval.

---

## Legacy to preserve
- `sources/legacy/*`
- `sources/backups/*`
- `STATE/backup_*`
- `meta/backup/*`

These areas must be preserved until their exact role is fully mapped and documented.

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

---

## UX direction for future safe improvements
Future safe improvements should improve access to existing worksheets without changing worksheet source content.
The target user experience is:
- easier discovery of all pages
- better filtering by topic
- better search
- better phone reading experience
- easier print/PDF flows
- future booklet assembly from existing pages

This implies the repository should evolve toward:
1. one canonical worksheet source
2. one metadata backbone
3. one canonical mobile reader direction
4. multiple access surfaces consuming the same metadata

---

## Interpretation rule
If there is a contradiction between historical notes, backups, and the live repository behavior, prefer the **live canonical state** described here together with `PROJECT_RULES.md`, unless explicitly overridden by the user.
