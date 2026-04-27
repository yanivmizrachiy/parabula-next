# ROADMAP_PARABULA_NEXT

_Last updated: 2026-04-27_

## Current priority

The immediate blocker remains final real-phone mobile validation.

Do not approve or merge PR #3 until:

- `עמוד מלא` shows full A4 width without right-side clipping.
- `קריאה מוגדלת` has intentional and comfortable internal pan/scroll.
- No embarrassing gray empty area remains.
- Topic navigation is usable on a real phone.
- PDF handoff opens `preview/print.html`.
- Protected worksheet source files remain untouched.

## Completed in PR #3 after deeper audit

- `mobile-app.js` now uses `pageLocalOrder()` and `sortTopicPages()` so topic-local titles such as `עמוד 1` are ordered before raw file/global number ordering.
- Topic entry now chooses the first page with topic-local ordering, not only `number` ordering.
- Visible page lists now use topic-local ordering.
- Global book order now preserves repository topic order and topic-local page order.
- `tests/contracts/access-surfaces.test.mjs` now guards this behavior so the mobile app does not silently regress to file-number-only ordering.

## Mandatory future improvements

1. Final real-device mobile display fix.
2. Better phone topic navigation for many topics.
3. Stronger digital-book flow: previous/next page, previous/next topic, resume last page.
4. Structured workflow for adding new worksheets.
5. Full metadata validation between `meta/topics.json` and all root pages.
6. Automated screenshot checks when Playwright/tooling is available.
7. Stronger `preview/print.html`.
8. Gradual audited cleanup of compat/legacy layers.
9. Keep `PROJECT_RULES.md` as live source of truth.
10. Maintain `STATE/PROJECT_HEALTH.md`.

## Guardrails

- Do not edit `עמוד-*.html` for mobile shell fixes.
- Do not edit `styles/pages/*.css` for mobile shell fixes.
- Do not edit `styles/a4-base.css`.
- Do not merge until real-phone validation passes.
- Do not present automated validation as proof of visual success.
