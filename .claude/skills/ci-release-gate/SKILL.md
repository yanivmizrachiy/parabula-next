---
name: ci-release-gate
description: Pre-release CI/CD gate. Checks GitHub Actions workflow status, deployment pipeline health, and release readiness before any merge to main or public deploy.
---

## Role

Confirm that the CI/CD pipeline is healthy and the repository is ready for a safe merge or deployment.

This skill is **read-only**. It does not push, merge, deploy, or trigger workflows.

This is the only skill that directly reads GitHub Actions state.

---

## When to invoke

- Before merging any branch into main
- Before confirming a GitHub Pages deployment is safe
- After a CI failure to understand what broke
- When the last CI run result is unknown
- Before reporting that the repo is "production ready"

---

## What to inspect/run

May read and run:
- `gh run list --limit 10` — recent workflow runs
- `gh run view [run-id]` — specific run details
- `gh pr checks [PR-number]` — CI checks for a specific PR (if applicable)
- `.github/workflows/*.yml` — active workflow definitions
- `STATE/LIVE_STATUS.md` — last known CI baseline
- `npm test` output (via `test-validation-runner` agent, read-only)
- `npm run verify` output (read-only)

Must NOT run:
- `git push` — forbidden here
- `git merge` — forbidden here
- `gh pr merge` — forbidden
- `gh workflow run` — do not trigger workflows
- `git reset`, `git rebase` — forbidden
- Any command that modifies production state

---

## Workflow files to verify (canonical set)

```
.github/workflows/deploy-pages.yml       ← build + test + deploy to GitHub Pages
.github/workflows/recovery-audit.yml     ← audit on every push
.github/workflows/preview-guard.yml      ← guard preview layer
.github/workflows/repository-health.yml  ← health check
```

Any workflow not in this list should be flagged as unclassified.

---

## GitHub Pages deployment check

- URL: `https://yanivmizrachiy.github.io/parabula-next/`
- Deployment workflow: `deploy-pages.yml`
- Base path: `/parabula-next/` (configured in vite.config.js)
- Check: was the last deploy-pages run successful?

---

## Release readiness checklist

All must be true before STATUS is READY:

1. Last `deploy-pages.yml` run: success
2. Last `recovery-audit.yml` run: success
3. Local `npm test`: all pass
4. Local `npm run verify`: pass
5. Local `npm run validate:access`: pass
6. Current branch: clean (no uncommitted changes)
7. Protected files: not modified without documented approval
8. No active workflow failures on main

---

## Safety rules

- Do not trigger, cancel, or re-run any GitHub Actions workflow.
- Do not merge or push to resolve a CI failure — diagnose first.
- Do not report READY if any checklist item is unknown (treat unknown as FAIL).
- If CI is failing on main, escalate to Yaniv immediately before any further work.
- Use `test-validation-runner` agent to run local checks, not CI.

---

## Output format

```
STATUS: [READY / NOT-READY / CI-FAILING / UNKNOWN]
DONE: [what was checked — workflows, local tests, git state]
EVIDENCE:
  - deploy-pages.yml last run: [success / fail / unknown — run ID + date]
  - recovery-audit.yml last run: [success / fail / unknown]
  - preview-guard.yml last run: [success / fail / unknown]
  - repository-health.yml last run: [success / fail / unknown]
  - npm test: [pass / fail / not run]
  - npm run verify: [pass / fail / not run]
  - npm run validate:access: [pass / fail / not run]
  - git status: [clean / dirty]
  - Protected files: [untouched / modified — list]
  - GitHub Pages last deploy: [success / fail / date]
BLOCKERS: [any CI failure, local test failure, or unresolved protected-file change]
NEXT: [one safest next action — fix, rerun, or proceed]
PERCENT: [0–100 — how complete the CI/release gate check is]
```
