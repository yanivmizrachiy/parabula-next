# APP_SURFACE_REGISTRY_PLAN — parabula-next

Status: planning/registry document only. No runtime file is changed by this document.

## Purpose

Define every app surface in the repository so future work can route worksheets to the correct experience without confusing canonical runtime, utilities, docs snapshots, and legacy layers.

## Surface status labels

| Label | Meaning |
|---|---|
| CANONICAL | Primary supported route for a core user flow. |
| UTILITY | Useful support tool, not the primary home. |
| DEDICATED | Focused route for one topic/family. |
| SNAPSHOT | Published/copied snapshot, not current source of truth. |
| LEGACY_COMPAT | Old compatibility route, not canonical. |
| INTERNAL_DEV | Development/preview utility. |
| UNKNOWN | Must be inspected before use. |

## Planned registry

| Surface ID | Entry files | Metadata source | Status | Role |
|---|---|---|---|---|
| `mobile` | `mobile-app.html`, `mobile-app.js`, `mobile-app.css` | `meta/topics.json` | CANONICAL | Mobile worksheet reader. |
| `topics` | `preview/topics.html`, `preview/topics.js`, `preview/topics.css` | `meta/topics.json` | CANONICAL | Topic-first browsing and reading. |
| `all-pages` | `preview/all-pages.html`, `preview/all-pages.js`, `preview/all-pages.css` | `meta/topics.json` | UTILITY | Catalog/search/selection surface for all worksheets. |
| `print` | `preview/print.html`, `preview/print.js`, `preview/print.css` | `meta/topics.json` | CANONICAL | Browser-driven print / Save as PDF. |
| `equations` | `preview/equations.html`, `preview/equations.js`, `preview/equations.css` | `meta/topics.json` | DEDICATED | Dedicated route for non-quadratic `משוואות`. |
| `preview-reader` | `preview/index.html`, `styles/preview.css` | root pages / metadata | INTERNAL_DEV | Internal reader/preview layer. |
| `preview-server` | `preview/server.mjs` | local files | INTERNAL_DEV | Local preview server. |
| `phone-legacy` | `preview/phone.html`, `preview/phone.js`, `preview/mobile.css` | legacy flow | LEGACY_COMPAT | Old phone reader; not canonical mobile. |
| `print-legacy` | `preview/print-center.js` | legacy flow | LEGACY_COMPAT | Old/duplicate-adjacent print controller. |
| `docs-mobile` | `docs/mobile-app.html`, `docs/mobile-app.js`, `docs/mobile-app.css` | `docs/mobile-topics.json` | SNAPSHOT | Docs/GitHub Pages snapshot until role is decided. |
| `docs-install` | `docs/mobile-app-install.html`, `docs/mobile-app-install.js`, `docs/mobile-app.webmanifest`, `docs/sw.js` | docs snapshot | SNAPSHOT | Docs PWA/install layer. |

## Canonical routing rules

1. New mobile work should target `mobile-app.*`.
2. New topic browsing work should target `preview/topics.*`.
3. New print/PDF work should target `preview/print.*`.
4. New equations-specific work should target `preview/equations.*` only for the exact non-quadratic `משוואות` topic.
5. Do not use `preview/phone.*` as canonical mobile.
6. Do not use `docs/mobile-app.*` as canonical mobile unless the docs policy is explicitly changed.
7. Do not use `mobile-topics.json` or `docs/mobile-topics.json` as canonical metadata.

## App chooser future plan

A future generated file may define the registry in machine-readable form:

`meta/app-surfaces.json`

Suggested fields:

```json
{
  "id": "mobile",
  "entry": "mobile-app.html",
  "metadata": "meta/topics.json",
  "status": "CANONICAL",
  "description": "Mobile worksheet reader"
}
```

## Validation requirements by surface

| Surface | Required validation |
|---|---|
| `mobile` | phone UX test, metadata check, navigation check, iframe/page fit check. |
| `topics` | topic list, page selection, prev/next, persistence. |
| `all-pages` | catalog load, selection, print/share/download actions. |
| `print` | page selection, topic selection, browser print / Save as PDF. |
| `equations` | exact topic scoping; no quadratic-equation mixing. |
| `docs-mobile` | docs routing and snapshot freshness if kept. |
| `phone-legacy` | reference/fallback check only. |

## Blocking rule

Before adding a new app surface, define:

- entry file;
- metadata source;
- canonical/utility/legacy status;
- user flow;
- validation gate;
- relation to existing surfaces.

No new app surface should duplicate worksheet content.
