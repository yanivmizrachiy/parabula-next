# .claude/skills — Parabula Next Skills Layer

Detailed skill specifications for Parabula Next.

Each skill lives in its own folder with a `SKILL.md` that defines: the skill's role, what it may inspect, what it must never touch, safety rules, and the required structured output format.

**Skills are not slash commands.** Use the `/command` in `.claude/commands/` to invoke behavior interactively. Skills define the contract behind each command.

**None of these skills may bypass Yaniv's approval rules.** Every skill that may write or modify files requires explicit approval for each specific file.

---

## Skill index

| Skill | Invoked via | Read-only? | May suggest changes? |
|---|---|---|---|
| `repo-safety-gate` | `/safety` | Yes | No — report only |
| `repo-map` | `/repo` | Yes | No — report only |
| `mobile-reader-guard` | `/mobile` | Yes | Reports gap; fix requires approval |
| `a4-print-rtl-guard` | `/print` | Yes | Reports violations; fix requires approval |
| `math-quality-review` | `/math` | Yes | Reports issues; fix requires approval |
| `ui-graphics-review` | `/ui`, `/design` | Yes | Reports issues; fix requires approval |
| `ci-release-gate` | (direct / pre-merge) | Yes | Reports readiness only |
| `docs-state-sync` | `/hygiene` | Yes* | May update REPO_CLEANUP_PLAN.md only |
| `pr-review-pack` | `/pr-pack` | Yes | Generates PR body; Yaniv approves before open |

*`docs-state-sync` may append new findings to `REPO_CLEANUP_PLAN.md`. This is the only allowed write action.

---

## When to use each skill

**Before any file change:**
→ `repo-safety-gate` first. Always.

**At the start of a session or when state is unclear:**
→ `repo-map`

**Before touching mobile-app.* or mobile-topics.json:**
→ `mobile-reader-guard`

**Before touching styles/, print CSS, or worksheet HTML:**
→ `a4-print-rtl-guard`

**Before adding or modifying worksheet math content or SVG diagrams:**
→ `math-quality-review`

**Before changing preview layer, RTL layout, or design compliance:**
→ `ui-graphics-review`

**Before merging to main or confirming a deployment:**
→ `ci-release-gate`

**When new files appeared or STATE looks stale:**
→ `docs-state-sync`

**Before opening any pull request:**
→ `pr-review-pack`

---

## Output format (all skills use this)

Every skill produces output in this structure:

```
STATUS: [skill-specific status]
DONE: [what was inspected]
EVIDENCE: [specific findings with file:line references]
BLOCKERS: [issues that must be resolved before proceeding]
NEXT: [one safest next action only]
PERCENT: [0–100 — completion of this check]
```

---

## What these skills must never do

- Run `git add .`
- Force push, reset --hard, rebase without approval
- Delete any file
- Modify worksheet source files (`עמוד-*.html`)
- Modify `styles/a4-base.css`
- Modify `meta/topics.json` or `mobile-topics.json` without approval
- Modify `package.json`
- Open a PR without Yaniv saying yes
- Trigger GitHub Actions workflows
- Install packages
- Create fake content, demo data, or placeholder UI

---

## Relationship to agents and commands

```
/command (slash command)       → describes WHAT to do and in what order
skill SKILL.md                 → defines the contract, safety rules, and output format
agent agents/*.md              → specialized sub-Claude for deep analysis tasks
```

A command typically invokes one or more agents and follows the skill's contract.
A skill may reference agents by name — the command wires them together.
