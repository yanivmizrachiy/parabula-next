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

Completed.

Added to `package.json` on the PR #5 branch:

```text
validate:registries = node scripts/validate-registries.mjs
```

Verified from GitHub after update: `package.json` contains `"validate:registries": "node scripts/validate-registries.mjs"`.

## Validation run status

Completed manually in Termux against a fresh clone of the PR #5 branch before the npm script was added.

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
package_script_added = yes
validation_run_direct_node = yes
validation_result_direct_node = pass
checked_registries = 5
passed = 5
failed = 0
validation_run_via_npm_script = not yet verified
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

1. Re-run validation via `npm run validate:registries` after pulling the latest PR #5 branch.
2. Record the npm-script run output in a follow-up report.
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
