---
name: ui-graphics-review
description: Read-only review of UI design, visual layout, RTL typography, and design system compliance across preview and worksheet surfaces.
---

## Role

Review UI quality, visual design, and RTL layout correctness in Parabula Next.

Covers preview surfaces (desktop, mobile) and worksheet page visual design compliance.

This skill is **read-only** by default. Any proposed fix requires Yaniv's explicit approval.

---

## Invoke via

`/ui` command for general UI/RTL/design review.
`/design` command for worksheet design system compliance (uses `docs/WORKSHEET_PAGE_DESIGN_SYSTEM.md`).

Invoke directly before:
- Changing preview layer (preview/index.html, preview/topics.html, etc.)
- Reviewing RTL layout correctness
- Checking visual design consistency across worksheets
- Assessing a new worksheet page for design compliance

---

## What to inspect

May read:
- `preview/index.html`, `preview/topics.html`, `preview/all-pages.html`, `preview/app.html`
- `preview/print.html`
- `mobile-app.html`, `mobile-app.css`
- `docs/WORKSHEET_PAGE_DESIGN_SYSTEM.md` (if design system review)
- Target `עמוד-N.html` (layout/structure only, not educational content)
- Corresponding `styles/pages/עמוד-N.css`

Must NOT touch:
- Educational content of any עמוד-*.html
- `styles/a4-base.css`
- `meta/topics.json`
- `mobile-topics.json`
- `package.json`

---

## What to check

**RTL layout:**
- `dir="rtl"` or `direction: rtl` declared at root
- LTR exceptions use `direction: ltr; unicode-bidi: isolate`
- Hebrew text flows right-to-left consistently
- No LTR-default elements left unstyled in Hebrew context

**Visual hierarchy:**
- Page title → subtitle → instructions → questions
- Consistent font sizes and spacing
- Headers clearly distinguish from body text

**Typography:**
- Rubik font loaded for all Hebrew text
- No fallback fonts replacing Rubik in print
- Font sizes appropriate for print (not screen-only sizes)

**Design system compliance (for worksheets):**
- `.a4-page`, `.header-container`, `.page-title`, `.page-number` structure
- `.question-block` used for all question content
- No inline CSS, no `<style>` blocks

---

## Safety rules

- Read only. No edits without approval.
- Do not change design to match personal aesthetic preferences.
- Do not improve mobile/desktop preview in ways that damage print.
- Use `mobile-preview-auditor` and `editing-architecture-reviewer` agents for deeper analysis.
- Do not edit educational content — design compliance only.

---

## Output format

```
STATUS: [PASS / FAIL / WARNING / NEEDS-REVIEW]
DONE: [pages/files reviewed]
EVIDENCE:
  - RTL layout: [correct / N issues]
  - Typography: [correct / issues]
  - Design system compliance: [pass / N violations]
  - Visual hierarchy: [clear / issues]
  - Specific violations: [list with file:line or "none"]
BLOCKERS: [design violations blocking merge or deploy]
NEXT: [one safest next action]
PERCENT: [0–100 — how complete the UI/design review is]
```
