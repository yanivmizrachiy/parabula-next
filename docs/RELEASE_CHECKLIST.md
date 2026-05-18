# Release Checklist — Parabula Next

_Last updated: 2026-05-18_

Use this checklist before every `git push`, merge, or significant change.

---

## Pre-push checklist

### 1. Tests

```bash
npm test                  # must: 96/96 pass
npm run verify            # must: no errors
npm run validate:access   # must: all canonical files present
```

- [ ] All 96 tests pass
- [ ] `npm run verify` shows no errors
- [ ] `npm run validate:access` shows all canonical files present

### 2. Protected files check

Confirm NONE of these were modified unintentionally:

- [ ] `עמוד-N.html` files (worksheet pages) — unchanged
- [ ] `styles/a4-base.css` — unchanged
- [ ] `meta/topics.json` — unchanged (unless adding pages)
- [ ] `mobile-app.*` — unchanged (unless mobile work)
- [ ] `sw.js` — unchanged (unless SW work, requires explicit approval)
- [ ] `package.json` — unchanged
- [ ] `scripts/`, `tests/`, `.github/workflows/` — unchanged

### 3. Git hygiene

- [ ] `git status` shows only intended files
- [ ] No `.env`, credentials, or secrets staged
- [ ] `.claude/settings.local.json` is NOT staged
- [ ] Commit message is descriptive (what AND why)
- [ ] Commit is staged with specific files, NOT `git add .`

### 4. Catalog layer check (if catalog files changed)

- [ ] `catalog.html` — no inline CSS added
- [ ] `catalog.js` — no hardcoded data; all from fetch
- [ ] Error state shows real error message (not generic text)
- [ ] Fetch URL uses explicit absolute URL construction
- [ ] No changes that would break preview or mobile layers

---

## Post-deploy verification (GitHub Pages)

After CI completes (~3–5 min after push):

```
Live URL: https://yanivmizrachiy.github.io/parabula-next/catalog.html
```

- [ ] Page loads without error state
- [ ] All 7 topics appear in sidebar
- [ ] Clicking a topic shows page cards
- [ ] Clicking a card opens the worksheet in the viewer iframe
- [ ] Prev/Next navigation works within a topic
- [ ] Print opens worksheet in a new tab with print dialog
- [ ] Search box finds pages by topic name or page title
- [ ] URL updates to `?topic=X&page=N` when navigating
- [ ] On mobile (<900px): sidebar collapses, hamburger menu works
- [ ] Mobile bottom nav appears when viewer is open

---

## Worksheet addition checklist

When adding a new worksheet:

- [ ] `עמוד-N.html` created with correct structure (see `docs/WORKSHEET_CREATION_RULES.md`)
- [ ] `styles/pages/עמוד-N.css` created (no inline CSS in HTML)
- [ ] No `<style>` block in the HTML
- [ ] No `style="..."` attributes in the HTML
- [ ] MathJax delimiters correct: `\(...\)` inline, `$$...$$` display
- [ ] `meta/topics.json` updated with new page entry
- [ ] `mobile-topics.json` synced (manual copy from meta/topics.json)
- [ ] Prev/Next links in `preview-nav` updated correctly
- [ ] `npm test` passes (may need contract test update for new page count)
- [ ] A4 layout verified — content fits within 210mm × 297mm
- [ ] Print preview checked in browser

---

## Rollback plan

If a push breaks something:

1. Identify the breaking commit: `git log --oneline -5`
2. Create a revert commit: `git revert <commit-hash>`
3. Run tests on the revert commit
4. Push the revert commit (requires approval)
5. NEVER use `git reset --hard` on pushed commits without explicit approval

---

## Who to ask

All of the following require explicit approval from Yaniv before proceeding:

- `git push` to any branch
- `gh pr merge` (any PR)
- `git reset --hard`
- `git rebase`
- Any modification to protected files
- Any deletion of files
- Any `rm -rf` or destructive shell command
