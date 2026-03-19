# Repository instructions for parabula-next

You are working in the real production repository `parabula-next` owned by Yaniv Mizrachi.

## Repository identity

- Repository name: `parabula-next`
- GitHub owner: `yanivmizrachiy`
- This is the active canonical repository.
- Do not confuse this repository with the old legacy repository.
- The previous repository content was imported for preservation and reference, but this repository is now the main workspace.

## Product purpose

This repository is a worksheet authoring, editing, preview, organization, and publishing system for Hebrew mathematics worksheet pages.
The user is a teacher and advanced technical builder who wants a stable long-term editing workflow inside Visual Studio Code.

The system must support:
- convenient editing of existing worksheet pages
- stable local preview
- real navigation across real worksheet pages
- topic-based organization
- GitHub Pages publishing for external viewing and printing from any device
- safe preservation of all previously created pages

## User priorities

Always optimize for:
1. stability
2. real working files
3. no loss of existing pages
4. convenient continuous editing in VS Code
5. real previews, not mockups
6. real commits, not claimed commits
7. minimal breakage
8. clear repository structure

## Non-negotiable rules

- Never delete or overwrite large sets of worksheet pages without explicit approval.
- Never invent pages, topics, metadata, or navigation items that do not map to real files.
- Never create fake buttons.
- Never create preview UI disconnected from actual worksheet files.
- Never rename Hebrew worksheet files unless explicitly instructed.
- Never break Hebrew filenames.
- Never rewrite git history unless explicitly requested.
- Never remove backups automatically unless the user explicitly asks.
- Never touch `sources/legacy/` except as read-only reference unless explicitly asked.
- Never replace a working system with a new system just because it looks cleaner.
- Never sacrifice existing real content for architectural elegance.

## Canonical structure

Treat this structure as the current source of truth unless inspection proves otherwise:

- Root canonical pages: `עמוד-N.html`
- Matching page CSS: `styles/pages/עמוד-N.css`
- Shared A4 stylesheet: `styles/a4-base.css`
- Preview workspace: `preview/`
- Metadata: `meta/`
- Validation scripts: `scripts/`
- Tests: `tests/`
- Legacy archive/reference: `sources/legacy/`
- Safety backups: `sources/backups/`

## Existing project expectations

The repository should support a high-quality authoring workflow where the user can:
- open the repository in VS Code
- run a stable preview
- browse all created worksheet pages
- browse by topic
- select a real page and immediately preview it
- continue editing existing pages safely
- validate changes with test/verify/build
- publish and open the real GitHub Pages site

## Preview rules

Preview must be stable and useful for daily work.

The preview system must:
- show only real pages that exist in the repository
- support topic grouping
- support page search or filtering if available
- support previous/next navigation
- support direct opening of the current page
- support direct opening of the real external site
- remain synchronized with file changes when possible
- avoid fragile assumptions

If the current preview is partially working, improve it incrementally rather than replacing it blindly.

## Metadata rules

Metadata must be derived from actual repository files.

Preferred per-page metadata fields:
- number
- file
- title
- topic
- previewPath
- siteUrl
- optional tags
- optional notes

If topic classification is uncertain:
- do not invent confident classifications
- preserve current values
- mark uncertain entries conservatively
- prefer editable metadata files over hardcoded assumptions

## Validation rules

After meaningful edits, run the real available validation commands and report exact results.

Preferred commands:
- `npm test`
- `npm run verify`
- `npm run build`

If any script is missing, inspect `package.json` and adapt to the real repository.
Do not invent scripts.

## Git and change management

- Make small safe changes.
- Prefer incremental commits.
- Use concise real commit messages.
- Report exactly what changed.
- Never claim success without actual command results.
- If there is risk, inspect first and ask only when necessary.

## VS Code workflow rules

Visual Studio Code is the main control center for this repository.

Prefer repository-managed workflows through:
- `.vscode/tasks.json`
- `.vscode/launch.json`
- `.github/copilot-instructions.md`
- prompt files for recurring maintenance tasks

When improving VS Code ergonomics:
- keep tasks explicit
- keep launch configs simple
- prefer durable setup over temporary hacks

## Deployment rules

GitHub Pages is the real external site for this repository.

When working on deployment:
- inspect the actual workflow files
- inspect Pages-related settings files if present
- check whether Vite is used for production assets
- verify `base` path handling for repository-path deployment such as `/parabula-next/` when relevant
- do not assume deployment is healthy without checking workflow/build configuration

## Working method

For each task:
1. inspect the repository and relevant files
2. summarize current state briefly
3. propose the smallest safe next step
4. implement carefully
5. run validation
6. report exact changed files
7. prepare or execute a real commit if appropriate
8. recommend the next best incremental improvement

## Preferred response style

Be practical, direct, and repository-aware.
Use the actual repository structure and actual files.
Avoid generic tutorials.
Favor reliability and editability over flashy rewrites.