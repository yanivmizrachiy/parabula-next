# FILE_CLASSIFICATION_PLAN — parabula-next

Status: planning/classification document only.

## Purpose

Define how every repository file should be classified before cleanup, deletion, validator rewrites, workflow changes, or app-surface changes.

No file should be deleted or moved until it has a classification and a reference/risk scan.

## Classification labels

| Label | Meaning |
|---|---|
| CANONICAL_CONTENT | Canonical worksheet/source content. |
| CANONICAL_STYLE | Canonical styling required by worksheet rendering. |
| CANONICAL_METADATA | Canonical metadata source. |
| CANONICAL_RULES | Living repository constitution. |
| RUNTIME_APP | Active app surface/runtime. |
| PRINT_APP | Active print/PDF surface. |
| MOBILE_APP | Active mobile surface. |
| PREVIEW_APP | Active preview/topic/all-pages surface. |
| DOCS_SNAPSHOT | Docs/public snapshot layer. |
| LEGACY_COMPAT | Old compatibility layer, not necessarily removable. |
| GENERATED_ARTIFACT | Generated output/report that may or may not be committed. |
| STATE_CURRENT | Current state/truth/gate file. |
| STATE_HISTORY | Historical or superseded state file. |
| STATE_DECISION | Decision record. |
| SCRIPT_READONLY | Script that reads/checks only. |
| SCRIPT_WRITES_REPORT | Script that writes reports/artifacts. |
| SCRIPT_WRITE_CAPABLE | Script that can modify rules/state/runtime/styles/content. |
| WORKFLOW_READONLY | Workflow that only validates/uploads artifacts. |
| WORKFLOW_WRITE_CAPABLE | Workflow that can commit or push repository changes. |
| DELETE_CANDIDATE | Candidate for future removal after quarantine and approval. |
| DO_NOT_TOUCH | Must not be modified without explicit approval. |
| UNKNOWN | Must be inspected before action. |

## Initial canonical files

| Path pattern | Classification | Rule |
|---|---|---|
| `עמוד-N.html` | CANONICAL_CONTENT / DO_NOT_TOUCH | Do not edit unless worksheet itself is the target. |
| `styles/pages/עמוד-N.css` | CANONICAL_STYLE | Page-scoped CSS; do not delete. |
| `styles/a4-base.css` | CANONICAL_STYLE / DO_NOT_TOUCH | Protected A4 base. |
| `meta/topics.json` | CANONICAL_METADATA | Single canonical topic/page metadata. |
| `PROJECT_RULES.md` | CANONICAL_RULES | Living rules document after approved rewrite. |

## Initial runtime/app files

| Path pattern | Classification | Rule |
|---|---|---|
| `mobile-app.*` | MOBILE_APP / RUNTIME_APP | Canonical mobile runtime. |
| `preview/topics.*` | PREVIEW_APP / RUNTIME_APP | Canonical topic reader. |
| `preview/all-pages.*` | PREVIEW_APP | Catalog/utility surface. |
| `preview/print.*` | PRINT_APP / RUNTIME_APP | Canonical browser print/PDF surface. |
| `preview/equations.*` | PREVIEW_APP | Dedicated non-quadratic equations surface. |
| `preview/index.html` | PREVIEW_APP | Internal preview reader. |
| `preview/server.mjs` | PREVIEW_APP | Local preview server. |

## Initial legacy/compat files

| Path pattern | Classification | Rule |
|---|---|---|
| `preview/phone.*` | LEGACY_COMPAT | Keep until role and references are fully resolved. |
| `preview/print-center.js` | LEGACY_COMPAT | Keep until print references and fallback role are resolved. |
| `mobile-topics.json` | LEGACY_COMPAT | Not canonical; compare to `meta/topics.json`. |
| `docs/mobile-topics.json` | DOCS_SNAPSHOT / LEGACY_COMPAT | Not canonical; docs snapshot metadata. |
| `docs/mobile-app.*` | DOCS_SNAPSHOT | Do not treat as canonical mobile until decided. |
| `עמוד-95-editable.html` | LEGACY_COMPAT / TRANSITION_SOURCE | Internal/editable transition file, not public canonical worksheet. |

## Initial generated/audit files

| Path pattern | Classification | Rule |
|---|---|---|
| `meta/audit/*` | GENERATED_ARTIFACT | Decide whether committed or workflow-artifact only. |
| `STATE/*AUDIT*` | STATE_CURRENT or STATE_HISTORY | Classify by date and relation to live code. |
| `STATE/*VALIDATION*` | STATE_CURRENT or STATE_HISTORY | Check whether still matches current runtime. |

## Classification workflow

For each file:

1. Identify path and extension.
2. Check whether it is referenced by canonical files.
3. Check whether it is referenced by runtime apps.
4. Check whether it is referenced by scripts.
5. Check whether it is referenced by workflows.
6. Determine whether it is source, generated, legacy, snapshot, or history.
7. Assign one or more labels.
8. Mark risk level: LOW / MEDIUM / HIGH / DO_NOT_TOUCH.
9. Only after that, consider cleanup or quarantine.

## Deletion rule

A file can become `DELETE_CANDIDATE` only after:

- it is not canonical;
- it has no active references;
- it has no workflow dependency;
- it has no runtime dependency;
- it has a preserved history or rollback path;
- it is approved for quarantine first.

## First safe output

The first future generated file should be:

`STATE/FILE_CLASSIFICATION.tsv`

Columns:

```text
path	labels	risk	canonical	legacy	generated	referenced_by	decision	notes
```

## Blocking rule

Do not start actual cleanup before `STATE/FILE_CLASSIFICATION.tsv` exists and is reviewed.
