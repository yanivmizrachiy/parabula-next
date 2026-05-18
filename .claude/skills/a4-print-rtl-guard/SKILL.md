---
name: a4-print-rtl-guard
description: Read-only guard for A4 print quality, Hebrew RTL correctness, and print CSS contracts across worksheet pages. The core product check.
---

## Role

Protect the core product: printable Hebrew RTL A4 math worksheets.

A4 print quality and Hebrew RTL fidelity are non-negotiable. This skill checks both before any CSS, HTML, or layout change is approved.

This skill is **read-only** by default. Any proposed fix requires Yaniv's explicit approval.

---

## Invoke via

`/print` command — or invoke directly before any change touching:
- `styles/a4-base.css`
- `styles/pages/עמוד-N.css`
- Any `עמוד-N.html` layout element
- Print CSS or `@media print` rules

Also invoke when reviewing a new worksheet page design.

---

## What to inspect

May read:
- `styles/a4-base.css`
- `styles/pages/עמוד-N.css` (specific page if targeted)
- `עמוד-N.html` (structure only, not educational content)
- `preview/print.html`

Must NOT touch:
- Educational content of any עמוד-*.html
- styles/a4-base.css (read-only — protected)
- package.json
- scripts/
- tests/

---

## A4 contract to verify

```css
.a4-page {
  width: 210mm;
  height: 297mm;
  overflow: hidden;   /* screen */
}
@media print {
  @page { size: A4; margin: 0; }
  .a4-page { overflow: visible; }
  .preview-nav { display: none; }
}
```

Hard rules to check:
- `width: 210mm` and `height: 297mm` — exact, no deviation
- `overflow: hidden` on screen, `overflow: visible` on print
- Never `overflow: auto` anywhere on .a4-page
- No inline `style="..."` on worksheet HTML elements
- No `<style>` blocks inside worksheet HTML
- RTL declared at root; LTR only via `direction: ltr; unicode-bidi: isolate`

---

## Safety rules

- Read only. No edits without approval.
- Do not "improve" A4 layout unless a concrete bug was found.
- Do not improve mobile by damaging print.
- Do not hide overflow issues with `overflow: hidden` on sub-elements.
- Use `a4-print-guardian` agent for deeper print/layout analysis.

---

## Output format

```
STATUS: [PASS / FAIL / WARNING / NEEDS-REVIEW]
DONE: [files inspected]
EVIDENCE:
  - A4 dimensions: [correct / incorrect]
  - overflow contract: [correct / violation found]
  - inline CSS violations: [none / list]
  - RTL declarations: [correct / issues]
  - @media print block: [present / missing]
  - .preview-nav hidden in print: [yes / no]
BLOCKERS: [specific violations — file:line]
NEXT: [one safest next action]
PERCENT: [0–100 — how complete the A4 guard check is]
```
