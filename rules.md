# RULES.md — Parabula Next Quick Reference

> ⚠️ This file is a **quick-access summary**. The authoritative source is `PROJECT_RULES.md`.
> In any conflict, `PROJECT_RULES.md` wins.

---

## What this project is

A Hebrew RTL printable A4 math worksheet system — 95 pages, 7 topics.
The catalog (`catalog.html`) is a digital textbook shell over the worksheets.
Everything must stay suitable for thousands of future pages.

---

## Protected files — DO NOT TOUCH without explicit approval

```
עמוד-N.html              ← 95 canonical worksheet pages
styles/a4-base.css       ← immutable A4 CSS foundation
styles/pages/עמוד-N.css  ← per-page CSS (protected)
meta/topics.json         ← single source of truth for all page/topic data
mobile-topics.json       ← mobile copy (must stay synced with topics.json)
mobile-app.*             ← canonical mobile reader
sw.js                    ← service worker (affects mobile app)
package.json             ← dependencies — no changes without approval
scripts/                 ← automation scripts — no changes without approval
tests/                   ← test suite — no changes without approval
.github/workflows/       ← CI/CD — no changes without approval
sources/legacy/*         ← archive — read only
sources/backups/*        ← archive — read only
STATE/backup_*           ← archive — read only
meta/backup/*            ← archive — read only
.claude/settings.local.json ← NEVER commit this file
```

---

## Edit-safe: catalog/textbook layer

These 3 files belong to the digital textbook and may be edited freely:

```
catalog.html    ← catalog page structure
catalog.css     ← catalog styling
catalog.js      ← catalog logic (reads topics.json, never writes it)
```

---

## Non-negotiable rules

| Rule | Detail |
|---|---|
| A4 = 210mm × 297mm | Exact — never change |
| `overflow: hidden` | On screen in A4 — NEVER `overflow: auto` |
| `overflow: visible` | In `@media print` only |
| ZERO inline CSS | No `<style>` or `style="..."` in worksheet HTML |
| RTL everywhere | `dir="rtl"` on root; LTR only via CSS |
| MathJax delimiters | `\(...\)` inline · `$$...$$` display · never `$...$` |
| Topics distinct | Never merge "משוואות" and "משוואות ריבועיות" |
| No demo content | No fake data, fake buttons, placeholder text |
| Small safe commits | Never `git add .` — only stage specific files |
| No force push | Never |

---

## Workflow

```
1. Read PROJECT_RULES.md + STATE/LIVE_STATUS.md before changes
2. Identify affected files + risks
3. Edit small → test → document
4. npm test + npm run verify before any push
5. Stop before: git push · merge · force push · delete · changing protected files
```

---

## Key commands

```bash
npm test                  # run all 96 contract tests
npm run verify            # basic structure check
npm run validate:access   # canonical files check
node scripts/doctor.mjs   # full audit
```

---

## Data flow (catalog layer — read only)

```
meta/topics.json → catalog.js (fetch) → DOM rendered in catalog.html
meta/topics.json (manual copy) → mobile-topics.json → mobile-app.js
```

---

## Further reading

- Full rules: `PROJECT_RULES.md`
- Live state: `STATE/LIVE_STATUS.md`
- Architecture: `STATE/ARCHITECTURE_MAP.md`
- Catalog status: `STATE/CATALOG_STATUS.md`
- Next actions: `STATE/NEXT_ACTIONS.md`
- Digital textbook architecture: `docs/DIGITAL_TEXTBOOK_ARCHITECTURE.md`
- Design system: `docs/PREMIUM_DESIGN_SYSTEM.md`
- Worksheet creation: `docs/WORKSHEET_CREATION_RULES.md`
- Release checklist: `docs/RELEASE_CHECKLIST.md`

_Last updated: 2026-05-18_
