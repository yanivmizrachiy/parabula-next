Review or apply the Parabula Next worksheet page design system.

Use this command when:
- creating a new worksheet page
- reviewing an existing worksheet for design compliance
- checking if a proposed worksheet follows all design rules
- verifying math notation, RTL layout, A4 fit, SVG quality, or pedagogy

Reference document: `docs/WORKSHEET_PAGE_DESIGN_SYSTEM.md`

This command is READ-ONLY for review mode. Write mode requires explicit approval.

Default mode: REVIEW (read-only design compliance check).

What to do in review mode:

1. Read `docs/WORKSHEET_PAGE_DESIGN_SYSTEM.md` fully.
2. Read the target worksheet page (if specified).
3. Read the corresponding CSS file `styles/pages/עמוד-N.css`.
4. Use the a4-print-guardian agent to check print/A4 compliance.
5. Use the math-graphics-reviewer agent to check math notation and diagrams.
6. Check all 17 sections of the design system against the target page.

Report findings:

א. A4 print contract — עובר / נכשל
ב. HTML structure — עובר / נכשל
ג. RTL typography — עובר / נכשל
ד. Visual hierarchy — עובר / נכשל
ה. Hebrew math writing — עובר / נכשל
ו. MathJax notation — עובר / נכשל
ז. Graphics/SVG — עובר / נכשל
ח. Pedagogy — עובר / נכשל
ט. Metadata — עובר / נכשל
י. Quality gate checklist — כמה פריטים עוברים / כמה נכשלים

For each failure, report:
- Which rule was violated
- Exact location (line/element)
- What the fix should be

After review:
Ask: "האם לתקן את הבעיות שנמצאו?" before making any changes.

If Yaniv says yes to fixing:
1. Fix only the design issues — do not change educational content
2. Run npm test and npm run verify after fixing
3. Report what changed

Hard rules:
- Do not change the educational content of any worksheet (text, questions, answers)
- Do not change styles/a4-base.css
- Do not change any worksheet outside the explicitly reviewed page
- Do not run git add or commit without explicit request
- Design-only fixes only — never content changes
- If unsure whether a change affects content, stop and ask
