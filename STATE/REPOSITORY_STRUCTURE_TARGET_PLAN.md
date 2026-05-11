# REPOSITORY_STRUCTURE_TARGET_PLAN — parabula-next

Status: planning document only. No files are moved or renamed by this file.

## Purpose

Define a future target structure for a cleaner repository without moving canonical worksheets prematurely or breaking GitHub Pages/runtime paths.

## Core problem

The repository currently has canonical root worksheets, styles, preview, mobile, docs, scripts, workflows, STATE, generated artifacts, and legacy layers mixed across the root and folders. Cleanup must be planned before moving files.

## Critical constraint

Do not move root `עמוד-N.html` worksheet files until all app surfaces, links, metadata, print, mobile, and public routes support the new structure.

## Target structure idea

Long-term possible structure:

```text
content/
  worksheets/
  sources/

styles/
  base/
  tokens/
  components/
  themes/
  pages/

meta/
  topics.json
  app-surfaces.json
  file-roles.json
  validators.json
  workflows.json
  scripts.json
  generated/

apps/
  mobile/
  topics/
  all-pages/
  print/
  equations/
  preview/

docs/
  public-snapshot/

scripts/
  audit/
  validate/
  generate/
  apply/
  doctor/
  legacy/

tests/
  contracts/
  visual/
  runtime/

STATE/
  current/
  history/
  decisions/
  audits/
  gates/
  planning/

legacy-quarantine/
```

## Migration policy

The target structure is not an instruction to move files now.

Any move must happen only after:

1. route compatibility is implemented;
2. metadata supports new paths;
3. app surfaces are updated;
4. tests pass;
5. public links are protected or redirected;
6. rollback is available;
7. PR approval exists.

## Near-term structure improvements without moving worksheets

Safer near-term improvements:

- add machine-readable registries under `meta/`;
- add planning/index documents under `STATE/`;
- add future scripts under clearer subfolders only for new scripts;
- add design-system components additively under `styles/components/` only after approval;
- keep root worksheets in place.

## Naming rules

Future new files should use predictable names:

- `STATE/*_PLAN.md` for planning;
- `STATE/*_STATUS.md` for current status;
- `STATE/*_INDEX.md` for indexes;
- `STATE/*_POLICY.md` for policies;
- `STATE/*_MAP.md` for classifications;
- `meta/*.json` for machine-readable registries;
- `scripts/validate/*` for validators;
- `scripts/audit/*` for audit scripts;
- `scripts/generate/*` for generators.

## Cleanup relationship

Repository structure cleanup must happen after:

- `PROJECT_RULES.md` rewrite;
- full file classification;
- STATE index;
- app surface registry;
- validator update;
- public route plan.

## Success condition

The repository becomes understandable by directory and naming convention without breaking existing public URLs, A4 pages, mobile, preview, or print behavior.
