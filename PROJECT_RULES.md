# PROJECT_RULES — Parabula (Single Source of Truth)

This repository is a **self-validating, RTL-first A4 digital textbook and worksheet system**. This document is the **ground truth** for future edits and code generation.

---

## 0) Product goal (non-negotiable)

- The main purpose of the site is to **create, present, organize, and print high-quality A4 math worksheets** under uniform rules.
- The product must stay suitable for **thousands of future pages**, not only the current set.
- The system must remain **topic-first**, not a raw file dump.
- The primary reading flow is:
  - Home / entry = **topic choice first**
  - Topic screen = **only pages of that topic**
  - Actions = open, browse, select, print, PDF, share, download
- The site must work comfortably on **desktop and mobile**.
- `preview/all-pages.*` is a **secondary utility screen**, not the primary home experience.
- No AI session may add demo text, demo buttons, fake reports, fake workflows, or fake content.
- No AI session may merge or blur separate math topics. For example, **"משוואות" and "משוואות ריבועיות" must remain distinct topics unless the user explicitly instructs otherwise**.
- No pages may be deleted, merged, renamed, or reassigned between topics without explicit user approval and a rules update.

---

## 1) Ground Truth (non-negotiable)

### A4 page contract

- Every textbook page lives in repo root as `עמוד-N.html`.
- Every page MUST contain exactly one main wrapper: `main.a4-page.page-N`.
- `.a4-page` is **exactly** `210mm × 297mm`.
- DO NOT use `overflow: auto` anywhere to “fix” height.

### A4 content coverage (required)

- Pages must be laid out to **use the full A4 page area** (no large unintended empty regions), while still respecting the A4 contract above.
- **Pythagoras — topic page 1** (`עמוד-9.html`) MUST be composed to **span the entire A4 page** and utilize the available height according to the design rules of this repo.

### Topic pages must not overflow (required)

- Topic pages under `pages/**` that represent printable A4 content must also be composed so that interactive/writing elements (e.g., answer boxes) **never spill outside the A4 bounds**.
- Avoid fixed widths that can overflow in narrow columns; prefer responsive layout primitives (`min-width: 0`, flexible grid tracks, and `flex: 1` where appropriate).

### CSS rules (critical)

- **ZERO inline styles**: no `<style>` tags and no `style="..."` attributes in any `עמוד-N.html`.
- **All page-specific CSS** goes ONLY in `styles/pages/עמוד-N.css`.
- `styles/a4-base.css` is **immutable foundation** (do not edit).

### Project-wide HTML/CSS separation (required)

- The repository enforces **full separation between HTML and CSS**.
- **No inline CSS anywhere**:
  - No `<style>` blocks
  - No `style="..."` attributes
- Styling must live in dedicated CSS files (A4 pages under `styles/`, topic pages under their topic `style.css`).

### RTL rules

- RTL (`dir="rtl"`) must be preserved across layout and navigation.
- If you must use LTR for math/answers, do it via CSS (`direction: ltr; unicode-bidi: isolate;`) in the page CSS.

### Math rendering

- Use MathJax delimiters:
  - Inline: `\( ... \)`
  - Display: `$$ ... $$`
- **Do not use `$...$`** or any `$` math delimiter in pages.

### Math notation (answers)

- When a problem has **two solutions** (e.g., quadratic roots), label them as **subscripts** using MathJax: `\(x_1\)` and `\(x_2\)` (not `x1/x2` text).

### Hebrew math writing (required)

- In Hebrew text, write negative numbers in a **mathematically correct order**: “מינוס 4” (or `\(-4\)`), not “4 מינוס”.

### Subquestion formatting (required)

- Subquestions inside a page (e.g., `.q-sub`) are separated by the **black bullet** only.
- Do **not** add manual numbering markers inside the text (no `א./ב./ג.` and no `1/2/3`) unless the user explicitly requested numbered subquestions for that page.

### Solution / writing space (required)

- Pages that include free-writing areas (e.g., `.solution-space`) must be laid out so those areas **expand to use the available A4 height**, avoiding large unintended blank regions.

### Exercise blocks must be separated (required)

