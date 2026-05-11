# MACHINE_READABLE_REGISTRY_PLAN — parabula-next

Status: planning document only. No registry files are created by this file.

## Purpose

Define future machine-readable registries so AI agents, scripts, and validators do not rely only on prose, guesses, or stale STATE files.

## Core problem

The repository needs human-readable rules and machine-readable truth. Without machine-readable registries, every AI session may rediscover and reinterpret the same facts.

## Planned registries

| Registry | Purpose |
|---|---|
| `meta/app-surfaces.json` | app surfaces, entry files, metadata source, canonical/legacy status. |
| `meta/file-roles.json` | canonical/legacy/generated/source role for key file families. |
| `meta/validators.json` | validator names, active/legacy/transition status, expected scope. |
| `meta/workflows.json` | workflow risk level and write capability. |
| `meta/scripts.json` | script risk level and file write behavior. |
| `meta/state-index.json` | STATE file status: current/history/audit/open gate. |
| `meta/design-system.json` | design tokens/components/themes once implemented. |
| `meta/worksheet-templates.json` | supported worksheet creation templates. |

## Registry principles

1. Human rules live in `PROJECT_RULES.md`.
2. Machine-readable operational truth lives under `meta/*.json`.
3. Generated registries must say whether they are committed source or generated artifacts.
4. Registries must be validated by schema.
5. Registries must not duplicate worksheet content.

## Example: app surface registry

```json
{
  "surfaces": [
    {
      "id": "mobile",
      "entry": "mobile-app.html",
      "metadata": "meta/topics.json",
      "status": "CANONICAL",
      "role": "Mobile worksheet reader"
    }
  ]
}
```

## Example: validator registry

```json
{
  "validators": [
    {
      "name": "validate_equations_pilot_page_1",
      "status": "LEGACY",
      "scope": "old SVG page-95 pilot",
      "blocksMain": false
    }
  ]
}
```

## Schema requirement

Future schemas should be created under:

```text
schemas/app-surfaces.schema.json
schemas/file-roles.schema.json
schemas/validators.schema.json
schemas/workflows.schema.json
schemas/scripts.schema.json
schemas/state-index.schema.json
```

## Implementation order

1. Keep planning in STATE first.
2. Approve registry structures.
3. Create schemas.
4. Create initial registries from reviewed seed maps.
5. Add validation scripts.
6. Use registries in doctor/check commands.

## Non-goals

- Do not make registries authoritative before review.
- Do not generate registries from stale data.
- Do not replace human rules with JSON only.
- Do not duplicate worksheet page content in registries.

## Success condition

Future tools can answer: what is canonical, what is legacy, what validates what, what is safe, and what remains open — without guessing.
