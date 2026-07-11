// scripts/import-bbb.mjs — ממיר ספרי bbb לדפי עבודה קנוניים (CLAUDE.md §5, §11)
//
// שימוש: node scripts/import-bbb.mjs --book=algebra [--assets=<דרך לתיקיית assets של המקור>]
//
// עקרונות:
// - נאמנות טקסט מוחלטת: אסור לשנות/לנסח/למספר מחדש שום טקסט מ-worksheet.html.
//   מותר להתאים אך ורק מעטפת: שמות מחלקות, המרת style מוטמע למחלקות, נתיבי נכסים.
// - עימוד במדידת דפדפן אמיתית (Playwright): שאלה נוספת לדף רק אם אין overflow.
// - אידמפוטנטי: הרצה חוזרת מוחקת את דפי הנושא שנוצרו בעבר ומחוללת מחדש.
// - אסור לגעת בעמוד-1..98, ב-styles/a4-base.css ובשכבות הקיימות.

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from '@playwright/test';

const ROOT = process.cwd();
const PROTECTED_MAX_PAGE = 98; // לעולם לא נוגעים בעמוד-1..98
const SITE_BASE = 'https://yanivmizrachiy.github.io/parabula-next';
const SAFETY_PX = 6; // מרווח ביטחון בתחתית הדף בעת אריזה
const MIN_UTIL = 50; // סף ניצול A4 (CLAUDE.md §5)
const STRETCH_BELOW_UTIL = 72; // מתחת לזה מותחים את הפריסה לגובה מלא (עיצוב בלבד)

const BOOKS = {
  algebra: {
    key: 'algebra',
    topicName: "אלגברה לכיתה ז'",
    navLabel: "אלגברה ז'",
    pageClass: 'bbb-algebra-page',
    topicCss: 'styles/topics/bbb-algebra.css'
  }
};

// תוויות קצרות לשורת הנושאים — העתק מדויק של השורה בעמוד-96.html (לא משנים דפים קיימים)
const BASE_TOPIC_LINKS = [
  { href: 'עמוד-1.html', label: 'חוקיות' },
  { href: 'עמוד-3.html', label: 'פונקציה ריבועית' },
  { href: 'עמוד-96.html', label: 'גרף עולה ושיפוע' },
  { href: 'עמוד-9.html', label: 'משפט פיתגורס' },
  { href: 'עמוד-31.html', label: 'משוואה ריבועית' },
  { href: 'עמוד-37.html', label: 'פילוג מורחב' },
  { href: 'עמוד-39.html', label: 'מקבילית' },
  { href: 'עמוד-42.html', label: 'משוואות' }
];

// ---------- כלי עזר ----------

function fail(message) {
  console.error(`IMPORT_BBB FAIL: ${message}`);
  process.exit(1);
}

function decodeEntities(text) {
  return text
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');
}

function escapeText(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

// סורק ילדים ברמה העליונה של קטע HTML (המקור מיוצר מכונה — מבנה סדור)
function topLevelChildren(html) {
  const VOID = new Set(['br', 'img', 'hr', 'meta', 'link', 'input', 'circle', 'line', 'rect', 'path', 'polygon', 'polyline', 'use']);
  const children = [];
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)[^>]*?>/g;
  let depth = 0;
  let start = -1;
  let match;
  while ((match = tagRe.exec(html)) !== null) {
    const tag = match[0];
    const name = match[1].toLowerCase();
    if (tag.startsWith('</')) {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        children.push(html.slice(start, match.index + tag.length));
        start = -1;
      }
      continue;
    }
    const selfClosing = tag.endsWith('/>') || VOID.has(name);
    if (selfClosing) continue;
    if (depth === 0) start = match.index;
    depth += 1;
  }
  return children;
}

function classOf(childHtml) {
  const m = childHtml.match(/^<[a-zA-Z][^>]*class="([^"]*)"/);
  return m ? m[1].split(/\s+/)[0] : '';
}

