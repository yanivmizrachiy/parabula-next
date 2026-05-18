Check Parabula Next mobile app status and metadata sync. Report only — do not edit files.

This command is READ-ONLY.

Do not edit files.
Do not run git add.
Do not commit.
Do not push.
Do not delete.

What to check:

1. Confirm `mobile-app.html`, `mobile-app.js`, `mobile-app.css`, `mobile-app.webmanifest` all exist.
2. Read `mobile-app.js` — verify it fetches `./mobile-topics.json` (not `meta/topics.json`).
3. Compare `mobile-topics.json` vs `meta/topics.json`:
   - Count topics and pages in each.
   - List pages present in `meta/topics.json` but missing from `mobile-topics.json`.
   - List pages present in `mobile-topics.json` but missing from `meta/topics.json`.
   - Report the last-modified date of `mobile-topics.json`.
4. Check `mobile-app-install.html` exists and links correctly.
5. Check `preview/phone.*` files — confirm they exist but are legacy-adjacent (not canonical).
6. Check whether `sw.js` and `preview/sw.js` both exist (known duplication issue).
7. Check `mobile-app.webmanifest` for PWA correctness (name, icons, start_url).
8. Look at `scripts/` for any sync script between `meta/topics.json` and `mobile-topics.json` — note if none exists.

Do NOT modify any files. Do NOT run any script that writes files.

Output in Hebrew:

א. מצב קבצי mobile-app
ב. מצב PWA (manifest, sw.js)
ג. מצב סנכרון mobile-topics.json vs meta/topics.json
ד. דפים חסרים ב-mobile-topics.json
ה. בעיות ידועות פתוחות
ו. סיכונים
ז. פעולה אחת הבאה בלבד

Rules:
- Do not propose changes to `mobile-app.*` without explicit approval from Yaniv.
- Do not propose changes to `mobile-topics.json` without listing the exact diffs first.
- Do not propose changes to worksheet source pages.
- Mobile improvements must never damage A4 print quality.
- The mobile reader is iframe-based by design — do not propose architectural rewrites.
