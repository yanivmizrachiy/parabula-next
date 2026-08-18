import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import { buildPythagorasWorkbook } from '../pythagoras-workbook-model.js';

const meta = JSON.parse(fs.readFileSync('meta/topics.json', 'utf8'));
const workbook = buildPythagorasWorkbook(meta);
const pages = workbook.pages.map((page) => page.file || `עמוד-${page.sourceNumber}.html`);
const port = 5179;
const baseUrl = `http://127.0.0.1:${port}`;

const server = spawn(process.execPath, ['preview/server.mjs'], {
  stdio: 'ignore',
  env: { ...process.env, PORT: String(port) },
});

async function waitForServer() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/preview`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('preview server לא עלה בזמן');
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
  const rows = [];
  const issues = [];

  for (let local = 0; local < pages.length; local += 1) {
    const file = pages[local];
    await page.goto(`${baseUrl}/${encodeURIComponent(file)}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page.waitForTimeout(250);

    const result = await page.evaluate(() => {
      const parsePx = (value) => {
        const number = Number.parseFloat(String(value ?? ''));
        return Number.isFinite(number) ? number : 0;
      };

      const inferPitch = (el, styles) => {
        if (el.classList.contains('full-solution-space')) return 28;
        if (el.classList.contains('solution-space')) return 28;
        if (el.classList.contains('work-lines')) return 28;
        const parts = String(styles.backgroundSize || '').split(',')[0].trim().split(/\s+/u);
        const y = parsePx(parts[1] ?? parts[0]);
        return y >= 18 && y <= 40 ? y : 28;
      };

      const inferRequired = (el) => {
        const explicit = Number(el.dataset.requiredLines || 0);
        if (Number.isFinite(explicit) && explicit > 0) return explicit;
        if (el.matches('.equation-practice-card .work-lines.short')) return 3;
        if (el.matches('.equation-practice-card .work-lines')) return 4;
        if (el.classList.contains('full-solution-space')) return 5;
        if (el.classList.contains('solution-space')) return 5;
        return 0;
      };

      const areaSelector = '.full-solution-space, .solution-space, .equation-practice-card .work-lines';
      const areas = [...document.querySelectorAll(areaSelector)].map((el, index) => {
        const required = inferRequired(el);
        const styles = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const pitch = inferPitch(el, styles);
        const borderY = parsePx(styles.borderTopWidth) + parsePx(styles.borderBottomWidth);
        const paddingY = parsePx(styles.paddingTop) + parsePx(styles.paddingBottom);
        const writableHeight = Math.max(0, rect.height - borderY - paddingY);
        const capacity = Math.floor((writableHeight + 0.5) / pitch);
        return {
          index,
          required,
          pitch: Math.round(pitch * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
          writableHeight: Math.round(writableHeight * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          capacity,
          className: String(el.className),
          aria: el.getAttribute('aria-label') || '',
          inferred: !el.hasAttribute('data-required-lines'),
        };
      });

      const finalSelector = [
        '.pyt-final-answer',
        '.student-final-answer',
        '.problem-answer',
        '.answer-box',
        '[aria-label="אפשרויות לתשובה הסופית"]',
      ].join(',');

      const cardIssues = [];
      for (const card of document.querySelectorAll('.equation-practice-card')) {
        if (card.querySelector('.work-lines') && !card.querySelector('.student-final-answer, .final-answer, .answer-box')) {
          cardIssues.push('כרטיס משוואה עם דרך אך ללא מקום תשובה סופית נפרד');
        }
      }
      for (const card of document.querySelectorAll('.full-solution-card')) {
        if (card.querySelector('.full-solution-space') && !card.querySelector('.student-final-answer, .final-answer, .answer-box')) {
          cardIssues.push('כרטיס פיתגורס מלא עם דרך אך ללא מקום תשובה סופית נפרד');
        }
      }
      for (const card of document.querySelectorAll('.pyt-calc-block')) {
        if (!card.querySelector('.solution-space')) cardIssues.push('סעיף חישובי ללא אזור דרך');
        if (!card.querySelector(finalSelector)) cardIssues.push('סעיף חישובי ללא תשובה סופית');
      }

      return { areas, cardIssues };
    });

    for (const metric of result.areas) {
      rows.push({ local: local + 1, file, ...metric });
      if (metric.required <= 0) {
        issues.push(`${file} (עמוד ${local + 1}): לא ניתן להסיק מספר שורות נדרש עבור ${metric.className}`);
        continue;
      }
      if (metric.capacity < metric.required) {
        issues.push(`${file} (עמוד ${local + 1}): ${metric.aria || metric.className} — נדרשות ${metric.required} שורות, בפועל כ-${metric.capacity} בלבד (${metric.height}px)`);
      }
      if (metric.width < 170) {
        issues.push(`${file} (עמוד ${local + 1}): אזור דרך צר מדי לכתיבה מתמטית (${metric.width}px)`);
      }
    }

    for (const issue of result.cardIssues) issues.push(`${file} (עמוד ${local + 1}): ${issue}`);
  }

  console.log(`PYTHAGORAS_WRITING_CAPACITY pages=${pages.length} areas=${rows.length}`);
  for (const row of rows) {
    console.log(`${String(row.local).padStart(2)} | ${row.file} | req=${row.required}${row.inferred ? '*' : ''} cap=${row.capacity} | ${row.width}x${row.height}px | pitch=${row.pitch}px`);
  }
  console.log('* = מספר השורות הוסק מהתבנית הקנונית ולא מתגית מפורשת');

  if (issues.length) {
    console.error(`\nPYTHAGORAS_WRITING_CAPACITY_FAILED issues=${issues.length}`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log('PYTHAGORAS_WRITING_CAPACITY_OK');
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}
