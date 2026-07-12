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
const SAFETY_PX = 14; // מרווח ביטחון בתחתית הדף בעת אריזה (מונע גלישה משונות רינדור זעירות)
const MIN_UTIL = 50; // סף ניצול A4 (CLAUDE.md §5)
const STRETCH_BELOW_UTIL = 72; // מתחת לזה מותחים את הפריסה לגובה מלא (עיצוב בלבד)

const BOOKS = {
  algebra: {
    key: 'algebra',
    topicName: "אלגברה לכיתה ז'",
    navLabel: "אלגברה ז'",
    pageClass: 'bbb-algebra-page',
    topicCss: 'styles/topics/bbb-algebra.css'
  },
  algebra8: {
    key: 'algebra8',
    topicName: "אלגברה לכיתה ח'",
    navLabel: "אלגברה ח'",
    pageClass: 'bbb-algebra8-page',
    topicCss: 'styles/topics/bbb-algebra8.css'
  },
  geometry8: {
    key: 'geometry8',
    topicName: "גאומטריה לכיתה ח'",
    navLabel: "גאומטריה ח'",
    pageClass: 'bbb-geometry8-page',
    topicCss: 'styles/topics/bbb-geometry8.css'
  },
  uncertainty: {
    key: 'uncertainty',
    topicName: 'תחום אי־וודאות',
    navLabel: 'אי־וודאות',
    pageClass: 'bbb-uncertainty-page',
    topicCss: 'styles/topics/bbb-uncertainty.css'
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

  // התאמה לאחור לפיילוט אלגברה (bbb-algebra.css מגדיר את המחלקות האלה):
  if (book.key === 'algebra') {
    out = out.replace(/<span class="abox" style="min-width:(\d+)px">/g, '<span class="abox abox-w$1">');
    out = out.replace(/<div class="figure" style="max-width:(\d+)%;margin-inline:auto">/g, '<div class="figure fig-w$1">');
    out = out.replace(/ style="font-family:[^"]*"/g, '');
  }

  // נכסי תמונה -> pages/bbb/<key>/assets/ (שני מסלולי הפריסה מעתיקים pages/)
  out = out.replace(/(<img[^>]*\ssrc=")assets\/([^"]+)(")/g, (_, pre, name, post) => {
    assetStats.referenced.add(name);
    return `${pre}pages/bbb/${book.key}/assets/${name}${post}`;
  });

  // כל שאר ה-inline style -> מחלקת utility scoped ב-CSS הנושא (§6): ההצהרות המדויקות
  // נשמרות (אפס שינוי ויזואלי), font-family מוסר כדי להתאים לתקן Rubik של הפרויקט (§5/§7).
  out = normalizeInlineStyles(out, assetStats.styleMap);

  if (/\sstyle\s*=\s*["']/.test(out)) {
    const leftover = out.match(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/g);
    fail(`נשאר style מוטמע שלא הומר: ${leftover?.slice(0, 3).join(' | ')}`);
  }
  return out;
}

// המרת כל inline style שנותר למחלקה scoped. שומר את ההצהרות בדיוק (למעט font-family
// שמוסר), ממזג למחלקה קיימת אם יש. הטקסט לא נוגע — canonicalText מתעלם מתגיות.
function normalizeInlineStyles(html, styleMap) {
  return html.replace(/<([a-zA-Z][\w-]*)\b([^>]*?)\sstyle=(?:"([^"]*)"|'([^']*)')([^>]*?)(\/?)>/g,
    (m, tag, pre, dq, sq, post, slash) => {
      const styleVal = dq !== undefined ? dq : sq;
      let decls = styleVal.split(';').map(s => s.trim()).filter(Boolean)
        .filter(d => !/^font-family\s*:/i.test(d))   // תקן Rubik של הפרויקט
        .filter(d => d.toLowerCase() !== 'italic');   // טוקן פגום במקור (no-op בדפדפן)
      const clean = decls.join('; ');
      let attrs = pre + post;
      if (!clean) return `<${tag}${attrs}${slash}>`;
      let cls = styleMap.get(clean);
      if (!cls) { cls = `bs-${styleMap.size + 1}`; styleMap.set(clean, cls); }
      if (/\sclass="/.test(attrs)) {
        attrs = attrs.replace(/(\sclass=")([^"]*)(")/, (_2, a, c, b) => `${a}${c} ${cls}${b}`);
      } else {
        attrs = ` class="${cls}"${attrs}`;
      }
      return `<${tag}${attrs}${slash}>`;
    });
}

// ---------- parse worksheet.html ----------

function parseWorksheet(book) {
  const srcPath = path.join(ROOT, 'sources', 'bbb', book.key, 'worksheet.html');
  if (!fs.existsSync(srcPath)) fail(`חסר קובץ מקור: ${srcPath}`);
  const html = fs.readFileSync(srcPath, 'utf8');
  // גוף המסמך = אחרי ה-</style> האחרון (חלק מהספרים מכילים כמה בלוקי style)
  const lastStyle = html.lastIndexOf('</style>');
  const body = lastStyle >= 0 ? html.slice(lastStyle + '</style>'.length) : html;

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

  const assetStats = { referenced: new Set(), widths: new Set(), styleMap: new Map() };
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

// כתיבת מחלקות ה-utility שנוצרו מ-inline style ל-CSS הנושא (§6). כל מחלקה מכילה
// את ההצהרות המדויקות מהמקור — אפס שינוי ויזואלי. אידמפוטנטי (מסיר בלוק קודם).
function writeGeneratedCss(book, styleMap) {
  const cssPath = path.join(ROOT, book.topicCss);
  let css = fs.readFileSync(cssPath, 'utf8');
  css = css.replace(/\n\/\* BBB_GENERATED_STYLES[\s\S]*$/, '\n');
  if (styleMap.size) {
    const rules = [...styleMap.entries()]
      .map(([decls, cls]) => `.${book.pageClass} .${cls} { ${decls}; }`).join('\n');
    css = css.replace(/\s*$/, '\n') +
      `\n/* BBB_GENERATED_STYLES — מחלקות מ-inline style של המקור (§6: אין inline style; הצהרות מדויקות) */\n${rules}\n`;
  }
  fs.writeFileSync(cssPath, css, 'utf8');
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
    <script>MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']] }, chtml: { fontURL: 'vendor/mathjax/tex-font/chtml/woff2' } };</script>
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
async function measureInBrowser({ itemsHtml, stretchMode, zoom }) {
  const main = document.querySelector('main.a4-page');
  const flow = document.getElementById('flow');
  flow.style.zoom = zoom && zoom < 1 ? String(zoom) : '';
  flow.innerHTML = itemsHtml.join('');
  for (const child of flow.children) {
    const isCard = child.classList.contains('q') || child.classList.contains('note');
    child.style.flex = stretchMode === 'cards' && isCard ? '1 0 auto' : '';
  }
  // המתנה לטעינת תמונות מוטמעות — בלעדיה הגובה נמדד חסר והדף גולש בפועל
  await Promise.all([...flow.querySelectorAll('img')].map((img) =>
    img.complete && img.naturalHeight > 0
      ? Promise.resolve()
      : new Promise((res) => { img.addEventListener('load', res, { once: true }); img.addEventListener('error', res, { once: true }); })));
  if (globalThis.MathJax?.startup?.promise) {
    await MathJax.startup.promise;
    if (MathJax.typesetPromise) {
      MathJax.typesetClear?.([flow]);
      await MathJax.typesetPromise([flow]);
    }
  }
  if (document.fonts?.ready) await document.fonts.ready;

  const computeMetrics = () => {
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
      usableTop,
      usableBottom,
      utilization: Math.round(((lowest - usableTop) / (usableBottom - usableTop)) * 100)
    };
  };

  // מדידה דטרמיניסטית: מודדים שוב ושוב (עם reflow כפוי) עד ש-contentBottom מתייצב.
  // מונע את המרוץ שבו טבלה/גרף מרונדרים קצר במדידה אחת וגבוה באחרת. לוקחים את המקסימום.
  let metrics = null, maxBottom = -Infinity, stable = 0;
  for (let i = 0; i < 8; i += 1) {
    void main.offsetHeight; // reflow כפוי
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const cur = computeMetrics();
    if (!metrics || cur.contentBottom > maxBottom) { metrics = cur; }
    if (Math.abs(cur.contentBottom - maxBottom) <= 1) { stable += 1; if (stable >= 2) break; }
    else stable = 0;
    maxBottom = Math.max(maxBottom, cur.contentBottom);
  }
  return { ...metrics, contentBottom: maxBottom, utilization: Math.round(((maxBottom - metrics.usableTop) / (metrics.usableBottom - metrics.usableTop)) * 100) };
}

// פיצול שאלה גבוהה מ-A4 בגבול תת-סעיף (<li> ב-ol.parts) על פני עמודים רצופים —
// בדיוק כמו זרימת ההדפסה במקור. אפס שינוי טקסט: כל <li> נשמר שלם, המשך ללא qnum.
function splitPartsList(qHtml) {
  const olIdx = qHtml.indexOf('<ol class="parts">');
  if (olIdx < 0) return null;
  const innerStart = olIdx + '<ol class="parts">'.length;
  // מציאת </ol> התואם (parts אינו מקונן ב-parts)
  const closeIdx = qHtml.indexOf('</ol>', innerStart);
  if (closeIdx < 0) return null;
  const before = qHtml.slice(0, olIdx);
  const after = qHtml.slice(closeIdx + '</ol>'.length);
  const inner = qHtml.slice(innerStart, closeIdx);
  const lis = [];
  let depth = 0, start = 0;
  const re = /<\/?li\b[^>]*>/g; let m;
  while ((m = re.exec(inner))) {
    if (m[0][1] !== '/') { if (depth === 0) start = m.index; depth += 1; }
    else { depth -= 1; if (depth === 0) lis.push(inner.slice(start, m.index + m[0].length)); }
  }
  if (lis.length < 2) return null; // אין מספיק תת-סעיפים לפיצול
  return { before, after, lis };
}

// פירוק qbody לרצף בלוקים ברמה העליונה + טקסט פתיח מוביל (לפיצול כללי כשאין ol.parts)
function splitQbodyBlocks(qHtml) {
  const bodyOpen = qHtml.indexOf('<div class="qbody">');
  if (bodyOpen < 0) return null;
  const innerStart = bodyOpen + '<div class="qbody">'.length;
  // סוף qbody = ה-</div> התואם (ספירת עומק div)
  let depth = 1, i = innerStart;
  const tag = /<\/?div\b[^>]*>/g; tag.lastIndex = innerStart;
  let m;
  while ((m = tag.exec(qHtml))) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (depth === 0) { i = m.index; break; }
  }
  const before = qHtml.slice(0, innerStart);
  const bodyInner = qHtml.slice(innerStart, i);
  const after = qHtml.slice(i); // כולל </div>(qbody) </div>(q)
  // נקודות התחלה של בלוקים ברמה העליונה — קפיצה מעל כל בלוק (חיפוש הסגירה התואמת שלו
  // לפי שם התג), עמיד לתוכן פנימי לא-מאוזן (SVG וכו') שמבלבל ספירת עומק גלובלית.
  const BLOCK = /^(div|ol|ul|table|figure|section|p|h[1-6]|blockquote|pre)$/i;
  const VOID = /^(br|img|hr|input|meta|link|circle|line|rect|path|polygon|polyline|use|stop|ellipse)$/i;
  const starts = [];
  const opener = /<([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;
  let pos = 0, mm;
  while (true) {
    opener.lastIndex = pos;
    mm = opener.exec(bodyInner);
    if (!mm) break;
    const tag = mm[1];
    const selfClose = mm[2] === '/' || VOID.test(tag);
    if (!BLOCK.test(tag) || selfClose) { pos = opener.lastIndex; continue; }
    starts.push(mm.index);
    // קפיצה מעל הבלוק: חיפוש הסגירה התואמת של אותו שם תג (ספירה מקומית)
    const both = new RegExp(`<(/?)${tag}\\b[^>]*?(/?)>`, 'g');
    both.lastIndex = opener.lastIndex;
    let depth = 1, cm;
    pos = bodyInner.length;
    while ((cm = both.exec(bodyInner))) {
      if (cm[1] === '/') { depth -= 1; if (depth === 0) { pos = both.lastIndex; break; } }
      else if (cm[2] !== '/') depth += 1;
    }
  }
  if (starts.length < 2) return null;
  // יחידות רציפות: השרשור שלהן = bodyInner בדיוק (נאמנות מובטחת). כל יחידה = בלוק +
  // הטקסט/inline שנגרר אחריו עד הבלוק הבא; היחידה הראשונה כוללת את טקסט הפתיח.
  const units = [];
  for (let k = 0; k < starts.length; k += 1) {
    const from = k === 0 ? 0 : starts[k];
    const to = k + 1 < starts.length ? starts[k + 1] : bodyInner.length;
    units.push(bodyInner.slice(from, to));
  }
  return { before, after, units };
}

async function splitTallQuestion(qHtml, measureHtml, fits) {
  // עדיפות 1: פיצול בגבול תת-סעיף (<li> ב-ol.parts) — נאמן ומוכח
  const parsed = splitPartsList(qHtml);
  if (parsed) {
    const { before, after, lis } = parsed;
    const piece1 = (sub) => `${before}<ol class="parts">${sub.join('')}</ol>${after}`;
    const cont = (sub) => `<div class="q q-cont"><div class="qbody"><ol class="parts">${sub.join('')}</ol></div></div>`;
    const pieces = await packPieces(lis, piece1, cont, measureHtml, fits);
    if (fits(await measureHtml([pieces[0]]))) return pieces;
    // הפתיח גבוה מדף גם עם סעיף אחד -> מפצלים את הפתיח רקורסיבית (נאמנות מובטחת), ואז הסעיפים
    const introPiece = `${before}</div></div>`; // סגירת qbody + q
    const introPieces = fits(await measureHtml([introPiece]))
      ? [introPiece]
      : await splitTallQuestion(introPiece, measureHtml, fits);
    const partsPieces = await packPieces(lis, cont, cont, measureHtml, fits);
    return [...introPieces, ...partsPieces];
  }
  // עדיפות 2 (כשאין ol.parts): פיצול בגבול בלוק ברמת qbody (יחידות רציפות — נאמנות מובטחת)
  const qb = splitQbodyBlocks(qHtml);
  if (qb) {
    const { before, after, units } = qb;
    const piece1 = (sub) => `${before}${sub.join('')}${after}`;
    const cont = (sub) => `<div class="q q-cont"><div class="qbody">${sub.join('')}</div></div>`;
    return await packPieces(units, piece1, cont, measureHtml, fits);
  }
  return [qHtml]; // לא ניתן לפצל
}

// פירוק בלוק-מיכל בודד (lines/ol/ul/table) לפריטי-בת לפיצול משנה כשהבלוק לבדו גבוה מדף
function extractByTag(inner, childTag) {
  const children = [];
  let depth = 0, start = -1, mm;
  const both = new RegExp(`<\\/?${childTag}\\b[^>]*>`, 'g');
  while ((mm = both.exec(inner))) {
    if (mm[0][1] !== '/') { if (depth === 0) start = mm.index; depth += 1; }
    else { depth -= 1; if (depth === 0) children.push(inner.slice(start, mm.index + mm[0].length)); }
  }
  return children;
}

// מפצל בלוק-מיכל בודד לשורות-בת. מחזיר wrap(sub, first) שעוטף מחדש.
function containerChildren(blockHtml) {
  const m = blockHtml.match(/^\s*<(div|ol|ul|table)\b([^>]*)>([\s\S]*)<\/\1>\s*$/);
  if (!m) return null;
  const [, tag, attrs, inner] = m;
  const openTag = blockHtml.slice(0, blockHtml.indexOf('>') + 1);

  if (tag === 'table') {
    // שורות tbody; thead נשאר בחלק הראשון בלבד (אין שכפול טקסט -> נאמנות מדויקת)
    const thead = (inner.match(/<thead>[\s\S]*?<\/thead>/) || [''])[0];
    const tb = inner.match(/<tbody\b[^>]*>([\s\S]*)<\/tbody>/);
    const rows = tb ? extractByTag(tb[1], 'tr') : extractByTag(inner, 'tr');
    if (rows.length < 2) return null;
    return { children: rows, wrap: (sub, first) => `${openTag}${first ? thead : ''}<tbody>${sub.join('')}</tbody></table>` };
  }

  const isLines = tag === 'div' && /class="[^"]*\blines\b/.test(attrs);
  const isTwocol = tag === 'div' && /class="[^"]*\btwocol\b/.test(attrs);
  let childTag;
  if (tag === 'ol' || tag === 'ul') childTag = 'li';
  else if (isLines || isTwocol) childTag = 'div'; // twocol -> עמודות נערמות; lines -> שורות
  else return null;
  const children = extractByTag(inner, childTag);
  if (children.length < 2) return null;
  return { children, wrap: (sub) => `${openTag}${sub.join('')}</${tag}>` };
}

async function packPieces(units, piece1, cont, measureHtml, fits) {
  const pieces = [];
  let remaining = units.slice();
  let first = true;
  while (remaining.length) {
    let take = 0;
    for (let n = 1; n <= remaining.length; n += 1) {
      const html = first ? piece1(remaining.slice(0, n)) : cont(remaining.slice(0, n));
      if (fits(await measureHtml([html]))) take = n; else break;
    }
    if (take === 0) {
      // יחידה בודדת גבוהה מדף -> פיצול משנה של המיכל הפנימי (lines/ol/table)
      const cc = containerChildren(remaining[0]);
      if (cc) {
        const isFirst = first;
        const sub = await packPieces(
          cc.children,
          (s) => (isFirst ? piece1([cc.wrap(s, true)]) : cont([cc.wrap(s, false)])),
          (s) => cont([cc.wrap(s, false)]),
          measureHtml, fits);
        pieces.push(...sub);
        remaining = remaining.slice(1);
        first = false;
        continue;
      }
      take = 1; // באמת אטומי — מקבלים דף גבוה בודד (יטופל/יתועד)
    }
    pieces.push(first ? piece1(remaining.slice(0, take)) : cont(remaining.slice(0, take)));
    remaining = remaining.slice(take);
    first = false;
  }
  return pieces;
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
    <script>MathJax = { tex: { inlineMath: [['\\\\(', '\\\\)']] }, chtml: { fontURL: 'vendor/mathjax/tex-font/chtml/woff2' } };</script>
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

function pageCss(book, n, stretchMode, zoom) {
  const rel = `../topics/${path.basename(book.topicCss)}`;
  let css = `@import url('${rel}');\n`;
  if (zoom) {
    css += `\n/* התאמת קנה-מידה לגובה A4 (CLAUDE.md §5) — הקטנה קריאה שמכניסה שאלה גבוהה, אפס שינוי תוכן */\n.page-${n} .question-block { zoom: ${zoom}; }\n`;
  } else if (stretchMode === 'cards') {
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
  const parsed = parseWorksheet(book);
  let items = parsed.items;
  const { questionCount, sections, assetStats } = parsed;
  console.log(`[import-bbb] ${sections} פרקים, ${questionCount} שאלות, ${items.length} פריטי זרימה`);

  const copiedAssets = copyAssets(book, assetStats, cloneAssetsDir);
  if (copiedAssets) console.log(`[import-bbb] הועתקו ${copiedAssets} נכסים ל-pages/bbb/${book.key}/assets/`);

  // מחלקות utility מ-inline style -> CSS הנושא (חייב להיכתב לפני מדידת העימוד)
  writeGeneratedCss(book, assetStats.styleMap);
  if (assetStats.styleMap.size) console.log(`[import-bbb] נכתבו ${assetStats.styleMap.size} מחלקות utility ל-${book.topicCss}`);

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
    const measure = async (list, stretchMode = null, zoom = null) =>
      await page.evaluate(measureInBrowser, { itemsHtml: list.map(idx => items[idx].html), stretchMode, zoom });
    const measureHtml = async (htmlArr) =>
      await page.evaluate(measureInBrowser, { itemsHtml: htmlArr, stretchMode: null, zoom: null });
    const fits = m => !m.overflowY && !m.overflowX && m.contentBottom <= m.usableBottom - SAFETY_PX;

    // קדם-מעבר: פיצול שאלות גבוהות מ-A4 לגבול תת-סעיף (נאמן לזרימת ההדפסה במקור)
    const expanded = [];
    for (const item of items) {
      if (item.type !== 'q' || fits(await measureHtml([item.html]))) { expanded.push(item); continue; }
      const pieces = await splitTallQuestion(item.html, measureHtml, fits);
      if (pieces.length === 1) { expanded.push(item); continue; }
      // אימות נאמנות: איחוד הטקסט של החלקים זהה למקור
      const combined = canonicalText(pieces.join(' '));
      if (combined !== canonicalText(item.html)) {
        fail(`פיצול שאלה שבר נאמנות טקסט:\nמקור:  ${canonicalText(item.html).slice(0, 160)}\nחלקים: ${combined.slice(0, 160)}`);
      }
      pieces.forEach((html, k) => expanded.push({ type: 'q', html, sourceHtml: k === 0 ? item.sourceHtml : '', split: true }));
      console.log(`[import-bbb] שאלה גבוהה פוצלה ל-${pieces.length} עמודים (נאמנות נשמרה)`);
    }
    items = expanded;
    // קנה-מידה שמכניס דף שגולש (CLAUDE.md §5: הקטנה קריאה, אפס שינוי תוכן). null אם כבר נכנס.
    const fitScale = async (list) => {
      const m0 = await measure(list);
      if (fits(m0)) return null;
      let scale = Math.floor(((m0.usableBottom - m0.usableTop - SAFETY_PX) / (m0.contentBottom - m0.usableTop)) * 100) / 100;
      for (let k = 0; k < 10 && scale >= 0.5; k += 1) {
        if (fits(await measure(list, null, scale))) return scale;
        scale = Math.round((scale - 0.02) * 100) / 100;
      }
      return -1; // לא נכנס גם ב-0.5 -> כשל אמיתי
    };

    // אריזה חמדנית עם "נצמד לבא"; דף שפריט בודד/כותרת+פריט גולש בו מתקבל כדף "גדול" (יוקטן בקנה-מידה)
    const pagesItems = [];
    let current = [];
    for (let i = 0; i < items.length; i += 1) {
      const tentative = [...current, i];
      if (fits(await measure(tentative))) {
        current = tentative;
        continue;
      }
      if (current.length === 0) { // פריט בודד גבוה מדף -> דף גדול משלו
        pagesItems.push([i]);
        continue;
      }
      // מעבר דף: גרירת פריטי "נצמד לבא" (כותרות/note פתיח) מסוף הדף הנוכחי לצד הפריט הבא
      const carry = [];
      while (current.length && keepWithNext(items, current[current.length - 1])) {
        carry.unshift(current.pop());
      }
      if (current.length > 0) pagesItems.push(current); // מה שנשאר (תוכן אמיתי) הופך לדף
      current = [...carry, i]; // כותרת נגררת + הפריט הבא ביחד (יוקטן יחד אם צריך)
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
          prev.push(...unit); // לא מרוקנים דף קודם כאן — מיזוג דפים נעשה במעבר נפרד
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

    // ---- מיזוג דפים סמוכים: דף בניצול נמוך שמתמזג עם קודמו לעמוד אחד תקין (מסיר דפי זנב דלילים) ----
    for (let p = pagesItems.length - 1; p >= 1; p -= 1) {
      const mP = await measure(pagesItems[p]);
      if (mP.utilization >= MIN_UTIL) continue;
      const merged = [...pagesItems[p - 1], ...pagesItems[p]];
      if (fits(await measure(merged))) {
        pagesItems[p - 1] = merged;
        pagesItems.splice(p, 1);
      }
    }

    // ---- אימות סופי לכל דף + החלטת מתיחה (CLAUDE.md §5: מותחים פריסה, לא ממציאים תוכן) ----
    console.log('[import-bbb] תוצאות עימוד:');
    for (let p = 0; p < pagesItems.length; p += 1) {
      const list = pagesItems[p];
      const m = await measure(list);
      let stretchMode = null;
      let zoom = null;
      let finalUtil = m.utilization;
      if (!fits(m)) {
        // דף גדול -> הקטנת קנה-מידה שמכניסה אותו (§5)
        zoom = await fitScale(list);
        if (zoom === -1) {
          const need = Math.round((m.contentBottom - m.usableTop) / (m.usableBottom - m.usableTop) * 100) / 100;
          fail(`דף ${p + 1} אינו נכנס ל-A4 גם בקנה-מידה 0.5 (overflowX=${m.overflowX}, overflowY=${m.overflowY}, יחס-גובה=${need}, פריטים=${list.length})`);
        }
        finalUtil = (await measure(list, null, zoom)).utilization;
      } else if (m.utilization < STRETCH_BELOW_UTIL) {
        stretchMode = 'cards';
        const mS = await measure(list, stretchMode);
        if (mS.overflowY || mS.overflowX) {
          stretchMode = null; // מתיחה לא בטוחה — נשארים בפריסה רגילה
        } else {
          finalUtil = mS.utilization;
        }
      }
      if (finalUtil < 25) fail(`דף ${p + 1} בניצול ${finalUtil}% (<25%) — חשד לבאג עימוד, לא זנב-פרק לגיטימי`);
      const sparse = finalUtil < MIN_UTIL; // זנב-פרק דליל נאמן למקור (§5: חריגה מתועדת)
      paginated.push({ list, utilization: m.utilization, finalUtil, stretchMode, zoom, sparse });
      console.log(`  דף ${String(p + 1).padStart(2)}: ${String(list.length).padStart(2)} פריטים, ניצול ${finalUtil}%${zoom ? ` (קנה-מידה ${zoom})` : stretchMode ? ` (מתיחת ${stretchMode})` : ''}${sparse ? ' [זנב-פרק דליל — חריגה מתועדת]' : ''}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  // ---- פליטה ----
  const total = paginated.length;
  const firstNewFile = `עמוד-${startN}.html`;
  const newPages = [];
  // חריגות ניצול A4 מתועדות (§5): דפי זנב-פרק דלילים, נאמנים למקור
  const exPath = path.join(ROOT, 'meta', 'a4-utilization-exceptions.json');
  const sparseFiles = fs.existsSync(exPath) ? JSON.parse(fs.readFileSync(exPath, 'utf8')) : {};
  for (const key of Object.keys(sparseFiles)) {
    if (sparseFiles[key].includes(book.topicName)) delete sparseFiles[key]; // ריצה חוזרת: איפוס לספר זה
  }
  for (let p = 0; p < total; p += 1) {
    const n = startN + p;
    const localIndex = p + 1;
    const file = `עמוד-${n}.html`;
    const prevFile = p > 0 ? `עמוד-${n - 1}.html` : null;
    const nextFile = p < total - 1 ? `עמוד-${n + 1}.html` : null;
    const itemsHtml = paginated[p].list.map(idx => items[idx].html);
    fs.writeFileSync(path.join(ROOT, file), pageHtml(book, n, localIndex, total, itemsHtml, firstNewFile, prevFile, nextFile), 'utf8');
    fs.writeFileSync(path.join(ROOT, 'styles', 'pages', `עמוד-${n}.css`), pageCss(book, n, paginated[p].stretchMode, paginated[p].zoom), 'utf8');
    if (paginated[p].sparse) sparseFiles[file] = `זנב-פרק דליל נאמן למקור (${book.topicName}) — ${paginated[p].finalUtil}% ניצול`;
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

  fs.writeFileSync(exPath, `${JSON.stringify(sparseFiles, null, 2)}\n`, 'utf8');
  const sparseCount = Object.keys(sparseFiles).filter(k => sparseFiles[k].includes(book.topicName)).length;
  if (sparseCount) console.log(`[import-bbb] ${sparseCount} דפי זנב-פרק דלילים נרשמו כחריגות ניצול מתועדות`);

  console.log(`[import-bbb] נוצרו ${total} דפים: עמוד-${startN} עד עמוד-${startN + total - 1}`);
  console.log(`[import-bbb] meta/topics.json עודכן: ${meta.topics.length} נושאים, ${meta.totalPages} דפים`);
}

await main();
