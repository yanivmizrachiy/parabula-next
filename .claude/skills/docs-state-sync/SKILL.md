---
name: docs-state-sync
description: Read-only audit of STATE/, docs/, and metadata file consistency. Detects stale documents, sync gaps, and unclassified repo additions.
---

## Role

Verify that STATE/ documents, docs/ build output, and metadata files accurately reflect the current repository state.

A stale STATE file is misleading. An unsynchronized mobile-topics.json is a bug. This skill detects both.

This skill is **read-only** by default. It may update `REPO_CLEANUP_PLAN.md` with new findings (safe, non-destructive).

---

## Invoke via

`/hygiene` command — or invoke directly when:
- New files were added to the repo root or STATE/
- mobile-topics.json and meta/topics.json may be out of sync
- STATE/LIVE_STATUS.md hasn't been updated recently
- After a session that added new documents or scripts

---

## What to inspect

May read:
- `STATE/LIVE_STATUS.md`
- `STATE/ARCHITECTURE_MAP.md`
- `STATE/PROJECT_CONTINUITY.md`
- `REPO_CLEANUP_PLAN.md`
- `REPO_ORGANIZATION.md`
- `meta/topics.json`
- `mobile-topics.json`
- `docs/` (list only, not deep read)
- `.github/workflows/` (list only)
- `scripts/` (list only)

May update (safe, non-destructive):
- `REPO_CLEANUP_PLAN.md` — add new findings under correct category

Must NOT touch:
- عمود-*.html
- `styles/a4-base.css`
- `meta/topics.json` (read-only)
- `mobile-topics.json` (read-only here — sync requires separate approval)
- `package.json`

---

## Checks to run

1. `meta/topics.json` vs `mobile-topics.json` — page count match?
2. `STATE/LIVE_STATUS.md` — is it dated? Does it reflect the current worksheet count?
3. Root-level documents — any new files not in REPO_ORGANIZATION.md or REPO_CLEANUP_PLAN.md?
4. `docs/` — stale planning files vs build output?
5. `scripts/` — new scripts not classified in REPO_CLEANUP_PLAN.md?
6. `.github/workflows/` — all active workflows classified and expected?
7. STATE/ — new unclassified backup files or session artifacts?

---

## Safety rules

- Never delete anything. No `rm`, no `Remove-Item`.
- Do not move or rename any file.
- Flagging a file for Yaniv's review is the only output action allowed.
- Adding entries to REPO_CLEANUP_PLAN.md is the only write action allowed.
- Do not sync mobile-topics.json — only report the gap.

---

## Output format

```
STATUS: [SYNCED / STALE / GAP-FOUND / UNCLASSIFIED-FILES]
DONE: [files/directories checked]
EVIDENCE:
  - meta/topics.json count: [N]
  - mobile-topics.json count: [M]
  - Sync status: [match / gap of X pages]
  - STATE/LIVE_STATUS.md freshness: [date / stale]
  - Unclassified root files: [list or "none"]
  - New workflows not in REPO_CLEANUP_PLAN: [list or "none"]
  - Stale planning documents: [list or "none"]
BLOCKERS: [sync gaps or stale STATE files that affect safety]
NEXT: [one safest next action]
PERCENT: [0–100 — how complete the docs/state sync check is]
```
