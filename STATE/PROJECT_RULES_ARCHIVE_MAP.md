# PROJECT_RULES_ARCHIVE_MAP — parabula-next

Status: planning document only.

## Purpose

The rewrite of `PROJECT_RULES.md` must preserve historical knowledge. This map defines where information should be kept when it no longer belongs in the living rules document.

## Archive targets

| Information moved out of living rules | Target location | Reason |
|---|---|---|
| Previous full rules text before rewrite | `STATE/history/PROJECT_RULES_PRE_REWRITE.md` | preserve historical context |
| Duplicate or old section numbering | `STATE/history/PROJECT_RULES_PRE_REWRITE.md` | not a living rule |
| `preview.ps1` references | `STATE/history/PROJECT_RULES_PRE_REWRITE.md` or tooling issue | file missing in current main |
| `test:watch:page` references | `STATE/history/PROJECT_RULES_PRE_REWRITE.md` or future package script issue | package script not currently defined |
| Old `preview/phone.*` canonical wording | `STATE/LEGACY_MAP.md` | phone is legacy/compat |
| Old page-95 SVG/overlay expectations | `STATE/VALIDATOR_STATUS_MAP.md` | page 95 is live HTML/MathJax now |
| Generated audit artifact assumptions | `STATE/AUDIT_ARTIFACT_POLICY.md` | artifacts may not be committed source |
| Design-pass historical notes | `STATE/history/EQUATIONS_DESIGN_PASS_HISTORY.md` | historical implementation record |
| Old mobile metadata mismatch reports | `STATE/history/MOBILE_METADATA_HISTORY.md` | canonical metadata now in `meta/topics.json` |

## Rule

Moving information out of `PROJECT_RULES.md` does not mean losing it. It means assigning it the correct role:

- living rule;
- current state;
- historical note;
- decision record;
- validator map;
- legacy map;
- generated artifact policy.

## Required before actual rewrite

Before replacing `PROJECT_RULES.md`, create or update:

- `STATE/history/PROJECT_RULES_PRE_REWRITE.md`
- `STATE/LEGACY_MAP.md`
- `STATE/VALIDATOR_STATUS_MAP.md`
- `STATE/AUDIT_ARTIFACT_POLICY.md`
- `STATE/OPEN_GATES.md`

## Review rule

If a rule still protects a real risk, rewrite it as a clean current rule instead of archiving it.
