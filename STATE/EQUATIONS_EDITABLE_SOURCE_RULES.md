# EQUATIONS_EDITABLE_SOURCE_RULES — ParabulaNext

_Last updated: 2026-05-07_

## Current truth

Some `משוואות` pages currently display imported SVG assets. In those assets, mathematical text may be converted into SVG paths/glyphs rather than live text.

Result:
- CSS font changes around the page do not reliably change the visible equation font.
- Directly editing one equation inside the SVG is fragile.
- A visual overlay can help temporarily, but it is not the final editable source.

## Binding rule

When the user asks to change equation content or equation fonts, do not treat closed SVG/PDF text as the final source.

The long-term source for corrected equations pages must be editable HTML/MathJax/CSS using:
- `main.a4-page.page-N`
- `styles/a4-base.css`
- `styles/topics/equations.css`
- page CSS in `styles/pages/עמוד-N.css`
- MathJax inline delimiters `\( ... \)`
- Rubik/project fonts from the existing project CSS
- no `<style>` blocks
- no `style="..."` attributes

## Temporary overlay policy

`styles/topics/equations-edits.css` may be used only as a temporary bridge for urgent visible corrections while converting the page to editable HTML.

Overlay is not considered full completion.

## Page 1 specific truth

For topic-local page 1, `עמוד-95.html`:
- The visible correction requested by the user is `6 + x = 6.5`.
- The previous overlay mechanism may validate in code but still be visually misplaced or hidden.
- The page clipping issue was addressed in `styles/pages/עמוד-95.css` by replacing crop/cover behavior with full-contain behavior.
- The correct next phase is to replace the closed SVG visual source with a live editable HTML/MathJax layout after the full page content is available and verified.

## Completion definition

Do not mark the equations page-editing system complete until:
- the corrected equation is visibly present in browser preview,
- equation fonts visibly match the project style,
- the page remains full A4 without left-side clipping,
- phone preview is checked,
- browser print / Save as PDF is checked,
- validation scripts include the editable-source rule.
