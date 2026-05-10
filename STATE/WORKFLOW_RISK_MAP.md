# WORKFLOW_RISK_MAP — parabula-next

Status: planning/classification document only.

## Purpose

Classify GitHub Actions workflows before cleanup, rules rewrite, or automation changes.

## Risk labels

| Label | Meaning |
|---|---|
| READ_ONLY_AUDIT | Runs checks and may upload artifacts only. |
| WRITES_ARTIFACT | Generates outputs as workflow artifacts. |
| WRITES_REPO | Can commit files to the repository. |
| DIRECT_PUSH_RISK | Can push directly to `main` or another branch without PR review. |
| MANUAL_ONLY | Should run only by manual dispatch. |
| NEEDS_REVIEW | Must be inspected before use. |

## Known workflows

| Workflow | Proposed label | Notes |
|---|---|---|
| `deploy-pages.yml` | NEEDS_REVIEW | real deploy workflow; must be checked before modifying. |
| `pages.yml` | NEEDS_REVIEW | build workflow; deploy step was observed as incomplete/placeholder-like. |
| `repository-health.yml` | READ_ONLY_AUDIT | health/check workflow. |
| `preview-health.yml` | READ_ONLY_AUDIT | preview health checks. |
| `preview-guard.yml` | WRITES_ARTIFACT | runs preview guard and uploads report. |
| `worksheet-intake-guard.yml` | WRITES_ARTIFACT | runs intake guard and uploads report. |
| `recovery-audit.yml` | WRITES_ARTIFACT | produces recovery audit as artifact, not committed by default. |
| `system-state-generation.yml` | WRITES_ARTIFACT | generates system-state artifact. |
| `equations-app-validation.yml` | READ_ONLY_AUDIT | validates equations app. |
| `apply-equations-design-pass.yml` | WRITES_REPO | can commit design-pass changes. |
| `audit-equations-svg-captions.yml` | WRITES_REPO | can write `STATE/EQUATIONS_SVG_CAPTION_AUDIT.md`. |
| `sync-equations-rules-section.yml` | WRITES_REPO | can write `PROJECT_RULES.md`. |
| `strict-preview-cleanup.yml` | WRITES_REPO | can modify preview docs/contracts/rules. |
| `strict-preview-cleanup-force.yml` | DIRECT_PUSH_RISK | can push directly to `main`; must not be used casually. |

## Future policy

Default policy for write-capable workflows:

1. No direct push to `main`.
2. Create a branch.
3. Commit to branch.
4. Open PR.
5. Attach report.
6. Run validations.
7. Require explicit approval.

## Immediate caution list

Do not run without explicit decision:

- `strict-preview-cleanup-force.yml`
- `strict-preview-cleanup.yml`
- `sync-equations-rules-section.yml`
- `apply-equations-design-pass.yml`
- `audit-equations-svg-captions.yml`

## Required next step

Create `STATE/SCRIPT_RISK_MAP.md` to classify scripts with the same rigor.
