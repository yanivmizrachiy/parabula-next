# PR3_TERMUX_VALIDATION_CONFIRMED

_Last updated: 2026-04-27_

## Scope

This document records the latest real Termux validation evidence for PR #3 on branch `copilot/stabilize-upgrade-repository`.

It does not approve the PR and does not replace final real-phone visual validation.

## Confirmed by latest Termux output

The following commands completed successfully on the local Termux worktree `~/parabula-next-pr3` after syncing the PR branch:

- `npm test`
- `npm run verify`
- `npm run validate:access`
- `npm run validate:mobile`
- `node scripts/app-layer-check.mjs`
- `node scripts/audit-preview-overlaps.mjs`
- `npm run build`

## Evidence from output

- `npm run verify`: `OK: Canonical contracts passed`
- `npm run validate:access`: `ACCESS LAYER VALIDATION OK`
- `npm run validate:mobile`: `TOTAL_CHECKS=24`, `PASSED=24`, `FAILED=0`
- `node scripts/app-layer-check.mjs`: `status: pass`, `errors: []`
- `node scripts/app-layer-check.mjs`: one warning remains: `preview/README.md documents print-center.js; review whether duplication is still required`
- `node scripts/audit-preview-overlaps.mjs`: `PREVIEW OVERLAP AUDIT: OK`
- `npm run build`: Vite build completed successfully

## Remaining warning

The only recorded warning is legacy/compat documentation-related:

```text
preview/README.md documents print-center.js; review whether duplication is still required
```

This is not a blocking test failure. It should be handled later in a deliberate compat/legacy cleanup pass.

## Protected source status

No evidence from this validation indicates changes to protected worksheet source files:

- `עמוד-*.html`
- `styles/pages/*.css`
- `styles/a4-base.css`

## Still not complete

The PR must remain Draft / not merged until real-phone visual validation confirms:

- `עמוד מלא` shows full A4 width without right-edge clipping.
- `קריאה מוגדלת` has intentional, comfortable pan/scroll.
- No embarrassing gray empty area remains.
- Topic navigation is usable on the actual phone.
- `תצוגת PDF` opens `preview/print.html` with the correct current page.
- Topic-local ordering works visually, especially for `משוואות` and pages whose displayed local page number differs from raw file number.

## Current practical status

Automated and local Termux validation: passed.

Product approval status: pending real-phone screenshot validation.

Estimated progress: 99%.
