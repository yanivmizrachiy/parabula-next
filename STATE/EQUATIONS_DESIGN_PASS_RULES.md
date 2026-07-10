# EQUATIONS_DESIGN_PASS_RULES — ParabulaNext

_Last updated: 2026-04-29_

## Purpose

This document records the official design-improvement pass for all non-quadratic equations pages in `parabula-next`.

The work is not demo work. It is a real repository design pass for the live topic:

- `משוואות`

The separate topic below must not be included, merged, renamed, or touched by this pass:

- `משוואות ריבועיות`

## Source rules studied before design

The design pass must follow `PROJECT_RULES.md` as the single source of truth.

Rules that control this pass:

- no demo content, fake content, fake buttons, fake reports, or fake workflows
- do not merge or blur `משוואות` and `משוואות ריבועיות`
- do not delete, merge, rename, or reassign pages without explicit user approval and rules update
- root worksheet pages live as `עמוד-N.html`
- every root worksheet page must contain exactly one `main.a4-page.page-N`
- `.a4-page` must remain exactly `210mm × 297mm`
- do not use `overflow: auto` as a fake fix for A4 height
- no inline CSS: no `<style>` blocks and no `style="..."` attributes
- page-specific CSS belongs only in `styles/pages/עמוד-N.css`
- `styles/a4-base.css` is immutable and must not be edited in this pass
- RTL must be preserved
- MathJax delimiters must remain `\( ... \)` and `$$ ... $$`; no `$...$`
- root page number badge `.page-number` must stay visually uniform
- do not override `.page-number` styling in page CSS
- do not override `.header-container` in page CSS; fix layout through content areas instead
- compact solutions footers should distribute answers across full width when present
- SVG strokes should be non-scaling where SVG editing is performed
- equations-family cleanup is allowed only as design-only cleanup
- design cleanup may normalize fonts, title presentation, spacing, visual residue, and SVG text styling
- design cleanup must not change learning text
- quadratic-equation pages are excluded unless explicitly requested

## Card design contract — משוואות בנעלם אחד (single-unknown equations)

These rules are binding for every non-quadratic equations page (`משוואות`) rebuilt as live HTML + MathJax from `משוואות.pdf`:

- **No per-exercise numbering.** Only the page is numbered, via the global `.page-number` badge in `.header-container`. Individual equation cards MUST NOT show a number badge (no `bullet-num`, no `1.` `2.` markers, no ordered-list counters).
- **Each equation is the focal point, centered inside the gray card area** (`.problem-block`, background `--bg-subtle`). The equation (`.problem-equation`) sits centered horizontally and vertically within its band above the writing area — prominent font weight 500, larger than body text. It must read like a professional textbook, not like a PDF pasted into HTML.
- Structure is the v2 gold-model card adapted for one unknown: `main.a4-page.page-N.equations-page` → `.question-block` → `.eq-body` → `.q-main` (instruction) + `.eq-grid` of `.problem-block` cards.
- Each card = centered `.problem-equation` (gray band) + `.solution-space` (white grid-paper writing area) + `.problem-answer` (`\(x\) = ` `.answer-box`).
- Provenance is mandatory and non-visual: `.eq-body[data-source="משוואות.pdf"][data-source-page="N"]` and each `.problem-block[data-source-line="K"]`. Content is transcribed only from the PDF — never invented.
- All other a4-base / RTL / MathJax / no-inline-CSS / per-page CSS rules above continue to apply.

## Actual target set

The canonical metadata file `meta/topics.json` currently lists 54 pages under the exact topic `משוואות`.

These 54 pages are the intended design-pass target set.

## Design pass intent

The design pass should make all equations pages look more professional and consistent according to the project rules, without changing the educational content.

Allowed design-only improvements:

- remove legacy visual residue
- improve A4 content usage without breaking the 210mm × 297mm contract
- normalize equation-page font usage only through page CSS
- normalize title presentation without overriding global header rules
- improve spacing inside the content area
- ensure page image/SVG presentation is stable and printable
- keep page-local CSS scoped to the specific `.page-N` class
- ensure the topic-local page order remains correct
- ensure print/PDF flow remains real browser print / Save as PDF

Forbidden actions:

- no demo rows, fake worksheets, placeholder content, or invented content
- no changes to learning text unless explicitly requested later
- no deletion of existing pages
- no merge with `משוואות ריבועיות`
- no editing `styles/a4-base.css`
- no inline CSS
- no visual fix that hides overflow instead of solving layout properly
- no global page CSS overrides such as unscoped `.header-container`, `.page-title`, or `body,html,.a4-page`

## Current known issue before design pass

Earlier equations cleanup left legacy global CSS overrides in equations page CSS files, including selectors such as:

