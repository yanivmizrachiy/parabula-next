# EQUATIONS_APP_STATUS — ParabulaNext

_Last updated: 2026-05-07_

## Verified real repository change

A dedicated non-quadratic equations access surface was added to the live repository on `main`.

Created files:
- `preview/equations.html`
- `preview/equations.css`
- `preview/equations.js`
- `preview/print.css`
- `scripts/validate-equations-app.mjs`
- `scripts/validate-equations-design-pass-strict.mjs`
- `scripts/validate-equations-print-scope.mjs`
- `scripts/validate-equations-pilot-page-1.mjs`
- `scripts/validate-equations-suite.mjs`
- `.github/workflows/equations-app-validation.yml`

Updated files:
- `preview/print.html`
- `preview/print.js`
- `preview/topics.js`
- `preview/topics.css`
- `package.json`

## Purpose

The new route is a dedicated Hebrew RTL app for the exact metadata topic:

- `משוואות`

It must not include or merge the separate topic:

- `משוואות ריבועיות`

## Source of truth

The app reads real worksheet metadata from:

- `meta/topics.json`

The worksheet pages themselves remain the canonical root A4 pages:

- `עמוד-N.html`
- `styles/pages/עמוד-N.css`
- `styles/a4-base.css`

## Current real topic count

`meta/topics.json` currently lists 54 pages under the exact topic `משוואות`.

## Public routes

Dedicated equations route:

- `https://yanivmizrachiy.github.io/parabula-next/preview/equations.html`

Preselected equations print route:

- `https://yanivmizrachiy.github.io/parabula-next/preview/print.html?topic=%D7%9E%D7%A9%D7%95%D7%95%D7%90%D7%95%D7%AA&autoselect=topic`

## Capabilities added

The dedicated app supports:
- topic-filtered viewing of equations pages only
- search inside equations pages
- previous / next navigation
- full-page open action
- current page HTML download link
- selection of pages
- export of selected/all page links as JSON
- handoff to the print center with equations pages preselected

The print center now supports:
- dedicated `topic` URL parameter
- `autoselect=topic` preselection mode
- topic-local sorting, so a page like `עמוד-95.html` can correctly appear as `עמוד 1 — משוואות`
- equations-only A4 viewport fitting through `body.equations-print-mode`
- extracted stylesheet `preview/print.css` instead of inline CSS in `preview/print.html`

The topics screen now exposes dedicated equations actions from the exact `משוואות` topic card:
- `אפליקציית משוואות`
- `PDF / הדפסה משוואות`

The topics click handler now avoids opening the topic card when a real link inside the card is clicked.

## Smart validation added

The main one-command validation suite is:

- `npm run validate:equations:all`

It runs:
- `node scripts/validate-equations-app.mjs`
- `node scripts/validate-equations-design-pass-strict.mjs`
- `node scripts/validate-equations-print-scope.mjs`
- `node scripts/validate-equations-pilot-page-1.mjs`
- `node scripts/validate-access-layer.mjs`

Individual validators are still available:
- `npm run validate:equations`
- `npm run validate:equations:strict`
- `npm run validate:equations:print-scope`
- `npm run validate:equations:pilot`

The validation checks cover:
- required files exist
- `preview/equations.html` is RTL
- no inline `<style>` or `style="..."` appears in the equations app shell
- `preview/print.html` uses `preview/print.css`, not inline CSS
- the equations app targets the exact topic `משוואות`
- the separate topic `משוואות ריבועיות` is explicitly protected from merging
- the app reads `meta/topics.json`
- the print center supports `topic` and `autoselect=topic`
- the print center uses topic-local sorting
- the print center applies A4 fitting only in exact equations print mode
- the topics screen exposes dedicated equations links
- clicking dedicated links inside the topics card is protected from triggering topic-card open behavior
- the exact equations topic currently has 54 pages
- every equations page has `topic=משוואות`
- no equations page has `topic=משוואות ריבועיות`
- the topic-local page indexes 1–54 are continuous and unique
- `עמוד-95.html` is validated as topic-local page 1 for equations
- every root `עמוד-N.html` file exists
- every matching `styles/pages/עמוד-N.css` file exists
- every expected `pages/משוואות/assets/page-XX.svg` asset exists
- every page preserves RTL
- every page links `styles/a4-base.css`
- every page links its dedicated CSS file
- every page contains the expected `main.a4-page.page-N` wrapper
- every page contains correct topic-local nav metadata
- every page contains the correct local page-number badge
- every page points to the expected SVG asset
- every page avoids references to `משוואות ריבועיות`
- previous/next links are checked by topic-local order
- CSS page layout rules are checked for page-scoped selectors

## GitHub Actions guard

A dedicated GitHub Actions workflow exists:

- `.github/workflows/equations-app-validation.yml`

It runs on relevant pushes, pull requests, and manual dispatch, and now executes:
- `npm run validate:equations:all`

The workflow is triggered by relevant changes in:
- `preview/equations.*`
- `preview/print.*`
- `preview/topics.*`
- `meta/topics.json`
- `styles/pages/עמוד-*.css`
- `עמוד-*.html`
- `pages/משוואות/assets/page-*.svg`
- equations validator scripts
- `package.json`
- the workflow file itself

## What was intentionally not changed

No educational worksheet content was changed.
No root A4 worksheet page was rewritten as learning content.
No quadratic-equation topic was touched.
No mass cleanup was applied to all equations CSS files without a live preview/test run.

## Known smart warning / unresolved risk

Some equations CSS files may still contain legacy global overrides such as `.header-container`, `.page-title`, or `body,html,.a4-page` from earlier cleanup work. These must not be removed blindly across all 54 files without confirming visual behavior in preview and print.

## Remaining verification before 100%

Not yet verified in this ChatGPT tool session:
- actual GitHub Actions green result after the workflow commits
- `npm run validate:equations:all` from a cloned workspace
- `npm test` from a cloned workspace
- real browser preview on GitHub Pages after deployment/cache refresh
- real phone check for clipping / iframe comfort
- browser print / Save as PDF test for all 54 equations pages

## Current status

Implementation committed to `main` through GitHub API.
Status: implemented, repository-visible, one-command validation suite added, CI guard updated, not yet locally test-run from a cloned workspace and not yet visually verified on a real phone/browser.

## 2026-05-07 — Easy equations edit layer

- Added `styles/topics/equations-edits.css` as the official easy-edit overlay layer for equations corrections.
- Connected `עמוד-95.html` to the edit layer.
- Added a visible text correction overlay for the page 1 equation: `6 + x = 6.5`.
- Added `scripts/validate-equations-easy-edits.mjs`.
- Added npm script: `validate:equations:easy-edits`.
- Educational SVG/PDF source was not edited directly.
- This makes future equation corrections easier: add/edit a small overlay entry instead of editing a closed SVG.
