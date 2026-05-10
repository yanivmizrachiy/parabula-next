# PROJECT_RULES_AUDIT — parabula-next

Status: planning/audit document only. No runtime files are changed by this document.

## Purpose

This audit identifies why `PROJECT_RULES.md` must be rewritten before repository cleanup, deletion, validator rewrites, workflow changes, or app-surface changes.

## Main finding

The current `PROJECT_RULES.md` contains important rules, but it also contains accumulated historical layers. The project needs a clean living constitution and separate historical/state documents.

## Rules to preserve

- No demo.
- No fake buttons.
- No fake reports.
- Do not rebuild blindly.
- Do not delete without mapping.
- Protect root `עמוד-N.html` worksheet files.
- Protect `styles/pages/עמוד-N.css` page CSS.
- Protect `styles/a4-base.css`.
- Use `meta/topics.json` as canonical metadata.
- Keep `משוואות` separate from `משוואות ריבועיות`.
- Treat `preview/phone.*` as legacy/compat, not canonical mobile.
- Treat `preview/print-center.js` as legacy/duplicate-adjacent to `preview/print.js`.
- Require real-phone validation before declaring mobile complete.
- Require browser print / Save as PDF validation before declaring print/PDF complete.

## Known structural issues to fix in the rules rewrite

1. Duplicate section numbering, including a repeated `## 7`.
2. References to missing or non-current tooling such as `preview.ps1`.
3. References to scripts/commands not present in `package.json`, such as `test:watch:page`.
4. Historical treatment of `preview/phone.*` that can confuse it with canonical mobile.
5. Historical treatment of page 95 as SVG/overlay even though the live public page is HTML/MathJax.
6. Mixed treatment of generated audit artifacts as if they are always committed source files.
7. Lack of a clear deletion/quarantine contract.
8. Lack of a clear script/workflow risk classification inside the rules.
9. Lack of a clear validator status classification.
10. Lack of a clear STATE status taxonomy.

## Required rewrite outcome

The new `PROJECT_RULES.md` should be:

- shorter;
- clearer;
- organized by contracts;
- free of duplicate numbering;
- explicit about canonical vs legacy;
- explicit about deletion safety;
- explicit about workflows and scripts;
- explicit about validators and historical checks;
- aligned with `meta/topics.json` and live app surfaces.

## Do not do during rules rewrite planning

- Do not change worksheet pages.
- Do not change page CSS.
- Do not change `styles/a4-base.css`.
- Do not delete legacy files.
- Do not run write-capable workflows.
- Do not change runtime behavior.
