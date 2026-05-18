Review or update PROJECT_RULES.md for Parabula Next.

This command requires explicit approval before any edits.

Default mode: READ-ONLY review.

Do not edit PROJECT_RULES.md unless Yaniv explicitly says: "update PROJECT_RULES.md" with exact content.
Do not edit CLAUDE.md.
Do not edit any worksheet source.
Do not run git add, commit, push, reset, rebase, or delete.

What to do by default (read-only):

1. Read `PROJECT_RULES.md` fully.
2. Read `CLAUDE.md` fully.
3. Read `STATE/LIVE_STATUS.md`.
4. Compare PROJECT_RULES.md against LIVE_STATUS.md — identify any contradictions or outdated entries.
5. Identify any rules that are missing based on known project evolution (new equations design pass, mobile-topics sync gap, etc.).
6. Identify any rules that reference files or paths that no longer exist.
7. Report what should be added, changed, or removed — but do NOT apply changes without explicit approval.

If Yaniv asks to update rules:

1. Show the exact current text that would be changed.
2. Show the exact proposed new text.
3. Ask for explicit confirmation: "אישור לעדכן PROJECT_RULES.md?"
4. Only after explicit confirmation: use Edit tool with exact old_string and new_string.
5. After editing: report exactly what changed.
6. Do NOT run git add or commit unless explicitly asked.

Output in Hebrew:

א. מצב נוכחי של PROJECT_RULES.md
ב. סתירות או ערכים מיושנים
ג. כללים חסרים
ד. המלצות לעדכון (ללא ביצוע)
ה. פעולה הבאה

Rules:
- PROJECT_RULES.md is the primary source of truth — treat every edit as high-stakes.
- Never edit it to match assumptions — only to match verified current repo state.
- Never silently remove rules. Always explain why a rule is being removed.
- Preserve Hebrew language and writing style of existing rules.
