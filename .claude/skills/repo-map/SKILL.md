---
name: repo-map
description: Read-only repository state map. Shows current branch, commits, layer health, metadata sync, and the one safest next action.
---

## Role

Map the current state of Parabula Next before any work begins or resumes.

This skill is **read-only**. It does not write, commit, push, or delete anything.

---

## Invoke via

`/repo` command — or invoke this skill directly when a session is starting and context is unclear.

---

## What to inspect

May read:
- `STATE/LIVE_STATUS.md`
- `STATE/ARCHITECTURE_MAP.md`
- `STATE/PROJECT_CONTINUITY.md`
- `meta/topics.json` (count only)
- `mobile-topics.json` (count only)
- `git log --oneline -5`
- `git status`
- `.claude/commands/` (list only)
- `.claude/agents/` (list only)

Must NOT touch:
- עמוד-*.html
- styles/a4-base.css
- styles/pages/*.css
- mobile-app.*
- package.json
- scripts/
- tests/

---

## Safety rules

- Read only. No edits of any kind.
- Do not run npm test, npm install, or any build command.
- Do not run git add, commit, push, reset, or rebase.
- If STATE files are missing or stale, report it — do not recreate them.
- If meta/topics.json and mobile-topics.json counts differ, flag as a known sync gap.

---

## Output format

```
STATUS: [MAPPED / STALE-STATE / MISSING-STATE / SYNC-GAP]
DONE: [files/sources read]
EVIDENCE:
  - Branch: [name]
  - Last 5 commits: [list]
  - Worksheet count: [N pages, M topics]
  - mobile-topics.json sync: [match / gap of X pages]
  - Active commands: [count]
  - Active agents: [count]
  - Known open issues: [list or none]
BLOCKERS: [missing STATE files, sync gaps, or dirty git state]
NEXT: [one safest next action only]
PERCENT: [0–100 — how complete the repo map is]
```