// טקסט קנוני להשוואת נאמנות: מרחיב data-tex, מסיר תגיות, מנרמל רווחים
function canonicalText(html) {
  let text = html.replace(/<span class="math" data-tex="([^"]*)"><\/span>/g, (_, tex) => ` ${decodeEntities(tex)} `);
  text = text.replace(/<span class="math">\\\((.*?)\\\)<\/span>/gs, (_, tex) => ` ${decodeEntities(tex)} `);
  text = text.replace(/<[^>]+>/g, ' ');
  return decodeEntities(text).replace(/\s+/g, ' ').trim();
}

// ---------- טרנספורמציית מעטפת (אפס שינוי טקסט) ----------

function transformItemHtml(html, book, assetStats) {
  let out = html;

  // dir="ltr" -> class="ltr" (LTR מוגדר ב-CSS בלבד לפי CLAUDE.md §7)
  out = out.replaceAll('<span dir="ltr">', '<span class="ltr">');

  // KaTeX data-tex -> MathJax inline \( ... \), ה-TeX עצמו נשמר 1:1
  out = out.replace(/<span class="math" data-tex="([^"]*)"><\/span>/g,
    (_, tex) => `<span class="math">\\(${escapeText(decodeEntities(tex))}\\)</span>`);

  // style מוטמע -> מחלקות (html-validate אוסר inline style)
  out = out.replace(/<span class="abox" style="min-width:(\d+)px">/g, '<span class="abox abox-w$1">');
  out = out.replace(/<div class="figure" style="max-width:(\d+)%;margin-inline:auto">/g, '<div class="figure fig-w$1">');
  out = out.replace(/ style="font-family:[^"]*"/g, '');

  // נכסי תמונה -> pages/bbb/<key>/assets/ (שני מסלולי הפריסה מעתיקים pages/)
  out = out.replace(/(<img[^>]*\ssrc=")assets\/([^"]+)(")/g, (_, pre, name, post) => {
    assetStats.referenced.add(name);
    return `${pre}pages/bbb/${book.key}/assets/${name}${post}`;
  });

  if (/\sstyle\s*=\s*["']/.test(out)) {
    const leftover = out.match(/\sstyle\s*=\s*"[^"]*"/g);
    fail(`נשאר style מוטמע שלא הומר: ${leftover?.slice(0, 3).join(' | ')}`);
  }
  return out;
}

// ---------- parse worksheet.html ----------

function parseWorksheet(book) {
  const srcPath = path.join(ROOT, 'sources', 'bbb', book.key, 'worksheet.html');
  if (!fs.existsSync(srcPath)) fail(`חסר קובץ מקור: ${srcPath}`);
  const html = fs.readFileSync(srcPath, 'utf8');
  const body = html.split('</style>', 2)[1] ?? html;

  const sections = [];
  const secRe = /<section id="sec-\d+" class="topic"[^>]*>/g;
  const starts = [];
  let match;
  while ((match = secRe.exec(body)) !== null) starts.push({ index: match.index, len: match[0].length });
  for (let i = 0; i < starts.length; i += 1) {
    const from = starts[i].index + starts[i].len;
    const hardEnd = i + 1 < starts.length ? starts[i + 1].index : body.length;
    const close = body.indexOf('</section>', from);
    const end = close !== -1 && close < hardEnd ? close : hardEnd;
    sections.push(body.slice(from, end));
  }
  if (sections.length === 0) fail('לא נמצאו פרקים (section.topic) במקור');

  const assetStats = { referenced: new Set() };
  const items = [];
  let questionCount = 0;

  for (const sectionHtml of sections) {
    for (const child of topLevelChildren(sectionHtml)) {
      const cls = classOf(child);
      if (cls === 'sectionbar') {
        const letter = child.match(/<div class="secletter">(.*?)<\/div>/s)?.[1] ?? '';
        const title = child.match(/<div class="sectitle">(.*?)<\/div>/s)?.[1] ?? '';
        const sub = child.match(/<div class="secsub">(.*?)<\/div>/s)?.[1] ?? '';
        items.push({
          type: 'heading',
          sourceHtml: child,
          html: `<h2 class="chapter-bar"><span class="chapter-letter">${letter}</span><span class="chapter-name">${title}</span><span class="chapter-sub">${sub}</span></h2>`
        });
      } else if (cls === 'q' || cls === 'note') {
        items.push({ type: cls, sourceHtml: child, html: transformItemHtml(child, book, assetStats) });
        if (cls === 'q') questionCount += 1;
      } else if (cls) {
        fail(`מבנה לא מוכר ברמה העליונה של פרק: class="${cls}"`);
      }
    }
  }

  // אימות נאמנות טקסט על כל פריט
  for (const item of items) {
    if (item.type === 'heading') continue;
    const before = canonicalText(item.sourceHtml);
    const after = canonicalText(item.html);
    if (before !== after) {
      fail(`נאמנות טקסט נשברה בפריט:\nמקור:  ${before.slice(0, 200)}\nתוצאה: ${after.slice(0, 200)}`);
    }
  }

  return { items, questionCount, sections: sections.length, assetStats };
}

