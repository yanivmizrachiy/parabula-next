# PROJECT_RULES_REWRITE_DIFF — parabula-next

Status: planning/diff document only.

## Purpose

This document explains what changes when moving from the current accumulated `PROJECT_RULES.md` to the proposed clean constitution.

## Big change

Current state:

- accumulated historical rules;
- duplicate numbering;
- mixed canonical/legacy language;
- some references to missing or old tooling;
- old page-95 assumptions preserved alongside newer reality.

Target state:

- living constitution;
- clear canonical sources;
- explicit legacy classification;
- explicit deletion rules;
- explicit script/workflow risk rules;
- explicit validator status rules;
- history moved to `STATE/history` or dedicated decision documents.

## Preserve

The rewrite preserves these principles:

- no demo;
- no fake success;
- no blind deletion;
- no blind rebuild;
- protect A4 worksheets;
- protect `styles/a4-base.css`;
- canonical metadata is `meta/topics.json`;
- mobile canonical runtime is `mobile-app.*`;
- print canonical runtime is `preview/print.*`;
- legacy is not automatically garbage;
- mobile and print require real validation.

## Remove from living rules, but archive elsewhere

| Current content type | Future handling |
|---|---|
| duplicate section numbering | remove from living rules |
| missing tool references such as `preview.ps1` | archive or recreate only if needed |
| missing package scripts such as `test:watch:page` | remove or add real script later |
| phone legacy phrasing as if canonical | rewrite as legacy/compat |
| page-95 SVG/overlay assumptions | move to validator/status history |
| generated artifact assumptions | move to audit artifact policy |
| old design-pass notes | rewrite as stable equations contract |

## Add to living rules

- App Surface Registry concept.
- Metadata hierarchy.
- Page 95 live HTML contract.
- Legacy/quarantine deletion process.
- Workflow direct-push restriction.
- Script risk taxonomy.
- Validator status taxonomy.
- STATE status taxonomy.
- Success contract.

## Risks after rewrite

After replacing `PROJECT_RULES.md`, existing scripts may still expect old phrases. These must be audited before making the rewrite authoritative.

Known sensitive scripts/workflows:

- `scripts/rules-sync-check.mjs`
- `scripts/sync-equations-rules-section.mjs`
- write-capable workflows that edit `PROJECT_RULES.md`

## Required follow-up after rewrite approval

1. Update or classify `rules-sync-check`.
2. Update or classify `sync-equations-rules-section`.
3. Create validator status map.
4. Create workflow risk map.
5. Create state index.
6. Only then begin cleanup/quarantine work.
