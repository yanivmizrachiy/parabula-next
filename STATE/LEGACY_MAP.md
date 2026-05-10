# LEGACY_MAP — parabula-next

Status: planning/classification document only. No legacy file is deleted or moved by this document.

## Purpose

Classify known legacy, compatibility, snapshot, transition, and historical layers so future cleanup does not break working routes or lose useful evidence.

Legacy is not garbage. Legacy is a role that must be mapped before action.

## Legacy status labels

| Label | Meaning |
|---|---|
| COMPAT | Kept for compatibility with older routes or workflows. |
| SNAPSHOT | A copied/published snapshot of another app layer. |
| TRANSITION | Used during migration from old structure to new structure. |
| HISTORICAL | Preserved for evidence/history. |
| GENERATED | Output produced by scripts/workflows. |
| DEPRECATED | Intended to be replaced, not yet safe to remove. |
| UNKNOWN | Must be inspected before action. |

## Known legacy / non-canonical layers

| Path / family | Status | Current interpretation | Default action |
|---|---|---|---|
| `preview/phone.*` | COMPAT / DEPRECATED | Old phone reader; not canonical mobile. | Keep until references and public routes are verified. |
| `preview/mobile.css` | COMPAT | Old phone/mobile styling layer. | Keep with `preview/phone.*` until role resolved. |
| `preview/manifest.webmanifest` | COMPAT | Manifest for old preview phone flow. | Keep until install surface policy is decided. |
| `preview/sw.js` | COMPAT | Service worker for preview layer. | Keep until cache/install strategy is reviewed. |
| `preview/install.html` | COMPAT | Install guide for old preview phone flow. | Keep until mobile install flow is unified. |
| `preview/print-center.js` | DEPRECATED / COMPAT | Legacy or duplicate-adjacent print controller beside `preview/print.js`. | Keep until references and fallback role are verified. |
| `mobile-topics.json` | COMPAT / GENERATED_CANDIDATE | Old mobile metadata shape; not canonical. | Do not use as source of truth. Consider generator from `meta/topics.json`. |
| `docs/mobile-topics.json` | SNAPSHOT / COMPAT | Docs snapshot metadata, not canonical. | Keep until docs app role is decided. |
| `docs/mobile-app.*` | SNAPSHOT | Docs mobile app layer differs from root mobile app. | Keep until public routing and GitHub Pages role are verified. |
| `docs/sw.js` | SNAPSHOT | Minimal docs service worker. | Keep with docs layer until docs policy is decided. |
| `עמוד-95-editable.html` | TRANSITION | Internal/editable source for page 95, not public canonical worksheet. | Keep until page-95 migration policy is complete. |
| `styles/pages/עמוד-95-editable.css` | TRANSITION | CSS for editable/transition page. | Keep with editable source. |
| `styles/topics/equations-edits.css` | TRANSITION / COMPAT | Old correction/edit overlay layer for equations/page 95 flow. | Keep until all dependent validators/workflows are updated. |
| `validators expecting SVG/overlay page 95` | HISTORICAL / TRANSITION | Encode old page-95 assumptions. | Classify in `VALIDATOR_STATUS_MAP`; do not force code back to old model. |
| `STATE/*` older reports | HISTORICAL / OPEN_GATE | May describe old states that differ from current code. | Keep; classify through `STATE_INDEX`. |
| `meta/audit/*` | GENERATED | Generated audit outputs may be artifact-only or committed depending on policy. | Define artifact policy before relying on committed presence. |

## Canonical replacements / anchors

| Legacy area | Canonical anchor |
|---|---|
| `preview/phone.*` | `mobile-app.*` |
| `mobile-topics.json` | `meta/topics.json` |
| `docs/mobile-topics.json` | `meta/topics.json` or generated docs snapshot, depending on policy |
| `preview/print-center.js` | `preview/print.js` |
| page-95 SVG/overlay expectations | `עמוד-95.html` live HTML/MathJax contract |

## Cleanup rule

No legacy file should become a delete candidate until:

1. it has a status in this file;
2. references are scanned;
3. workflows are scanned;
4. public routes are verified;
5. rollback is defined;
6. quarantine is used before deletion;
7. explicit approval is given.

## Next required documents

- `STATE/AUDIT_ARTIFACT_POLICY.md`
- `STATE/STATE_INDEX_PLAN.md`
- `STATE/APP_SURFACE_REGISTRY_PLAN.md`
