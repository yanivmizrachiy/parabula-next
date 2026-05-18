# Digital Textbook Architecture — Parabula Next

_Last updated: 2026-05-18_

---

## System overview

Parabula Next has three independent layers:

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1 — Worksheets (canonical, protected)         │
│  עמוד-N.html · styles/pages/עמוד-N.css              │
│  210mm × 297mm · MathJax · SVG · RTL                │
└─────────────────────────────────────────────────────┘
         ↑ read-only source of truth

┌─────────────────────────────────────────────────────┐
│  LAYER 2 — Digital Textbook (catalog layer)          │
│  catalog.html · catalog.css · catalog.js             │
│  Reads meta/topics.json — never modifies it          │
└─────────────────────────────────────────────────────┘
         ↑ shell — points to worksheets

┌─────────────────────────────────────────────────────┐
│  LAYER 3 — CI/CD + Quality Gates                    │
│  .github/workflows/ · scripts/ · tests/             │
└─────────────────────────────────────────────────────┘
```

---

## Layer 2: Catalog architecture

### Entry point

`catalog.html` at repo root — served at `/parabula-next/catalog.html` on GitHub Pages.

### Data loading

```
DOMContentLoaded
  → init()
    → loadData()
      → fetch(absolute URL of meta/topics.json, {cache:'no-store'})
      → build state.topics and state.allPages (flat)
      → renderSidebar()
      → renderHome()
      → showState('home')
    → readURLState()  ← restore ?topic=X&page=N from URL
```

### State machine

The catalog has 5 UI states, each mapping to a DOM section:

| State | Element | When shown |
|---|---|---|
| `loading` | `#stateLoading` | Initial, while fetch in progress |
| `error` | `#stateError` | fetch failed — shows actual `err.message` |
| `home` | `#stateHome` | No topic selected — shows topic grid |
| `topic` | `#stateTopic` | Topic selected — shows page cards + viewer |
| `search` | `#stateSearch` | Search query active — shows filtered results |

### URL state

`?topic=<topicName>&page=<pageNumber>` — pushed via `history.pushState`, read on load.

### Viewer

- Inline `<iframe id="viewerFrame">` inside `#stateTopic`
- A4 aspect ratio maintained via `padding-block-end: 75%` (210:297 ≈ 75%)
- `sandbox="allow-same-origin allow-scripts allow-popups allow-forms"`
- Opened via `page.file` (relative path like `"עמוד-42.html"`)
- Close → `src = 'about:blank'` to stop network requests

### Print behavior

`printPage(page)` opens `page.file` in a NEW TAB (`window.open(page.file, '_blank', 'noopener')`), then fires `window.print()` after the page loads. This preserves A4 print quality — the catalog UI is never printed.

---

## meta/topics.json structure

```json
{
  "generatedAt": "ISO timestamp",
  "siteUrl": "https://yanivmizrachiy.github.io/parabula-next/",
  "totalPages": 95,
  "topics": [
    {
      "name": "משוואות",
      "count": 54,
      "pages": [
        {
          "number": 1,
          "file": "עמוד-1.html",
          "title": "עמוד 1 — משוואות",
          "h1": "משוואות",
          "topic": "משוואות",
          "previewPath": "/עמוד-1.html",
          "siteUrl": "https://yanivmizrachiy.github.io/parabula-next/עמוד-1.html"
        }
      ]
    }
  ]
}
```

**catalog.js adds at load time** (these are NOT in topics.json):
- `topicName` — string copy of the parent topic name
- `topicIndex` — 1-based page position within the topic
- `topicTotal` — total page count for the topic

---

## Service Worker interaction

`sw.js` (registered by `mobile-app.js` and `mobile-app-install.js`) has scope `/parabula-next/` and uses a **network-first** strategy. It intercepts ALL same-origin GET requests including those from `catalog.html`.

**Known risk:** If `cache.put(req, fresh.clone())` throws inside the SW (e.g., due to certain GitHub Pages response headers), the error propagates and the original fetch from `catalog.js` fails. Fix: wrap `cache.put` in its own try/catch inside sw.js (requires approval).

---

## GitHub Pages deployment

Source: `dist/` directory built by CI (`deploy-pages.yml`)

```
Vite build (index.html only)
  → cp -r meta dist/
  → cp -r styles dist/
  → cp -r preview dist/
  → for *.html: cp to dist/
  → for *.css *.js sw.js: cp to dist/
  → deploy dist/ to GitHub Pages
```

Base path: `/parabula-next/` (configured in `vite.config.js`)

Live URL: `https://yanivmizrachiy.github.io/parabula-next/`

---

## Future growth plan

When adding hundreds more worksheets:

1. Add `עמוד-N.html` + `styles/pages/עמוד-N.css` per new page
2. Update `meta/topics.json` (and sync `mobile-topics.json`)
3. CI runs tests + deploys
4. Catalog automatically displays new pages (no catalog code changes needed)

The catalog is data-driven — it requires zero code changes for new worksheets.