- `.header-container`
- `.page-title`
- `body,html,.a4-page`

These selectors conflict with the rule that page CSS must not override global header/page-number behavior.

The design pass should remove or replace these with page-scoped selectors only after confirming that the resulting layout remains correct.

## Required documentation behavior

Every real design change must be documented in:

- this file
- `STATE/EQUATIONS_APP_STATUS.md` when relevant
- `PROJECT_RULES.md` if the operating contract changes

## Execution trigger

A safe documentation-only trigger was committed on 2026-04-29 to make GitHub Actions run the real design-pass workflow:

- `.github/workflows/apply-equations-design-pass.yml`

The workflow is expected to run `scripts/apply-equations-design-pass.mjs`, validate the equations family, and commit the resulting scoped CSS changes if any are produced.

## Completion standard

Do not mark the design pass as complete until:

- all 54 equations pages are covered
- the validator passes
- the access layer remains valid
- visual preview is checked
- print/PDF flow is checked
- no quadratic-equation pages are affected

## Production conversion from משוואות.pdf (2026-06)

The equations topic was rebuilt as live HTML + MathJax directly from the single
content source `משוואות.pdf` (faithful visual transcription, never OCR, never
invented). Pipeline:

- `meta/equations-content.json` — faithful per-page transcription (logical page ===
  PDF page). Each page carries `sourcePage`, optional `columns` (1 or 2), optional
  `fontSize`, and the `equations` array in worksheet reading order (right column
  top-to-bottom, then left column).
- `scripts/build-equations-pages.mjs` — data-driven generator. Rewrites only the
  worksheet body between `</header>` and `</main>` and writes the scoped
  `styles/pages/עמוד-N.css`. Picks font size from a TeX-aware visual-length proxy
  (so `\frac{a}{b}` does not over-shrink the font); honours an explicit `fontSize`.
- `scripts/audit-equations-master-map.mjs` — canonical `logical → file → status`
  map (`meta/equations-master-map.json`).

Content types covered faithfully: multiplication/like-terms, distributive
parentheses, negatives, both-sides equations, fractions (`\frac`), division
notations (`\div`, `:`), parameter equations (a, b, c, …), and proportions
(`\frac = \frac`, with added terms). Where the PDF prints a degenerate line
(e.g. page 17 `-15 + 1 = -12 - 2`, no unknown), it is transcribed as printed —
not corrected.

## Validation suite realignment (2026-06)

`npm run validate:equations:all` (`scripts/validate-equations-suite.mjs`) was
realigned to the live design. The legacy checks asserted a superseded design and
were retired from the canonical gate (script files kept for history):

- `validate-equations-app.mjs` — required a separate preview "equations app" and
  `img`/SVG-asset worksheets.
- `validate-equations-design-pass-strict.mjs` — required `.pdf-wrap` / `.pdf-page`
  image markers and the old `EQUATIONS_DESIGN_PASS_20260429` marker.
- `validate-equations-print-scope.mjs` — required the separate equations/print/
  topics preview surfaces.
- `validate-equations-pilot-page-1.mjs` — required an SVG "pilot" shell for page 1.
- `validate-equations-easy-edits.mjs` — required a temporary overlay on the PDF image.
- `validate-page-95-editable.mjs` — required a separate editable prototype page.

New canonical gate:

1. `scripts/audit-equations-master-map.mjs` — map consistency.
2. `scripts/validate-equations-live.mjs` — strict live-design validation of all 52
   converted pages (RTL, a4-base + scoped page CSS, no inline CSS, v2 wrapper
   `main.a4-page.page-N.equations-page`, correct badge + nav-meta, live `\(...\)`
   MathJax with no `$...$`, `eq-body`/`problem-block`/`problem-equation`/
   `solution-space` structure, provenance attributes, no `img.pdf-page` content).
3. `scripts/validate-access-layer.mjs` — access layer.

## Current status

Status: production conversion COMPLETE and verified.

- 52 / 54 logical pages converted to live HTML + MathJax (logical 1–52 →
  `עמוד-95`, `עמוד-42`…`עמוד-92`).
- Logical 53–54 (`עמוד-93`, `עמוד-94`) remain **EXTRA_UNVERIFIED** — they have no
  source page in `משוואות.pdf`, so they were intentionally not converted or invented.
- `npm run verify`, `npm run validate:equations:all`, and
  `node scripts/audit-equations-master-map.mjs` all pass
  (master map: total=54, LIVE=52, WRAP=2).
- Dense / fraction / proportion pages visually verified via headless render
  (no clipping, correct right→left column order, centered equations, no per-exercise
  numbering). No quadratic-equation pages touched.
