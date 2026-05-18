---
name: pr-review-pack
description: Pre-PR review pack. Classifies changed files by risk, runs verification, and generates a Hebrew PR summary ready for Yaniv's approval before opening.
---

## Role

Generate a complete, honest PR summary for Parabula Next before any pull request is opened.

This skill confirms safety, classifies risk, and produces the exact PR body — but does not open the PR. Yaniv must approve first.

---

## Invoke via

`/pr-pack` command — always invoke before `gh pr create`.

---

## What to inspect/run

May read and run:
- `git status` — working tree must be clean
- `git log main..HEAD --oneline` — list all commits on this branch
- `git diff main...HEAD --name-only` — list all changed files
- `npm test` (via `test-validation-runner` agent)
- `npm run verify`
- Protected file list from CLAUDE.md + PROJECT_RULES.md

Must NOT run:
- `gh pr create` — not without explicit Yaniv approval
- `git push` — not without explicit Yaniv approval
- `git merge` — forbidden here
- `git add .` — forbidden
- `git reset` — forbidden

---

## Risk classification

| Changed files | Risk level |
|---|---|
| `.claude/` only | Low — no production impact |
| `STATE/` or `docs/` only | Low — documentation |
| `scripts/` or `tests/` | Medium — tooling changes |
| `preview/` or `mobile-app.*` | Medium — app layer |
| `עמוד-*.html` or `styles/` | High — protected files |
| `meta/topics.json` or `mobile-topics.json` | Medium — metadata |
| `styles/a4-base.css` | Critical — blocked without explicit approval |

---

## Safety rules

- Do not open a PR without Yaniv's explicit "yes."
- If protected files changed, flag them explicitly — do not downplay the risk.
- Do not push to main. Confirm branch is a work/* branch before generating summary.
- Use `git-safety-manager` agent if git state is unclear.

---

## Output format

```
STATUS: [READY-FOR-PR / NOT-READY / BLOCKED]
DONE: [what was checked]
EVIDENCE:
  - Branch: [name]
  - Commits on branch: [N — list]
  - Changed files: [list by category]
  - Protected files changed: [none / list with risk]
  - npm test: [pass / fail]
  - npm run verify: [pass / fail]
  - git status: [clean / dirty]
BLOCKERS: [test failures, protected files without approval, dirty git state]
NEXT: [PR title (Hebrew, ≤60 chars) + PR body (Hebrew, using /pr-pack format)]
PERCENT: [0–100 — how complete the PR review is]
```

After generating, ask Yaniv: "האם לפתוח PR עם הסיכום הזה?"
Do NOT run `gh pr create` unless Yaniv explicitly says yes.
