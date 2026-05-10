# CURRENT_TRUTH_PLAN — parabula-next

Status: planning/source-of-truth document only. No runtime or worksheet files are changed by this file.

## Purpose

Define the current truth that future AI agents, scripts, validators, and humans must use before modifying the repository.

The goal is to prevent decisions based on stale STATE files, legacy metadata, old validators, or outdated workflow assumptions.

## Current truth hierarchy

| Layer | Current truth |
|---|---|
| Rules | `PROJECT_RULES.md` after approved rewrite; until then, use rewrite draft + audit maps as planning source. |
| Metadata | `meta/topics.json` is canonical. |
| Worksheet content | Root `עמוד-N.html` files are canonical. |
| Worksheet style | `styles/pages/עמוד-N.css` files are canonical page styles. |
| A4 base | `styles/a4-base.css` is protected base style. |
| Mobile | `mobile-app.*` is canonical mobile runtime. |
| Topic browsing | `preview/topics.*` is canonical topic reader. |
| All pages utility | `preview/all-pages.*` is utility/catalog surface. |
| Print/PDF | `preview/print.*` is canonical browser-driven print/PDF surface. |
| Equations route | `preview/equations.*` is dedicated to `משוואות`. |
| Legacy phone | `preview/phone.*` is legacy/compat. |
| Legacy print | `preview/print-center.js` is legacy/duplicate-adjacent. |
| Docs app | `docs/mobile-app.*` is docs snapshot/legacy until explicitly redefined. |

## Current known repository facts

From readonly audit/knowledge-pack evidence:

- tracked files: 2049
- root `עמוד-*.html` files: 96
- `styles/pages/עמוד-*.css` files: 96
- scripts: 34
- tests: 8
- workflows: 14
- STATE files: 156
- docs files: 208
- SVG assets under `pages`: 54

The 96 root page files include the transition/editable file `עמוד-95-editable.html`; canonical worksheet count is expected to remain 95 unless metadata changes explicitly.

## Current metadata truth

`meta/topics.json` currently separates:

- `משוואות` — 54 pages.
- `משוואות ריבועיות` — 6 pages.

`mobile-topics.json` and `docs/mobile-topics.json` may still reflect older grouping and must not override `meta/topics.json`.

## Current page 95 truth

- `עמוד-95.html` is public live HTML/MathJax worksheet.
- `עמוד-95-editable.html` is internal/transition editable source.
- Validators that require page 95 to be SVG/overlay are not automatically authoritative.

## Current validation truth

Observed temp-runtime probe results:

### Passed

- `preview_guard`
- `worksheet_intake_guard`

### Failed / needs interpretation

- `rules_sync_check` — fails because of generated audit output reference and old expected phrases.
- `validate_page_95_editable` — expects public page to link editable page.
- `validate_equations_public_clean` — expects temporary corrections CSS and `object-fit: contain` from old SVG flow.
- `validate_equations_easy_edits` — expects overlay edit layer.
- `validate_equations_pilot_page_1` — expects exact SVG pilot asset and design marker.
- `validate_equations_print_scope` — flags print-scope leakage concerns; this one likely represents a real active concern and should be fixed carefully.

## Current open gates

The following must not be called complete yet:

- real phone UX validation;
- real browser print / Save as PDF validation;
- full GitHub Actions cloud validation;
- full line-by-line review of all 2049 files;
- final replacement of `PROJECT_RULES.md`;
- cleanup/deletion/quarantine.

## Protected areas

Do not change without explicit approval:

- root `עמוד-N.html` worksheets;
- `styles/pages/עמוד-N.css` unless the page is intentionally targeted;
- `styles/a4-base.css`;
- `meta/topics.json`;
- `PROJECT_RULES.md` on `main`;
- write-capable workflows;
- legacy files before classification.

## Required before any cleanup

1. Approve `PROJECT_RULES_REWRITE_DRAFT`.
2. Create `STATE/FILE_CLASSIFICATION.tsv`.
3. Create `STATE/LEGACY_MAP.md`.
4. Create `STATE/OPEN_GATES.md`.
5. Create `STATE/VALIDATOR_STATUS_MAP.md` and review it.
6. Create `STATE/WORKFLOW_RISK_MAP.md` and review it.
7. Create `STATE/SCRIPT_RISK_MAP.md` and review it.
8. Only then produce deletion/quarantine candidates.

## Final rule

If a source is stale, historical, generated, or legacy, it may still be useful, but it must not override the current canonical truth.
