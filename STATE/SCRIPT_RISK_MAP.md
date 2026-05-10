# SCRIPT_RISK_MAP — parabula-next

Status: planning/classification document only.

## Purpose

Classify scripts before running them. Some scripts are named as audits but still write report files. Others modify rules, runtime, or page CSS.

## Risk labels

| Label | Meaning |
|---|---|
| READ_ONLY | Reads files and prints results only. |
| WRITES_REPORT | Writes audit/report files only. |
| MODIFIES_RULES | Can edit `PROJECT_RULES.md` or derived rules docs. |
| MODIFIES_STATE | Can write `STATE/*` files. |
| MODIFIES_RUNTIME | Can change app/preview/mobile/print runtime files. |
| MODIFIES_WORKSHEET_STYLE | Can change `styles/pages/*`. |
| MODIFIES_WORKSHEET_CONTENT | Can change root `עמוד-N.html` files. |
| SHELL_OR_GIT_CAPABLE | Uses shell/git or can trigger broader effects. |
| UNKNOWN | Do not run until inspected. |

## Known scripts

| Script | Proposed label | Notes |
|---|---|---|
| `scripts/recovery-audit.mjs` | WRITES_REPORT | writes `meta/audit/recovery-audit.json`. |
| `scripts/app-layer-check.mjs` | WRITES_REPORT / NEEDS_UPDATE | writes `meta/audit/app-layer-check.json`; seems aligned with older phone flow. |
| `scripts/duplicate-audit.mjs` | WRITES_REPORT | writes `meta/audit/duplicate-audit.json`. |
| `scripts/generate-system-state-auto.mjs` | WRITES_REPORT | writes `meta/audit/generated-system-state.json`. |
| `scripts/rules-sync-check.mjs` | READ_ONLY/REPORT_OUTPUT | checks rules/system-state; assertions need update. |
| `scripts/sync-rules.mjs` | MODIFIES_RULES | writes derived rules file(s). |
| `scripts/sync-equations-rules-section.mjs` | MODIFIES_RULES | writes equations section into `PROJECT_RULES.md`. |
| `scripts/strict-preview-cleanup.mjs` | MODIFIES_RUNTIME / MODIFIES_RULES | can change preview app/docs/contracts/rules. |
| `scripts/upgrade-mobile-app.mjs` | MODIFIES_RUNTIME | can change mobile/preview references. |
| `scripts/apply-equations-design-pass.mjs` | MODIFIES_WORKSHEET_STYLE | can change `styles/pages/עמוד-N.css` for equations pages. |
| `scripts/audit-equations-svg-captions.mjs` | MODIFIES_STATE | writes `STATE/EQUATIONS_SVG_CAPTION_AUDIT.md`. |
| `scripts/worksheet-intake-guard.mjs` | WRITES_REPORT | writes intake guard report under `meta/audit`. |
| `scripts/preview-guard.mjs` | WRITES_REPORT | writes preview guard report under `meta/audit`. |
| `scripts/visual-regression.mjs` | WRITES_REPORT | creates visual artifacts/screenshots; must run only in temp/output context. |
| `scripts/watch-page.mjs` | READ_ONLY/DEV_TOOL | local watch utility. |
| `scripts/validate-meta.mjs` | READ_ONLY | validates `meta/pages.json`; may be legacy if `meta/topics.json` is canonical. |
| `scripts/validate-mobile-runtime.mjs` | MODIFIES_STATE / NEEDS_UPDATE | writes mobile runtime validation reports; failed checks should affect exit policy. |
| `scripts/validate-page-95-editable.mjs` | TRANSITION_VALIDATOR | expects public page to link editable source. |
| `scripts/validate-equations-public-clean.mjs` | LEGACY_VALIDATOR | expects old correction CSS/object-fit for page 95. |
| `scripts/validate-equations-easy-edits.mjs` | TRANSITION_VALIDATOR | expects overlay edit layer. |
| `scripts/validate-equations-pilot-page-1.mjs` | LEGACY_VALIDATOR | expects exact SVG pilot asset. |
| `scripts/validate-equations-print-scope.mjs` | ACTIVE/NEEDS_FIX | print scope concern is important. |
| `scripts/validate-equations-app.mjs` | ACTIVE/REVIEW | validates equations app route. |
| `scripts/validate-equations-suite.mjs` | ACTIVE/REVIEW | suite wrapper; must be checked for legacy validator inclusion. |
| `scripts/validate-equations-design-pass-strict.mjs` | ACTIVE | protects scoped design-pass limits. |
| `scripts/validate-equations-print-scope.mjs` | ACTIVE/NEEDS_FIX | prevents equations print logic leaking globally. |
| `scripts/verify.mjs` | ACTIVE/REVIEW | broad verification script. |
| `scripts/validate-access-layer.mjs` | ACTIVE/REVIEW | access/runtime layer validation. |

## Policy

1. Do not run write-capable scripts on `main`.
2. Run risky scripts only in temp copy or branch.
3. If a validator encodes an old contract, classify it before fixing code.
4. Never modify worksheet content just to satisfy a legacy validator.
5. Prefer report-only mode before apply mode.

## Required next step

Create `STATE/FILE_CLASSIFICATION_PLAN.md` before cleanup or deletion candidates are produced.
