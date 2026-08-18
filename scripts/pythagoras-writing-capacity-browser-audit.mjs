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

  const result = await page.evaluate(() => {
    const parsePx = (value) => {
      const n = Number.parseFloat(String(value ?? ''));
      return Number.isFinite(n) ? n : 0;
    };
    const inferPitch = (el, cs) => {
      if (el.classList.contains('full-solution-space')) return 28;
      if (el.classList.contains('work-lines')) return 28;
      const parts = String(cs.backgroundSize || '').split(',')[0].trim().split(/\s+/u);
      const y = parsePx(parts[1] ?? parts[0]);
      if (y >= 18 && y <= 40) return y;
      return 22;
    };
    const inferRequired = (el) => {
      const explicit = Number(el.dataset.requiredLines || 0);
      if (Number.isFinite(explicit) && explicit > 0) return explicit;
      if (el.matches('.equation-practice-card .work-lines')) return 3;
      if (el.classList.contains('full-solution-space')) return 5;
      if (el.classList.contains('solution-space')) return 5;
      return 0;
    };

    const areaSelector = '.full-solution-space, .solution-space, .equation-practice-card .work-lines';
    const areas = [...document.querySelectorAll(areaSelector)].map((el, index) => {
      const required = inferRequired(el);
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const pitch = inferPitch(el, cs);
      const borderY = parsePx(cs.borderTopWidth) + parsePx(cs.borderBottomWidth);
      const paddingY = parsePx(cs.paddingTop) + parsePx(cs.paddingBottom);
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
        className: el.className,
        aria: el.getAttribute('aria-label') || '',
        inferred: !el.hasAttribute('data-required-lines'),
      };
    });

    // Exact task language only: do not let "הפתרון" match an embedded "פתרו".
    const calcRe = /(?:חשבו|מצאו|הביעו|מהו אורך|מה היקף|מהו היקף|מהו שטח|כתבו\s+(?:שתי|2)?\s*משוואות)/u;
    const calcSubQuestions = [...document.querySelectorAll('.q-sub')]
      .filter((el) => calcRe.test((el.textContent || '').replace(/\s+/gu, ' ').trim()));
    const finalSelector = [
      '.pyt-final-answer',
      '.student-final-answer',
      '.problem-answer',
      '.answer-box',
      '[aria-label="אפשרויות לתשובה הסופית"]',
    ].join(',');
    const finalResponses = document.querySelectorAll(finalSelector).length;

    const cardIssues = [];
    for (const card of document.querySelectorAll('.equation-practice-card')) {
      if (card.querySelector('.work-lines') && !card.querySelector('.student-final-answer')) {
        cardIssues.push('כרטיס משוואה עם דרך אך ללא תשובה סופית');
      }
    }
    for (const card of document.querySelectorAll('.full-solution-card')) {
      if (card.querySelector('.full-solution-space') && !card.querySelector('.student-final-answer')) {
        cardIssues.push('כרטיס פיתגורס מלא עם דרך אך ללא תשובה סופית');
      }
    }
    for (const card of document.querySelectorAll('.pyt-calc-block')) {
      if (!card.querySelector('.solution-space')) cardIssues.push('סעיף חישובי ללא אזור דרך');
      if (!card.querySelector('.pyt-final-answer')) cardIssues.push('סעיף חישובי ללא תשובה סופית');
    }

    return {
      areas,
      calcSubCount: calcSubQuestions.length,
      finalResponses,
      cardIssues,
    };
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

  if (result.calcSubCount > 1 && result.areas.length < result.calcSubCount) {
    issues.push(`${file} (עמוד ${local + 1}): ${result.calcSubCount} סעיפים חישוביים חולקים רק ${result.areas.length} אזורי דרך — נדרש אזור נפרד לכל סעיף`);
  }
  if (result.calcSubCount > 0 && result.finalResponses < result.calcSubCount) {
    issues.push(`${file} (עמוד ${local + 1}): ${result.calcSubCount} סעיפים חישוביים לעומת ${result.finalResponses} מקומות לתשובה סופית`);
  }
  for (const issue of result.cardIssues) issues.push(`${file} (עמוד ${local + 1}): ${issue}`);
}

await browser.close();
server.kill();

console.log(`PYTHAGORAS_WRITING_CAPACITY pages=${pages.length} areas=${rows.length}`);
for (const row of rows) {
  console.log(`${String(row.local).padStart(2)} | ${row.file} | req=${row.required}${row.inferred ? '*' : ''} cap=${row.capacity} | ${row.width}x${row.height}px | pitch=${row.pitch}px`);
}
console.log('* = מספר השורות הוסק מהתבנית הקנונית ולא מתגית מפורשת');

if (issues.length) {
  console.error(`\nPYTHAGORAS_WRITING_CAPACITY_FAILED issues=${issues.length}`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log('PYTHAGORAS_WRITING_CAPACITY_OK');
