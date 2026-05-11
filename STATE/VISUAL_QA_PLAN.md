# VISUAL_QA_PLAN — parabula-next

Status: planning document only. No visual tooling or runtime files are changed by this file.

## Purpose

Define the future visual quality-assurance layer required to ensure worksheets are not only valid by code, but also look correct on A4, mobile, preview, and print.

## Core problem

A validator can pass while a worksheet still looks bad: clipped content, gray empty area, cramped layout, tiny text, print overflow, or mobile mis-centering.

## Visual QA goals

- catch A4 clipping;
- catch page overflow;
- catch mobile left/right clipping;
- catch excessive gray/empty area in mobile reader;
- catch tiny or unreadable text;
- catch bad centering;
- catch print scaling errors;
- compare before/after for visual regressions;
- produce evidence, not claims.

## Required visual surfaces

Each important worksheet/page should eventually be checked in:

1. A4 desktop preview;
2. mobile reader viewport;
3. print preview / print stylesheet mode;
4. relevant app surface if special, such as equations.

## Future screenshot outputs

Suggested future output paths:

```text
artifacts/visual/a4/עמוד-N.png
artifacts/visual/mobile/עמוד-N.png
artifacts/visual/print/עמוד-N.png
artifacts/visual/diff/עמוד-N.png
```

These should usually be CI artifacts, not committed source files, unless explicitly approved.

## Checks to automate

Planned automated checks:

- page renders without console errors;
- A4 page bounding box matches expected ratio;
- no vertical scroll inside `.a4-page`;
- no horizontal clipping in mobile iframe;
- page is centered in reader;
- print mode does not add unexpected overflow;
- MathJax rendered when required;
- no visible placeholder/demo text;
- navigation controls are visible and clickable.

## Checks requiring human review

Some checks remain visual/human:

- premium design quality;
- mathematical readability;
- visual hierarchy;
- appropriate white space;
- clear answer areas;
- teacher usability;
- age-level suitability.

## Tooling direction

Future implementation can use:

- Playwright for screenshots and browser checks;
- local preview server;
- image diffs for regression;
- mobile viewport presets;
- print media emulation where possible.

## Required viewports

Initial planned viewport set:

- A4/desktop preview viewport;
- common mobile portrait viewport;
- large mobile viewport;
- print media mode.

## Validation policy

A page is not visually approved until:

1. screenshot evidence exists;
2. no obvious clipping/overflow appears;
3. mobile reader is comfortable;
4. print/PDF path is checked;
5. review status is documented.

## Non-goals

- Do not commit large screenshot artifacts by default.
- Do not claim visual approval from code-only tests.
- Do not visually approve all 95 pages without actual screenshots or sampled strategy.

## Success condition

Future worksheet changes can be reviewed with real visual evidence instead of relying only on HTML/CSS validators.
