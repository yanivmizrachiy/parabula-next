import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const ROOT = process.cwd();
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta/topics.json'), 'utf8'));
const topic = meta.topics.find((item) => item.name === 'משפט פיתגורס');
if (!topic) throw new Error('הנושא משפט פיתגורס חסר');

const pages = topic.pages.map((page) => page.file);
const server = spawn(process.execPath, ['preview/server.mjs'], { stdio: 'ignore' });
let serverReady = false;
for (let i = 0; i < 40; i += 1) {
  try {
    const res = await fetch('http://127.0.0.1:5179/preview');
    if (res.ok) { serverReady = true; break; }
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (!serverReady) {
  server.kill();
  throw new Error('preview server לא עלה');
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
const rows = [];
const issues = [];

for (let local = 0; local < pages.length; local += 1) {
  const file = pages[local];
  await page.goto(`http://127.0.0.1:5179/${encodeURIComponent(file)}`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => {
    const parsePx = (value) => {
      const n = Number.parseFloat(String(value ?? ''));
      return Number.isFinite(n) ? n : 0;
    };
    const inferPitch = (el, cs) => {
      if (el.classList.contains('full-solution-space')) return 28;
      if (el.classList.contains('reason-space')) return 27;
      const parts = String(cs.backgroundSize || '').split(',')[0].trim().split(/\s+/u);
      const y = parsePx(parts[1] ?? parts[0]);
      if (y >= 18 && y <= 40) return y;
      return 22;
    };

    return [...document.querySelectorAll('[data-required-lines]')].map((el, index) => {
      const required = Number(el.dataset.requiredLines || 0);
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const pitch = inferPitch(el, cs);
      const borderY = parsePx(cs.borderTopWidth) + parsePx(cs.borderBottomWidth);
      const paddingY = parsePx(cs.paddingTop) + parsePx(cs.paddingBottom);
      const writableHeight = Math.max(0, rect.height - borderY - paddingY);
      const capacity = Math.floor((writableHeight + 0.5) / pitch);
      const width = rect.width;
      return {
        index,
        required,
        pitch: Math.round(pitch * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
        writableHeight: Math.round(writableHeight * 10) / 10,
        width: Math.round(width * 10) / 10,
        capacity,
        className: el.className,
        aria: el.getAttribute('aria-label') || '',
      };
    });
  });

  for (const metric of metrics) {
    rows.push({ local: local + 1, file, ...metric });
    if (metric.required <= 0) {
      issues.push(`${file} (עמוד ${local + 1}): data-required-lines אינו מספר חיובי`);
      continue;
    }
    if (metric.capacity < metric.required) {
      issues.push(`${file} (עמוד ${local + 1}): ${metric.aria || metric.className} — נדרשות ${metric.required} שורות, בפועל כ-${metric.capacity} בלבד (${metric.height}px)`);
    }
    if (metric.width < 170) {
      issues.push(`${file} (עמוד ${local + 1}): אזור דרך צר מדי לכתיבה מתמטית (${metric.width}px)`);
    }
  }
}

await browser.close();
server.kill();

console.log(`PYTHAGORAS_WRITING_CAPACITY pages=${pages.length} areas=${rows.length}`);
for (const row of rows) {
  console.log(`${String(row.local).padStart(2)} | ${row.file} | req=${row.required} cap=${row.capacity} | ${row.width}x${row.height}px | pitch=${row.pitch}px`);
}

if (issues.length) {
  console.error(`\nPYTHAGORAS_WRITING_CAPACITY_FAILED issues=${issues.length}`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log('PYTHAGORAS_WRITING_CAPACITY_OK');
