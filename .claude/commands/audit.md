Run a safe Parabula Next repository audit and report results only.

This command is READ-ONLY by default.

Do not edit files.
Do not run git add.
Do not commit.
Do not push.
Do not delete.
Do not change worksheet pages.
Do not change mobile-app files.
Do not change print CSS.
Do not change package.json.
Do not change scripts or tests.

Audit goals:

1. Confirm current git branch and clean/dirty state.
2. Confirm CLAUDE.md exists.
3. Confirm PROJECT_RULES.md exists.
4. Read CLAUDE.md and PROJECT_RULES.md before making recommendations.
5. Count worksheet source pages.
6. Check whether meta/topics.json exists.
7. Check whether mobile-topics.json exists.
8. Compare metadata/page coverage if safe.
9. Identify protected files that must not be changed casually.
10. Identify known issues already documented in PROJECT_RULES.md.
11. Report whether npm test, npm run verify, and npm run validate:access should be run next.
12. Recommend one safest next action only.

Output in Hebrew:

A. מצב Git
B. קבצי מקור אמת
C. דפי עבודה קיימים
D. מובייל/נייח/הדפסה — מצב כללי
E. בעיות ידועות
F. סיכונים
G. פעולה אחת הבאה בלבד

Important:
This command is for audit and planning only.
Implementation is not allowed unless Yaniv explicitly approves the exact files and risk.