- In exercise grids/lists (e.g., `.pyt-tri-grid` with `.problem-block`), each block must be visually separated with **white space between blocks**.
- Blocks must not touch each other; do not set vertical gaps to zero in a way that merges adjacent blocks.

### Solutions footer (layout + notation)

- When a page includes a compact solutions footer (e.g., `.eq-solutions`, `.pyt-solutions`), the answers must be **distributed across the full line width** (e.g., via CSS grid), not clumped to one side.
- For exercises whose answers are a **pair** (e.g., two roots), present the pair with **correct parentheses**: `\((x_1,\,x_2)\)` or `\((a,\,b)\)` as appropriate.

### SVG rules

- Every SVG stroke must be **non-scaling**:
  - Use `vector-effect: non-scaling-stroke` (in SVG attributes or via page CSS selectors).

### Geometry diagrams — parallelism notation (required)

- **Placement:** Parallel markers MUST be placed at the **exact midpoint** of the segment they annotate.
- **Style:** Markers must be **clean, sharp chevrons** centered on the segment (avoid cluttered marks that can read as right-angle/angle notation).
- **Distinct pairs:** Use a **single chevron** (`>`) for the first parallel pair and a **double chevron** (`>>`) for the second parallel pair.
- **Alignment:** The chevrons must be rotated to match the **segment direction/slope**.
- **Labels:** Vertex labels (A, B, C, D) must sit **outside** the polygon with a consistent padding (~5pt) and must not touch/overlap any stroke.
- **Print clarity:** Use consistent, high-contrast strokes suitable for A4 printing (no faint gray lines for primary geometry edges).

### Geometry / coordinate systems

- Coordinate system container size: **440px × 440px**.
- Grid increment: **22px** (20 units per axis).
- Labels use `.axis-label` with **absolute positioning** relative to `.coordinate-system`.

---

## 2) Live Preview (permanent)

### The canonical preview server

- Run: `npm run preview`
- URL: http://127.0.0.1:5179
- Reader UI: `/preview` (also served at `/`)

Reader URL parameters (supported):

- `mode=all` (default) or `mode=book`
- `file=<relative html path>` (must exist in the Preview TOC; otherwise the reader falls back to the first valid page)

Notes:

- Default host/port are controlled by env vars `HOST` and `PORT` (see `preview/server.mjs`).
- Windows helper: `./preview.ps1` (can also run with `-Lan` to bind `0.0.0.0`).

### Live reload + correctness signals

- The preview must reload on changes to watched files (recursive): `*.html`, `*.css`, `*.js`, `*.mjs`, `*.svg` (excluding ignored paths like `.git/`, `node_modules/`, `.vscode/`).
- The preview must **detect A4 overflow** for `.a4-page` and report a terminal line:
  - Prefix: `[CRITICAL ERROR]`
  - Format: `A4 overflow: <file> (...)` including measured scroll/client sizes.

### /preview Reader UI (navigation must stay visible)

- In `/preview`, the Reader’s top controls (mode toggle, prev/next, and topic buttons) must remain **visible while scrolling**.
- In `/preview`, the Reader must show an **accurate A4 print boundary frame** for every page at all times (in all modes), so layout decisions are made against real print bounds.

---

## 3) Navigation engine (textbook hierarchy)

### System files must never appear in the Preview TOC (required)

- System/deployment files (Redirects, 404, Rules) must never appear in the `/preview` TOC or topic buttons.

### Topic buttons must always lead to the first page (required)

- Clicking a topic button must always navigate to the **first page** in that topic sequence (topic-local page 1), not to a previously selected or cached page.

Each page MUST contain a `.preview-nav` with:

- `.nav-meta` formatted as: `{Topic} — עמוד {i} / {total}`
- `.page-number` must equal `{i}` (topic-local index, not global file number).
- Topic bar `.preview-nav-topics` must:
  - Use `.topic-link`
  - Mark the current topic link with `.is-active`
  - Include `aria-current="page"` on the active link.

Prev/Next links must match the repo’s global reading order as defined by topics and per-topic page indices.

### Product navigation requirement

