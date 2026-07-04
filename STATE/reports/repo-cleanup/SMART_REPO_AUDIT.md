# SMART_REPO_AUDIT

Generated from current `main` state after canonical mobile-reader alignment work.

## What was verified

- `PROJECT_RULES.md` exists and remains the single source of truth.
- `meta/topics.json` remains the live metadata source.
- `preview/topics.html` and `preview/topics.js` remain the primary topic-first browsing layer.
- `preview/all-pages.html`, `preview/all-pages.css`, and `preview/all-pages.js` remain the live secondary utility surface.
- `preview/print.html` and `preview/print.js` remain the live print/PDF handoff layer.
- `mobile-app.html`, `mobile-app.js`, and `mobile-app.css` are now explicitly documented as the canonical mobile worksheet runtime.
- `preview/phone.*` is now explicitly documented as compatibility / legacy-adjacent rather than a peer canonical runtime.
- The main documentation layer is now aligned across rules and state files.

## Real findings

### 1. Rules/state alignment is no longer the main blocker
This used to be a real issue.
It has now been substantially reduced.
The following files are aligned around the same canonical mobile direction:
- `PROJECT_RULES.md`
- `STATE/LIVE_STATUS.md`
- `STATE/ARCHITECTURE_MAP.md`
- `STATE/PROJECT_CONTINUITY.md`
- `STATE/README.md`
- `STATE/MOBILE_READER_EXEC_STATUS.md`
- `preview/APP_CONTRACT.md`
- `preview/README.md`

### 2. Topic-first UX remains the primary product flow
This is still correct and documented.
`preview/all-pages.*` remains useful, but it is still secondary to topic-first browsing.

### 3. Link integrity is no longer the urgent repository-level issue
The repo already carries prior fixes for safe URL resolution and public flow.
It is no longer the most urgent blocking layer.

### 4. `preview/phone.html` must still not be deleted blindly
This remains true.
It is compatibility / legacy-adjacent, not a dead file.
However, it is no longer ambiguous whether it is canonical.
It is not canonical.

### 5. `preview/phone.js` still contains real logic
This remains true.
It should still be treated as compat logic until a deliberate cleanup pass proves it is safe to reduce or retire.

### 6. `preview/print-center.js` is still duplicate-adjacent but not yet proven removable
This remains true.
The canonical print direction is `preview/print.js`, but the older file should not be deleted without a dedicated cleanup audit and explicit approval.

### 7. `mobile-app.*` is now clearly the canonical mobile runtime
This is no longer just an inference from code shape.
It is now documented consistently across rules and state material.
The mobile reader remains iframe-based by design, with A4 pages remaining the source of truth.

### 8. The main unfinished work is now visual validation, not documentation cleanup
This is the key current reality.
The repository has been organized and documented around the new mobile-reader direction.
What still blocks a final “done” claim is live phone validation of:
- page size
- centering
- gray empty area removal
- reading comfort
- open / print / PDF handoff integrity

### 9. No deletion should happen before a dedicated cleanup audit
This remains active.
There are still legacy or duplicate-adjacent files in `preview/`, but the repo is no longer in a documentation-confusion state.
Future cleanup can be much more targeted.

### 10. The next smart step is narrow and execution-oriented
The next smart step is not more broad repo rewriting.
The next smart step is:
- live mobile visual check
- then only targeted fine-tuning in `mobile-app.js` / `mobile-app.css` if needed
- then a later focused cleanup audit for legacy/duplicate-adjacent files

## Current canonical vs compatibility picture

### Canonical now
- `preview/topics.*` = primary topic-first browsing layer
- `preview/print.*` = primary live print/PDF handoff layer
- `preview/all-pages.*` = secondary all-pages utility layer
- `mobile-app.*` = primary mobile worksheet runtime

### Compatibility / legacy-adjacent now
- `preview/phone.html` = redirect / compatibility layer
- `preview/phone.js` = legacy/compat runtime with real logic still present
- `preview/print-center.js` = older / parallel print-selection flow with real logic still present

## Safe next actions only

1. Do **not** delete pages.
2. Do **not** merge topics.
3. Do **not** rename topics or reassign pages between topics.
4. Do **not** remove legacy files before confirming they are truly unused.
5. Keep `mobile-app.*` as the only canonical destination for new mobile fixes.
6. Limit the next technical pass to live visual validation and targeted mobile-reader tuning.
7. Only after that, consider a focused cleanup audit for compat / legacy-adjacent files.

## Current conclusion

The repository is now much better governed than it was earlier in this sequence.
The documentation confusion layer has been mostly resolved.
The main remaining gap is no longer structural governance.
The main remaining gap is real visual confirmation of the mobile reader on the phone.
