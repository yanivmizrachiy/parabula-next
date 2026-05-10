# VALIDATOR_STATUS_MAP — parabula-next

Status: planning/classification document only.

## Purpose

Classify validators before changing `PROJECT_RULES.md`, cleanup rules, workflows, or page-95/equations logic.

A failing validator is not automatically proof that live code is wrong. Some validators encode historical expectations.

## Status labels

| Status | Meaning |
|---|---|
| ACTIVE | Should be part of the current gate. |
| LEGACY | Checks old behavior; preserve as knowledge but do not block current work. |
| TRANSITION | Valid only during migration/editable-source work. |
| NEEDS_UPDATE | Concept is useful, but assertions must be updated to current contracts. |
| OBSERVE_ONLY | Generates useful reports but should not block. |
| UNKNOWN | Do not use as a gate until inspected. |

## Known validator classification

| Validator | Current observed behavior | Proposed status | Reason |
|---|---|---|---|
| `preview_guard` | passed in temp runtime probe | ACTIVE | preview guard is still useful. |
| `worksheet_intake_guard` | passed in temp runtime probe | ACTIVE | intake guard is useful for page/CSS hygiene. |
| `rules_sync_check` | failed because `meta/system-state.json` points to generated audit output and expected old phrases | NEEDS_UPDATE | useful idea, but assertions must match new rules/state policy. |
| `validate_page_95_editable` | requires public page to link editable page | TRANSITION | conflicts with clean public page-95 contract. |
| `validate_equations_public_clean` | requires `equations-edits.css` and `object-fit: contain` | LEGACY/NEEDS_UPDATE | assumes SVG/overlay page-95 world. |
| `validate_equations_easy_edits` | requires edit overlay in public page | TRANSITION | only relevant to overlay/editable migration, not clean public page. |
| `validate_equations_pilot_page_1` | requires exact SVG asset and design marker | LEGACY | page 95 is now live HTML/MathJax. |
| `validate_equations_print_scope` | failed on global equations print leakage | ACTIVE/NEEDS_FIX | scope concern is real and should remain a gate after assertions are reviewed. |
| `validate_mobile_runtime` | reports 9 passed / 1 failed but returns exit 0 | NEEDS_UPDATE | internal failed count must align with exit code policy. |
| `a4-pages.rules.test.mjs` | broad A4 contract | ACTIVE | protects core worksheet contract. |
| `topic-pages.*` | topic/site numbering and badges | ACTIVE/REVIEW | useful but must match actual `pages/site` role. |

## Required future work

1. Split equations validators into:
   - `validate:equations:legacy-svg`
   - `validate:equations:live-html`
   - `validate:equations:editable`
2. Add a dedicated validator for public page 95 as live HTML/MathJax.
3. Update `rules-sync-check` after the rules rewrite is approved.
4. Make validation exit codes reflect failed internal checks.
5. Keep old validators as historical/transition tools until no longer needed.

## Blocking rule

Do not change live page 95 back to SVG/overlay to satisfy a legacy validator.
