Show current Parabula Next repository map and the one safest next action.

This command is READ-ONLY.

Do not edit files.
Do not run git add, commit, push, reset, rebase, or delete.

What to read and report:

1. `STATE/LIVE_STATUS.md` — live canonical state snapshot.
2. `STATE/ARCHITECTURE_MAP.md` — layer map (if it exists).
3. `STATE/PROJECT_CONTINUITY.md` — in-progress work across sessions (if it exists).
4. `meta/topics.json` — count total topics and pages.
5. `mobile-topics.json` — confirm page count matches meta/topics.json.
6. Git branch and log (last 5 commits).
7. `.claude/commands/` — list available commands.
8. `.claude/agents/` — list available agents.

Report:

א. ענף + 5 קומיטים אחרונים
ב. מצב קנוני: דפי עבודה, נושאים, מטא-דאטה
ג. בעיות סנכרון ידועות (mobile-topics.json וכו׳)
ד. שכבות הריפו — מה פעיל, מה legacy
ה. כלים פעילים (commands + agents)
ו. עבודה בין-שיחתית (מה היה בתהליך)
ז. בעיות ידועות פתוחות
ח. פעולה אחת בטוחה הבאה

Rules:
- Do not guess at repo state — read the files.
- Do not propose implementation — planning and mapping only.
- If STATE files are missing or stale, note it clearly.
- Output in Hebrew.
