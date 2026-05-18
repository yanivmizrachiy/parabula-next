---
name: mobile-reader-guard
description: Read-only guard for mobile-app.* files and mobile-topics.json synchronization. Detects sync gaps, broken fetch paths, and PWA integrity issues.
---

## Role

Protect the mobile reading experience in Parabula Next.

The canonical mobile path is `mobile-app.html` + `mobile-app.js` + `mobile-app.css` + `mobile-topics.json`.

This skill is **read-only** by default. Any proposed fix requires Yaniv's explicit approval.

---

## Invoke via

`/mobile` command — or invoke directly before any change touching mobile-app.* or mobile-topics.json.

Also invoke when:
- Adding new worksheet pages to meta/topics.json (mobile-topics.json may need sync)
- Debugging mobile layout or scaling issues
- Checking PWA manifest or Service Worker state

---

## What to inspect

May read:
- `mobile-app.html`
- `mobile-app.js`
- `mobile-app.css`
- `mobile-app.webmanifest`
- `mobile-topics.json`
- `meta/topics.json`
- `STATE/LIVE_STATUS.md`

Must NOT touch:
- עמוד-*.html
- styles/a4-base.css
- styles/pages/*.css
- meta/topics.json (read-only here)
- package.json

---

## Critical known issue

`mobile-topics.json` is a **frozen copy** of `meta/topics.json` from 2026-03-19.
If pages were added to `meta/topics.json` after that date, the counts will differ.
This skill must detect and report that gap.

---

## Safety rules

- Read only. No edits of any kind without approval.
- Do not modify mobile-topics.json without explicit approval and a sync plan.
- Do not change mobile-app.* files without explicit approval.
- Do not introduce a new mobile reading path — the canonical path is mobile-app.*.
- Use the `mobile-preview-auditor` agent for deeper mobile/desktop rendering checks.

---

## Output format

```
STATUS: [OK / SYNC-GAP / BROKEN / NEEDS-REVIEW]
DONE: [files inspected]
EVIDENCE:
  - meta/topics.json page count: [N]
  - mobile-topics.json page count: [M]
  - Sync gap: [none / X pages missing]
  - mobile-app.js fetch path: [correct / incorrect]
  - PWA manifest: [present / missing]
  - Service Worker: [sw.js present / missing]
BLOCKERS: [sync gap, broken fetch, missing files]
NEXT: [one safest next action — or "no action needed"]
PERCENT: [0–100 — how complete the mobile guard check is]
```
