# RULES_REWRITE_EXECUTION_PLAN — parabula-next

Status: execution plan only. This file does not replace `PROJECT_RULES.md`.

## Purpose

Define the safe sequence for replacing `PROJECT_RULES.md` with the new clean constitution and then using it as the foundation for future cleanup and improvements.

## Current branch

Planning branch:

`agent/project-rules-rewrite-plan-20260510`

## Current planning package

The following planning documents should exist before touching `PROJECT_RULES.md`:

- `STATE/PROJECT_RULES_REWRITE_DRAFT.md`
- `STATE/PROJECT_RULES_AUDIT.md`
- `STATE/PROJECT_RULES_REWRITE_DIFF.md`
- `STATE/PROJECT_RULES_ARCHIVE_MAP.md`
- `STATE/PROJECT_RULES_OPEN_QUESTIONS.md`
- `STATE/CURRENT_TRUTH_PLAN.md`
- `STATE/OPEN_GATES.md`
- `STATE/LEGACY_MAP.md`
- `STATE/VALIDATOR_STATUS_MAP.md`
- `STATE/WORKFLOW_RISK_MAP.md`
- `STATE/SCRIPT_RISK_MAP.md`
- `STATE/FILE_CLASSIFICATION_PLAN.md`
- `STATE/DELETE_CANDIDATES_POLICY.md`
- `STATE/AUDIT_ARTIFACT_POLICY.md`
- `STATE/APP_SURFACE_REGISTRY_PLAN.md`
- `STATE/STATE_INDEX_PLAN.md`

## Execution phases

### Phase 1 — Planning documents only

Status: active.

Allowed changes:

- Add planning STATE files.
- Do not alter runtime.
- Do not alter worksheet pages.
- Do not alter page CSS.
- Do not alter `PROJECT_RULES.md` yet.

### Phase 2 — Review planning package

Required review questions:

1. Does the draft include all non-demo/no-fake/no-delete rules?
2. Does it preserve A4 worksheet protection?
3. Does it correctly identify canonical metadata?
4. Does it correctly classify mobile/preview/print app surfaces?
5. Does it separate `משוואות` from `משוואות ריבועיות`?
6. Does it preserve legacy knowledge without treating it as canonical?
7. Does it prevent direct cleanup before classification?

### Phase 3 — Archive old rules context

Before replacing `PROJECT_RULES.md`, create:

- `STATE/history/PROJECT_RULES_PRE_REWRITE.md`

This file should contain the previous rules content or a faithful preservation reference.

### Phase 4 — Replace `PROJECT_RULES.md`

Only after review/approval:

1. Replace `PROJECT_RULES.md` using the approved draft.
2. Do not edit worksheet files.
3. Do not edit runtime files.
4. Do not delete legacy files.
5. Commit as a dedicated rules-only change.

Suggested commit message:

`Refactor PROJECT_RULES as canonical repository constitution`

### Phase 5 — Update checks that depend on old phrases

Known affected scripts/checks:

- `scripts/rules-sync-check.mjs`
- `scripts/sync-equations-rules-section.mjs`

These should be updated or classified after the new rules are approved.

### Phase 6 — Validation

Run, at minimum, in a temp copy or branch:

- package install;
- `npm test`;
- `npm run verify` if available;
- metadata validation;
- preview guard;
- worksheet intake guard;
- mobile runtime validation;
- print scope validation;
- rules sync validation after it is updated.

### Phase 7 — PR review

No direct push to `main`.

The change should be reviewed as a PR with:

- planning summary;
- changed files list;
- validation output;
- known open gates;
- explicit statement that no A4 worksheets were changed.

## Success criteria

The rules rewrite is successful only if:

1. `PROJECT_RULES.md` is clear, current, and non-contradictory.
2. History is preserved in STATE.
3. No worksheet content changed.
4. No A4 base changed.
5. No legacy file was deleted.
6. Known old validators are classified rather than silently ignored.
7. Future cleanup is blocked until file classification exists.

## What must not happen

- Do not combine rules rewrite with cleanup.
- Do not combine rules rewrite with mobile changes.
- Do not combine rules rewrite with print changes.
- Do not combine rules rewrite with page 95 changes.
- Do not combine rules rewrite with deletion.

## Next phase after rules rewrite

After the rules rewrite is safely merged, the next repository-improvement phase should be:

1. Generate `STATE/FILE_CLASSIFICATION.tsv`.
2. Generate `STATE/STATE_INDEX.md`.
3. Generate `meta/app-surfaces.json` or keep registry as STATE until approved.
4. Update validators according to `VALIDATOR_STATUS_MAP`.
5. Only then produce delete/quarantine candidates.
