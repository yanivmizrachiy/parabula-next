---
name: math-quality-review
description: Read-only review of math notation, MathJax correctness, SVG diagram quality, and textbook-grade visual math in worksheet pages.
---

## Role

Review mathematical content quality in Parabula Next worksheets.

Target quality level: textbook/workbook grade. Not "good enough" — correct and visually precise.

This skill is **read-only** by default. Any proposed fix requires Yaniv's explicit approval.

---

## Invoke via

`/math` command — or invoke directly before:
- Adding or modifying math content in a worksheet page
- Reviewing SVG geometry diagrams
- Checking MathJax rendering correctness
- Assessing whether a new diagram meets quality standards

---

## What to inspect

May read:
- Target `עמוד-N.html` (math/SVG content)
- Corresponding `styles/pages/עמוד-N.css`
- `STATE/LIVE_STATUS.md` for context

Must NOT touch:
- Educational content (questions, answers, text)
- `styles/a4-base.css`
- `meta/topics.json`
- `mobile-topics.json`
- `package.json`

---

## Quality standards to verify

**MathJax notation:**
- Inline: `\(...\)` — never `$...$`
- Display: `$$...$$`
- No malformed LaTeX (unclosed delimiters, bad commands)

**SVG diagrams:**
- `vector-effect: non-scaling-stroke` on all stroked elements
- `shape-rendering: geometricPrecision` on geometric shapes
- Right-angle markers (ריבוע) present where appropriate
- Labels positioned correctly (outside axes, near vertices)
- Line thickness consistent and readable at print size

**Coordinate systems:**
- Grid unit: 22px
- Arrows at axis ends
- Labels outside the grid area

**Print readability:**
- All math/diagrams readable at A4 print size (not just screen)
- No blurry raster images where vector is practical
- Black-and-white print still readable if color removed

---

## Safety rules

- Read only. No edits without approval.
- Do not replace working MathJax setup with alternatives.
- Do not replace SVG with raster images.
- Do not change educational content — only math/diagram rendering.
- Use `math-graphics-reviewer` agent for detailed per-page analysis.

---

## Output format

```
STATUS: [PASS / FAIL / WARNING / NEEDS-REVIEW]
DONE: [pages/files reviewed]
EVIDENCE:
  - MathJax notation: [correct / N violations found]
  - SVG quality: [textbook-grade / issues found]
  - Coordinate systems: [correct / issues]
  - Print readability: [pass / fail]
  - Specific violations: [list with file:line or "none"]
BLOCKERS: [quality violations that must be fixed before merge/deploy]
NEXT: [one safest next action]
PERCENT: [0–100 — how complete the math quality review is]
```
