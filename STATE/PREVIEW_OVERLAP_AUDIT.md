# PREVIEW OVERLAP AUDIT

This report distinguishes files that are actually live on main from legacy or duplicate-adjacent layers.
It is informational by default and should fail only when a truly live canonical file is missing.

## Canonical runtime presence
CLAUDE.md: YES
meta/topics.json: YES
preview/index.html: YES
preview/app.html: YES
preview/topics.html: YES
preview/print.html: YES
mobile-app.html: YES
mobile-app-install.html: YES
scripts/validate-access-layer.mjs: YES
scripts/audit-preview-overlaps.mjs: YES
STATE/LIVE_STATUS.md: YES
STATE/ARCHITECTURE_MAP.md: YES
STATE/PROJECT_CONTINUITY.md: YES

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
./print.html: YES
./mobile-app.html: YES

## Important note
- all-pages / booklet / flow-shell / all-pages-index are not treated here as live canonical files on main unless they are actually committed there.
- planned or previously discussed files must not be used as failure criteria.

## Interpretation
- YES on a legacy/duplicate file does not mean an error by itself.
- It means the repository still contains a secondary path that must be treated carefully.
- Only missing live canonical files should be treated as a blocking issue.

