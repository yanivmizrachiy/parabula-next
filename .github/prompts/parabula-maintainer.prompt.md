Work as the primary repository engineer for this workspace.

Repository:
- name: parabula-next
- owner: yanivmizrachiy
- local path: C:\Users\yaniv\projects\parabula-next

You must read and obey `.github/copilot-instructions.md`.

## Main goal

Turn this repository into a stable, convenient, long-term worksheet editing workspace in Visual Studio Code, while preserving all existing real worksheet pages and the progress already achieved.

I want a workflow that feels excellent for daily use:
- I can see all existing worksheet pages clearly
- I can browse them by topic
- I can keep editing them safely
- I have a stable preview
- I can validate changes reliably
- I can open the real GitHub Pages site externally
- I do not lose work from the previous repository import

## Current intent

Do not rebuild from scratch.
Do not give me generic advice.
Do not create placeholders.
Do not create fake page buttons.
Do not invent fake topics.

Use the real repository state.

## Required workflow

### Step 1 — audit the current repository
Inspect and summarize the real current state of:
- root worksheet pages
- styles/pages
- styles/a4-base.css
- preview/
- meta/
- scripts/
- tests/
- package.json
- Vite config if present
- GitHub Pages workflow files if present
- .vscode/tasks.json
- .vscode/launch.json
- any current mismatches or fragility

### Step 2 — define the safest next implementation plan
Create a short implementation plan with the smallest safe improvements first.
Prioritize:
1. preserving all existing pages
2. stable preview
3. accurate page navigation
4. accurate topics metadata
5. VS Code usability
6. deployment reliability

### Step 3 — implement incrementally
Then continue automatically with the safest useful improvements, such as:
- improving `meta/topics.json`
- improving preview page navigation
- ensuring preview buttons map only to real pages
- ensuring preview refresh behavior is stable
- improving VS Code tasks for preview, verify, test, build
- checking GitHub Pages deployment configuration
- improving real-site links

Do not perform risky mass changes without stating the risk first.

### Step 4 — validate after changes
After each meaningful change, run the real repository commands that exist:
- `npm test`
- `npm run verify`
- `npm run build`

If needed, inspect `package.json` first and adapt to the actual scripts.

### Step 5 — commit properly
If validations pass, create a real concise commit.
Then report:
- exact files changed
- exact validation results
- exact commit message
- exact next best step

## Important repository facts

Treat these as high-confidence until inspection shows otherwise:
- Canonical worksheet pages are named `עמוד-N.html` at repository root.
- Matching page styles are under `styles/pages/עמוד-N.css`.
- Shared A4 CSS is `styles/a4-base.css`.
- Preview workspace exists under `preview/`.
- Metadata exists under `meta/`.
- Legacy reference content exists under `sources/legacy/`.
- Backups may exist under `sources/backups/`.
- This repository already has imported real content and should be improved, not restarted.

## Success criteria

A good result means:
- no worksheet pages are lost
- preview is stable
- topic navigation is real
- VS Code usage feels smooth
- build/test/verify stay green
- GitHub Pages remains usable as the external viewing/printing site
- the workspace becomes easier to maintain over time

## First response format

Start with:
1. Current architecture
2. What is already working
3. What is fragile
4. Safest next implementation step

Continue automatically only if the step is low-risk.
Pause only if a destructive or ambiguous action is required.

Operate with maximum safe autonomy.
Prefer making the smallest useful real change now rather than suggesting many future ideas.
Optimize the workspace for continuous daily editing by a teacher who works with many worksheet pages and needs reliable preview, simple navigation, and minimal friction.