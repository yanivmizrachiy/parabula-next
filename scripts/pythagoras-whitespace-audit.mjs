import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const workbook = JSON.parse(fs.readFileSync('meta/workbooks/pythagoras.json', 'utf8'));
const pages = workbook.pages.map((number) => `עמוד-${number}.html`);

const server = spawn(process.execPath, ['preview/server.mjs'], { stdio: 'ignore' });
for (let i = 0; i < 40; i += 1) {
  try { await fetch('http://127.0.0.1:5179/preview'); break; }
  catch { await new Promise((r) => setTimeout(r, 500)); }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
const rows = [];

for (const file of pages) {
  await page.goto(`http://127.0.0.1:5179/${encodeURIComponent(file)}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(500);
  const metric = await page.evaluate(() => {
    const a4 = document.querySelector('main.a4-page');
    const header = a4?.querySelector(':scope > .header-container');
    const footer = a4?.querySelector(':scope > .gz-footer');
    const block = a4?.querySelector(':scope > .question-block');
    if (!a4 || !header || !footer || !block) return null;

    const a4r = a4.getBoundingClientRect();
    const hr = header.getBoundingClientRect();
    const fr = footer.getBoundingClientRect();
    const top = hr.bottom;
    const bottom = fr.top;
    const usable = Math.max(1, bottom - top);

    const rects = [...block.children]
      .filter((el) => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { top: Math.max(top, r.top), bottom: Math.min(bottom, r.bottom), cls: el.className || el.tagName };
      })
      .filter((r) => r.bottom > r.top)
      .sort((a, b) => a.top - b.top);

    let cursor = top;
    let maxGap = 0;
    let maxGapAfter = 'header';
    for (const r of rects) {
      const gap = Math.max(0, r.top - cursor);
      if (gap > maxGap) { maxGap = gap; maxGapAfter = String(r.cls); }
      cursor = Math.max(cursor, r.bottom);
    }
    const trailing = Math.max(0, bottom - cursor);
    if (trailing > maxGap) { maxGap = trailing; maxGapAfter = 'trailing'; }

    return {
      maxGapPct: Math.round(maxGap / usable * 100),
      trailingGapPct: Math.round(trailing / usable * 100),
      childCount: rects.length,
      maxGapAfter,
      a4Height: Math.round(a4r.height)
    };
  });
  rows.push({ file, ...metric });
}

await browser.close();
server.kill();

console.log(`PYTHAGORAS_WHITESPACE_AUDIT pages=${pages.length}`);
for (const r of rows.sort((a, b) => (b.maxGapPct ?? -1) - (a.maxGapPct ?? -1))) {
  console.log(`${String(r.maxGapPct ?? '??').padStart(3)}% max-gap | ${String(r.trailingGapPct ?? '??').padStart(3)}% trailing | ${r.file} | children=${r.childCount ?? 0} | ${r.maxGapAfter ?? ''}`);
}
