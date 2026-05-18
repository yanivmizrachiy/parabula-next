Run a UI, visual design, and RTL layout quality review for Parabula Next.

This command is READ-ONLY by default.

Do not edit files.
Do not run git add, commit, push, or delete.

Use the mobile-preview-auditor agent and editing-architecture-reviewer agent together for this review.

What to check:

1. RTL layout correctness:
   - `lang="he" dir="rtl"` on all page roots
   - Navigation order is RTL-correct (הקודם on right, הבא on left)
   - No text overflow cutting Hebrew words
   - Math equations with LTR content use `direction: ltr; unicode-bidi: isolate`
2. Desktop preview quality:
   - `preview/index.html` — sidebar + iframe layout
   - `preview/all-pages.html` — grid layout and filtering
   - `preview/topics.html` — topic browsing layout
3. Mobile reading quality:
   - `mobile-app.html` — full-screen iframe reader
   - Scale transform behavior (does A4 page fit the screen without clipping?)
   - Navigation comfort on small screens
   - No horizontal scroll on the mobile reader shell
4. Print preview access:
   - `preview/print.html` — print center layout
   - Can a user reach the print flow easily?
5. Visual hierarchy:
   - Page titles, numbers, and nav are clearly distinct
   - `is-active` topic link is visually clear
   - Font size is readable at all screen sizes
6. No screen-only changes that damage print:
   - Confirm any proposed visual changes do not break `@media print` rules

If reviewing a specific UI surface, read that file before reporting.

Output in Hebrew:

א. שכבת UI שנבדקה
ב. ממצאי RTL
ג. ממצאי Desktop Preview
ד. ממצאי Mobile Reader
ה. ממצאי גישה להדפסה
ו. בעיות שנמצאו
ז. סיכונים לשכבת ההדפסה
ח. פעולה אחת בטוחה הבאה

Rules:
- Do not improve mobile at the cost of print quality.
- Do not propose visual redesigns without explicit approval.
- RTL correctness is non-negotiable.
- The mobile reader is iframe-based by design — do not propose architectural rewrites.
- Do not implement changes unless Yaniv explicitly approved the exact files and risks.
