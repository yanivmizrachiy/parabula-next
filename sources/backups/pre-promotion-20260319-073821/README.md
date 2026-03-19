# parabula-next

A clean, healthy, RTL-first A4 worksheet/book repository.

## Core principles
- Root A4 pages stay in the repository root as `עמוד-N.html`.
- Each root page must contain exactly one `main.a4-page.page-N`.
- No inline CSS.
- `styles/a4-base.css` is immutable foundation CSS.
- Canonical preview runs through `npm run preview`.
- Rules must stay synchronized between `PROJECT_RULES.md` and `rules.md`.

## Commands
- `npm run preview` - canonical preview server
- `npm run build` - production build
- `npm test` - test suite
- `npm run test:contracts` - contract tests
- `npm run verify` - project verification
- `npm run page:new -- 1` - create a new page
- `npm run rules:sync` - sync short rules from project rules