// ---------- העתקת נכסים ----------

function copyAssets(book, assetStats, cloneAssetsDir) {
  if (assetStats.referenced.size === 0) return 0;
  if (!cloneAssetsDir || !fs.existsSync(cloneAssetsDir)) {
    fail(`הדפים מפנים ל-${assetStats.referenced.size} נכסים אך תיקיית המקור לא נמצאה (--assets=): ${cloneAssetsDir}`);
  }
  const target = path.join(ROOT, 'pages', 'bbb', book.key, 'assets');
  fs.mkdirSync(target, { recursive: true });
  let copied = 0;
  for (const name of assetStats.referenced) {
    const from = path.join(cloneAssetsDir, name);
    if (!fs.existsSync(from)) fail(`נכס חסר במקור: ${from}`);
    fs.copyFileSync(from, path.join(target, name));
    copied += 1;
  }
  return copied;
}

// ---------- שרת סטטי + דף מדידה ----------

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
  })[ext] || 'application/octet-stream';
}

function measureHarnessHtml(book) {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>מדידה — ${book.topicName}</title>
    <link rel="stylesheet" href="vendor/fonts/rubik.css" />
    <script>MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']] }, chtml: { fontURL: 'vendor/mathjax/output/chtml/fonts/woff-v2' } };</script>
    <script id="MathJax-script" async src="vendor/mathjax/tex-mml-chtml.js"></script>
    <link rel="stylesheet" href="styles/a4-base.css">
    <link rel="stylesheet" href="${book.topicCss}">
</head>
<body>
    <main class="a4-page ${book.pageClass}">
        <header class="header-container">
            <h1 class="page-title">${book.topicName}</h1>
            <div class="page-number">99</div>
        </header>
        <div class="question-block" id="flow"></div>
    </main>
</body>
</html>`;
}

async function startStaticServer(virtualPages) {
  return await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url, 'http://127.0.0.1');
        const pathname = decodeURIComponent(url.pathname);
        if (virtualPages.has(pathname)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
          res.end(virtualPages.get(pathname));
          return;
        }
        const filePath = path.resolve(ROOT, `.${pathname}`);
        if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          res.writeHead(404).end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType(filePath), 'Cache-Control': 'no-store' });
        fs.createReadStream(filePath).pipe(res);
      } catch (error) {
        res.writeHead(500).end(String(error?.message || error));
      }
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}

// רץ בתוך הדפדפן: מציב סט פריטים ב-flow ומחזיר התאמה + ניצול (באותה שיטה כמו audit הניצול)
// stretchMode: null | 'cards' (כרטיסי השאלות גדלים למילוי גובה הדף — מרחב עבודה לתלמיד)
// המתיחה כאן היא סימולציה של כלל ה-CSS שייכתב בקובץ הדף — לא inline style בדף מופק.
async function measureInBrowser({ itemsHtml, stretchMode }) {
  const main = document.querySelector('main.a4-page');
  const flow = document.getElementById('flow');
  flow.innerHTML = itemsHtml.join('');
  for (const child of flow.children) {
    const isCard = child.classList.contains('q') || child.classList.contains('note');
    child.style.flex = stretchMode === 'cards' && isCard ? '1 0 auto' : '';
  }
  if (globalThis.MathJax?.startup?.promise) {
    await MathJax.startup.promise;
    if (MathJax.typesetPromise) {
      MathJax.typesetClear?.([flow]);
      await MathJax.typesetPromise([flow]);
    }
  }
  if (document.fonts?.ready) await document.fonts.ready;
  const rect = main.getBoundingClientRect();
  const style = getComputedStyle(main);
  const usableTop = rect.top + (parseFloat(style.paddingTop) || 0);
  const usableBottom = rect.bottom - (parseFloat(style.paddingBottom) || 0);
  let lowest = usableTop;
  for (const el of main.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.height === 0 && r.width === 0) continue;
    const isLeaf = el.children.length === 0;
    const paints = cs.borderBottomWidth !== '0px' ||
      (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent');
    if (!isLeaf && !paints) continue;
    if (r.bottom > lowest) lowest = r.bottom;
  }
  return {
    overflowY: main.scrollHeight > main.clientHeight,
    overflowX: main.scrollWidth > main.clientWidth,
    contentBottom: lowest,
    usableBottom,
    utilization: Math.round(((lowest - usableTop) / (usableBottom - usableTop)) * 100)
  };
}

// פריט "נצמד לבא אחריו": כותרת פרק, וכן note שמציג פתיח לשאלות שאחריו
function keepWithNext(items, index) {
  const item = items[index];
  if (item.type === 'heading') return true;
  if (item.type === 'note' && index + 1 < items.length && items[index + 1].type === 'q') return true;
  return false;
}

// ---------- פליטה ----------

function navRow(book, firstNewFile) {
  const links = BASE_TOPIC_LINKS
    .map(l => `            <a class="topic-link" href="${l.href}">${l.label}</a>`)
    .join('\n');
  const active = `            <a class="topic-link is-active" href="${firstNewFile}" aria-current="page">${book.navLabel}</a>`;
  return `${links}\n${active}`;
}

function pageHtml(book, n, localIndex, total, itemsHtml, firstNewFile, prevFile, nextFile) {
  const prev = prevFile
    ? `<a class="nav-link" href="${prevFile}">הקודם</a>`
    : '<span class="nav-link is-disabled" aria-disabled="true">הקודם</span>';
  const next = nextFile
    ? `<a class="nav-link" href="${nextFile}">הבא</a>`
    : '<span class="nav-link is-disabled" aria-disabled="true">הבא</span>';
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>עמוד ${localIndex} — ${book.topicName}</title>
    <link rel="stylesheet" href="vendor/fonts/rubik.css" />
    <script>MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']] }, chtml: { fontURL: 'vendor/mathjax/output/chtml/fonts/woff-v2' } };</script>
    <script id="MathJax-script" async src="vendor/mathjax/tex-mml-chtml.js"></script>
    <link rel="stylesheet" href="styles/a4-base.css">
    <link rel="stylesheet" href="styles/pages/עמוד-${n}.css">
</head>
<body>
    <nav class="preview-nav" aria-label="ניווט בין עמודים">
        <div class="preview-nav-top">
            <div class="nav-side">${prev}</div>
            <div class="nav-meta">${book.topicName} — עמוד ${localIndex} / ${total}</div>
            <div class="nav-side">${next}</div>
        </div>
        <div class="preview-nav-topics" aria-label="מעבר בין נושאים">
${navRow(book, firstNewFile)}
        </div>
    </nav>

    <main class="a4-page page-${n} ${book.pageClass}">
        <header class="header-container">
            <h1 class="page-title">${book.topicName}</h1>
            <div class="page-number">${localIndex}</div>
        </header>

        <div class="question-block">
${itemsHtml.map(h => `            ${h}`).join('\n')}
        </div>
    </main>
</body>
</html>
`;
}

