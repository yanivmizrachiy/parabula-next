# Equations Page 1 — Automated Source Match

> SUPERSEDED (2026-06-15): מסמך זה מתאר את עיצוב-המשוואות הישן ואת ה-PDF הישן בן 54 העמודים (`sources/legacy/parabula-old/sources/משוואות.pdf`). מקור האמת הנוכחי הוא `sources/equations/משוואות-52.pdf` (52 עמודים), ועמוד-95 הומר ל-HTML+MathJax חי. ראה `STATE/EQUATIONS_DESIGN_PASS_RULES.md`.

Date: 2026-05-27_15:33:20

Scope:
- Topic: משוואות
- Page: עמוד-95.html
- Source PDF: sources/legacy/parabula-old/sources/משוואות.pdf
- Excluded: משוואות ריבועיות

Automated visual source match:
- BEST_FILE=pdf-page-01.png
- BEST_SCORE=2116.35
- SECOND_SCORE=4711.77
- RATIO=2.226
- Decision: SOURCE_VISUAL_MATCH_OK

Meaning:
The rendered PDF page 1 is the strongest visual match for pages/משוואות/assets/page-01.svg.

Important limitation:
pdftotext did not extract the equations from the PDF, so this is visual-source evidence, not text-extraction evidence.

Operational decision:
- Do not change mathematical content by guessing.
- Do not touch quadratic equations.
- Page 1 is visually source-matched for the current first-three-pages stage.
