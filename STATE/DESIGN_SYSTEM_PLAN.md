# DESIGN_SYSTEM_PLAN — parabula-next

Status: planning document only. No CSS/runtime files are changed by this file.

## Purpose

Define a future design system for premium, consistent, RTL-first, print-safe A4 math worksheets.

## Core problem

The repository has many page-specific CSS files. Without a design system, new worksheets may look inconsistent, become hard to maintain, or break print/mobile behavior.

## Design goals

- premium visual quality;
- consistent worksheet structure;
- true A4 print safety;
- Hebrew RTL readability;
- mobile-reader compatibility;
- easy future editing;
- no inline styles;
- scoped CSS only;
- no global page regressions.

## Planned design layers

| Layer | Purpose |
|---|---|
| base | A4/page-level primitives, protected. |
| tokens | spacing, typography, borders, colors, radii. |
| components | reusable worksheet blocks. |
| themes | controlled visual profiles. |
| page CSS | page-specific composition only. |

## Proposed future folders

No folder move is performed now. Target structure idea:

```text
styles/base/
styles/tokens/
styles/components/
styles/themes/
styles/pages/
```

## Design tokens

Future tokens should define:

- spacing scale;
- font scale;
- border scale;
- print-safe shadows;
- color roles;
- table roles;
- geometry roles;
- answer-space roles;
- difficulty badges;
- teacher-note roles.

## Core components

Planned reusable components:

- worksheet-header;
- page-number;
- problem-card;
- exercise-grid;
- answer-line;
- solution-space;
- math-table;
- multiple-choice;
- true-false block;
- geometry-canvas;
- coordinate-grid;
- axis-system;
- theorem-box;
- hint-box;
- teacher-note;
- difficulty-badge.

## Theme profiles

Planned profiles:

- clean practice;
- premium worksheet;
- formal test;
- discovery / investigation;
- geometry visual;
- coordinate-system focused;
- compact review;
- colorful younger-student style.

## CSS safety rules

Design-system CSS must not:

- override `body` or `html` globally from page CSS;
- globally change `.a4-page` sizing;
- globally change `.header-container` or `.page-number` without base-level review;
- use `overflow: auto` to force A4 fit;
- introduce non-print-safe effects;
- depend on screen-only layout for print.

## Print safety

Every component must be checked for:

- print readability;
- no clipping;
- no page overflow;
- no hidden essential content;
- no excessive background ink unless intentionally approved;
- browser print compatibility.

## Mobile compatibility

Worksheet design should be readable through the mobile reader without changing canonical worksheet content.

Mobile fixes belong mostly to:

- `mobile-app.*`
- reader scaling;
- iframe fit;
- navigation controls.

Not to random changes in worksheet pages.

## Future implementation strategy

1. Create tokens/components as additive CSS only.
2. Apply to one pilot worksheet.
3. Validate A4, mobile, and print.
4. Expand gradually by worksheet family.
5. Never mass-rewrite all worksheets without visual regression.

## Success condition

New worksheets share consistent professional design, are easy to edit, print correctly, display comfortably, and do not require custom CSS hacks for every page.
