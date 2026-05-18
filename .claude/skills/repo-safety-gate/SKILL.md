---
name: repo-safety-gate
description: Pre-flight safety check before any repository change. Inspects git state, protected files, rule compliance, and Yaniv's approval requirements. Read-only.
---

## Role

Gate all non-trivial changes to Parabula Next.

Before any implementation is allowed, run this skill to confirm that the proposed work is safe to begin.

This skill is **read-only**. It does not write, commit, push, or delete anything.

---

## When to invoke

- Before touching any worksheet source file (`עמוד-*.html`)
- Before touching `styles/a4-base.css` or `styles/pages/*.css`
- Before touching `mobile-app.*`, `meta/topics.json`, `mobile-topics.json`
- Before any git operation that stages, commits, merges, or pushes
- Before creating a new branch for non-trivial changes
- Before running any destructive or irreversible command

---

## Inspection targets

May read:
- `CLAUDE.md`
- `PROJECT_RULES.md`
- `STATE/LIVE_STATUS.md`
- `STATE/CLAUDE_LAYER_STATUS.md`
- `.claude/agents/*.md`
- `.claude/commands/*.md`
- `git status` (read-only)
- `git log --oneline -10` (read-only)

Must NOT read or touch:
- `עמוד-*.html` source content (unless reviewing for safety, not editing)
- `styles/a4-base.css`
- Any backup or legacy archive

---

## Safety rules

- Do not run `git add .` — only specific files by name
- Do not force push
- Do not reset --hard without a backup branch and explicit approval
- Do not rebase without explicit approval
- Do not delete any files without explicit approval
- Do not edit protected files without explicit approval
- Do not bypass tests with `--no-verify`
- Do not create demo content, fake buttons, placeholder flows

---

## Agents to delegate to if needed

- `source-of-truth-guardian` — for rule compliance checks
- `git-safety-manager` — for git operation safety
- `a4-print-guardian` — if print/A4 files are involved
- `mobile-preview-auditor` — if mobile files are involved

---

## Output format

```
STATUS: [SAFE / UNSAFE / BLOCKED / NEEDS-APPROVAL]
DONE: [what was inspected]
EVIDENCE: [specific files/rules that were checked, what was found]
BLOCKERS: [any safety violation, rule conflict, or missing approval]
NEXT: [one safest next action only — or "wait for Yaniv's approval"]
PERCENT: [0–100 — how complete the safety check is]
```

---

## Hard constraints

- This skill never approves anything on behalf of Yaniv.
- If protected files are involved, output must state exactly which ones.
- If any safety rule is violated, STATUS must be UNSAFE or BLOCKED.
- Never proceed without this gate if a protected file is involved.
