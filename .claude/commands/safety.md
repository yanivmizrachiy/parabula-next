Run a fast safety gate check for Parabula Next before any task that may change files.

This command is READ-ONLY.

Do not edit files.
Do not run git add, commit, push, reset, rebase, or delete.

Use the git-safety-manager agent to perform this check.

What to verify:

1. Current branch — confirm it is a safe work branch (not main directly).
2. Git status — list any untracked or modified files.
3. Check for uncommitted changes to protected files:
   - עמוד-*.html
   - styles/a4-base.css
   - styles/pages/*.css
   - meta/topics.json
   - mobile-topics.json
   - mobile-app.*
   - package.json
   - scripts/
   - tests/
4. Run `npm run validate:access` — confirm access layer is intact.
5. Confirm no forbidden operations are staged (git add ., rm -rf, etc.).
6. Rate overall safety: GREEN / YELLOW / RED.

Output in Hebrew:

א. ענף נוכחי
ב. מצב git (נקי / שינויים תלויים)
ג. קבצים מוגנים — האם נוגעו?
ד. תוצאת validate:access
ה. דירוג בטיחות: ירוק / צהוב / אדום
ו. פעולה אחת בטוחה הבאה

Hard rules:
- RED = stop. Do not proceed until issues are resolved.
- YELLOW = proceed with caution. Flag the risk before any change.
- GREEN = safe to proceed with the planned task.
- Never skip this check before a destructive or broad edit.
