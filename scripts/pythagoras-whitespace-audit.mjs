import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import { buildPythagorasWorkbook } from '../pythagoras-workbook-model.js';

const maxGapLimit = Number((process.argv.find((arg) => arg.startsWith('--max-gap=')) ?? '--max-gap=40').split('=')[1]);
const maxTrailingLimit = Number((process.argv.find((arg) => arg.startsWith('--max-trailing=')) ?? '--max-trailing=40').split('=')[1]);
if (!Number.isFinite(maxGapLimit) || !Number.isFinite(maxTrailingLimit)) throw new Error('ספי whitespace אינם תקינים');

const meta = JSON.parse(fs.readFileSync('meta/topics.json', 'utf8'));
const workbook = buildPythagorasWorkbook(meta);
const pages = workbook.pages.map((page) => page.file || `עמוד-${page.sourceNumber}.html`);

const port = 5179;
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['preview/server.mjs'], {
  stdio: 'ignore',
  env: { ...process.env, PORT: String(port) },
});

let browser;
try {
  let serverReady = false;
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/preview`);
      if (response.ok) { serverReady = true; break; }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!serverReady) throw new Error('preview server לא עלה');

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
  const rows = [];
  const issues = [];

  for (const file of pages) {
    await page.goto(`${baseUrl}/${encodeURIComponent(file)}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(300);
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
          const styles = getComputedStyle(el);
          if (styles.display === 'none' || styles.visibility === 'hidden') return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        })
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            top: Math.max(top, rect.top),
            bottom: Math.min(bottom, rect.bottom),
            cls: el.className || el.tagName,
          };
        })
        .filter((rect) => rect.bottom > rect.top)
        .sort((a, b) => a.top - b.top);

      let cursor = top;
      let maxGap = 0;
      let maxGapAfter = 'header';
      for (const rect of rects) {
        const gap = Math.max(0, rect.top - cursor);
        if (gap > maxGap) { maxGap = gap; maxGapAfter = String(rect.cls); }
        cursor = Math.max(cursor, rect.bottom);
      }
      const trailing = Math.max(0, bottom - cursor);
      if (trailing > maxGap) { maxGap = trailing; maxGapAfter = 'trailing'; }

      return {
        maxGapPx: Math.round(maxGap),
        trailingGapPx: Math.round(trailing),
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
    if (row.maxGapPx > maxGapLimit) {
      issues.push(`${file}: פער פנימי/חיצוני ${row.maxGapPx}px גדול מהסף ${maxGapLimit}px (${row.maxGapAfter})`);
    }
    if (row.trailingGapPx > maxTrailingLimit) {
      issues.push(`${file}: שטח מת בתחתית ${row.trailingGapPx}px גדול מהסף ${maxTrailingLimit}px`);
    }
  }

  console.log(`PYTHAGORAS_WHITESPACE_AUDIT pages=${pages.length} max_gap_limit=${maxGapLimit}px max_trailing_limit=${maxTrailingLimit}px`);
  for (const row of rows.sort((a, b) => (b.maxGapPx ?? -1) - (a.maxGapPx ?? -1))) {
    console.log(`${String(row.maxGapPx ?? '??').padStart(4)}px max-gap | ${String(row.trailingGapPx ?? '??').padStart(4)}px trailing | ${row.file} | children=${row.childCount ?? 0} | ${row.maxGapAfter ?? ''}`);
  }

  if (issues.length) {
    console.error(`\nPYTHAGORAS_WHITESPACE_FAILED issues=${issues.length}`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log('PYTHAGORAS_WHITESPACE_OK');
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}
