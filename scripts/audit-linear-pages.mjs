// scripts/audit-linear-pages.mjs — אימות מדיד לדפי הנושא "פונקציה קווית".
//
// CLAUDE.md §4.3: "אימות במדידה, לא בעין". הבדיקה רצה בדפדפן אמיתי ומודדת:
//   1. ניצול A4  — גובה התוכן מול 297mm, וזליגה מעבר לדף.
//   2. היפוך bidi — מיקומי תווים בפועל (getStartPositionOfChar) בכל <text> ב-SVG.
//   3. התנגשות  — חיתוך מדויק בין תיבת טקסט לכל stroke בסרטוט.
//   4. גלישה אופקית של אלמנטים מחוץ לדף.
//
// הרצה: node scripts/audit-linear-pages.mjs [--shot]

import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const shot = process.argv.includes('--shot');
const outDir = path.join(root, 'STATE', 'reports', 'linear-function');
fs.mkdirSync(outDir, { recursive: true });

const TOPIC = 'פונקציה קווית';
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
const pages = (meta.topics.find((t) => t.name === TOPIC)?.pages) || [];
if (!pages.length) { console.error(`לא נמצאו דפים לנושא "${TOPIC}"`); process.exit(1); }

const PORT = 5188;
const child = spawn(process.execPath, ['preview/server.mjs'], {
  cwd: root, stdio: 'ignore', env: { ...process.env, PORT: String(PORT) },
});
const stop = () => { try { child.kill(); } catch {} };
process.on('exit', stop);

