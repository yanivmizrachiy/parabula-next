# PR5_PLANNING_STATUS — parabula-next

Status: current status summary for Draft PR #5.

## PR

- PR: #5
- Title: Plan PROJECT_RULES rewrite and safe repository cleanup
- Branch: `agent/project-rules-rewrite-plan-20260510`
- Base: `main`
- Draft: yes
- Merge target: not approved yet

## Scope

This PR is a planning/governance PR only.

It does not:

- replace `PROJECT_RULES.md`;
- modify root worksheet `עמוד-N.html` files;
- modify `styles/pages/*`;
- modify `styles/a4-base.css`;
- modify runtime app surfaces;
- modify metadata;
- modify workflows;
- delete files;
- move legacy files;
- clean the repository.

## Added planning layer

The PR adds a structured STATE planning package for:

- `PROJECT_RULES.md` rewrite;
- rules audit and rewrite diff;
- archive mapping;
- current truth planning;
- open gates;
- legacy classification;
- validator classification;
- workflow risk classification;
- script risk classification;
- file classification planning;
- deletion/quarantine policy;
- audit artifact policy;
- app surface registry planning;
- STATE index planning;
- rules rewrite execution order.

## Current progress

- First planning phase: complete.
- Repository-wide healing project: early stage only.
- Estimated full repository healing progress: about 18%.
- Remaining full repository healing work: about 82%.

## Before this PR can be merged

Required review:

1. Read the planning files.
2. Confirm that the rules rewrite direction matches the intended project governance.
3. Confirm no canonical A4 files are changed.
4. Confirm no runtime behavior is changed.
5. Confirm no deletion is included.
6. Decide whether to merge planning docs only, keep as draft, or request revisions.

## After this PR, if merged later

Next safe phase should be:

1. Generate `STATE/FILE_CLASSIFICATION.tsv`.
2. Generate `STATE/STATE_INDEX.md`.
3. Review `PROJECT_RULES_REWRITE_DRAFT.md`.
4. Archive the old rules context.
5. Only then prepare a separate PR to replace `PROJECT_RULES.md`.

## Hard rule

Do not combine this planning PR with cleanup, deletion, worksheet changes, mobile changes, print changes, or page-95 changes.
