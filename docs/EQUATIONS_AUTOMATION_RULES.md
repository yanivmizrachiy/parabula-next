# Equations Automation Rules

This document records the current automation rules for the non-quadratic equations worksheet flow.

It is a focused companion to `PROJECT_RULES.md`; it does not replace it.

## Scope

- Applies only to `משוואות`.
- Does not apply to `משוואות ריבועיות`.
- The page order comes from `meta/topics.json`.
- Work must continue page by page.

## Canonical preview

Use the existing canonical preview and print layer:

- `preview/index.html`
- `preview/app.html`
- `preview/topics.html`
- `preview/print.html`
- `preview/print.js`

Do not create another preview route for the first three equations pages.

## Current canonical print links

- First three equations pages: `preview/print.html?topic=משוואות&autoselect=topic&maxLocalPage=3`
- Full equations topic: `preview/print.html?topic=משוואות&autoselect=topic`

## Automation tools

Current tools:

- `scripts/equations-smart-queue.mjs`
- `scripts/validate-equations-print-smoke.mjs`
- `scripts/audit-equations-svg-conversion-plan.mjs`
- `scripts/validate-equations-page1-source-lock.mjs`
- `scripts/validate-equations-automation-wiring.mjs`
- `scripts/validate-equations-first3-readiness.mjs`

These tools are audit/validation tools. They must not modify worksheet pages or source files.

## GitHub Actions guard

The workflow `.github/workflows/equations-guard.yml` is the main safety layer for equations changes.

It must remain read-only and include:

- automation wiring validation
- equations validation suite
- print smoke validation
- page 1 source lock guard
- first three readiness guard
- smart queue audit
- SVG conversion plan audit
- a final check that audits did not create tracked changes

Manual runs are allowed through `workflow_dispatch`.

## Page 1 rules

`עמוד-95.html` is page 1 of the non-quadratic equations sequence.

Current requirements:

- Keep 12 exercises.
- Keep 12 answer areas.
- Do not mark the page fully verified until a real source-verification record exists.
- Do not change the expression `4 + x = \square` until verified against the source PDF.

## Page 2 rules

`עמוד-42.html` is a lock candidate.

Current requirements:

- Keep 10 exercises.
- Keep 10 answer areas.
- Keep 10 verified markers unless source evidence proves a correction is needed.
- Do not rebuild the page from scratch.

## Page 3 rules

`עמוד-43.html` is currently SVG-based.

Current requirements:

- Keep the SVG path unless reliable source extraction exists.
- Keep `object-fit: contain`.
- Avoid crop/translation based layout changes.
- Do not convert to HTML/MathJax by guessing exercises.

## Next improvement order

1. Keep the guard green.
2. Verify page 1 against the source PDF.
3. Lock page 2 with a short evidence report.
4. Decide page 3 conversion only after source evidence.
5. Continue pages 4-10 using the same process.

## Forbidden project behavior

- No fake verification.
- No fake preview route.
- No broad rewrite of the equations topic.
- No changes to quadratic equations unless explicitly requested.
- No mathematical content changes without source evidence.
