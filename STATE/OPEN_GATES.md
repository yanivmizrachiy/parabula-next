# OPEN_GATES — parabula-next

Status: planning gate list only.

## Purpose

List repository capabilities and cleanup areas that must not be marked complete until validated with real evidence.

## Gate status labels

| Label | Meaning |
|---|---|
| OPEN | Not complete; validation missing. |
| PARTIAL | Some evidence exists, but not enough for completion. |
| BLOCKED | Requires decision or missing infrastructure. |
| COMPLETE | Evidence exists and is documented. |

## Current open gates

| Gate | Status | Evidence needed |
|---|---|---|
| Project rules rewrite | PARTIAL | Draft/audit/diff/maps exist; actual `PROJECT_RULES.md` not replaced yet. |
| File classification | PARTIAL | Plan exists; actual `STATE/FILE_CLASSIFICATION.tsv` not generated/reviewed. |
| Legacy map | OPEN | `STATE/LEGACY_MAP.md` still needed. |
| Delete candidates | BLOCKED | Must wait for file classification and legacy map. |
| Mobile runtime | PARTIAL | metadata/runtime evidence exists; needs real-phone UX test. |
| Print/PDF | PARTIAL | print route exists; needs browser print/Save as PDF validation. |
| Page 95 live HTML | PARTIAL | code evidence exists; needs updated validators and visual/print/mobile gate. |
| Equations print scope | OPEN | validator reported scope concerns; requires fix plan before completion. |
| Metadata alignment | PARTIAL | `meta/topics.json` canonical; legacy mobile metadata still mismatched. |
| Workflow safety | PARTIAL | risk map exists; write workflows not yet converted to branch/PR policy. |
| Script safety | PARTIAL | risk map exists; scripts not yet reorganized or guarded. |
| STATE cleanup | OPEN | 156 files need index/status classification. |
| Docs app role | OPEN | docs snapshot vs canonical/public role not decided. |
| Full visual regression | OPEN | no screenshot/phone/browser visual run yet. |
| GitHub Actions cloud validation | OPEN | not all workflow runs validated after changes. |

## Completion rule

A gate can move to COMPLETE only with:

1. real evidence;
2. relevant validation output;
3. documented result;
4. no broken canonical A4 pages;
5. explicit note of environment, date, and limitations.

## No fake completion

If a feature was not checked in its target environment, it must remain OPEN or PARTIAL.

Examples:

- Mobile without phone test = PARTIAL at most.
- Print without browser print/PDF test = PARTIAL at most.
- Cleanup without classification/quarantine = OPEN/BLOCKED.
- Validator rewrite without running validation = PARTIAL at most.
