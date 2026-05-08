# EQUATIONS_PUBLIC_CLEANUP_STATUS

## Current decision

The public worksheet page must look like a math worksheet, not like an AI/internal editing dashboard.

## Fixed

- Removed public "גרסה עריכה" link from page 1.
- Removed public "תיקון עריך" panel from page 1.
- Removed public "גרסה עריכה" / "טרם הומר לעריכה" UI from equations app.
- Kept only the temporary visual correction layer for the known requested equation:
  - `6 + x = 6.5`
- Kept left-side clipping fix:
  - `object-fit: contain`
  - no `object-fit: cover`
- Moved the bad editable prototype to `STATE/internal-drafts/` instead of keeping it public.

## Important truth

The current page is still based on a legacy SVG visual source. That means it is not yet a fully editable HTML/MathJax worksheet.

## Correct next phase

Reconstruct page 1 as a real worksheet using verified content only:

- HTML for structure
- MathJax for equations
- CSS in a separate file
- no inline styles
- no system/debug/prototype text in public pages
- no invented equations