- The primary home experience must present **topics first**. `preview/app.html` now serves as a redirect entry into `preview/topics.html` rather than a standalone hub.
- The primary topic experience must present **pages of the chosen topic only**.
- `preview/all-pages.*` may exist as a utility surface, but it must not replace the topic-first home experience.

---

## 3.1) Page numbering UI (design uniformity)

### Root A4 pages (`עמוד-N.html`)

- The page index UI is the circular badge `.page-number` in the header.
- Its **visual design must remain uniform across the entire project**.
- Do not override `.page-number` styling in page CSS (`styles/pages/עמוד-N.css`).
- Do not override `.header-container` in page CSS (`styles/pages/עמוד-N.css`) — keep header placement uniform.
- Prefer fixing layout issues by adjusting the content area, not by moving/hiding/re-styling the page number.

### Topic pages (`pages/**`)

- The topic page index UI is the circular badge `.page-badge`.
- Its **visual design must remain uniform across the entire project** (match the canonical A4 header badge look).
- The badge color must use `var(--title-blue)` (not per-topic accent colors).
- The number inside `.page-badge` MUST match the page index `X` from the path `pages/<topic>/עמוד-X/index.html`.
- The badge must be styled only in the canonical topic stylesheet `pages/<topic>/style.css`.
- Do not create or link per-page topic stylesheets like `pages/<topic>/עמוד-X/style.css`.

---

## 4) Automated testing loop

### One-command validation

- `npm test` must be green.

### Watch mode (required in development)

- Run: `npm run test:watch:page`
- This must re-run the relevant page test on every save of:
  - `עמוד-*.html`
  - `styles/pages/*.css`
  - `preview/*`

### Access layer validation (required)

- Run: `npm run validate:access`
- This must validate the currently committed access layer.
- It must verify what is actually present on `main`, not planned files that do not yet exist.

### Preview overlap audit (required when changing access surfaces)

- When working on preview/mobile/topic/print overlap questions, use `node scripts/audit-preview-overlaps.mjs` directly.
- Do not document `npm run audit:preview` unless that script is actually present in `package.json`.

---

## 5) Failure recovery protocol

1. Read the terminal error from `npm test`.
2. Locate the matching rule section in this file.
3. Fix source HTML/CSS (do **not** modify tests to “make it pass”).
4. If preview live-reload drops, restart `npm run preview`.

---

## 6) Progress reporting (required)

When executing multi-step work (especially via Copilot/automation), **every step update** must include an explicit remaining-work percentage using this exact format:

- `נותרו X% לסיום.`

Rules:

- `X` is an integer `0`–`100`.
- `X` must decrease as progress is made.
- Use `0%` only when the task is fully complete.

---

## 7) Golden Preview Standard (required)

- Preview background must be a **solid** neutral color; patterns/gradients/images are strictly forbidden outside the A4 boundary.
- Preview pages must be **top-aligned** in the reading area (no vertical centering that starts mid-page).
- In “all pages” mode, pages must appear as a **single vertical sequence** with stable spacing.

### Zero Tolerance — Non-centered preview pages

- The A4 preview must be **horizontally centered at all times** in `/preview` (all modes).
- Any drift/bias to the right (common under RTL) is a **critical regression**.
- The preview _layout container_ may be forced to `direction: ltr` to guarantee centering, but the `.a4-page` content must remain RTL.
- The `.a4-page` must never be allowed to shrink in flex layouts (`flex-shrink: 0`) and must keep a stable outer margin in the host.

---

## 8) Preview Stability Contract (required)

- `/preview` must never show a blank main reading area when valid TOC entries exist.
- If a stored/selected file becomes invalid, the reader must clear the broken state and fall back to the first valid page.
- The reader must show a visible loading state while the preview page is being resolved.
- If primary rendering fails, the reader must display a fallback iframe for a valid page instead of leaving an empty gray area.
- A blank preview shell with a loaded sidebar is considered a critical regression.

Additional stability requirements:

- The reader must start at the **top of the selected page** (not mid-scroll).
- Book mode must not render an “empty slot” state.

---

## 9) Shared cleanup permission (design only)

