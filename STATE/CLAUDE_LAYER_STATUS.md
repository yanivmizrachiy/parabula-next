# Claude Layer Status — Parabula Next

## Purpose

This file records the current verified Claude Code working layer for Parabula Next.

It exists to reduce repeated context loading and token usage. Claude should read this file together with `CLAUDE.md` and `PROJECT_RULES.md` before proposing future work.

## Project identity

Parabula Next is a Hebrew RTL printable A4 math worksheet production system.

The core product is printable worksheets. Mobile and desktop views are support layers for preview, navigation, review, editing, and printing.

## Verified current state

- `main` is the canonical branch.
- Local `main` must stay synchronized with `origin/main`.
- No direct push to `main` should be used for non-trivial changes.
- Use small branch + Draft PR + safety check + squash merge.
- Do not use `git add .`.
- Do not change protected files without explicit approval.

## Claude commands (13 active — branch: work/parabula-claude-skills-continue)

**Safety & orientation:**
- `.claude/commands/safety.md` — `/safety` — שער בטיחות לפני שינויים
- `.claude/commands/repo.md` — `/repo` — מפת ריפו + פעולה הבאה
- `.claude/commands/continue.md` — `/continue` — המשך שיחה מהמצב הנוכחי
- `.claude/commands/next.md` — `/next` — פעולה בטוחה אחת הבאה

**Validation:**
- `.claude/commands/verify.md` — `/verify` — npm test + verify + validate:access
- `.claude/commands/audit.md` — `/audit` — full repo audit

**Domain review:**
- `.claude/commands/print.md` — `/print` — A4 / CSS / הדפסה
- `.claude/commands/mobile.md` — `/mobile` — mobile-app + sync
- `.claude/commands/math.md` — `/math` — MathJax + SVG
- `.claude/commands/ui.md` — `/ui` — UI + RTL + עיצוב

**Workflow:**
- `.claude/commands/rules.md` — `/rules` — ניהול PROJECT_RULES.md
- `.claude/commands/worksheet.md` — `/worksheet` — הוספת דף עבודה
- `.claude/commands/pr-pack.md` — `/pr-pack` — חבילת PR
- `.claude/commands/hygiene.md` — `/hygiene` — ניקוי וארגון ריפו

## Claude agents (7 active)

- `.claude/agents/git-safety-manager.md` — שמירת בטיחות git
- `.claude/agents/source-of-truth-guardian.md` — אכיפת PROJECT_RULES.md
- `.claude/agents/a4-print-guardian.md` — שמירת A4 / הדפסה / RTL
- `.claude/agents/mobile-preview-auditor.md` — mobile + desktop preview
- `.claude/agents/math-graphics-reviewer.md` — MathJax + SVG + גרפיקה
- `.claude/agents/editing-architecture-reviewer.md` — ארכיטקטורת עריכה
- `.claude/agents/test-validation-runner.md` — הרצת בדיקות ופרשנות

## Last known validation baseline

The repository validation was run read-only.

Verified effective results:

- `npm test` passed.
- 96 tests passed.
- 0 tests failed.
- `npm run verify` passed with canonical contracts OK.
- `npm run validate:access` passed with access layer validation OK.
- Git status remained clean after validation.

Note: one previous PowerShell wrapper produced `RESULT=FAIL` because the wrapper mixed command output with exit-code values. The underlying validation commands passed.

## Protected areas

Do not change casually:

- worksheet source pages
- `עמוד-*.html`
- `styles/a4-base.css`
- `styles/pages/*.css`
- `mobile-app.*`
- `preview/*`
- `meta/topics.json`
- `mobile-topics.json`
- `package.json`
- `scripts/`
- `tests/`

## Required workflow

1. Learn
2. Check rules
3. Plan
4. Execute one small approved change
5. Validate
6. Document
7. Use branch + PR
8. Merge only after file safety check

## Token-saving workflow

Prefer PowerShell/local scripts for broad scanning and validation.

Give Claude only short summaries unless deep review is necessary.

Claude should be used mainly for:

- interpreting concise reports
- planning one next action
- reviewing risks
- writing small controlled changes
- checking source-of-truth alignment

## Current next safe direction

Before changing worksheet/mobile/print code, continue strengthening safe workflow only if needed.

Recommended next actions should be small, isolated, and PR-based.