function pageCss(book, n, stretchMode) {
  const rel = `../topics/${path.basename(book.topicCss)}`;
  let css = `@import url('${rel}');\n`;
  if (stretchMode === 'cards') {
    css += `\n/* ניצול מלא של גובה ה-A4 (CLAUDE.md §5) — פריסה בלבד, אפס שינוי תוכן:\n   כרטיסי השאלות גדלים למילוי הדף ומעניקים מרחב עבודה לתלמיד */\n.page-${n} .question-block > .q, .page-${n} .question-block > .note { flex: 1 0 auto; }\n`;
  }
  return css;
}

// ---------- meta/topics.json ----------

function removePreviousImport(meta, book) {
  const existing = meta.topics.find(t => t.name === book.topicName);
  if (!existing) return [];
  const removed = [];
  for (const page of existing.pages) {
    if (page.number <= PROTECTED_MAX_PAGE) fail(`סירוב למחוק דף מוגן: ${page.file}`);
    for (const rel of [page.file, path.join('styles', 'pages', `עמוד-${page.number}.css`)]) {
      const full = path.join(ROOT, rel);
      if (fs.existsSync(full)) {
        fs.unlinkSync(full);
        removed.push(rel);
      }
    }
  }
  meta.topics = meta.topics.filter(t => t.name !== book.topicName);
  return removed;
}