- Design-only shared cleanup is allowed for a page family such as equations when no learning content is changed.
- The cleanup may remove stale styling, inconsistent title styling, inconsistent spacing, and legacy visual residue.
- The no-inline-style rule applies to preview utility pages as well.
- Mobile entry files under preview are an official part of the live system.

## 10) Equations family cleanup

- Pages belonging to the non-quadratic equations family may receive **design-only shared cleanup**.
- This cleanup must not change the learning text.
- It may normalize fonts, title presentation, spacing, visual residue from older styling, and SVG text styling.
- Quadratic-equation pages are excluded unless explicitly requested.

## 11) Metadata reality contract

- `meta/topics.json` is present and remains the canonical source metadata for worksheet content structure.
- Topic separation inside metadata must remain explicit and stable.
- Distinct topics must not be collapsed merely because their names are similar.

## 12) Live access system map (actual current main branch)

### Canonical content layer
- `עמוד-N.html`
- `styles/pages/עמוד-N.css`
- `styles/a4-base.css`

### Metadata layer
- `meta/topics.json`

### Access/UI layer currently present on `main`
- `preview/index.html`
- `preview/app.html` (topic-first redirect entry to `preview/topics.html`)
- `preview/topics.html`
- `preview/print.html`
- `preview/all-pages.html`
- `preview/all-pages.css`
- `preview/all-pages.js`
- `mobile-app.html`
- `mobile-app-install.html`

### State/handoff layer currently present on `main`
- `STATE/LIVE_STATUS.md`
- `STATE/ARCHITECTURE_MAP.md`
- `STATE/PROJECT_CONTINUITY.md`

This map is intentionally limited to files that are actually present on `main`.

## 13) Topics browser contract

- `preview/topics.html` is the dedicated topic-first browsing surface that exists on `main`.
- It must expose clear topic buttons/cards, comfortable navigation, and topic-local page browsing.
- It must remain suitable for phone usage.
- Topic-first UX is the primary UX of the product.

## 14) All-pages utility contract

- `preview/all-pages.*` is live on `main`.
- It is a secondary utility surface for searching, filtering, selecting, sharing, downloading, and printing across all pages.
- It must not replace topic-first home flow.
- It must open live page links correctly under GitHub Pages.

## 15) Mobile live entry contract

- The primary mobile app is `mobile-app.html`.
- The primary install page is `mobile-app-install.html`.
- The dedicated manifest is `mobile-app.webmanifest`.
- `preview/icon.svg` is part of the official live mobile path.
- The mobile app must always reflect the current worksheet repository through repository metadata.
- Legacy mobile entry files may exist, but the dedicated mobile app is the primary path.
- `preview/phone.*` is a utility / legacy layer and must not be treated as the canonical mobile runtime.

## 16) Preview UX polish contract

- `preview/app.html`, `preview/phone.html`, `preview/install.html`, `preview/print.html`, `preview/topics.html`, and `preview/all-pages.html` must keep a unified visual language.
- Shared visual polish belongs in shared preview CSS, not inline style blocks.
- UX polish may improve spacing, button clarity, focus states, mobile tap comfort, and visual consistency without changing worksheet content.

## 17) Dedicated mobile worksheet app

- The dedicated mobile worksheet app must remain easy to edit.
- Keep separate HTML / CSS / JS files.
- Use repository metadata as the source of truth for topics and worksheet pages.
- The mobile app must provide topic browsing, fast page navigation, live preview, open, print, and PDF handoff.
- New mobile fixes must land in `mobile-app.*` first, not in `preview/phone.*`.

## 18) Planned but not yet live on `main`

- The following surfaces were discussed or partially prototyped during AI planning, but must not be treated as live on `main` unless committed and present:
  - `meta/all-pages-index.json`
  - `preview/booklet.*`
  - `preview/flow-shell.*`
  - `STATE/SAFE_IMPROVEMENT_REPORT.md`
- Another AI must not assume these files exist just because they appeared in earlier planning or chat output.

## 19) Mobile app navigation contract

- The mobile app must support fast movement like a digital book on the phone.
- The user must be able to move to the next page, next topic, and the first page of the current topic.
- The mobile app should expose direct actions for install flow and PDF/print flow.

## 20) Mobile app reading flow contract

