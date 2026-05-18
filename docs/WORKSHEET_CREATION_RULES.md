# Worksheet Creation Rules — Parabula Next

_Last updated: 2026-05-18_

---

## When to create a new worksheet

1. Yaniv provides source material (PDF, image, or text description)
2. A topic must be identified (existing or new)
3. The page number N is assigned (next available root file number)
4. Create `עמוד-N.html` + `styles/pages/עמוד-N.css` + update `meta/topics.json`

---

## Required HTML structure (exact)

```html
<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>עמוד X — שם הנושא</title>           <!-- X = number within topic, NOT global -->

  <!-- Shared A4 base — NEVER modify this file -->
  <link rel="stylesheet" href="styles/a4-base.css" />

  <!-- MathJax (required for all math notation) -->
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" id="MathJax-script" async></script>

  <!-- Page-specific CSS (only file where page styling lives) -->
  <link rel="stylesheet" href="styles/pages/עמוד-N.css" />
</head>
<body>

  <!-- Navigation bar — hidden in print -->
  <nav class="preview-nav">
    <div class="preview-nav-top">
      <div class="nav-side">
        <a class="nav-link" href="עמוד-[PREV].html">הקודם</a>  <!-- or empty div -->
      </div>
      <div class="nav-meta">שם הנושא — עמוד X / Y</div>
      <div class="nav-side">
        <a class="nav-link" href="עמוד-[NEXT].html">הבא</a>   <!-- or empty div -->
      </div>
    </div>
    <div class="preview-nav-topics">
      <a class="topic-link" href="עמוד-[FIRST-OF-TOPIC].html">נושא א</a>
      <a class="topic-link is-active" href="עמוד-N.html" aria-current="page">נושא ב</a>
      <!-- add one link per topic -->
    </div>
  </nav>

  <!-- A4 page — exactly 210mm × 297mm -->
  <main class="a4-page page-N [topic-class]">
    <header class="header-container">
      <h1 class="page-title">שם הנושא</h1>
      <div class="page-number">X</div>   <!-- X = position within topic -->
    </header>
    <div class="question-block">
      <!-- educational content here -->
    </div>
  </main>

</body>
</html>
```

---

## CSS file: `styles/pages/עמוד-N.css`

```css
/* ALL page-specific styling lives here — no inline CSS in HTML */

/* Selector must always start with .page-N to scope to this page */
.page-N .question-block { ... }
.page-N .q-text { ... }
.page-N .answer-line { ... }

/* Print adjustments (if needed) */
@media print {
  .page-N .something { ... }
}
```

**Forbidden in `styles/pages/עמוד-N.css`:**
- Modifying `.a4-page` dimensions (sacred — in a4-base.css)
- Overriding `overflow` on `.a4-page` (use only in a4-base.css)
- Importing external fonts (Rubik already loaded in a4-base.css)

---

## A4 page rules (non-negotiable)

| Property | Value | Why |
|---|---|---|
| `width` | `210mm` | ISO A4 |
| `height` | `297mm` | ISO A4 |
| `overflow` | `hidden` (screen) | prevents scroll |
| `overflow` | `visible` (print) | allows correct pagination |
| `padding` | `10mm 18mm` | standard margins |

**Content must fit within the A4 boundary.** If content is too long:
- Reduce font size (stay readable)
- Reduce spacing
- Split into multiple pages
- NEVER add `overflow: auto` or `overflow: scroll`

---

## MathJax notation rules

| Use | Syntax | Notes |
|---|---|---|
| Inline math | `\( x^2 + y^2 \)` | In running text |
| Display math | `$$ x = \frac{-b \pm \sqrt{b^2-4ac}}{2a} $$` | Centered, block |
| Two solutions | `\(x_1\)` and `\(x_2\)` | NOT `x1/x2` |
| Negative numbers | `\(-4\)` or "מינוס 4" | NOT "4 מינוס" |

**Never use:** `$...$` (single dollar signs) — conflict with some MathJax configs.

---

## SVG graphics rules

For geometry, graphs, and diagrams:

```html
<!-- Inline SVG only — no raster images -->
<svg viewBox="0 0 400 300" role="img" aria-label="תיאור הצורה">
  <!-- All strokes must use: -->
  <line ... style="vector-effect: non-scaling-stroke" />
  <path ... style="shape-rendering: geometricPrecision; vector-effect: non-scaling-stroke" />

  <!-- Right angle markers (square) must appear on geometric right angles -->
  <rect x="..." y="..." width="8" height="8" fill="none" stroke="currentColor" ... />
</svg>
```

**Quality requirements:**
- Clean vector lines — no blurry or screenshot-style graphics
- `vector-effect: non-scaling-stroke` on all strokes
- `shape-rendering: geometricPrecision` on geometric paths
- Label positions must be outside the figure, readable in print

**Coordinate system template (440px × 440px, 22px grid):**
See `docs/WORKSHEET_CREATION_RULES.md` section for coordinate system template.

---

## RTL rules in worksheets

1. `<html dir="rtl">` — set at root
2. For math expressions that must be LTR: use CSS only:
   ```css
   .page-N .math-ltr { direction: ltr; unicode-bidi: isolate; }
   ```
3. Answer boxes: typically `direction: ltr` for number entry
4. Never add `dir="ltr"` as an HTML attribute to a worksheet element

---

## Updating meta/topics.json after adding a page

After creating `עמוד-N.html`, add an entry to `meta/topics.json`:

```json
{
  "number": N,
  "file": "עמוד-N.html",
  "title": "עמוד X — שם הנושא",
  "h1": "שם הנושא",
  "topic": "שם הנושא",
  "previewPath": "/עמוד-N.html",
  "siteUrl": "https://yanivmizrachiy.github.io/parabula-next/עמוד-N.html"
}
```

Where:
- `N` = global file number (e.g., 96)
- `X` = position within the topic (e.g., 3 if it's the 3rd page on this topic)
- After updating `meta/topics.json`, also update `mobile-topics.json` (manual copy)
- Run `npm test` to verify the contract

---

## Common mistakes to avoid

- ❌ Adding `style="..."` or `<style>` to worksheet HTML
- ❌ Using `$...$` math delimiters (use `\(...\)` inline, `$$...$$` display)
- ❌ Using `overflow: auto` on `.a4-page`
- ❌ Putting LTR as HTML attribute instead of CSS
- ❌ Using raster images for math diagrams (use SVG)
- ❌ Forgetting to update `meta/topics.json` AND `mobile-topics.json`
- ❌ Not running `npm test` after adding a page
