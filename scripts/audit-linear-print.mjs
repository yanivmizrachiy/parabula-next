// scripts/audit-linear-print.mjs — אימות הדפסה לדפי "פונקציה קווית" (CLAUDE.md §3).
//
// למה: §3 דורש שההדפסה תשמור A4 אמיתי, RTL, MathJax, SVG, גופנים ושבירת עמודים
// נכונה. כל בדיקות המסך שלנו מודדות את התצוגה — לא את הפלט המודפס. דף שנראה
// מושלם במסך יכול להישבר לשני עמודים בהדפסה, לאבד נוסחאות או לגלוש מגבולות A4.
//
// הבדיקה מייצרת PDF אמיתי דרך Chromium ומודדת אותו:
//   1. עמוד אחד בדיוק לכל דף עבודה (לא שניים).
//   2. מידות A4 מדויקות — 210mm × 297mm.
//   3. כל נוסחה, טקסט וסרטוט קיימים בפלט (השוואת ספירות מול ה-DOM).
//   4. אין טקסט שנחתך מחוץ לתיבת העמוד.
//
// הרצה: node scripts/audit-linear-print.mjs [--all] [--keep]

import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const all = process.argv.includes('--all');
const keep = process.argv.includes('--keep');
const outDir = path.join(root, 'STATE', 'reports', 'linear-print');
fs.mkdirSync(outDir, { recursive: true });

const TOPIC = 'פונקציה קווית';
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
const pages = (meta.topics.find((t) => t.name === TOPIC)?.pages) || [];
if (!pages.length) { console.error(`לא נמצאו דפים לנושא "${TOPIC}"`); process.exit(1); }

// A4 בנקודות PDF: 210mm × 297mm ב-72dpi
const A4_W = 210 / 25.4 * 72;   // 595.28
const A4_H = 297 / 25.4 * 72;   // 841.89
const TOL = 1.5;

const PORT = 5190;
const child = spawn(process.execPath, ['preview/server.mjs'], {
  cwd: root, stdio: 'ignore', env: { ...process.env, PORT: String(PORT) },
});
const stop = () => { try { child.kill(); } catch {} };
process.on('exit', stop);
const t0 = Date.now();
while (Date.now() - t0 < 20000) {
  try { const r = await fetch(`http://127.0.0.1:${PORT}/preview`); if (r.ok) break; } catch {}
  await new Promise((r) => setTimeout(r, 250));
}


const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const sample = all ? pages : pages.filter((_, i) => i % 6 === 0 || i >= pages.length - 2);
const rows = [];

for (const p of sample) {
  const url = `http://127.0.0.1:${PORT}/${encodeURIComponent(p.file)}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { if (window.MathJax?.startup?.promise) await window.MathJax.startup.promise; }).catch(() => {});
  await page.waitForTimeout(300);

  // ספירות במסך — הבסיס להשוואה מול הפלט המודפס
  const screen = await page.evaluate(() => {
    const sheet = document.querySelector('.a4-page');
    return {
      svg: sheet.querySelectorAll('svg').length,
      mjx: sheet.querySelectorAll('mjx-container').length,
      text: (sheet.innerText || '').replace(/\s+/g, ' ').trim().length,
    };
  });

  const pdfPath = path.join(outDir, `${p.file.replace('.html', '')}.pdf`);
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, preferCSSPageSize: true });

  // מדידת ה-PDF נעשית בשלב נפרד (scripts/measure-pdf.py, PyMuPDF) כדי לא
  // להוסיף תלות npm לריפו משותף.
  rows.push({ file: p.file, pdf: path.basename(pdfPath), ...screen });
}

await browser.close();
stop();

console.log(`\n${'='.repeat(64)}`);
console.log(`אימות הדפסה — "${TOPIC}" (${sample.length} מתוך ${pages.length} דפים)`);
console.log('='.repeat(64));
console.log(`נוצרו ${rows.length} קובצי PDF ב-${path.relative(root, outDir)}`);
console.log('מדידה: python scripts/measure-pdf.py');

fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify({ rows }, null, 2), 'utf8');
