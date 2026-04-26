# SMART_REPO_AUDIT

Generated automatically from current `main` state.

## What was verified

- `PROJECT_RULES.md` exists and is intended to be the single source of truth.
- `meta/topics.json` is the live metadata source.
- `preview/topics.html` and `preview/topics.js` are the primary topic-first browsing layer.
- `preview/all-pages.html`, `preview/all-pages.css`, and `preview/all-pages.js` are live on `main` as a secondary utility surface.
- `preview/print.html` is the live print/PDF handoff layer.
- `preview/all-pages.js` and `preview/topics.js` now resolve page links through `siteUrl` / safe URL resolution for GitHub Pages.
- `package.json` currently includes `preview`, `validate:access`, `verify`, `test`, `page:new`, and `rules:sync` scripts.

## Real findings

### 1. Rules were previously out of sync
This was a real issue.
`PROJECT_RULES.md` previously described `preview/all-pages.*` as planned, while the files were already live on `main`.
This required a rules sync.

### 2. Topic-first UX must remain the primary product flow
This is now documented as a product rule.
The home experience should be topic-first.
`preview/all-pages.*` is useful, but it must stay a secondary utility surface.

### 3. Link integrity was a real problem
This was a real issue.
Earlier live page links could fall to broken GitHub Pages paths.
This required explicit safe URL resolution.

### 4. No deletion should happen before a dedicated repo cleanup audit
This is still active.
There may be legacy or duplicate-adjacent files in `preview/`, but they must not be deleted blindly.
Examples already known in the repository history include `preview/phone.*` and `preview/print-center.js` as legacy/compat candidates.

### 5. The repository still needs a focused cleanup audit
This is still pending.
The next smart step is not broad rewriting.
The next smart step is a read-only audit of:
- duplicate-adjacent preview files
- stale backup/state files that were created during repair flows
- contradictions between live code and `PROJECT_RULES.md`
- topic-separation safety (for example: `משוואות` must never silently merge with `משוואות ריבועיות`)
- files that are too long or too central and may need later refactoring

## Safe next actions only

1. Do **not** delete pages.
2. Do **not** merge topics.
3. Do **not** rename topics or reassign pages between topics.
4. Do **not** remove legacy files before confirming they are truly unused.
5. Keep syncing every real structural change back into `PROJECT_RULES.md`.
6. Next improvement pass should focus on audit, not on new feature sprawl.

## Current conclusion

The repository is in a much better state than before, but it is not yet at the final "clean and fully governed" state.
The correct next move is a careful cleanup audit, followed only by targeted fixes that are proven necessary.