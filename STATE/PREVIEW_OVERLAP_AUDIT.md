# PREVIEW OVERLAP AUDIT

This report distinguishes canonical runtime files from legacy/duplicate-adjacent layers.
It is informational by default and does not fail the process unless a canonical file is missing.

## Canonical runtime presence
preview/app.html: YES
preview/topics.html: YES
preview/all-pages.html: NO
preview/booklet.html: NO
preview/print.html: YES
preview/print.js: YES
preview/flow-shell.css: NO
preview/flow-shell.js: NO
meta/all-pages-index.json: NO

## Print layer
canonical: preview/print.js => YES
legacy_or_duplicate: preview/print-center.js => YES

## Mobile layer
canonical: mobile-app.html => YES
legacy_or_duplicate: preview/phone.html => YES

## Mobile JS
canonical: mobile-app.js => YES
legacy_or_duplicate: preview/phone.js => YES

## Mobile styles
canonical: mobile-app.css => YES
legacy_or_duplicate: preview/mobile.css => YES

## Mobile manifest
canonical: mobile-app.webmanifest => YES
legacy_or_duplicate: preview/manifest.webmanifest => YES

## Hub route coverage
./topics.html: YES
./all-pages.html: YES
./booklet.html: YES
./print.html: YES
./index.html: YES
./mobile-app.html: YES

## Interpretation
- YES on a legacy/duplicate file does not mean an error by itself.
- It means the repository still contains a secondary path that must be treated carefully.
- Only missing canonical files should be treated as a blocking issue.

