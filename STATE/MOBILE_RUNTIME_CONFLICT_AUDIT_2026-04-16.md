# MOBILE RUNTIME CONFLICT AUDIT — 2026-04-16

## confirmed live mobile runtime
- canonical public mobile entry currently used for work: `mobile-app.html`
- canonical public runtime files currently updated in recent fixes:
  - `mobile-app.html`
  - `mobile-app.css`
  - `mobile-app.js`
  - `mobile-topics.json`

## confirmed conflicting mobile runtime still present
A second mobile/phone runtime still exists under `preview/`:
- `preview/phone.html`
- `preview/phone.js`
- `preview/mobile.css`
- `preview/manifest.webmanifest`
- `preview/icon.svg`
- `preview/sw.js`

## why this is harmful
- duplicate mobile entry points
- duplicate iframe-based reading logic
- duplicate page-list / navigation logic
- duplicate manifest/service-worker path for mobile usage
- encourages future edits to hit the wrong layer

## safe conclusion
Do not delete anything yet.
First classify `preview/phone.*` as legacy/utility-only and keep `mobile-app.*` as the only canonical mobile runtime.

## next safe action
- update repo rules / continuity docs so future work does not touch `preview/phone.*` as the primary mobile path
- continue improvements only in `mobile-app.*`
