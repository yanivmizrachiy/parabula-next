# EQUATIONS_DESIGN_PASS_APPLIED — ParabulaNext

_Last updated: 2026-04-29_

## Applied scope

Applied a design-only cleanup to the non-quadratic equations topic:

- Topic: משוואות
- Pages covered: 54
- Quadratic-equation pages touched: 0

## What changed

For each equations page CSS file, the pass:

- removed legacy global equations cleanup overrides where present
- avoided global selectors such as `.header-container`, `.page-title`, and `body,html,.a4-page`
- preserved page-local layout rules
- appended a scoped design block marked `/* EQUATIONS_DESIGN_PASS_20260429 */`
- scoped all new design rules to the exact page class, for example `.page-42`
- kept worksheet HTML and educational content unchanged
- kept `styles/a4-base.css` unchanged

## Files changed by the script

- No CSS files required changes.

## Verification required

After applying this pass, run:

- `npm run validate:equations`
- `npm run validate:access`
- `npm test`

Then check real preview and print/PDF output before declaring the design pass fully complete.
