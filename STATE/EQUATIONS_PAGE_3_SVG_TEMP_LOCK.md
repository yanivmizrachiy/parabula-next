# Equations Page 3 Temporary SVG Lock — עמוד-43.html

> SUPERSEDED (2026-06-15): מסמך זה מתאר את ה-SVG lock הזמני ואת ה-PDF הישן בן 54 העמודים (כולל `4 + x = \square`). מקור האמת הנוכחי הוא `sources/equations/משוואות-52.pdf` (52 עמודים), ועמוד-43 הומר ל-HTML+MathJax חי. ראה `STATE/EQUATIONS_DESIGN_PASS_RULES.md`.

Status: TEMPORARY SVG LOCK / PRINTABLE PRESENTATION

Scope:
- Topic: `משוואות`
- Page file: `עמוד-43.html`
- CSS file: `styles/pages/עמוד-43.css`
- Source SVG: `pages/משוואות/assets/page-03.svg`
- This record does not apply to `משוואות ריבועיות`.

Current decision:
- Page 3 remains SVG-based for the current first-three-pages improvement stage.
- Do not convert it to HTML/MathJax without reliable source evidence.
- Do not invent exercises from visual appearance.
- Use it as a temporary printable page only while source extraction/verification is pending.

Evidence currently enforced by automation:
- `scripts/validate-equations-first3-readiness.mjs` checks that page 3 still references `page-03.svg`.
- It checks that page 3 CSS does not use crop-risk layout such as translation or cover fitting.
- It checks that page 3 CSS keeps the SVG contained with `object-fit: contain`.
- `scripts/audit-equations-svg-conversion-plan.mjs` identifies whether SVG pages have text evidence or outline-only evidence before any conversion decision.
- `Equations Guard` runs these checks automatically.

Operational rules:
- Preserve `object-fit: contain` and avoid crop/translation layout fixes.
- If visual spacing requires improvement, adjust only safe page-specific presentation CSS.
- Do not edit mathematical content on this page until source evidence is available.
- Do not treat this page as final HTML/MathJax.

Next page focus:
- Page 1 still needs source verification against `sources/legacy/parabula-old/sources/משוואות.pdf`, especially `4 + x = \square`.
- Page 2 is locked for the current stage.
