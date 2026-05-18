# Premium Design System — Parabula Next Catalog

_Last updated: 2026-05-18_

Applies to: `catalog.html` · `catalog.css` · `catalog.js`
Does NOT apply to: `עמוד-N.html` worksheet pages (those follow `styles/a4-base.css`)

---

## Design philosophy

- **RTL-first**: All Hebrew text, layout, and direction must be right-to-left
- **Premium textbook feel**: Dark sidebar, clean card grid, subtle shadows
- **Print-safe**: Catalog UI should never interfere with A4 worksheet printing
- **Mobile-ready**: Full functionality at 360px–900px screen width
- **Data-driven**: No hardcoded content — everything from `meta/topics.json`

---

## Color variables (catalog.css :root)

```css
--clr-bg:             #f8f9fc   /* main background */
--clr-sidebar-bg:     #1a1f36   /* dark navy sidebar */
--clr-sidebar-hover:  #252b4a   /* sidebar hover state */
--clr-sidebar-active: #4361ee   /* selected topic */
--clr-accent:         #4361ee   /* primary action color */
--clr-accent-hover:   #3451d1   /* hover state for accent */
--clr-text:           #1a1f36   /* primary text */
--clr-text-muted:     #6b7280   /* secondary text */
--clr-border:         #e5e7eb   /* card/section borders */
--clr-card-bg:        #ffffff   /* card background */
--clr-card-shadow:    rgba(0,0,0,.06)  /* card default shadow */
--clr-card-shadow-hover: rgba(67,97,238,.15)  /* card hover shadow */
```

---

## Typography

| Element | Font | Weight | Size |
|---|---|---|---|
| Brand title | Rubik | 700 | — |
| Section titles | Rubik | 600 | — |
| Body / labels | Rubik | 400 | — |
| Card number badge | Rubik | 700 | — |
| Topic count chips | Rubik | 500 | — |

Font loaded via Google Fonts CDN: `Rubik:wght@300;400;500;600;700`

---

## Layout grid

### Desktop (>900px)
```
┌─────────────────────────────────────────────────────┐
│ HEADER (fixed, 60px, full width)                    │
├───────────────────┬─────────────────────────────────┤
│ SIDEBAR (260px)   │ MAIN CONTENT                    │
│ (fixed right)     │ (padding-inline-end: 260px)     │
│ dark navy         │ card grid / viewer / search     │
└───────────────────┴─────────────────────────────────┘
```

### Mobile (≤900px)
- Sidebar slides in from right as overlay (`.is-open`)
- Dark overlay (`#sidebarOverlay`) covers main content
- Sidebar toggled via hamburger (`#mobileMenuBtn`)

### Mobile (≤640px)
- Cards go full-width (1 per row)
- Bottom nav bar appears when viewer is open

---

## Component specifications

### Header `.site-header`
- Fixed top, z-index: 100, full width
- Dark background (`#1a1f36`), white text
- 3 zones: brand · search · stats chips
- Height: `var(--header-h)` = 60px
- Padding: 0 24px (accounts for RTL)

### Sidebar `.sidebar`
- Fixed right (RTL), width: `var(--sidebar-w)` = 260px
- Top: `var(--header-h)`, bottom: 0
- Scrollable inner content
- Topic nav items: `button.topic-nav-item`
  - Active state: accent background + white text
  - Hover state: `--clr-sidebar-hover`

### Page cards `.page-card`
- White background, border-radius: 12px
- Subtle shadow, hover: stronger shadow + slight lift (`translateY(-2px)`)
- Active (viewer open): accent left border + tinted background
- Card number badge (`.card-num`): accent circle, top-right in RTL layout
- Two action buttons: "צפה" (primary, accent) + "הדפס" (secondary)

### Viewer `.viewer`
- A4 aspect ratio: `padding-block-end: 75%` (210÷297 ≈ 0.707, ~70.7% — use 75% for safe margin)
- Toolbar: topic label + page title + prev/next + print + open + close
- iframe: `border: none`, fills the wrapper absolutely

### Search `.search-wrap`
- Inside header, center position
- Clear button appears when text is entered
- Results section: `#stateSearch` with result count badge

---

## RTL rules

1. All layout uses logical properties: `margin-inline-end`, `padding-inline-start`, etc.
2. Sidebar is on the RIGHT (not left) — standard for Hebrew
3. Card badges position: logical top-right (which is physical top-left for English, but we're RTL)
4. Keyboard nav: Arrow RIGHT = previous, Arrow LEFT = next (RTL reading direction)
5. Hebrew text: `font-feature-settings: "kern" 1` for better kerning

---

## Responsive breakpoints

```css
/* Tablet / small desktop */
@media (max-width: 900px) {
  .sidebar → hidden by default, slides in as overlay
  .main-content → padding-inline-end: 0
}

/* Mobile */
@media (max-width: 640px) {
  .pages-grid → 1 column
  .home-topics-grid → 2 columns (or 1 if narrow)
  .viewer-toolbar → wrap on multiple lines
}
```

---

## Print behavior (catalog layer)

- `catalog.html` itself should never be printed accidentally
- Add to catalog.css if needed: `@media print { .site-header, .sidebar, .viewer-toolbar { display: none; } }`
- Printing worksheets: always open in NEW TAB to preserve A4 print contract
- The catalog UI is a navigation shell, not a printable document

---

## Design anti-patterns to avoid

- ❌ Hardcoded topic names or page numbers in CSS/HTML
- ❌ `overflow: auto` on anything that could contain A4 worksheet content
- ❌ `position: fixed` elements that obscure the iframe viewer
- ❌ Inline `style="..."` attributes in catalog.html
- ❌ Custom fonts other than Rubik (consistency)
- ❌ Colors that break in RTL context
- ❌ Layout that assumes LTR (use logical properties)
