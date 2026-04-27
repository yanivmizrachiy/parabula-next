# rules.md — Quick Reference (auto-synced from PROJECT_RULES.md)

> Full rules: `PROJECT_RULES.md` · Last sync: 2026-04-27

## Core contracts
- Root A4 pages: `עמוד-N.html`
- Exact wrapper: `main.a4-page.page-N` (210mm × 297mm)
- No inline CSS (`<style>` or `style="..."`) in any `עמוד-N.html`
- Page-specific CSS → `styles/pages/עמוד-N.css`
- `styles/a4-base.css` is immutable — do not edit

## Math rules
- Inline math: `\( ... \)` | Display math: `$$ ... $$`
- Two solutions: `\(x_1\)` and `\(x_2\)` (subscripts)
- Negative numbers: write as `\(-4\)`, never "4 מינוס"

## Layout rules
- RTL (`dir="rtl"`) must be preserved
- No `overflow: auto` to "fix" A4 height
- Subquestions separated by bullet only (no א./ב./ג. unless requested)

## Entry points (external site)
- Public site: https://yanivmizrachiy.github.io/parabula-next/
- Root URL → `catalog.html` (textbook catalog)
- Reader URL → `mobile-app.html` (topic-first, mobile + desktop)
- Desktop nav → `preview/topics.html`
- Print center → `preview/print.html`

## Metadata
- `meta/topics.json` — canonical topic + page metadata (do not edit by hand)
- `meta/pages.json` — flat page list (auto-generated; do not edit by hand)

## Development commands
- `npm run preview` — local preview at http://127.0.0.1:5179/preview
- `npm test` — contract tests (must be green before commit)
- `npm run verify` — quick structural check
- `npm run build` — Vite build to `dist/`
- `npm run rules:sync` — regenerate this file

## Safety rules
- Old content: imported into `sources/legacy/` — do not delete
- No pages deleted / renamed / reassigned without explicit user approval
- Use small, validated commits
