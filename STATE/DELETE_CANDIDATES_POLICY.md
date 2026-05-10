# DELETE_CANDIDATES_POLICY — parabula-next

Status: planning policy only. No deletion is performed by this file.

## Purpose

Define a safe deletion/quarantine process for future repository cleanup.

## Core rule

No file is deleted directly. Every cleanup candidate must go through classification, reference scanning, quarantine, review, validation, and explicit approval.

## Deletion gates

A file can be considered for removal only if all gates pass:

1. It is classified in `STATE/FILE_CLASSIFICATION.tsv`.
2. It is not `CANONICAL_CONTENT`.
3. It is not `CANONICAL_STYLE`.
4. It is not `CANONICAL_METADATA`.
5. It is not `CANONICAL_RULES`.
6. It is not `DO_NOT_TOUCH`.
7. It has no active imports, links, fetches, script references, workflow references, or public route dependency.
8. Its role is documented.
9. A rollback path exists.
10. It is first moved to quarantine, not removed immediately.
11. Validations pass after quarantine.
12. A PR documents the change.
13. Explicit approval is received.

## Quarantine path

Future quarantine should use:

```text
legacy-quarantine/YYYYMMDD/<original-path>
```

The original path must be preserved in a manifest.

## Required manifests

Before any quarantine PR:

- `STATE/DELETE_CANDIDATES.tsv`
- `STATE/QUARANTINE_PLAN.md`
- `STATE/QUARANTINE_MANIFEST.tsv`
- `STATE/ROLLBACK_PLAN.md`

## Never delete automatically

Never auto-delete:

- root `עמוד-N.html` files;
- `styles/pages/עמוד-N.css`;
- `styles/a4-base.css`;
- `meta/topics.json`;
- `PROJECT_RULES.md`;
- backup/legacy sources without manual approval;
- workflows without explicit review;
- scripts without classification;
- STATE decision/history records.

## Possible future delete-candidate families

These are not approved for deletion now. They are only families to inspect later:

- exact duplicate generated artifacts;
- stale generated audit outputs if artifact-only policy is adopted;
- unused docs snapshots after public routing is confirmed;
- deprecated validators after new validators replace them;
- obsolete workflow variants after branch/PR-safe replacements exist.

## Success condition

A cleanup is successful only when the repository still validates, app surfaces still work, A4 pages are unchanged unless intentionally targeted, and rollback is possible.
