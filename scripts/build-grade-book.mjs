/**
 * build-grade-book.mjs — מחולל עמוד השער "חומרים, דפי עבודה וקישורים לכיתה ז׳".
 *
 * מקור אמת יחיד לתוכן: meta/topics.json (עץ תכנית הלימודים + הדפים + curriculumId).
 * הקישורים לדפי העבודה נגזרים בסדר הקריאה של הקורא (catalog.js) — לא לפי מספר קובץ.
 * כפתורי המשאבים החיצוניים מצביעים לפורטל מחוז ירושלים (jerusalem2), שם התוכן חי
 * באמת — לכידה חיה מ-2026-09-06. אין כפתור מזויף/ריק (CLAUDE.md §1).
 *
 * שימוש:
 *   node scripts/build-grade-book.mjs           # כתיבת grade-7-book.html
 *   node scripts/build-grade-book.mjs --check    # אימות CI: הקובץ מסונכרן למקור
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const OUT = 'grade-7-book.html';
const GRADE = { id: 'g7', letter: 'ז׳', title: "כיתה ז'" };

/* --- 10 צבעי הנושאים העיקריים + הרחבה ל-11/12 --- מיפוי הצבעים חי ב-CSS (data-c) --- */
const TOPIC_COLORS = 12;
const colorOf = (num) => ((num - 1) % TOPIC_COLORS) + 1; // מספר הנושא → אינדקס צבע 1..12

/* --- פורטל מחוז ירושלים (jerusalem2) — יעדים חיים, נלכדו מהעמוד החי 2026-09-06 --- */
const J2 = 'https://jerusalem2.vercel.app';
const PORTAL = {
  tests:     { label: 'מבחנים לכיתה ז׳',        href: `${J2}/chativat-beynayim/z/collections/z-mivchanim/`, c: 2 },
  summaries: { label: 'משימות סיכום לשכבת ז׳',   href: `${J2}/chativat-beynayim/z/collections/z-sikumim/`,  c: 1 },
  resources: [
    { label: 'דפי נוסחאות לכיתה ז׳',                              href: `${J2}/chativat-beynayim/z/collections/z-noschaot/`,   c: 3 },
    { label: 'משחקים לכיתה ז׳',                                   href: `${J2}/chativat-beynayim/z/collections/z-mischakim/`,  c: 4 },
    { label: 'העשרה מתמטית לכיתה ז׳',                             href: `${J2}/chativat-beynayim/z/collections/z-haashara/`,   c: 8 },
    { label: 'מאגרי הוראה לכיתה ז׳',                              href: `${J2}/chativat-beynayim/z/collections/z-maagarim/`,   c: 6 },
    { label: 'יחידת הוראה: הוראת משוואות ללא מספרים שליליים',     href: `${J2}/chativat-beynayim/z/units/mishvaot/`,           c: 7 },
    { label: 'משימות ועבודות סיכום',                             href: `${J2}/chativat-beynayim/sikumim/`,                    c: 5 },
    { label: 'מקורות והדרכה למורי חטיבת הביניים',                href: `${J2}/chativat-beynayim/mekorot-hadracha/`,           c: 10 },
  ],
};

