# Equations Page 2 Lock — עמוד-42.html

> SUPERSEDED (2026-06-15): מסמך זה מתאר את העיצוב הישן ומפנה ל-PDF הישן בן 54 העמודים. מקור האמת הנוכחי הוא `sources/equations/משוואות-52.pdf` (52 עמודים), ועמוד-42 הומר ל-HTML+MathJax חי. ראה `STATE/EQUATIONS_DESIGN_PASS_RULES.md`.

Status: LOCK CANDIDATE / VERIFIED STRUCTURE

Scope:
- Topic: `משוואות`
- Page file: `עמוד-42.html`
- CSS file: `styles/pages/עמוד-42.css`
- This record does not apply to `משוואות ריבועיות`.

Evidence currently enforced by automation:
- `scripts/validate-equations-first3-readiness.mjs` checks that page 2 has exactly 10 exercises.
- It checks that page 2 has exactly 10 answer areas.
- It checks that page 2 has exactly 10 `data-correction="verified"` markers.
- `Equations Guard` runs this readiness guard automatically.

Operational decision:
- Do not rebuild page 2 from scratch.
- Do not change page 2 mathematical content unless a real source defect is found.
- Treat page 2 as locked for the current first-three-pages improvement stage.

Next page focus:
- Page 1 still needs source verification against `sources/legacy/parabula-old/sources/משוואות.pdf`.
- Page 3 remains SVG-based and must not be converted without source evidence.
