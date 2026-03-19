# PROJECT_RULES.md

## Mission
Build a healthy, structured, RTL-first A4 worksheet and textbook repository with stable preview, predictable layout, and controlled publishing.

## Non-negotiable contracts
1. Root A4 pages live in the repository root as `עמוד-N.html`.
2. Each root page contains exactly one `main.a4-page.page-N`.
3. Page size target is A4: 210mm x 297mm.
4. No inline CSS.
5. `styles/a4-base.css` is immutable base CSS and must not be used as a quick fix location for local layout issues.
6. Preview must have one canonical entry point.
7. Rules must exist in two layers:
   - `PROJECT_RULES.md` = full source of truth
   - `rules.md` = short operational summary
8. `rules.md` must be generated from `PROJECT_RULES.md` and never drift.
9. All major changes must preserve RTL, print correctness, and preview stability.
10. Prefer small safe commits over large risky edits.

## Architecture
- Root `עמוד-N.html` files = canonical A4 pages
- `styles/pages/` = page-specific CSS
- `preview/` = canonical reader and preview server
- `scripts/` = project automation
- `tests/contracts/` = hard contract tests
- `sources/legacy/` = imported content from old repository before manual promotion

## Workflow
1. Create or edit content.
2. Run canonical preview.
3. Run tests.
4. Run verify.
5. Commit only after green state.

## Preview requirements
- Stable URL
- Predictable state restoration
- Minimal reload noise
- No dependency on VS Code Simple Browser
- Designed for external browser opening from VS Code

## Import policy
- Old repository content is first copied into `sources/legacy/`.
- Nothing is promoted directly into canonical root pages before review.
- Rules, templates, and content are promoted in separate commits.
## Promotion policy
1. Old repository material is imported first into `sources/legacy/`.
2. Promotion from legacy to canonical files is deliberate and reviewed.
3. Canonical files in the new repo must obey current contracts even if legacy files do not.
4. Rules, content, preview code, and scripts are promoted in separate commits.