Run a math notation and diagram quality review for Parabula Next worksheet content.

This command is READ-ONLY by default.

Do not edit worksheet source files.
Do not edit SVG content.
Do not run git add, commit, push, or delete.

Use the math-graphics-reviewer agent to perform this review.

What to check:

1. MathJax notation correctness:
   - Inline math: `\(...\)` — confirm, never `$...$`
   - Display math: `$$...$$` — confirm
   - Check for malformed LaTeX (missing closing delimiters, bad commands)
2. SVG diagram quality:
   - `vector-effect: non-scaling-stroke` present on all stroked elements
   - `shape-rendering: geometricPrecision` present on geometric SVGs
   - Labels are positioned correctly (outside axes, near vertices)
   - Right-angle markers (ריבוע) are present where appropriate
   - Line thickness is consistent and readable at print size
3. Coordinate system diagrams:
   - Grid is 22px unit
   - Arrows at axis ends
   - Labels outside the grid area
4. Print readability:
   - All math/diagrams readable at A4 print size
   - No blurry raster images where vector is practical
   - Black-and-white print still readable if color removed

If reviewing a specific page, read that page and its CSS before reporting.

Output in Hebrew:

א. דפים שנבדקו
ב. ממצאי MathJax (שגיאות / הערות)
ג. ממצאי SVG (איכות / בעיות)
ד. ממצאי קריאות בהדפסה
ה. בעיות שדורשות תיקון
ו. המלצות לשיפור (ללא ביצוע)
ז. פעולה אחת בטוחה הבאה

Rules:
- Do not edit worksheets without explicit approval from Yaniv.
- Do not replace SVG with raster images.
- Textbook-quality graphics are required — not "good enough."
- Print quality takes priority over screen appearance.
