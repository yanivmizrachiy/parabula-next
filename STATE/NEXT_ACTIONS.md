# NEXT_ACTIONS — Parabula Next

_Last updated: 2026-05-18_

---

## 🔴 PRIORITY 1 — Do immediately

### 1.1 Push catalog.js fix and verify live site

**Action:** `git push origin main`
**Why:** Fix committed (11824ff) that shows real error message + uses explicit URL + `cache: 'no-store'`. Live site currently shows generic load error.
**After push:** Wait ~2 minutes for deploy, then verify `https://yanivmizrachiy.github.io/parabula-next/catalog.html` loads topics.
**Requires:** Explicit approval from Yaniv before push.

### 1.2 Diagnose real cause if still failing

If after push the catalog still fails, the UI will now show the actual error (e.g., "HTTP 404", "Failed to fetch"). Diagnose from there.

**Likely causes in priority order:**
1. SW (`sw.js`) `cache.put()` failing on GitHub Pages headers — fix: wrap `cache.put()` in its own try-catch in sw.js (requires approval to touch sw.js)
2. Actual 404 on meta/topics.json — unlikely, WebFetch confirmed it's accessible
3. JavaScript runtime error after successful fetch — check browser console

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
