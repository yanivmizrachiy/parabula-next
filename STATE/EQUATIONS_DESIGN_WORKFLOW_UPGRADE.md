# EQUATIONS_DESIGN_WORKFLOW_UPGRADE — ParabulaNext

_Last updated: 2026-05-02_

## Purpose

This file upgrades the working method for the `משוואות` page-family redesign.

The previous broad design pass is not enough for final approval. From now on, the work must be slower, evidence-based, and aligned with the existing project design language.

## Core correction from the user

The user clarified that:

- all equations pages must have a uniform design;
- the design must not be invented by the assistant;
- the design must match the rest of this project;
- page area usage must follow the project rules;
- all work must repeatedly consult `PROJECT_RULES.md`;
- page approval must be based on actual project requirements, not a generic visual opinion;
- nothing may be treated as demo or placeholder.

## Required source order before changing or approving any equations page

Before marking any equations page approved, consult in this order:

1. `PROJECT_RULES.md` — source of truth.
2. `styles/a4-base.css` — immutable base design tokens and A4 foundation.
3. Representative existing project pages and styles, especially pages with strong layout rules such as:
   - `styles/pages/עמוד-9.css`
   - `styles/topics/pythagoras.css`
4. The exact equations page files:
   - root page: `עמוד-N.html`
   - page CSS: `styles/pages/עמוד-N.css`
   - SVG/content asset: `pages/משוואות/assets/page-XX.svg`
5. Existing validation scripts and CI rules for equations.

## Existing project design language that equations must follow

Based on `styles/a4-base.css`, root pages use:

- `Rubik` as the worksheet font family;
- black main text: `--text-main: #000000`;
- project blue title token: `--title-blue: #1d4ed8`;
- neutral paper background: `--bg-paper: #ffffff`;
- subtle background: `--bg-subtle: #f8fafc`;
- light borders: `--border-light: #e2e8f0`;
- grid line color: `--grid-line: #cbd5e1`;
- exact A4 wrapper: `.a4-page` at `210mm × 297mm`;
- uniform `.header-container`, `.page-title`, and `.page-number` from the base stylesheet;
- content should be fixed by the content area, not by overriding the base header/page-number.

Based on existing project page design such as Pythagoras:

- page CSS is scoped to `.page-N`;
- page-specific CSS may use flex/grid to use available A4 space;
- problem blocks use `var(--bg-subtle)`, `var(--border-light)`, modest border radius, and compact spacing;
- writing areas use subtle grid backgrounds when appropriate;
- SVG text and geometry use inherited font, high-contrast black text, and `vector-effect: non-scaling-stroke` where strokes exist;
- solutions footers distribute content across the full width when present.

## Equations-specific non-negotiables

- Work only on the exact topic `משוואות`.
- Do not touch or merge `משוואות ריבועיות`.
- Current topic size: 54 pages.
- Do not change educational content unless the user explicitly instructs so.
- Do not edit `styles/a4-base.css`.
- Do not add inline CSS.
- Do not override `.header-container`, `.page-title`, or `.page-number` in page CSS.
- Do not approve a page just because it has a design-pass marker.
- Do not approve a page if its visible captions remain unverified glyph/path content inside an external SVG.

## New page-by-page approval standard

A page is approved only when all are true:

1. Its root HTML obeys the A4/RTL/navigation rules.
2. Its CSS is scoped to `.page-N` and uses the existing project tokens/style language.
3. It uses the A4 area well and does not leave large unintended blank regions.
4. It does not use fake overflow fixes.
5. Its caption/text layer is handled in the real source layer:
   - live HTML/SVG text is styled directly, or
   - SVG vector/glyph captions are redesigned or verified at SVG level, or
   - the page is reconstructed as structured HTML/CSS.
6. It is visually checked through the equations route on mobile/preview.
7. Print / Save as PDF remains A4.

## Faster but still real workflow

Instead of writing long manual notes first, proceed like this:

1. Audit a small batch of pages, but still record page-level evidence.
2. Identify repeated structural patterns across equations pages.
3. Create a shared equations design target that matches the project language.
4. Apply real corrections to one pilot page first.
5. Verify the pilot visually.
6. Only then apply the same correction pattern to matching pages.
7. Continue reporting exact progress percentages:
   - checked pages;
   - corrected pages;
   - finally approved pages.

## Current honest status

- 54 equations pages exist in scope.
- Pages checked manually so far: 5 / 54.
- Pages finally approved: 0 / 54.
- Main blocker: many pages use external SVG assets where visible captions appear to be glyph/path based, so page CSS alone cannot certify full caption redesign.

## Next correct move

The next work should not merely continue writing audit notes.

The next work should establish a real pilot correction path for page 1 or a repeated SVG/page pattern:

- inspect the SVG more deeply;
- decide whether captions can be restyled at SVG level;
- if yes, update one pilot SVG/page according to the existing project design language;
- if no, reconstruct one page as structured HTML/CSS without changing the learning content;
- verify visually before broad application.
