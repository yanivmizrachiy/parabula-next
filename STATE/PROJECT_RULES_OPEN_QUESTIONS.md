# PROJECT_RULES_OPEN_QUESTIONS — parabula-next

Status: planning document only.

## Purpose

This file lists decisions that must be resolved before replacing `PROJECT_RULES.md` or starting cleanup work.

## Open decisions

| Area | Question | Recommended default |
|---|---|---|
| Docs app | Is `docs/mobile-app.*` a required public snapshot, generated copy, or legacy fallback? | Treat as legacy snapshot until verified. |
| Mobile metadata | Should `mobile-topics.json` be generated from `meta/topics.json` or kept only as legacy? | Do not use as canonical. Decide after reference scan. |
| Docs metadata | Should `docs/mobile-topics.json` be regenerated or archived as snapshot? | Treat as docs snapshot until verified. |
| Phone legacy | Should `preview/phone.*` remain for compatibility? | Keep, classify legacy/compat, do not delete. |
| Print legacy | Should `preview/print-center.js` remain as fallback? | Keep until references and runtime are checked. |
| Audit artifacts | Should `meta/audit/*.json` be committed or workflow artifacts only? | Define explicit artifact policy. |
| Rules sync | Should `rules-sync-check` be updated to new rules or classified legacy? | Update after rules rewrite approval. |
| Page 95 validators | Should old SVG/overlay validators remain? | Classify as legacy/transition. Add live-html validator. |
| Write workflows | Should any workflow push directly to main? | Prefer branch + PR only. |
| STATE structure | Should 156 STATE files be reorganized physically or indexed only? | Start with index only. No moving files yet. |

## Blocking rule

Do not begin deletion or broad cleanup until these questions have an initial decision record.
