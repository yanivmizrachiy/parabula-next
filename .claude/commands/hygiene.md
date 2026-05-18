Run a repo hygiene and organization audit for Parabula Next. Report only — do not move, delete, or rename files.

This command is READ-ONLY.

Do not delete files.
Do not move files.
Do not rename files.
Do not run git add, commit, push, reset, rebase.

Reference documents to read first:
- `REPO_CLEANUP_PLAN.md` — current cleanup plan and findings
- `REPO_ORGANIZATION.md` — organization standards
- `STATE/ARCHITECTURE_MAP.md` — layer map

What to audit:

1. Check for new files at repo root that are not classified in REPO_CLEANUP_PLAN.md.
2. Check `docs/` — confirm it is only build output + flag any stale planning files.
3. Check `STATE/` — confirm LIVE_STATUS.md is up-to-date; flag new unclassified files.
4. Check `scripts/` — flag any new scripts not listed in REPO_CLEANUP_PLAN.md.
5. Check `.github/workflows/` — confirm all active workflows are classified.
6. Check for accidental duplicate files (same content, different names/locations).
7. Check for files that appear to be one-time scripts that already ran (candidate archive).
8. Check for stale planning/session files that are no longer relevant.
9. Verify no protected files have been modified outside an approved change.
10. Compare `meta/topics.json` and `mobile-topics.json` — flag any sync gap.

If new cleanup candidates are found:
- Add them to `REPO_CLEANUP_PLAN.md` under the correct category.
- Do NOT delete them.
- Flag them clearly for Yaniv's review.

Output in Hebrew:

א. קבצים/תיקיות חדשים שלא מסווגים
ב. ממצאים ב-docs/ STATE/ scripts/ workflows/
ג. כפילויות שנמצאו
ד. קבצי שלב-אחד שכבר הופעלו
ה. קבצי תכנון ישנים
ו. עדכונים ל-REPO_CLEANUP_PLAN.md (אם נדרש)
ז. סנכרון meta/topics.json vs mobile-topics.json
ח. פעולה אחת בטוחה הבאה

Rules:
- Hygiene is non-destructive by default.
- Every finding must be classified before any action is taken.
- Never delete without Yaniv's explicit approval.
- Update REPO_CLEANUP_PLAN.md with new findings (this is safe).
- Do not edit any production file during hygiene audit.