// ---------- main ----------

async function main() {
  const bookArg = process.argv.find(a => a.startsWith('--book='))?.split('=')[1];
  const book = BOOKS[bookArg];
  if (!book) fail(`ספר לא מוכר: --book=${bookArg}. זמינים: ${Object.keys(BOOKS).join(', ')}`);
  if (!fs.existsSync(path.join(ROOT, book.topicCss))) fail(`חסר CSS נושא: ${book.topicCss}`);

  const cloneAssetsDir = process.argv.find(a => a.startsWith('--assets='))?.split('=').slice(1).join('=') || null;

  console.log(`[import-bbb] מפרסר את sources/bbb/${book.key}/worksheet.html ...`);
  const { items, questionCount, sections, assetStats } = parseWorksheet(book);
  console.log(`[import-bbb] ${sections} פרקים, ${questionCount} שאלות, ${items.length} פריטי זרימה`);

  const copiedAssets = copyAssets(book, assetStats, cloneAssetsDir);
  if (copiedAssets) console.log(`[import-bbb] הועתקו ${copiedAssets} נכסים ל-pages/bbb/${book.key}/assets/`);

  // הסרה אידמפוטנטית של ייבוא קודם לפני חישוב המספור
  const metaPath = path.join(ROOT, 'meta', 'topics.json');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const removed = removePreviousImport(meta, book);
  if (removed.length) console.log(`[import-bbb] הוסרו ${removed.length} קבצים מייבוא קודם`);

  const existingNumbers = meta.topics.flatMap(t => t.pages.map(p => p.number));
  const startN = Math.max(PROTECTED_MAX_PAGE, ...existingNumbers) + 1;

  // ---- עימוד במדידת דפדפן ----
  const virtual = new Map([['/__bbb_measure.html', measureHarnessHtml(book)]]);
  const { server, origin } = await startStaticServer(virtual);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });
  page.setDefaultTimeout(60000);

  let paginated = [];
  try {
    await page.goto(`${origin}/__bbb_measure.html`, { waitUntil: 'networkidle' });
    const measure = async (list, stretchMode = null) =>
      await page.evaluate(measureInBrowser, { itemsHtml: list.map(idx => items[idx].html), stretchMode });
    const fits = m => !m.overflowY && !m.overflowX && m.contentBottom <= m.usableBottom - SAFETY_PX;

    // אריזה חמדנית עם "נצמד לבא"
    const pagesItems = [];
    let current = [];
    for (let i = 0; i < items.length; i += 1) {
      const tentative = [...current, i];
      if (fits(await measure(tentative))) {
        current = tentative;
        continue;
      }
      if (current.length === 0) fail(`פריט בודד גבוה מדף A4 שלם (פריט #${i}, ${items[i].type})`);
      // מעבר דף: גרירת פריטי "נצמד לבא" מסוף הדף הנוכחי
      const carry = [];
      while (current.length && keepWithNext(items, current[current.length - 1])) {
        carry.unshift(current.pop());
      }
      if (current.length === 0) fail(`שרשרת כותרות ארוכה מדף שלם לפני פריט #${i}`);
      pagesItems.push(current);
      current = [...carry, i];
      if (!fits(await measure(current))) {
        fail(`פריט #${i} אינו נכנס גם בדף ריק (עם כותרת נגררת)`);
      }
    }
    if (current.length) pagesItems.push(current);

    // ---- איזון לאחור: דף בניצול נמוך מושך יחידות מהדף שלפניו (cascade ימין->שמאל) ----
    // "יחידה" = פריט + כל פריטי "נצמד לבא" שצמודים אליו מאחור (כותרת פרק/note פתיח).
    for (let p = pagesItems.length - 1; p >= 1; p -= 1) {
      for (let guard = 0; guard < 12; guard += 1) {
        const mP = await measure(pagesItems[p]);
        if (mP.utilization >= MIN_UTIL) break;
        const prev = pagesItems[p - 1];
        const unit = [prev.pop()];
        while (prev.length && keepWithNext(items, prev[prev.length - 1])) unit.unshift(prev.pop());
        if (prev.length === 0) {
          prev.push(...unit);
          break;
        }
        pagesItems[p] = [...unit, ...pagesItems[p]];
        const mNew = await measure(pagesItems[p]);
        if (!fits(mNew)) {
          pagesItems[p].splice(0, unit.length);
          prev.push(...unit);
          break;
        }
        // גם אם הדף הקודם ירד מתחת לסף — הלולאה החיצונית תטפל בו בהמשך הירידה
      }
    }

    // ---- אימות סופי לכל דף + החלטת מתיחה (CLAUDE.md §5: מותחים פריסה, לא ממציאים תוכן) ----
    console.log('[import-bbb] תוצאות עימוד:');
    for (let p = 0; p < pagesItems.length; p += 1) {
      const list = pagesItems[p];
      const m = await measure(list);
      if (m.overflowY || m.overflowX) fail(`overflow בדף ${p + 1} לאחר עימוד`);
      let stretchMode = null;
      let finalUtil = m.utilization;
      if (m.utilization < STRETCH_BELOW_UTIL) {
        stretchMode = 'cards';
        const mS = await measure(list, stretchMode);
        if (mS.overflowY || mS.overflowX) {
          stretchMode = null; // מתיחה לא בטוחה — נשארים בפריסה רגילה
        } else {
          finalUtil = mS.utilization;
        }
      }
      if (finalUtil < MIN_UTIL) fail(`דף ${p + 1} נשאר בניצול ${finalUtil}% (<${MIN_UTIL}%) גם אחרי איזון ומתיחה`);
      paginated.push({ list, utilization: m.utilization, finalUtil, stretchMode });
      console.log(`  דף ${String(p + 1).padStart(2)}: ${String(list.length).padStart(2)} פריטים, ניצול ${m.utilization}%${stretchMode ? ` -> ${finalUtil}% (מתיחת ${stretchMode})` : ''}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  // ---- פליטה ----
  const total = paginated.length;
  const firstNewFile = `עמוד-${startN}.html`;
  const newPages = [];
  for (let p = 0; p < total; p += 1) {
    const n = startN + p;
    const localIndex = p + 1;
    const file = `עמוד-${n}.html`;
    const prevFile = p > 0 ? `עמוד-${n - 1}.html` : null;
    const nextFile = p < total - 1 ? `עמוד-${n + 1}.html` : null;
    const itemsHtml = paginated[p].list.map(idx => items[idx].html);
    fs.writeFileSync(path.join(ROOT, file), pageHtml(book, n, localIndex, total, itemsHtml, firstNewFile, prevFile, nextFile), 'utf8');
    fs.writeFileSync(path.join(ROOT, 'styles', 'pages', `עמוד-${n}.css`), pageCss(book, n, paginated[p].stretchMode), 'utf8');
    newPages.push({
      number: n,
      file,
      title: `עמוד ${localIndex} — ${book.topicName}`,
      h1: book.topicName,
      topic: book.topicName,
      previewPath: `/${file}`,
      siteUrl: `${SITE_BASE}/${file}`
    });
  }

  meta.topics.push({ name: book.topicName, count: newPages.length, pages: newPages });
  meta.totalPages = meta.topics.reduce((sum, t) => sum + t.pages.length, 0);
  meta.generatedAt = new Date().toISOString();
  fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

  console.log(`[import-bbb] נוצרו ${total} דפים: עמוד-${startN} עד עמוד-${startN + total - 1}`);
  console.log(`[import-bbb] meta/topics.json עודכן: ${meta.topics.length} נושאים, ${meta.totalPages} דפים`);
}

await main();
