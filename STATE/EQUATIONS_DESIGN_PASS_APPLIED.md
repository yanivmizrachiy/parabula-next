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

- styles/pages/עמוד-95.css
- styles/pages/עמוד-42.css
- styles/pages/עמוד-43.css
- styles/pages/עמוד-44.css
- styles/pages/עמוד-45.css
- styles/pages/עמוד-46.css
- styles/pages/עמוד-47.css
- styles/pages/עמוד-48.css
- styles/pages/עמוד-49.css
- styles/pages/עמוד-50.css
- styles/pages/עמוד-51.css
- styles/pages/עמוד-52.css
- styles/pages/עמוד-53.css
- styles/pages/עמוד-54.css
- styles/pages/עמוד-55.css
- styles/pages/עמוד-56.css
- styles/pages/עמוד-57.css
- styles/pages/עמוד-58.css
- styles/pages/עמוד-59.css
- styles/pages/עמוד-60.css
- styles/pages/עמוד-61.css
- styles/pages/עמוד-62.css
- styles/pages/עמוד-63.css
- styles/pages/עמוד-64.css
- styles/pages/עמוד-65.css
- styles/pages/עמוד-66.css
- styles/pages/עמוד-67.css
- styles/pages/עמוד-68.css
- styles/pages/עמוד-69.css
- styles/pages/עמוד-70.css
- styles/pages/עמוד-71.css
- styles/pages/עמוד-72.css
- styles/pages/עמוד-73.css
- styles/pages/עמוד-74.css
- styles/pages/עמוד-75.css
- styles/pages/עמוד-76.css
- styles/pages/עמוד-77.css
- styles/pages/עמוד-78.css
- styles/pages/עמוד-79.css
- styles/pages/עמוד-80.css
- styles/pages/עמוד-81.css
- styles/pages/עמוד-82.css
- styles/pages/עמוד-83.css
- styles/pages/עמוד-84.css
- styles/pages/עמוד-85.css
- styles/pages/עמוד-86.css
- styles/pages/עמוד-87.css
- styles/pages/עמוד-88.css
- styles/pages/עמוד-89.css
- styles/pages/עמוד-90.css
- styles/pages/עמוד-91.css
- styles/pages/עמוד-92.css
- styles/pages/עמוד-93.css
- styles/pages/עמוד-94.css

## Verification required

After applying this pass, run:

- `npm run validate:equations`
- `npm run validate:access`
- `npm test`

Then check real preview and print/PDF output before declaring the design pass fully complete.
