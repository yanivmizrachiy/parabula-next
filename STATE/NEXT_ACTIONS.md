# NEXT_ACTIONS — Parabula Next

_Last updated: 2026-05-18_

---

## 🔴 PRIORITY 1 — Push + Verify

### 1.1 Push commit 549976e to deploy topic rename + equations ordering fix

**Action:** `git push origin main`
**What's in the commit:**
- "כללי" → "פילוג מורחב" in meta/topics.json, mobile-topics.json, catalog.js
- Page 95 moved to front of equations array (badge numbers now match page titles)
**After push:** Wait ~2 minutes for GitHub Actions, verify catalog shows "פילוג מורחב" topic.

### 1.2 Deploy equations SVG assets — NEEDS YANIV APPROVAL

**Problem:** 53 equations pages (עמוד-42 through עמוד-94) use `<img>` tags pointing to `/parabula-next/pages/משוואות/assets/page-XX.svg`. These SVG files ARE in git but are NOT copied to `dist/` during deploy. Result: broken images on GitHub Pages.

**Fix:** Add `cp -r pages dist/` to `.github/workflows/deploy-pages.yml` in the "Copy all assets to dist" step.

**⚠️ Requires explicit Yaniv approval** (workflow file change).

---

## 🟡 PRIORITY 2 — Next session

### 2.1 Full catalog QA on live site

After live fix confirmed:
- [ ] Topic selection works
- [ ] Page cards render with correct titles
- [ ] Viewer opens worksheet in iframe
- [ ] Prev/Next navigation works
- [ ] Print opens worksheet in new tab with print dialog
- [ ] Search filters pages
- [ ] URL state preserved on reload (?topic=X&page=N)
- [ ] Mobile bottom nav appears when viewer is open
- [ ] Sidebar collapses at <900px

### 2.2 Sync mobile-topics.json

**Problem:** `mobile-topics.json` is frozen from 2026-03-19 but `meta/topics.json` is the live source.
**Action:** Copy `meta/topics.json` → `mobile-topics.json` and commit.
**Rule:** Never auto-sync — always verify differences first.

---

## 🟢 PRIORITY 3 — Future improvements

### 3.1 Fix sw.js cache.put vulnerability

Modify `sw.js` to wrap `cache.put()` in its own try-catch so a caching failure never kills the network response. This would make the catalog and all other pages more resilient.
**Requires:** Yaniv approval (sw.js is used by mobile-app).

### 3.2 Hide preview-nav inside catalog viewer

Currently the iframe shows the worksheet's internal preview-nav bar. The catalog has its own navigation.
**Fix:** After iframe loads, inject a style to hide `.preview-nav` inside the iframe (same-origin, so this works).

### 3.3 Add grade/skill metadata

Extend `meta/topics.json` with `grade`, `skill`, `difficulty`, `worksheetType` per page.
Extend catalog.js search/filter to use these fields.

### 3.4 Add "print all topic" feature

Print all pages of a topic as a PDF booklet. Requires opening multiple tabs or using a print-order mechanism.

---

## Safety reminders

- Always run `npm test` before push
- Never modify `meta/topics.json` — it is the data source of truth
- Never modify `עמוד-N.html` without explicit approval
- Always stop before `git push` — ask Yaniv first
