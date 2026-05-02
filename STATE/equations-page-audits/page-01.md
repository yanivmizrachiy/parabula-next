# Page 01 Pilot Audit — Equations

_Last updated: 2026-05-02_

## Identity

- Topic: `משוואות`
- Excluded topic: `משוואות ריבועיות`
- Topic-local page: 1 / 54
- Root page file: `עמוד-95.html`
- Page CSS file: `styles/pages/עמוד-95.css`
- Shared family CSS: `styles/topics/equations.css`
- SVG/content file: `pages/משוואות/assets/page-01.svg`

## User requirement status

This page is the current pilot. It is not a demo and it must not be used to claim that all equations pages are complete.

The goal is to verify one real page first, according to `PROJECT_RULES.md`, then expand only after the pilot is actually good.

## Changes already applied to this pilot

### Shared equations design standard attached

Status: done.

`עמוד-95.html` now links:

- `styles/a4-base.css`
- `styles/topics/equations.css`
- `styles/pages/עמוד-95.css`

### Pilot page class attached

Status: done.

`main` now uses:

- `a4-page`
- `page-95`
- `equations-page`

### Page-local CSS reduced

Status: done.

`styles/pages/עמוד-95.css` now contains only the local crop override:

- `--equations-crop-top: 118px`

The common visual rules live in `styles/topics/equations.css`.

### Wrong previous-page escape fixed

Status: done.

The previous link no longer escapes from the first equations page to `עמוד-40.html`.
The first page now marks the left control as `תחילת הנושא`.

## PROJECT_RULES checklist

### A. Topic and reality rules

Status: structurally OK.

- Topic is `משוואות`.
- No intentional merge with `משוואות ריבועיות`.
- No fake/demo worksheet content was added.
- No learning content was changed.

### B. A4 page contract

Status: structurally OK, visual verification still required.

- Root page exists as `עמוד-95.html`.
- The page contains one `main.a4-page.page-95` wrapper.
- A4 base is still `styles/a4-base.css`.
- `styles/a4-base.css` was not edited.
- Visual A4 usage still requires browser/phone verification.

### C. HTML / CSS separation

Status: OK.

- No inline CSS added.
- Styling is separated into CSS files.
- Shared family styling is in `styles/topics/equations.css`.
- Local page styling is in `styles/pages/עמוד-95.css`.

### D. RTL and math rules

Status: structurally OK.

- `dir="rtl"` is preserved.
- MathJax still uses `\( ... \)` inline delimiters.
- No `$...$` math delimiters were introduced.

### E. Navigation and numbering rules

Status: improved, structurally OK.

- `.preview-nav` exists.
- `.nav-meta` says `משוואות — עמוד 1 / 54`.
- `.page-number` equals `1`.
- The active topic link is `משוואות` with `.is-active` and `aria-current="page"`.
- The previous control was corrected so the first equations page does not escape to another topic.

### F. Shared equations design rules

Status: improved but not final.

- The pilot uses the shared equations design standard.
- The shared standard uses project tokens from `styles/a4-base.css`:
  - `var(--border-light)`
  - `var(--grid-line)`
  - `var(--bg-paper)`
  - `var(--bg-subtle)`
  - `var(--title-blue)`
  - `var(--text-main)`
- The style is not invented from outside the project.
- The page-local CSS is now minimal.

### G. SVG / caption-source rules

Status: still blocking final approval.

- The visible worksheet content is still an external SVG image.
- The SVG includes glyph/path content.
- Page CSS and shared CSS cannot honestly prove that every visible caption was redesigned at the real source layer.
- Final approval still requires SVG-level verification/redesign or reconstruction of the content layer.

### H. Mobile / preview / print rules

Status: not finally verified.

- The equations route exists and has been improved.
- This exact pilot page still requires real visual verification on phone.
- Browser print / Save as PDF still requires real visual verification.

## Decision

Page 1 is now a **real pilot with improved structure**, but it is **not finally approved**.

## Why it is not approved yet

The shell, shared standard, CSS separation, topic separation, and first-page navigation are now better aligned with `PROJECT_RULES.md`.

The remaining blocker is the actual SVG/caption layer and real visual proof:

- captions are not yet verified as redesigned at source level;
- mobile A4 preview still needs user-visible confirmation;
- print/PDF output still needs confirmation.

## Next required action

The next action should be one of these, in this order:

1. Visually inspect `עמוד-95.html` through `preview/equations.html` on phone and desktop.
2. Verify that the A4 boundary uses the page well and does not crop incorrectly.
3. Verify print / Save as PDF.
4. Decide whether the SVG layer is good enough as a source-level visual layer, or whether page 1 must be reconstructed as live HTML/CSS.

## Current progress

- Pilot page structurally improved: 1 / 54
- Pages checked manually: 5 / 54
- Pages finally approved: 0 / 54
- Final approval progress: 0%
