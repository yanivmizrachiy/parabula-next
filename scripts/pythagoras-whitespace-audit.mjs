import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const maxGapLimit = Number((process.argv.find((arg) => arg.startsWith('--max-gap=')) ?? '--max-gap=20').split('=')[1]);
const maxTrailingLimit = Number((process.argv.find((arg) => arg.startsWith('--max-trailing=')) ?? '--max-trailing=20').split('=')[1]);
if (!Number.isFinite(maxGapLimit) || !Number.isFinite(maxTrailingLimit)) throw new Error('ספי whitespace אינם תקינים');

const meta = JSON.parse(fs.readFileSync('meta/topics.json', 'utf8'));
const topic = meta.topics.find((entry) => entry.name === 'משפט פיתגורס');
if (!topic) throw new Error('הנושא משפט פיתגורס חסר מ-meta/topics.json');
const pages = topic.pages.map((page) => page.file);

const server = spawn(process.execPath, ['preview/server.mjs'], { stdio: 'ignore' });
let serverReady = false;
for (let i = 0; i < 40; i += 1) {
  try {
    const res = await fetch('http://127.0.0.1:5179/preview');
    if (res.ok) { serverReady = true; break; }
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}
if (!serverReady) {
  server.kill();
  throw new Error('preview server לא עלה');
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
const rows = [];
const issues = [];

for (const file of pages) {
  await page.goto(`http://127.0.0.1:5179/${encodeURIComponent(file)}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(350);
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
      a4Height: Math.round(a4r.height),
    };
  });
  if (!metric) {
    issues.push(`${file}: לא ניתן למדוד את מבנה A4`);
    continue;
  }
  const row = { file, ...metric };
  rows.push(row);
  if (row.maxGapPct > maxGapLimit) issues.push(`${file}: max-gap ${row.maxGapPct}% גדול מהסף ${maxGapLimit}% (${row.maxGapAfter})`);
  if (row.trailingGapPct > maxTrailingLimit) issues.push(`${file}: trailing-gap ${row.trailingGapPct}% גדול מהסף ${maxTrailingLimit}%`);
}

await browser.close();
server.kill();

console.log(`PYTHAGORAS_WHITESPACE_AUDIT pages=${pages.length} max_gap_limit=${maxGapLimit}% max_trailing_limit=${maxTrailingLimit}%`);
for (const r of rows.sort((a, b) => (b.maxGapPct ?? -1) - (a.maxGapPct ?? -1))) {
  console.log(`${String(r.maxGapPct ?? '??').padStart(3)}% max-gap | ${String(r.trailingGapPct ?? '??').padStart(3)}% trailing | ${r.file} | children=${r.childCount ?? 0} | ${r.maxGapAfter ?? ''}`);
}

if (issues.length) {
  console.error(`\nPYTHAGORAS_WHITESPACE_FAILED issues=${issues.length}`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log('PYTHAGORAS_WHITESPACE_OK');
