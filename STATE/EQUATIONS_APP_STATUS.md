# EQUATIONS_APP_STATUS — ParabulaNext

_Last updated: 2026-04-29_

## Verified real repository change

A dedicated non-quadratic equations access surface was added to the live repository on `main`.

Created files:
- `preview/equations.html`
- `preview/equations.css`
- `preview/equations.js`
- `preview/print.css`
- `scripts/validate-equations-app.mjs`
- `.github/workflows/equations-app-validation.yml`

Updated files:
- `preview/print.html`
- `preview/print.js`
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
- extracted stylesheet `preview/print.css` instead of inline CSS in `preview/print.html`

## Smart validation added

A dedicated validator was added:

- `npm run validate:equations`

The validator now checks both the app shell and the underlying equations worksheet family.

App and print-shell checks:
- required files exist
- `preview/equations.html` is RTL
- no inline `<style>` or `style="..."` appears in the equations app shell
- `preview/print.html` uses `preview/print.css`, not inline CSS
- the equations app targets the exact topic `משוואות`
- the separate topic `משוואות ריבועיות` is explicitly protected from merging
- the app reads `meta/topics.json`
- the print center supports `topic` and `autoselect=topic`
- the print center uses topic-local sorting

Metadata checks:
- the exact equations topic currently has 54 pages
- every equations page has `topic=משוואות`
- no equations page has `topic=משוואות ריבועיות`
- the topic-local page indexes 1–54 are continuous and unique
- `עמוד-95.html` is validated as topic-local page 1 for equations

Worksheet-family checks across all 54 pages:
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
- legacy global CSS overrides are reported as warnings rather than hidden

A dedicated GitHub Actions workflow was added:

- `.github/workflows/equations-app-validation.yml`

It runs on relevant pushes, pull requests, and manual dispatch, and executes:
- `npm run validate:equations`
- `npm run validate:access`

## What was intentionally not changed

No educational worksheet content was changed.
No root A4 worksheet page was rewritten.
No equation SVG asset was edited.
No quadratic-equation topic was touched.

## Known smart warning

The new validator is expected to warn that some equations CSS files still contain legacy global overrides such as `.header-container`, `.page-title`, or `body,html,.a4-page` from the previous equations cleanup. These are reported as warnings, not immediate failures, because changing all 54 CSS files may affect visual layout and should be done only after test/preview confirmation.

## Remaining verification before 100%

Not yet verified in this ChatGPT tool session:
- actual GitHub Actions run result after the workflow commit
- `npm test` from a cloned workspace
- real browser preview on GitHub Pages after deployment cache refresh
- real phone check for clipping / iframe comfort
- browser print / Save as PDF test for all 54 equations pages

## Current status

Implementation committed to `main` through GitHub API.
Status: implemented, repository-visible, deep validator added, CI guard added, not yet locally test-run from a cloned workspace.
