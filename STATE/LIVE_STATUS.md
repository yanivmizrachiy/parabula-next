# LIVE_STATUS — parabula-next

_Last updated: 2026-04-23_

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

---

## Active but needs alignment
- `STATE/README.md`
- `STATE/PROJECT_CONTINUITY.md`
- `preview/README.md`
- `preview/APP_CONTRACT.md`
- `meta/system-state.json`
- `mobile-topics.json`
- `storage/system-state.json`

These files are live and useful, but may still require wording and structural alignment with the canonical snapshot above.

---

## Duplicated or conflicting

### Print layer
- Canonical active print entry: `preview/print.js`
- Known duplicate / legacy-adjacent file: `preview/print-center.js`

### Mobile / phone layer
- Live mobile app layer exists: `mobile-app.*`
- Live preview phone layer also exists: `preview/phone.*`

This means the repository currently contains more than one access path for mobile/phone usage and must be treated carefully.
No destructive cleanup should happen before explicit alignment.

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
- easier print/PDF flows
- future booklet assembly from existing pages

This implies the repository should evolve toward:
1. one canonical worksheet source
2. one metadata backbone
3. multiple access surfaces consuming the same metadata

---

## Interpretation rule
If there is a contradiction between historical notes, backups, and the live repository behavior, prefer the **live canonical state** described here together with `PROJECT_RULES.md`, unless explicitly overridden by the user.
