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

## Completion standard

Do not mark the design pass as complete until:

- all 54 equations pages are covered
- the validator passes
- the access layer remains valid
- visual preview is checked
- print/PDF flow is checked
- no quadratic-equation pages are affected

## Current status

Status: design pass formally defined and documented.

No claim is made yet that all 54 equations pages have been redesigned or visually verified.
