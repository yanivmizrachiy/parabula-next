# REPO_DOCTOR_PLAN — parabula-next

Status: planning document only. No scripts are created or changed by this file.

## Purpose

Define a future unified repository health command that summarizes the true state of rules, worksheets, metadata, app surfaces, validators, workflows, scripts, STATE, legacy, mobile, print, and visual QA.

## Core problem

The repository has many focused checks and many STATE files. Future AI agents need one high-level doctor report to avoid partial or misleading conclusions.

## Future command

Planned command:

```text
npm run doctor
```

or:

```text
node scripts/doctor/repo-doctor.mjs
```

## Doctor report outputs

Suggested outputs:

```text
STATE/DOCTOR_REPORT.md
STATE/DOCTOR_REPORT.json
```

## Required sections

The doctor report should include:

1. Git status and current branch.
2. Canonical file counts.
3. A4 worksheet contract status.
4. CSS contract status.
5. Metadata consistency status.
6. Topic separation status.
7. App surface status.
8. Mobile runtime status.
9. Print/PDF status.
10. Equations/page-95 status.
11. Legacy map status.
12. Validator status summary.
13. Workflow risk summary.
14. Script risk summary.
15. STATE index status.
16. Generated artifact policy status.
17. Visual QA status.
18. Open gates.
19. Delete/quarantine candidates status.
20. Final safe/unsafe judgment.

## Output categories

Each area should report:

- PASS
- WARN
- FAIL
- OPEN
- BLOCKED
- NOT_CHECKED

## Truth rules

The doctor must not report PASS if:

- no evidence was collected;
- a check was skipped;
- a generated artifact is missing but policy says artifact-only;
- a legacy validator fails but is not active;
- mobile was not tested on a real phone;
- print/PDF was not tested in a real browser path.

## Machine-readable JSON

The JSON report should include:

```json
{
  "generatedAt": "...",
  "commit": "...",
  "branch": "...",
  "summary": {
    "pass": 0,
    "warn": 0,
    "fail": 0,
    "open": 0,
    "blocked": 0
  },
  "areas": {}
}
```

## Safety mode

Default doctor mode should be read-only.

Possible modes:

```text
--readonly
--json
--markdown
--strict
--include-visual
--include-runtime
```

No doctor command should modify source files unless explicitly run with a future apply mode.

## Success condition

A future AI session can run one command and know what is actually safe, what is broken, what is legacy, what is unverified, and what must not be touched.