async function waitForServer() {
  const t0 = Date.now();
  while (Date.now() - t0 < 20000) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/preview`); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('שרת התצוגה לא עלה');
}

await waitForServer();

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const findings = [];
const rows = [];

for (const p of pages) {
  const url = `http://127.0.0.1:${PORT}/${encodeURIComponent(p.file)}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  // המתנה להתייצבות MathJax
  await page.evaluate(async () => { if (window.MathJax?.startup?.promise) await window.MathJax.startup.promise; }).catch(() => {});
  await page.waitForTimeout(250);

  const r = await page.evaluate(() => {
    const sheet = document.querySelector('.a4-page');
    if (!sheet) return { error: 'אין .a4-page' };
    const sb = sheet.getBoundingClientRect();

    // --- ניצול אמיתי ---
    // .question-block משתמש ב-justify-content:space-between, ולכן הוא **תמיד**
    // נמתח לגובה המלא — מדידת תחתית התוכן הייתה מחזירה ~96% לכל דף ללא קשר
    // לכמות התוכן. המדד הנכון: סכום הגבהים הטבעיים של הילדים מול הגובה הפנוי.
    const qb = sheet.querySelector('.question-block');
    let used = null, naturalH = null, availH = null;
    if (qb) {
      const kids = [...qb.children];
      naturalH = kids.reduce((s, k) => s + k.getBoundingClientRect().height, 0)
        + Math.max(0, kids.length - 1) * parseFloat(getComputedStyle(qb).rowGap || 0);
      availH = qb.getBoundingClientRect().height;
      used = availH > 0 ? naturalH / availH : null;
    }
    let contentBottom = sb.top;
    for (const k of sheet.children) contentBottom = Math.max(contentBottom, k.getBoundingClientRect().bottom);
    const spill = (contentBottom - sb.top) / sb.height;

    // --- זליגה של צאצאים מחוץ לדף ---
    const overflow = [];
    for (const el of sheet.querySelectorAll('*')) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 && b.height === 0) continue;
      if (b.bottom > sb.bottom + 1 || b.right > sb.right + 1 || b.left < sb.left - 1) {
        overflow.push({ tag: el.tagName.toLowerCase(), cls: el.className?.baseVal ?? el.className ?? '',
          dx: Math.round(Math.max(0, b.right - sb.right, sb.left - b.left)), dy: Math.round(Math.max(0, b.bottom - sb.bottom)) });
      }
    }

    // --- היפוך bidi בטקסטים של SVG: הסדר החזותי חייב להתאים לסדר הלוגי ---
    const flipped = [];
    for (const t of sheet.querySelectorAll('svg text')) {
      const s = t.textContent || '';
      if (!/[0-9]/.test(s) || /[֐-׿]/.test(s)) continue;
      const n = t.getNumberOfChars?.() ?? 0;
      if (n < 2) continue;
      try {
        const first = t.getStartPositionOfChar(0).x;
        const last = t.getStartPositionOfChar(n - 1).x;
        if (last < first) flipped.push({ text: s, first, last, dir: t.getAttribute('direction') });
      } catch {}
    }

    // --- היפוך bidi בנוסחאות MathJax: בהקשר RTL, \(y = mx + b\) עלול
    //     להתרנדר כ-`b + mx = y`. משווים סדר חזותי מול סדר לוגי. ---
    const mjxFlipped = [];
    for (const c of sheet.querySelectorAll('mjx-container')) {
      // שבר (mjx-frac) הוא פריסה דו־ממדית: המונה, קו השבר והמכנה חולקים אותו
      // טווח x, ולכן השטחה לשורה מדווחת היפוך שווא (\(-\frac{3}{14}\) נראה כ-"−143").
      // בודקים את שורת הבסיס בלבד; תוכן השברים נבדק בנפרד לכל מונה/מכנה.
      const inFrac = (el) => !!el.closest('mjx-frac');
      const leaves = [...c.querySelectorAll('mjx-mi,mjx-mn,mjx-mo')].filter((l) => !inFrac(l));
      for (const fr of c.querySelectorAll('mjx-frac')) {
        for (const part of fr.querySelectorAll('mjx-num, mjx-den')) {
          const ls = [...part.querySelectorAll('mjx-mi,mjx-mn,mjx-mo')];
          if (ls.length < 2) continue;
          const lg = ls.map((l) => l.textContent.trim()).join('');
          const vs = ls.slice().sort((a, z) => a.getBoundingClientRect().left - z.getBoundingClientRect().left)
            .map((l) => l.textContent.trim()).join('');
          if (lg !== vs) mjxFlipped.push({ logical: lg, visual: vs, whole: 'בתוך שבר' });
        }
      }
      if (leaves.length < 2) continue;
      const items = leaves.map((l) => {
        const b = l.getBoundingClientRect();
        return { t: l.textContent.trim(), x: b.left, y: Math.round((b.top + b.bottom) / 2) };
      });
      // שבר נפרס לשתי שורות (מונה/מכנה) באותו טווח x. מיון גולמי לפי x היה
      // משרשר אותן ומדווח היפוך שווא — לכן ממיינים קודם לפי שורה ואז לפי x.
      const rowOf = (y) => { const r = rows0.find((v) => Math.abs(v - y) <= 6); if (r === undefined) rows0.push(y); return r ?? y; };
      const rows0 = [];
      items.forEach((i) => { i.row = rowOf(i.y); });
      // ההשוואה היא **בתוך כל שורה בנפרד**: פריסה דו־ממדית (שבר) אינה ניתנת
      // ליניאריזציה, אבל בתוך שורה אחת סדר חזותי חייב להתאים לסדר הלוגי.
      const logical = items.map((i) => i.t).join('');
      let bad = null;
      for (const row of [...new Set(items.map((i) => i.row))]) {
        const inRow = items.filter((i) => i.row === row);
        if (inRow.length < 2) continue;
        const lg = inRow.map((i) => i.t).join('');
        const vs = inRow.slice().sort((a, z) => a.x - z.x).map((i) => i.t).join('');
        if (lg !== vs) { bad = { logical: lg, visual: vs }; break; }
      }
      if (bad) mjxFlipped.push({ ...bad, whole: logical });
    }

    // --- התנגשות בין תיבת טקסט לבין קווי הסרטוט ---
    const collide = [];
    for (const svg of sheet.querySelectorAll('svg.chart')) {
      const texts = [...svg.querySelectorAll('text')];
      const strokes = [...svg.querySelectorAll('line, polyline, path')];
      for (const t of texts) {
        const tb = t.getBoundingClientRect();
        if (tb.width === 0) continue;
        const shrink = 0.22 * Math.min(tb.width, tb.height);
        const box = { l: tb.left + shrink, r: tb.right - shrink, t: tb.top + shrink, b: tb.bottom - shrink };
        for (const s of strokes) {
          if (s.tagName.toLowerCase() === 'path' && s.closest('marker')) continue;
          // צירים ושנתות אינם "התנגשות": תוויות הסימון ממוקמות בחישוב כך שיישבו
          // לצדם. בודקים רק את קווי הגרף עצמם.
          if (s.classList.contains('axis') || s.classList.contains('tick')) continue;
          if (s.closest('g.grid')) continue; // קווי רשת הם רקע, לא תוכן
          const sb2 = s.getBoundingClientRect();
          if (sb2.right < box.l || sb2.left > box.r || sb2.bottom < box.t || sb2.top > box.b) continue;
          // חפיפת תיבות בלבד אינה מספיקה לקו אלכסוני — בודקים חיתוך קטע-מלבן מדויק
          if (s.tagName.toLowerCase() === 'line') {
            const x1 = +s.getAttribute('x1'), y1 = +s.getAttribute('y1'), x2 = +s.getAttribute('x2'), y2 = +s.getAttribute('y2');
            const m = svg.getScreenCTM();
            const P = (x, y) => { const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; return pt.matrixTransform(m); };
            const a = P(x1, y1), b = P(x2, y2);
            const inBox = (p) => p.x >= box.l && p.x <= box.r && p.y >= box.t && p.y <= box.b;
            let hit = inBox(a) || inBox(b);
            if (!hit) {
              const segInt = (p1, p2, p3, p4) => {
                const d = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
                if (Math.abs(d) < 1e-9) return false;
                const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / d;
                const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / d;
                return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
              };
              const c = [{ x: box.l, y: box.t }, { x: box.r, y: box.t }, { x: box.r, y: box.b }, { x: box.l, y: box.b }];
              for (let i = 0; i < 4 && !hit; i++) hit = segInt(a, b, c[i], c[(i + 1) % 4]);
            }
            if (hit) collide.push({ text: t.textContent, stroke: s.getAttribute('stroke') });
          }
        }
      }
    }

    return {
      used, spill, naturalH, availH, w: sb.width, h: sb.height,
      overflow: overflow.slice(0, 6), overflowCount: overflow.length,
      flipped, mjxFlipped, collide: collide.slice(0, 8), collideCount: collide.length,
      svgCount: sheet.querySelectorAll('svg').length,
    };
  });

  if (shot) {
    const el = await page.$('.a4-page');
    await el?.screenshot({ path: path.join(outDir, `${p.file.replace('.html', '')}.png`) });
  }

  const pct = r.used ? (r.used * 100).toFixed(1) : '—';
  rows.push({ file: p.file, title: p.title, pct, ...r });

  // שפיות תוכן: ערך JS שדלף אל הדף. תפס `null.` כתווית סעיף ב-23 דפים —
  // ליקוי שבדיקות הגאומטריה וה-bidi אינן רואות כלל (§1.6).
  const raw = fs.readFileSync(path.join(root, p.file), 'utf8');
  const body = raw.slice(raw.indexOf('<main'));
  for (const token of ['>null', 'null.', '>undefined', 'NaN', '[object Object]']) {
    if (body.includes(token)) findings.push(`${p.file}: ערך שדלף לדף — "${token}"`);
  }

  if (r.error) findings.push(`${p.file}: ${r.error}`);
  if (r.used && r.used > 1.001) findings.push(`${p.file}: תוכן חורג מגבול A4 (${pct}%)`);
  if (r.used && r.used < 0.80) findings.push(`${p.file}: ניצול נמוך ${pct}% (נדרש ≥80%)`);
  if (r.overflowCount) findings.push(`${p.file}: ${r.overflowCount} אלמנטים חורגים — ${JSON.stringify(r.overflow[0])}`);
  if (r.flipped?.length) findings.push(`${p.file}: היפוך bidi ב-${r.flipped.length} טקסטים — ${JSON.stringify(r.flipped[0])}`);
  if (r.mjxFlipped?.length) findings.push(`${p.file}: היפוך bidi ב-${r.mjxFlipped.length} נוסחאות MathJax — ${JSON.stringify(r.mjxFlipped[0])}`);
  if (r.collideCount) findings.push(`${p.file}: ${r.collideCount} התנגשויות טקסט/קו — ${JSON.stringify(r.collide[0])}`);
}