- The dedicated mobile app must support quick movement to the first page of the current topic.
- The dedicated mobile app must support quick movement to the first page of the whole book.
- The dedicated mobile app should keep the selected page visible in the page list.
- The dedicated mobile app should expose a clear loading signal while switching pages.

## 21) Mobile app resume flow contract

- The mobile app should offer a clear resume-from-last-position flow.
- The mobile app should expose a clear start-from-beginning action.
- The opening state should feel like a useful reading app, not a raw technical viewer.

## 22) Mobile topic home cards contract

- The mobile app should expose clear topic home cards near the opening state.
- Topic home cards should allow fast entry into a topic from its first page.
- The opening state on mobile should emphasize useful reading navigation, not raw technical structure.

## 23) Print / PDF contract

- `preview/print.html` is the live print/PDF handoff surface currently present on `main`.
- The final print / Save as PDF step may remain browser-driven.
- `preview/all-pages.*` and `preview/topics.*` may prepare selections for print/PDF, but must not bypass real print flow.

## 24) Live duplicate / legacy interpretation contract

- A duplicate or legacy-adjacent file is not automatically an error.
- `preview/print-center.js` is legacy/duplicate-adjacent relative to `preview/print.js`.
- `preview/phone.*` is legacy/compat relative to `mobile-app.*`.
- Future AI sessions must not delete these layers blindly; first map their role and inspect `scripts/audit-preview-overlaps.mjs`.

## 25) Mobile app public publish contract

- The public mobile app URL is `mobile-app.html`.
- The public install page URL is `mobile-app-install.html`.
- Published runtime topic data must come from repository runtime metadata.
- The public app must not depend on an alternate hidden worksheet source.
- The same published files should exist in both root and `/docs` so either Pages source can work.

## 26) Open-work policy for future AI sessions

- Preserve the canonical worksheet source first.
- Prefer improvements above the pages, not inside the pages.
- When planning new work, document what already exists before adding new surfaces.
- If a requested change touches preview/mobile/topic/print flows, check the scripts and `package.json` that are actually present on `main` before calling the work complete.
- Every real change must remain consistent with this file.
- This file must reflect reality on `main`, not aspirational architecture from an earlier planning session.

## 27) Canonical mobile reader engine contract

- The dedicated mobile worksheet reader remains `mobile-app.*` and is canonical over `preview/phone.*`.
- The mobile worksheet reader currently remains **iframe-based by design**.
- The canonical worksheet source remains the root A4 pages and `styles/a4-base.css`; mobile improvements must not fork or duplicate worksheet content.
- Mobile rendering fixes must be applied in the mobile reader shell through controlled runtime presentation overrides and reader-engine logic.
- Mobile reader progress copy should remain human-readable in Hebrew (for example, `עמוד X מתוך Y בנושא`), not raw technical counters.
- Mobile reader fixes must prefer stable centering, stable scaling, and removal of desktop preview aesthetics before adding new gesture/polish features.

---

## 7) Shared cleanup permission (design only)

- Design-only shared cleanup is allowed for a page family such as equations when no learning content is changed.
- The no-inline-style rule applies to preview utility pages as well.
- Mobile entry files under preview are an official part of the live system.

<!-- EQUATIONS_ROUTE_AND_DESIGN_PASS_RULES -->
## 28) Dedicated equations route and scoped design pass

