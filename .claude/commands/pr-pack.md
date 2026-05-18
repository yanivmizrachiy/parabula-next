Generate a complete PR summary pack for Parabula Next before opening a pull request.

This command is READ-ONLY for audit. It generates output for you to review before using.

Do not open a PR automatically.
Do not run git push.
Do not run git merge.

What to do:

1. Run: `git status` — confirm working tree is clean.
2. Run: `git log main..HEAD --oneline` — list all commits on this branch.
3. Run: `git diff main...HEAD --name-only` — list all changed files.
4. Classify changed files:
   - `.claude/` only → safe, no production impact
   - `STATE/` or `docs/` only → documentation, low risk
   - `scripts/` or `tests/` → tooling changes, medium risk
   - `preview/` or `mobile-app.*` → app layer, medium risk
   - `עמוד-*.html` or `styles/` → protected, high risk — flag explicitly
   - `meta/topics.json` or `mobile-topics.json` → metadata, medium risk
5. Verify no protected files were changed without documented approval:
   - `styles/a4-base.css`
   - `עמוד-*.html` (unless this was a planned worksheet addition)
6. Use the test-validation-runner agent — run `npm test` and `npm run verify`.
7. Generate PR title (Hebrew, under 60 chars) and PR body.

PR body format:

```
## סיכום שינויים

[בוליטים — מה השתנה, בלי כיצד]

## קבצים שהשתנו

[רשימה קצרה לפי קטגוריה]

## קבצים מוגנים שלא נגעת בהם

[אישור מפורש שלא שונו]

## מה נבדק

- npm test: [עבר / נכשל]
- npm run verify: [עבר / נכשל]
- git status: [נקי / שינויים תלויים]

## סיכון

[נמוך / בינוני / גבוה — ולמה]

## מה לא עשוי עדיין (אם רלוונטי)

[בעיות פתוחות שנותרו]
```

Output in Hebrew.

After generating, ask Yaniv: "האם לפתוח PR עם הסיכום הזה?"

Do NOT run `gh pr create` unless Yaniv explicitly says yes.