/* --- כותרות התחומים = כפתורי-ענק צבעוניים; אינדקס צבע ייעודי לכל עמודה --- */
const DOMAIN_COLOR = {
  'g7.num':         6,
  'g7.alg':         8,
  'g7.geo':         4,
  'g7.uncertainty': 10,
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const two = (n) => String(n).padStart(2, '0');
const deepLink = (file) => `./catalog.html?file=${encodeURIComponent(file)}&mode=single`;

function loadModel() {
  const topics = JSON.parse(fs.readFileSync(path.join(root, 'meta/topics.json'), 'utf8'));
  const nodes = topics.curriculum?.nodes || [];
  const pages = [];
  for (const grp of topics.topics || []) for (const p of grp.pages || []) pages.push(p);

  // דפים לפי צומת (בית ראשי), ממויין למספר עמוד
  const byNode = new Map();
  for (const p of pages) {
    if (!p.curriculumId) continue;
    if (!byNode.has(p.curriculumId)) byNode.set(p.curriculumId, []);
    byNode.get(p.curriculumId).push(p);
  }
  for (const list of byNode.values()) list.sort((a, b) => a.number - b.number);

  // סדר קריאה זהה ל-catalog.js: מהלך על העץ, דף נספר בבית הראשי בלבד
  const ordered = [];
  const seen = new Set();
  (function walk(ns) {
    for (const n of ns) {
      for (const p of byNode.get(n.id) || []) {
        if (p.curriculumId === n.id && !seen.has(p.file)) { seen.add(p.file); ordered.push({ file: p.file, node: n.id }); }
      }
      if (n.children) walk(n.children);
    }
  })(nodes);

  const isDesc = (id, base) => id === base || id.startsWith(base + '.');
  const firstFileUnder = (id) => ordered.find((o) => isDesc(o.node, id))?.file || null;

  // מונים רשמיים בלבד — נגזרים ע"י build-curriculum ומאומתים ע"י validate-curriculum (§4.5).
  // אין לחשב מונה מחדש כאן; קוראים את pageCount מהצומת.
  const byId = new Map();
  (function idx(ns) { for (const nd of ns) { byId.set(nd.id, nd); if (nd.children) idx(nd.children); } })(nodes);
  const pageCount = (id) => byId.get(id)?.pageCount ?? 0;

  const g7 = nodes.find((n) => n.id === GRADE.id);
  if (!g7) throw new Error('grade node g7 not found in topics.json curriculum');

  const domains = (g7.children || [])
    .filter((d) => !d.extension && DOMAIN_COLOR[d.id])
    .map((d) => ({
      id: d.id,
      name: d.name,
      colorIndex: DOMAIN_COLOR[d.id],
      count: pageCount(d.id),
      mains: (d.children || []).map((mt) => ({
        id: mt.id,
        name: mt.name,
        count: pageCount(mt.id),
        firstFile: firstFileUnder(mt.id),
      })),
    }));

  return { domains, generatedAt: topics.generatedAt };
}

function render(model) {
  // מספור רץ 01.. לכל הנושאים העיקריים, בסדר התחומים → אינדקס צבע 1..12
  let n = 0;
  const numbered = [];
  for (const dom of model.domains) for (const mt of dom.mains) { mt.num = ++n; mt.c = colorOf(mt.num); numbered.push(mt); }

  // ---- תוכן העניינים: תגי-מספר צבעוניים ----
  const tocItems = numbered.map((mt) => {
    if (mt.firstFile) {
      return `        <li><a class="toc-item" data-c="${mt.c}" href="${deepLink(mt.firstFile)}">
          <span class="toc-num">${two(mt.num)}</span><span class="toc-name">${esc(mt.name)}</span>
        </a></li>`;
    }
    return `        <li><span class="toc-item" data-c="${mt.c}" aria-disabled="true">
          <span class="toc-num">${two(mt.num)}</span><span class="toc-name">${esc(mt.name)}</span>
        </span></li>`;
  }).join('\n');

  // ---- עמודה של תחום razpages (כפתור-ענק + נושאים) ----
  const razColumn = (dom) => {
    const domFirst = dom.mains.find((m) => m.firstFile)?.firstFile || null;
    const domCount = dom.count; // pageCount רשמי של התחום (§4.5)
    const head = domFirst
      ? `      <a class="domain-head" data-c="${dom.colorIndex}" href="${deepLink(domFirst)}">
        <span class="domain-head-title">${esc(dom.name)}</span>
        <span class="domain-head-meta">${domCount} דפי עבודה</span>
      </a>`
      : `      <div class="domain-head is-empty" data-c="${dom.colorIndex}">
        <span class="domain-head-title">${esc(dom.name)}</span>
        <span class="domain-head-meta">בקרוב</span>
      </div>`;
    const items = dom.mains.map((mt) => {
      if (mt.firstFile) {
        return `        <li><a class="topic" data-c="${mt.c}" href="${deepLink(mt.firstFile)}">
          <span class="topic-num">${two(mt.num)}</span>
          <span class="topic-name">${esc(mt.name)}</span>
          <span class="topic-count" aria-label="${mt.count} דפי עבודה">${mt.count}</span>
        </a></li>`;
      }
      return `        <li><span class="topic is-empty" data-c="${mt.c}">
          <span class="topic-num">${two(mt.num)}</span>
          <span class="topic-name">${esc(mt.name)}</span>
          <span class="topic-soon">בקרוב</span>
        </span></li>`;
    }).join('\n');
    return `    <section class="domain" aria-labelledby="dh-${dom.id}">
${head}
      <ul class="topic-list" aria-label="נושאים · ${esc(dom.name)}">
${items}
      </ul>
    </section>`;
  };

  // ---- עמודות פורטל (מבחנים / משימות סיכום) → jerusalem2 ----
  const portalColumn = (title, entry) => `    <section class="domain">
      <a class="domain-head" data-c="${entry.c}" href="${esc(entry.href)}" target="_blank" rel="noopener">
        <span class="domain-head-title">${esc(title)}</span>
        <span class="domain-head-meta">פורטל המחוז ↗</span>
      </a>
      <ul class="topic-list" aria-label="${esc(title)}">
        <li><a class="topic" data-c="${entry.c}" href="${esc(entry.href)}" target="_blank" rel="noopener">
          <span class="topic-num" aria-hidden="true">↗</span>
          <span class="topic-name">${esc(entry.label)}</span>
          <span class="topic-src">פורטל</span>
        </a></li>
      </ul>
    </section>`;

  const columns = [
    ...model.domains.map(razColumn),
    portalColumn('מבחנים', PORTAL.tests),
    portalColumn('משימות סיכום', PORTAL.summaries),
  ].join('\n');

  const resources = PORTAL.resources.map((r) =>
    `      <a class="res" data-c="${r.c}" href="${esc(r.href)}" target="_blank" rel="noopener">
        <span class="res-dot" aria-hidden="true"></span>
        <span class="res-label">${esc(r.label)}</span>
        <span class="res-ext" aria-hidden="true">↗</span>
      </a>`).join('\n');

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>חומרים, דפי עבודה וקישורים לכיתה ז׳ — ספר דיגיטלי</title>
  <meta name="description" content="ספר דיגיטלי לכיתה ז׳: נושאי תכנית הלימודים לפי תחום, קישור ישיר לדפי העבודה, ומשאבי פורטל מחוז ירושלים." />
  <meta name="theme-color" content="#007AFF" />
  <link rel="icon" href="./icon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="./vendor/fonts/rubik.css" />
  <link rel="stylesheet" href="./styles/grade-book.css" />
  <script src="./grade-book.js" defer></script>
</head>
<body>
  <main class="book">
    <header class="book-hero">
      <div class="book-grade" aria-hidden="true">${GRADE.letter}</div>
      <div class="book-hero-body">
        <p class="book-eyebrow">ספר דיגיטלי · תכנית הלימודים במתמטיקה · חטיבת הביניים</p>
        <h1 class="book-title">חומרים, דפי עבודה וקישורים לכיתה ${GRADE.letter}</h1>
        <p class="book-sub">בחרו תחום ונושא כדי לפתוח את דפי העבודה, או דלגו ישירות מתוכן העניינים.</p>
      </div>
    </header>

    <nav class="book-section" aria-labelledby="toc-title">
      <h2 id="toc-title">תוכן העניינים</h2>
      <p class="book-section-note">כל נושא עיקרי מסומן במספר ובצבע ייחודי — כמו בחוברת.</p>
      <ol class="toc-grid">
${tocItems}
      </ol>
    </nav>

    <section class="book-section" aria-labelledby="domains-title">
      <h2 id="domains-title">נושאים לפי תחום</h2>
      <p class="book-section-note">כותרת כל עמודה היא כפתור לפתיחת התחום; הנושאים מקשרים ישירות לדפי העבודה.</p>
      <div class="domain-grid">
${columns}
      </div>
    </section>

    <section class="book-section" aria-labelledby="res-title">
      <h2 id="res-title">משאבים ופורטל המחוז</h2>
      <p class="book-section-note">נפתחים בפורטל מחוז ירושלים ↗</p>
      <div class="res-grid">
${resources}
      </div>
    </section>

    <footer class="book-credit">
      <div class="f1">יניב רז — מדריך מחוזי חט"ב בעיר ירושלים</div>
      <div class="f2">הדרכה במחוז ירושלים והעיר ירושלים — מנח"י, בהובלת איילת קריספין</div>
    </footer>
  </main>
</body>
</html>
`;
}

function main() {
  const check = process.argv.includes('--check');
  const html = render(loadModel());
  const outPath = path.join(root, OUT);
  if (check) {
    const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
    if (current !== html) {
      console.error(`[grade-book] ${OUT} is stale — run "npm run book:build" and commit.`);
      process.exit(1);
    }
    console.log(`[grade-book] ${OUT} is up to date.`);
    return;
  }
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`[grade-book] wrote ${OUT}`);
}

main();