- `preview/equations.html` is the dedicated live access route for the exact non-quadratic equations topic: `משוואות`.
- The dedicated equations route must read worksheet structure from `meta/topics.json` and must not create an alternate worksheet source.
- The route must not include, merge, rename, or blur the separate topic `משוואות ריבועיות`.
- Current verified non-quadratic equations topic size: 54 pages.
- The scoped design pass for the 54 non-quadratic equations pages is real repository work, not a demo.
- Design-pass execution report: `STATE/EQUATIONS_DESIGN_PASS_APPLIED.md`.
- Design-pass operating rules: `STATE/EQUATIONS_DESIGN_PASS_RULES.md`.
- Design-pass script: `scripts/apply-equations-design-pass.mjs`.
- Strict design guard: `scripts/validate-equations-design-pass-strict.mjs`.
- Required validation command for this family: `npm run validate:equations:strict`.
- The design pass may change only page-specific CSS under `styles/pages/עמוד-N.css` for pages in the exact `משוואות` topic.
- The design pass must not change worksheet learning content, root worksheet HTML, `styles/a4-base.css`, or any quadratic-equation page.
- Equations CSS must remain page-scoped. Forbidden regressions include global selectors such as `.header-container`, `.page-title`, `body,html,.a4-page`, and the legacy marker `EQUATIONS_STRICT_UNIFY`.
- The equations print/PDF route is browser-driven through `preview/print.html?topic=%D7%9E%D7%A9%D7%95%D7%95%D7%90%D7%95%D7%AA&autoselect=topic`.
- Do not mark this family fully complete unless real preview, phone viewing, and browser print / Save as PDF have been checked.


<!-- YANIV_CLAUDE_RULES_LAYER_START -->

## Claude / AI rules layer — Yaniv requirements

This section is the mandatory rules layer for Claude Code and any AI assistant working on this repository.

### Product identity

Parabula Next is a long-term Hebrew RTL printable math worksheet production system.

The core product is high-quality A4 printable worksheets. Desktop and mobile views are support layers for preview, review, navigation, editing, and printing. They are not a replacement for print-quality worksheets.

### Long-term goal

The repository must evolve into a comfortable worksheet book/library application that presents all existing printable pages like a digital textbook/workbook, while preserving A4 print quality and enabling future expansion to hundreds or thousands of worksheets.

Future worksheets must be organized by topic, grade, skill, worksheet type, and learning sequence.

### Preservation rules

- Preserve all existing worksheet pages.
- Preserve Hebrew RTL correctness.
- Preserve A4 print quality.
- Preserve what already works well.
- Do not rewrite working systems just because they can be rewritten.
- Do not remove legacy files without evidence and explicit approval.
- Do not introduce demo content, fake buttons, fake flows, or placeholder behavior.

### Editing architecture rules

Future worksheet creation and correction must be fast and safe.

Prefer clear separation between:

1. HTML/content structure
2. CSS styling
3. print-specific CSS
4. mobile/preview CSS
5. JavaScript behavior
6. worksheet/task data
7. reusable math/diagram components
8. validation scripts
9. build/export/print logic

CSS should be separated from HTML where practical to improve editing, reuse, and maintainability.

### Math graphics quality

Math graphics must aim for textbook/workbook quality.

Graphs, coordinate systems, diagrams, illustrations, SVG/vector graphics, MathJax notation, typography, and layout must be precise, printable, visually consistent, and easy to maintain.

Use stronger tools only when they clearly improve quality, print, editing speed, reuse, or maintainability. Do not replace a good working tool just because a newer tool exists.

### Repository organization

The repo should be organized with clear folders and meaningful filenames. If the structure needs improvement, propose staged reorganization first. Do not break existing pages or workflows.

### Automation and scripting policy

Safe automation only. Scripts may read, validate, and report by default.

Destructive operations require explicit approval from Yaniv.

Forbidden without explicit approval:

- deleting files
- force push
- git add .
- changing protected worksheet source files
- changing A4/print core files
- changing mobile runtime files
- rewriting architecture
- removing legacy files
- committing reports, temp files, backups, logs, or secrets

### Pre-execution requirements

Before any non-trivial implementation:

1. State which files will be affected.
2. State the risks.
3. State the success criteria.
4. Get explicit approval from Yaniv.
5. Execute in small steps.
6. Test/verify after each meaningful change.
7. Document the result in STATE/ or the relevant source-of-truth file when needed.

### Mandatory workflow order

Learn -> Rules -> Plan -> Small Execute -> Test -> Document

Skipping any step violates this file's authority.

### Relationship between CLAUDE.md and PROJECT_RULES.md

CLAUDE.md is the Claude Code entry point for this repository.

PROJECT_RULES.md remains the governing source of truth. If CLAUDE.md and PROJECT_RULES.md conflict, PROJECT_RULES.md wins.

Both files must be kept synchronized when rules change.

<!-- YANIV_CLAUDE_RULES_LAYER_END -->
