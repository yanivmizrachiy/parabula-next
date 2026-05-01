# EQUATIONS_PAGE_BY_PAGE_DESIGN_AUDIT — ParabulaNext

_Last updated: 2026-04-30_

## Scope

This is a slow, page-by-page design audit for the exact topic:

- `משוואות`

Excluded topic:

- `משוואות ריבועיות`

This audit is not a bulk claim. A page is approved only after checking its HTML, CSS, SVG/content source, A4 behavior, mobile behavior, and whether captions/text are genuinely styled according to the project rules.

## Progress

- Pages in scope: 54
- Pages checked: 2 / 54
- Pages finally approved: 0 / 54
- Audit progress: 3.7%
- Final approval progress: 0%

## Page 1 audit

### Identity

- Topic-local page: 1 / 54
- Root page file: `עמוד-95.html`
- CSS file: `styles/pages/עמוד-95.css`
- SVG/content file: `pages/משוואות/assets/page-01.svg`

### HTML check

Status: structurally OK.

Findings:
- The page is RTL.
- It links `styles/a4-base.css`.
- It links `styles/pages/עמוד-95.css`.
- It contains `main.a4-page.page-95`.
- It points to the expected SVG: `pages/משוואות/assets/page-01.svg`.
- Navigation metadata says `משוואות — עמוד 1 / 54`.

### CSS check

Status: partially OK.

Findings:
- CSS is scoped to `.page-95`.
- The design-pass marker exists.
- No global `.header-container`, `.page-title`, or `body,html,.a4-page` override was identified in the current page CSS.
- However, the CSS mainly styles the container/image placement and does not truly restyle the internal SVG captions if the SVG text is not live text.

### SVG / captions check

Status: not finally approved.

Finding:
- The page content is loaded as an external SVG image.
- The root HTML/CSS cannot reliably restyle captions inside an external SVG image.
- Initial SVG inspection did not find live `<text>` elements in the SVG, which means the visible Hebrew/math captions are likely vector glyphs/paths from the original source rather than editable styled text.

### Decision

Page 1 is checked, but **not approved as fully redesigned**.

Reason:
- The page shell and CSS are improved, but the actual visible captions inside the SVG cannot yet be certified as redesigned according to project rules.

### Required next action for page 1

Choose and implement one real correction path before approving page 1:

1. Convert the SVG captions into live editable text with project fonts/styles, or
2. Rebuild the page content as structured HTML/CSS instead of relying on the original SVG image, or
3. Produce a verified SVG-level design pass that updates the visual caption styling directly inside the SVG.

Until one of these is done and visually checked, page 1 remains **not finally approved**.

---

## Page 2 audit

### Identity

- Topic-local page: 2 / 54
- Root page file: `עמוד-42.html`
- CSS file: `styles/pages/עמוד-42.css`
- SVG/content file: `pages/משוואות/assets/page-02.svg`

### HTML check

Status: structurally OK.

Findings:
- The page is RTL.
- It links `styles/a4-base.css`.
- It links `styles/pages/עמוד-42.css`.
- It contains `main.a4-page.page-42`.
- It points to the expected SVG: `pages/משוואות/assets/page-02.svg`.
- Navigation metadata says `משוואות — עמוד 2 / 54`.
- Previous/next links are topic-local: previous `עמוד-95.html`, next `עמוד-43.html`.

### CSS check

Status: partially OK.

Findings:
- CSS is scoped to `.page-42`.
- The design-pass marker exists.
- No global `.header-container`, `.page-title`, or `body,html,.a4-page` override was identified in the current page CSS.
- However, the CSS mainly styles the container/image placement and does not truly restyle the internal SVG captions if the SVG text is not live text.

### SVG / captions check

Status: not finally approved.

Findings:
- The page content is loaded as an external SVG image.
- The SVG contains a font-unify style marker, but the actual visible captions appear to be glyph/path based rather than simple live HTML/SVG text.
- Therefore the page shell CSS cannot honestly be treated as full caption redesign.

### Decision

Page 2 is checked, but **not approved as fully redesigned**.

Reason:
- The page shell and CSS are improved, but the visible caption layer inside the SVG still needs SVG-level verification or reconstruction before final approval.

### Required next action for page 2

Before approving page 2, implement one real correction path:

1. Verify and restyle live SVG text if it exists, or
2. Update the SVG/vector caption layer directly, or
3. Rebuild the page content as structured HTML/CSS.

Until then, page 2 remains **not finally approved**.
