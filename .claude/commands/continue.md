Resume work in Parabula Next from the current repository state without restarting context.

This command is READ-ONLY for state recovery. It does not modify files.

Use this at the start of a new conversation to quickly re-orient before taking any action.

What to read:

1. `STATE/LIVE_STATUS.md` — canonical live state.
2. `STATE/PROJECT_CONTINUITY.md` — cross-session work log (if it exists).
3. `STATE/ARCHITECTURE_MAP.md` — repo layer map (if it exists).
4. `CLAUDE.md` — project rules and constraints.
5. `git log --oneline -10` — last 10 commits.
6. `git status` — current working tree.
7. `git branch` — current branch.
8. Check if any `.claude/` files were recently updated (these record in-progress work).

Do not run tests or validation unless Yaniv explicitly asks.
Do not edit files.
Do not run git add, commit, push, reset, or rebase.

Report in Hebrew:

א. ענף נוכחי + 5 קומיטים אחרונים
ב. מה היה בתהליך (מ-PROJECT_CONTINUITY + git log)
ג. מצב קנוני עכשיו (דפים, נושאים, sync status)
ד. בעיות פתוחות שנותרו מהשיחה הקודמת
ה. שכבות שפעלת בהן לאחרונה
ו. פעולה אחת בטוחה הבאה

Rules:
- Do not assume current state from memory — read the files.
- Do not propose implementation — orientation and planning only.
- Do not start working until Yaniv confirms the state is correct.
- If something looks wrong (branch, files, status), flag it before anything else.
- The right question after /continue: "האם המצב הזה נכון? מה אנחנו עושים עכשיו?"
