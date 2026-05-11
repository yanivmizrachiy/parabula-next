# REGISTRY_VALIDATION_STATUS — parabula-next

Status: current status report for registry validation work in PR #5.

## Scope

This report covers the machine-readable registry layer added in the PR #5 branch.

## Registries created

Created as planning/seed registries:

- `meta/app-surfaces.json`
- `meta/validators.json`
- `meta/workflows.json`
- `meta/scripts.json`
- `meta/file-roles.json`

These files are real files in the branch, but they remain seed/planning data until reviewed and approved.

## Schemas created

Created:

- `schemas/app-surfaces.schema.json`
- `schemas/validators.schema.json`
- `schemas/workflows.schema.json`
- `schemas/scripts.schema.json`
- `schemas/file-roles.schema.json`

## Validator created

Created:

- `scripts/validate-registries.mjs`

The validator checks:

- each registry is valid JSON;
- each registry has `schemaVersion`;
- each registry has `status`;
- each registry has `authority`;
- `app-surfaces` entries include required fields;
- `validators` entries include required fields;
- `workflows` entries include required fields;
- `scripts` entries include required fields;
- `file-roles` entries include required fields.

## Package script status

Not completed yet.

Attempted next intended script:

```text
validate:registries = node scripts/validate-registries.mjs
```

The file update to `package.json` was blocked by the tool safety layer during the earlier API update attempt, so this report must not claim that the npm script was added.

## Validation run status

Completed manually in Termux against a fresh clone of the PR #5 branch.

Environment / evidence provided by user:

```text
working_directory=/data/data/com.termux/files/home/parabula-next-pr5-registry-check-20260511-170341
report=/data/data/com.termux/files/home/PARABULA_NEXT_REGISTRY_VALIDATION_20260511-170341.txt
Node.js v25.8.2
checkedRegistries=5
passed=5
failed=0
```

Therefore, the correct current status is:

```text
registries_created = yes
schemas_created = yes
validator_created = yes
package_script_added = no
validation_run = yes
validation_result = pass
checked_registries = 5
passed = 5
failed = 0
```

## Validation warnings

The validator emitted seed-status warnings. These warnings are expected and correct:

- the registries are still marked as `seed`;
- the registries are not final canonical metadata;
- they must not override `PROJECT_RULES.md`, `meta/topics.json`, or live runtime files until reviewed and approved.

## What is still seed / not canonical

The following are still planning seeds, not final canonical metadata:

- `meta/app-surfaces.json`
- `meta/validators.json`
- `meta/workflows.json`
- `meta/scripts.json`
- `meta/file-roles.json`

They should not override `PROJECT_RULES.md`, `meta/topics.json`, or live runtime files until reviewed and approved.

## Next required steps

1. Add `validate:registries` to `package.json` when safe/tooling allows.
2. Optionally re-run `node scripts/validate-registries.mjs` after any registry change.
3. Add schema validation beyond structural field checks if/when needed.
4. Keep PR #5 as Draft until reviewed.

## Safety confirmation

This work did not intentionally change:

- root worksheet pages;
- page CSS;
- `styles/a4-base.css`;
- runtime app files;
- canonical `meta/topics.json`;
- workflows;
- existing validators;
- deletion/quarantine state.
