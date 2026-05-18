Add a new printable A4 Hebrew RTL math worksheet to Parabula Next.

This command requires explicit step-by-step approval before creating any files.

Do NOT create or edit any files until Yaniv explicitly approves each step.
Do not run git add, commit, or push.

---

## Step 1 — Gather requirements (ask if not provided)

Before doing anything else, ask Yaniv for:

1. **Page number** — the next available `עמוד-N.html` (check which numbers are in use: glob `עמוד-*.html` in the repo root).
2. **Topic name** (Hebrew) — e.g. `חוקיות`, `משפט פיתגורס`, `משוואות`.
3. **Page number within topic** — e.g. "דף 5 בנושא" (used for `page-number` badge and nav meta).
4. **Topic page range** — how many pages total in this topic (for nav meta "עמוד X / Y").
5. **Previous page** — filename of the previous worksheet (for nav link).
6. **Next page** — filename of the next worksheet (for nav link), or "none" if this is the last.
7. **Topic CSS class** — e.g. `topic-pythagoras`, `topic-equations` (check existing pages for convention).
8. **Worksheet content** — the actual educational content (questions, diagrams, MathJax).
9. **Is this a new topic or an existing topic?** If existing: read the relevant topic entry in `meta/topics.json`.

Do not proceed to Step 2 without all of the above.

---

## Step 2 — Pre-flight checks (read-only)

Before proposing anything:

1. Run `glob עמוד-*.html` — confirm chosen page number is not already in use.
2. Read `meta/topics.json` — find the topic entry (or confirm it needs to be created).
3. Read `mobile-topics.json` — confirm it will also need updating.
4. Read `styles/a4-base.css` — internalize the print contract.
5. Read an existing page in the same topic for nav structure reference.
6. Read `styles/pages/עמוד-[adjacent].css` to match CSS conventions.

---

## Step 3 — Propose files (show before creating)

Show Yaniv the exact content of each file before writing:

### File A: `עמוד-N.html`

Must follow this exact structure from CLAUDE.md:

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>עמוד X — שם הנושא</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500&display=swap" rel="stylesheet">

    <script>
        MathJax = { tex: { inlineMath: [['\\(', '\\)']] } };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <link rel="stylesheet" href="styles/a4-base.css">
    <link rel="stylesheet" href="styles/pages/עמוד-N.css">
</head>
<body>

    <nav class="preview-nav" aria-label="ניווט בין עמודים">
        <div class="preview-nav-top">
            <div class="nav-side"><a class="nav-link" href="עמוד-PREV.html">הקודם</a></div>
            <div class="nav-meta">שם הנושא — עמוד X / Y</div>
            <div class="nav-side"><a class="nav-link" href="עמוד-NEXT.html">הבא</a></div>
        </div>
        <div class="preview-nav-topics" aria-label="מעבר בין נושאים">
            <!-- topic links from meta/topics.json — is-active on current topic -->
        </div>
    </nav>

    <main class="a4-page page-N [topic-class]">
        <header class="header-container">
            <h1 class="page-title">שם הנושא</h1>
            <div class="page-number">X</div>
        </header>

        <div class="question-block">
            <!-- educational content here -->
        </div>
    </main>

</body>
</html>
```

Hard rules for the HTML:
- `page-number` = page number within the topic (NOT the file number N).
- `<title>` = `עמוד X — שם הנושא` (X = position within topic).
- Zero inline `style=""` attributes — forbidden.
- Zero `<style>` blocks — forbidden.
- All CSS goes in `styles/pages/עמוד-N.css` only.
- MathJax: `\(...\)` for inline, `$$...$$` for display. Never `$...$`.
- RTL everywhere. LTR only in CSS (`direction: ltr; unicode-bidi: isolate`).
- Nav: if first in topic, use `<span class="nav-link is-disabled" aria-disabled="true">הקודם</span>`.
- Nav: if last in topic, use `<span class="nav-link is-disabled" aria-disabled="true">הבא</span>`.
- SVG: always add `vector-effect: non-scaling-stroke` and `shape-rendering: geometricPrecision`.

### File B: `styles/pages/עמוד-N.css`

Minimal, page-scoped CSS only. Must not override `a4-base.css` print rules.
Show exact content before writing.

### File C: `meta/topics.json` update

Show the exact JSON diff — which entry is being updated or added.
`count` must be incremented if a page is added to an existing topic.
`totalPages` at root must be incremented.

### File D: `mobile-topics.json` update

Must mirror the same changes as `meta/topics.json`.
Show the exact JSON diff.

---

## Step 4 — Wait for approval

After showing the proposed files:

Ask: **"אישור ליצור את הקבצים האלה?"**

Do NOT create any files until Yaniv explicitly says yes.

---

## Step 5 — Create files (only after approval)

Create files in this order:
1. `עמוד-N.html`
2. `styles/pages/עמוד-N.css`
3. Update `meta/topics.json`
4. Update `mobile-topics.json`

After creating:
- Run `npm run verify` and report result.
- Run `npm run validate:access` and report result.
- Do NOT run git add or commit unless explicitly asked.

---

## Rules

- Never create placeholder content or fake buttons.
- Never create demo questions — only real educational content provided by Yaniv.
- Never change `styles/a4-base.css`.
- Never change any existing `עמוד-*.html`.
- Never change `scripts/` or `tests/`.
- Print quality is the primary goal — mobile/desktop are secondary.
- If anything is unclear, ask before creating.
