# Page 01 Audit — Equations

_Last updated: 2026-05-27_

## Identity

- Topic: `משוואות`
- Excluded topic: `משוואות ריבועיות`
- Topic-local page: 1 / 54
- Root page file: `עמוד-95.html`
- Page CSS file: `styles/pages/עמוד-95.css`
- Shared family CSS: `styles/topics/equations.css`
- Source PDF candidate: `sources/legacy/parabula-old/sources/משוואות.pdf`

## Current truth

Page 1 is no longer an SVG-only pilot.

Current `עמוד-95.html` is an HTML-live worksheet page with:

- 12 exercise rows.
- 12 answer areas.
- MathJax inline notation.
- A `worksheet-card` container.
- Two equation columns: `equation-list-right` and `equation-list-left`.
- Source metadata on the worksheet and on each exercise.
- All 12 exercises still marked `data-correction="existing-content-preserved"`.

This means page 1 is structurally improved, but it is still not fully source-verified.

## Current exercise list from HTML

1. `31 = 6 + x`
2. `10 = 6 + x`
3. `8 = 4 + x`
4. `14 = 8 + x`
5. `10 + x = 10`
6. `6 + x = 6.5`
7. `4 + x = 24`
8. `4 + x = \square`
9. `55 = 5 + x`
10. `16 + x = 32`
11. `20 + x = 100`
12. `2 + x = 81`

## Current blockers

### Source verification blocker

The page must not be marked fully `verified` until the 12 equations above are checked against the real source PDF.

Special attention:

- `4 + x = \square` must not be changed, removed, or marked verified without source proof.

### Visual verification blocker

The page still requires visual confirmation in the canonical preview/print flow:

- Browser preview.
- Mobile preview if relevant.
- Print / Save as PDF.

## Current automated protection

The following automation now protects page 1 and the first-three-pages flow:

- `scripts/validate-equations-page1-source-lock.mjs`
  - verifies 12 exercises and 12 answer areas;
  - requires the source PDF to exist and be non-empty;
  - blocks fully verified status when `4 + x = \square` exists without a source-verification marker.
- `scripts/validate-equations-first3-readiness.mjs`
  - checks the first-three-pages order and page-specific readiness rules.
- `.github/workflows/equations-guard.yml`
  - runs the relevant validations automatically;
  - can also run manually through `workflow_dispatch`.

## Operational decision

- Do not rebuild page 1 from scratch.
- Do not mark page 1 as `verified` yet.
- Do not alter mathematical content until source proof exists.
- Continue using page 1 as the HTML-live pilot for the equations cleanup process.

## Next required action

1. Verify the 12 listed equations against `sources/legacy/parabula-old/sources/משוואות.pdf`.
2. If the source confirms all items, create `STATE/EQUATIONS_PAGE_1_SOURCE_VERIFICATION.md` with `PAGE_1_SOURCE_VERIFIED=YES`.
3. Only after that, page 1 may be considered for changing `existing-content-preserved` to `verified`.
4. If source proof is not available, keep the current preserved status.

## Current progress

- Page 1 structurally improved: yes.
- Page 1 source-verified: no.
- Page 1 final approval: no.
