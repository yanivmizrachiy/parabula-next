Run the full Parabula Next verification suite and report results.

Execute these three commands in order, stopping on first failure:

1. `npm test` — contract tests (tests/contracts/)
2. `npm run verify` — basic structure check (scripts/verify.mjs)
3. `npm run validate:access` — canonical access layer check (scripts/validate-access-layer.mjs)

After running, report:
- Which commands passed and which failed
- Full error output for any failure
- Whether the repo is safe to continue working on

Do not edit any files. Do not commit. Do not push. Report only.
