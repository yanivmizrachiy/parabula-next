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

The file update to `package.json` was blocked by the tool safety layer, so this report must not claim that the npm script was added.

## Validation run status

Not run yet in this environment.

Reason:

- The validator file was created through GitHub API.
- No local checkout/test execution was performed in this step.
- No GitHub Actions validation run was triggered or verified for this registry validator.

Therefore, the correct status is:

```text
registries_created = yes
schemas_created = yes
validator_created = yes
package_script_added = no
validation_run = no
validation_result = not verified
```

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
2. Run `node scripts/validate-registries.mjs` or `npm run validate:registries` after package script is added.
3. Record real output in this file or a follow-up report.
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
