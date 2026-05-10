# PROJECT_RULES_REWRITE_DRAFT — parabula-next

Status: planning draft only. This file does not replace `PROJECT_RULES.md`.

## Purpose

This draft defines the intended clean constitution for the repository before any destructive cleanup or runtime changes.

## Core truth

- `PROJECT_RULES.md` is the living rules document.
- `meta/topics.json` is the canonical metadata source.
- Root `עמוד-N.html` files are the canonical worksheet content.
- `styles/pages/עמוד-N.css` files are page-scoped CSS.
- `styles/a4-base.css` is the protected A4 base.
- `STATE/*` stores current state, history, audits, decisions, and open gates.

## Iron rules

- No demo content.
- No fake buttons.
- No fake reports.
- No invented success.
- No blind rebuild.
- No deletion without classification, reference scan, rollback, tests, PR, and explicit approval.
- Do not modify canonical worksheet pages to fix mobile, preview, or print runtime issues unless the worksheet itself is the confirmed cause.
- Do not mix topics.
- Do not mix `משוואות` with `משוואות ריבועיות`.

## Canonical app surfaces

| Surface | Files | Role |
|---|---|---|
| Mobile canonical | `mobile-app.*` | canonical mobile runtime |
| Topic reader | `preview/topics.*` | canonical topic browsing |
| All pages | `preview/all-pages.*` | catalog / utility |
| Print | `preview/print.*` | canonical browser print / PDF flow |
| Equations | `preview/equations.*` | dedicated non-quadratic equations route |
| Phone legacy | `preview/phone.*` | legacy / compat |
| Print legacy | `preview/print-center.js` | legacy / duplicate-adjacent |
| Docs mobile | `docs/mobile-app.*` | snapshot / legacy until explicitly redefined |

## A4 worksheet contract

Every canonical worksheet page must:

- live at repo root as `עמוד-N.html`;
- include `styles/a4-base.css`;
- include `styles/pages/עמוד-N.css`;
- contain exactly one `main.a4-page.page-N` wrapper;
- avoid inline `<style>` blocks and `style="..."` attributes;
- preserve true A4 print behavior.

## Metadata contract

`meta/topics.json` is canonical. `mobile-topics.json`, `docs/mobile-topics.json`, and `meta/pages.json` are not canonical unless explicitly regenerated and documented.

Expected current topic separation:

- `משוואות` — 54 pages.
- `משוואות ריבועיות` — 6 pages.

## Page 95 contract

- `עמוד-95.html` is the public live HTML/MathJax worksheet.
- `עמוד-95-editable.html` is an internal/transition editable source.
- Validators that require SVG/overlay/`equations-edits.css` for page 95 must be treated as legacy or transition validators unless updated.

## Deletion contract

Deletion is allowed only after:

1. classification as `DELETE_CANDIDATE`;
2. reference scan;
3. runtime scan;
4. workflow scan;
5. rollback path;
6. quarantine or branch-only change;
7. validation;
8. PR review;
9. explicit approval.

## Success contract

A feature is complete only when real files exist, relevant validations pass, the relevant app surface works, canonical A4 pages are not broken, and the result is documented. Mobile requires real-phone validation. Print/PDF requires real browser print / Save as PDF validation.
