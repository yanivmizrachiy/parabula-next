# SMART_REPO_AUDIT

Generated automatically from current `main` state.

## What was verified

- `PROJECT_RULES.md` exists and is intended to be the single source of truth.
- `meta/topics.json` is the live metadata source.
- `preview/topics.html` and `preview/topics.js` are the primary topic-first browsing layer.
- `preview/all-pages.html`, `preview/all-pages.css`, and `preview/all-pages.js` are live on `main` as a secondary utility surface.
- `preview/print.html` and `preview/print.js` are the live print/PDF handoff layer.
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

### 4. `preview/phone.html` is not a removable dead file
This file currently acts as a compatibility redirect into `mobile-app.html`.
It should not be deleted blindly.

### 5. `preview/phone.js` is not a trivial duplicate
This file still contains real navigation, filtering, page-frame handling, open/print actions, and metadata loading logic.
It is a compatibility / legacy-adjacent runtime, not a dead stub.

### 6. `preview/print-center.js` is duplicate-adjacent but still functional
This file still contains real selection, filtering, and print-preview iframe logic.
It may overlap with `preview/print.js`, but it is not yet proven safe to delete.

### 7. `preview/print.js` appears to be the canonical print flow
Compared with `preview/print-center.js`, `preview/print.js` is the stronger live print/PDF handoff path because it includes persisted selection restore and the newer print flow already referenced by the repository changes.

### 8. `mobile-app.js` appears to be the canonical mobile runtime
`mobile-app.js` uses a dedicated mobile reading flow, topic strip, page navigation, loading state, iframe cleanup, and mobile-first controls.
This strongly suggests that `mobile-app.*` is the canonical mobile path and `preview/phone.*` is now compatibility / legacy support.

### 9. No deletion should happen before a dedicated repo cleanup audit
This is still active.
There are legacy or duplicate-adjacent files in `preview/`, but they must not be deleted blindly.

### 10. The repository still needs a focused cleanup audit
This is still pending.
The next smart step is not broad rewriting.
The next smart step is a read-only audit of:
- duplicate-adjacent preview files
- stale backup/state files that were created during repair flows
- contradictions between live code and `PROJECT_RULES.md`
- topic-separation safety (for example: `משוואות` must never silently merge with `משוואות ריבועיות`)
- files that are too long or too central and may need later refactoring

## Current canonical vs compatibility picture

### Canonical now
- `preview/topics.*` = primary topic-first browsing layer
- `preview/print.*` = primary live print/PDF handoff layer
- `preview/all-pages.*` = secondary all-pages utility layer
- `mobile-app.*` = primary mobile worksheet runtime

### Compatibility / legacy-adjacent now
- `preview/phone.html` = redirect compatibility layer
- `preview/phone.js` = legacy/compat runtime with real logic still present
- `preview/print-center.js` = older / parallel print-selection flow with real logic still present

## Safe next actions only

1. Do **not** delete pages.
2. Do **not** merge topics.
3. Do **not** rename topics or reassign pages between topics.
4. Do **not** remove legacy files before confirming they are truly unused.
5. Keep syncing every real structural change back into `PROJECT_RULES.md`.
6. Next improvement pass should focus on audit, not on new feature sprawl.
7. Before any cleanup deletion, explicitly document canonical vs compatibility intent in rules/state files.

## Current conclusion

The repository is in a much better state than before, but it is not yet at the final "clean and fully governed" state.
The correct next move is a careful cleanup audit, followed only by targeted fixes that are proven necessary.