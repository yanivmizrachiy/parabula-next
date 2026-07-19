// scripts/calibrate-linear-pages.mjs — מודד את הגובה האמיתי של כל שאלה בדפדפן.
//
// למה: אריזת שאלות לעמודים לפי "משקל" מוערך נותנת עמודים דלילים (35%) או חורגים.
// CLAUDE.md §4.3 דורש מדידה, לא הערכה. כאן כל שאלה מורכבת ומורנדרת ב-CSS ובגופנים
// האמיתיים, נמדד גובהה בפיקסלים, והתוצאה נשמרת ומשמשת את האורז.
//
// הרצה: node scripts/calibrate-linear-pages.mjs

import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { composeQuestion } from './lib/compose-question.mjs';
import { chapterBar } from './lib/linear-page.mjs';
import { SUBTOPICS } from './lib/pack-pages.mjs';

const root = process.cwd();
const BANK = JSON.parse(fs.readFileSync(path.join(root, 'sources', 'linear-function', 'bank.json'), 'utf8'));
const outFile = path.join(root, 'sources', 'linear-function', 'heights.json');

const PORT = 5189;
const child = spawn(process.execPath, ['preview/server.mjs'], {
  cwd: root, stdio: 'ignore', env: { ...process.env, PORT: String(PORT) },
});
process.on('exit', () => { try { child.kill(); } catch {} });
const t0 = Date.now();
while (Date.now() - t0 < 20000) {
  try { const r = await fetch(`http://127.0.0.1:${PORT}/preview`); if (r.ok) break; } catch {}
  await new Promise((r) => setTimeout(r, 250));
}

// עמוד בסיס כלשהו של הנושא — נותן בדיוק את ה-CSS, הגופנים וה-MathJax האמיתיים.
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
const base = meta.topics.find((t) => t.name === 'פונקציה קווית').pages[0].file;

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1000, height: 1400 } })).newPage();
await page.goto(`http://127.0.0.1:${PORT}/${encodeURIComponent(base)}`, { waitUntil: 'networkidle' });
await page.evaluate(async () => { if (window.MathJax?.startup?.promise) await window.MathJax.startup.promise; });

const availH = await page.evaluate(() =>
  document.querySelector('.question-block').getBoundingClientRect().height);
const gap = await page.evaluate(() =>
  parseFloat(getComputedStyle(document.querySelector('.question-block')).rowGap) || 0);

const heights = {};
const chapterH = {};

for (const st of SUBTOPICS) {
  const qs = BANK[st.slug] || [];
  if (!qs.length) continue;
  const html = chapterBar(st.chapter, st.sub)
    + qs.map((qq, i) => `<div data-qid="${qq.id}">${composeQuestion(qq, `cal${i}`)}</div>`).join('');

  await page.evaluate(async (h) => {
    const qb = document.querySelector('.question-block');
    qb.innerHTML = h;
    // ביטול space-between כדי שהגבהים יהיו טבעיים ולא מתוחים
    qb.style.justifyContent = 'flex-start';
    if (window.MathJax?.typesetPromise) await window.MathJax.typesetPromise([qb]);
  }, html);
  await page.waitForTimeout(220);

  const res = await page.evaluate(() => {
    const out = {};
    for (const el of document.querySelectorAll('[data-qid]')) {
      out[el.dataset.qid] = el.getBoundingClientRect().height;
    }
    const cb = document.querySelector('.chapter-bar');
    return { out, cb: cb ? cb.getBoundingClientRect().height : 0 };
  });
  Object.assign(heights, res.out);
  chapterH[st.slug] = res.cb;
  process.stdout.write(`  ${st.slug.padEnd(22)} ${qs.length} שאלות נמדדו\n`);
}

await browser.close();
try { child.kill(); } catch {}

fs.writeFileSync(outFile, JSON.stringify({ availH, gap, chapterH, heights }, null, 1), 'utf8');

const vals = Object.values(heights);
console.log(`\n[OK] נמדדו ${vals.length} שאלות`);
console.log(`     גובה פנוי בעמוד: ${availH.toFixed(1)}px | מרווח: ${gap}px`);
console.log(`     גובה שאלה: מינימום ${Math.min(...vals).toFixed(0)} · חציון ${vals.sort((a, b) => a - b)[vals.length >> 1].toFixed(0)} · מקסימום ${Math.max(...vals).toFixed(0)}`);
console.log(`     נכתב ${path.relative(root, outFile)}`);