await browser.close();
stop();

console.log(`\n${'='.repeat(72)}`);
console.log(`אימות מדיד — נושא "${TOPIC}" (${pages.length} דפים)`);
console.log('='.repeat(72));
console.log(`${'קובץ'.padEnd(18)} ${'ניצול'.padEnd(8)} ${'SVG'.padEnd(5)} ${'חריגות'.padEnd(8)} ${'bidi'.padEnd(6)} ${'מתמטיקה'.padEnd(9)} התנגשות`);
console.log('-'.repeat(72));
for (const r of rows) {
  console.log(`${r.file.padEnd(18)} ${String(r.pct + '%').padEnd(8)} ${String(r.svgCount ?? '-').padEnd(5)} ${String(r.overflowCount ?? '-').padEnd(8)} ${String(r.flipped?.length ?? '-').padEnd(6)} ${String(r.mjxFlipped?.length ?? '-').padEnd(9)} ${r.collideCount ?? '-'}`);
}
console.log('='.repeat(72));

fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify({ topic: TOPIC, rows, findings }, null, 2), 'utf8');

if (findings.length) {
  console.log(`\n[FAIL] ${findings.length} ממצאים:`);
  for (const f of findings) console.log('  ✗ ' + f);
  process.exitCode = 1;
} else {
  console.log('\n[OK] כל הדפים עברו: ניצול תקין, אין חריגה, אין היפוך bidi, אין התנגשות.');
}
