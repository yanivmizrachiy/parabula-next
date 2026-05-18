Check Parabula Next print CSS and A4 overflow correctness. Report only — do not edit files.

This command is READ-ONLY.

Do not edit files.
Do not run git add.
Do not commit.
Do not push.
Do not delete.

What to check:

1. Read `styles/a4-base.css` — verify A4 dimensions (210mm × 297mm), overflow: hidden in screen, overflow: visible in print, @page margin: 0.
2. Scan `styles/pages/עמוד-N.css` files (sample at least 10, including newest pages) — look for overflow: auto, overflow: scroll, or missing @media print rules.
3. Check `preview/print.html` and `preview/print.js` for print-related logic.
4. Check each worksheet HTML for inline `style=""` attributes that may affect print layout.
5. Check for `-webkit-print-color-adjust: exact` presence.
6. Check for any `@media print` rules that may conflict with a4-base.css.
7. Check MathJax CDN script is present and correct in a sample of worksheet pages.
8. Report whether `scripts/validate-equations-design-pass-strict.mjs` should be run.

Checks to run (safe, read-only):

```
npm run verify
npm run validate:access
```

Do NOT run `npm test` unless the user explicitly requests it.

Output in Hebrew:

א. מצב CSS הדפסה בסיסי (a4-base.css)
ב. ממצאים ב-CSS של דפים ספציפיים
ג. ממצאים ב-HTML inline styles
ד. מצב print.html / print.js
ה. בעיות פתוחות שנמצאו
ו. פעולה אחת הבאה בלבד

Rules:
- Do not propose changes to `styles/a4-base.css` without explicit approval from Yaniv.
- Do not propose changes to any worksheet HTML without explicit approval.
- Print quality must not be sacrificed for any other goal.
- If you find a serious print regression, flag it immediately before anything else.
