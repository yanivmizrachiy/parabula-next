Run a safe Parabula Next repository audit and report results only.

This command is READ-ONLY by default.

Before auditing, read `CLAUDE.md` in full. It is the only authoritative rules, requirements, memory, and AI-entry document.

Do not edit files, stage, commit, push, delete, change worksheet pages, change mobile runtime files, change print CSS, or change scripts/tests.

Audit goals:

1. Confirm current git branch and clean/dirty state.
2. Confirm `CLAUDE.md` exists and no duplicate active rules source exists.
3. Count worksheet source pages and topics.
4. Check `meta/topics.json` and its coverage.
5. Compare desktop and mobile coverage: all topics, all pages, global search, navigation, open, print/PDF, share/download where present.
6. Treat any desktop-mobile content or action gap as a critical issue.
7. Identify protected files.
8. Identify known issues already recorded in `CLAUDE.md`.
9. Report whether `npm test`, `npm run verify`, `npm run validate:access`, and `npm run rules:check` should be run next.
10. Recommend one safest next action only.

Output in Hebrew:

A. מצב Git
B. מקור הכללים היחיד
C. דפי עבודה ונושאים
D. שוויון נייד/נייח/הדפסה
E. בעיות ידועות
F. סיכונים
G. פעולה אחת הבאה בלבד

Implementation is not allowed unless Yaniv explicitly requests it.
