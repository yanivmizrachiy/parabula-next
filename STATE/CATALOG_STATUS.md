# CATALOG_STATUS — Digital Textbook Layer

_Last updated: 2026-05-18_

---

## Overview

The Premium Catalog is a digital textbook shell that presents all 95 worksheets as a browsable, searchable, printable library. It reads data exclusively from `meta/topics.json` and renders it on the fly — no content is hardcoded.

---

## Files

| File | Status | Purpose |
|---|---|---|
| `catalog.html` | Deployed (commit 8795161) | HTML skeleton — all IDs required by catalog.js |
| `catalog.css` | Deployed (commit 8795161) | Premium design — dark sidebar, card grid, viewer |
| `catalog.js` | Deployed, fix pending push (commit 11824ff) | Data loading, rendering, search, URL state |

---

## GitHub Pages live status

- URL: `https://yanivmizrachiy.github.io/parabula-next/catalog.html`
- **Status (2026-05-19):** catalog.html deployed correctly with all state IDs. topics.json accessible (HTTP 200). Catalog likely works in real browsers.
- Fixes deployed: `11824ff`, `83fa67c`, `71b4344`, `9c9e0f6`, `549976e`
- Topic "כללי" renamed to "פילוג מורחב" (commit `549976e`, push pending)
- Equations page ordering fixed: page 95 is now first in array (commit `549976e`)

---

## Features implemented

| Feature | Local status | Live status |
|---|---|---|
| Topic list (sidebar + home grid) | ✅ Working | ⚠️ Blocked by load error |
| Page cards with title + number | ✅ Working | ⚠️ Blocked by load error |
| Inline viewer (iframe) | ✅ Working | ⚠️ Blocked by load error |
| Prev/Next navigation within topic | ✅ Working | ⚠️ Blocked by load error |
| Print (opens worksheet in new tab) | ✅ Working | ⚠️ Blocked by load error |
| Open in new tab | ✅ Working | ⚠️ Blocked by load error |
| Full-text search across all pages | ✅ Working | ⚠️ Blocked by load error |
| URL state (?topic=X&page=N) | ✅ Working | ⚠️ Blocked by load error |
| Mobile bottom nav | ✅ Working | ⚠️ Blocked by load error |
| Sidebar overlay (mobile) | ✅ Working | ⚠️ Blocked by load error |
| Keyboard navigation (arrow/Esc) | ✅ Working | ⚠️ Blocked by load error |
| Page count stats in header | ✅ Working | ⚠️ Blocked by load error |

---

## Data contract

- Source: `meta/topics.json` (7 topics, 95 pages)
- catalog.js reads only — never writes
- Page display title: `page.title` (format: "עמוד N — נושא")
- Page number in badge: `page.topicIndex` (1-based within topic, computed at load time)
- Viewer iframe src: `page.file` (relative path like "עמוד-42.html")

---

## Design variables (catalog.css)

```css
--clr-bg:         #f8f9fc
--clr-sidebar-bg: #1a1f36
--clr-accent:     #4361ee
--clr-text:       #1a1f36
--sidebar-w:      260px
--header-h:       60px
```

Responsive breakpoints: 900px (sidebar collapses), 640px (cards go full-width).

---

## Known limitations

1. Worksheet iframe loads full HTML (with preview-nav visible) — no style injection to hide nav inside viewer
2. `mobile-topics.json` is frozen from 2026-03-19 and not auto-synced with `meta/topics.json`
3. No deep search by difficulty/grade/skill (future metadata)
4. Service worker (`sw.js`) controlled by mobile-app, affects all `/parabula-next/*` pages

---

## Next steps

See `STATE/NEXT_ACTIONS.md`.
