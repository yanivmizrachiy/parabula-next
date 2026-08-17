// בדיקת גאומטריה בדפדפן אמיתי: A4, גלישה, ניצול עמוד וכיווניות בפועל.
// מודדת את ה־DOM המרונדר, לא את קוד המקור (CLAUDE.md §4.3 — אימות במדידה).
//
// דורשת dist/index.html בנוי. אם Playwright או ה־build חסרים, הבדיקה מדולגת
// במפורש ולא מדווחת כהצלחה.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import pages from '../src/pages/index.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'dist', 'index.html');

const MIN_UTILIZATION = 80;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

let chromium = null;
try {
  ({ chromium } = await import('playwright'));
} catch {
  chromium = null;
}

const ready = Boolean(chromium) && fs.existsSync(indexPath);
const skipReason = !chromium
  ? 'playwright אינו מותקן'
  : !fs.existsSync(indexPath)
    ? 'dist/index.html חסר — יש להריץ תחילה node src/build.mjs'
    : null;

// node:test מדווח `skip: null` כדילוג גם כשהגוף רץ. לכן מעבירים את
// האפשרות רק כשקיימת סיבת דילוג אמיתית, אחרת התוצאה נראית כדילוג מטעה.
const geoTest = (name, fn) => (skipReason ? test(name, { skip: skipReason }, fn) : test(name, fn));

let measurements = null;

if (ready) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(indexPath).href, { waitUntil: 'networkidle' });

  measurements = await page.evaluate(() => {
    const mmToPx = 96 / 25.4;
    const sheets = [...document.querySelectorAll('.a4-page')];
    return {
      rtl: document.documentElement.dir === 'rtl',
      count: sheets.length,
      horizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      pages: sheets.map(el => {
        const bodyEl = el.querySelector('.wbody');
        const foot = el.querySelector('.wfoot');
        const blocks = [...bodyEl.children];
        const gap = parseFloat(getComputedStyle(bodyEl).rowGap) || 0;
        const contentHeight = blocks.reduce((sum, c) => sum + c.getBoundingClientRect().height, 0);
        const natural = contentHeight + gap * Math.max(0, blocks.length - 1);
        const available = bodyEl.getBoundingClientRect().height;
        const rect = el.getBoundingClientRect();
        const footRect = foot.getBoundingClientRect();
        return {
          n: Number(el.dataset.page),
          widthMm: Math.round((rect.width / mmToPx) * 10) / 10,
          heightMm: Math.round((rect.height / mmToPx) * 10) / 10,
          percent: Math.round((natural / available) * 1000) / 10,
          overflows: natural > available + 0.5,
          footerInside: footRect.bottom <= rect.bottom + 0.5,
          footerLines: foot.querySelectorAll('.wfoot-line').length,
          scrollableDescendants: [...el.querySelectorAll('*')].filter(node => {
            const overflow = getComputedStyle(node).overflow;
            return overflow === 'auto' || overflow === 'scroll';
          }).length
        };
      }),
      // מיקומי תווים בפועל — לגילוי היפוך דו־כיווני בטקסט מספרי.
      flippedLabels: [...document.querySelectorAll('svg.cg text')].filter(node => {
        const content = (node.textContent || '').trim();
        if (!/^-\d+$/.test(content) || typeof node.getStartPositionOfChar !== 'function') return false;
        try {
          // במינוס תקין, הסימן נמצא שמאלה מהספרה.
          return node.getStartPositionOfChar(0).x > node.getStartPositionOfChar(content.length - 1).x;
        } catch {
          return false;
        }
      }).map(node => node.textContent)
    };
  });

  await browser.close();
}

geoTest('המסמך RTL וכל העמודים נטענו', () => {
  assert.equal(measurements.rtl, true);
  assert.equal(measurements.count, pages.length);
});

geoTest('כל דף שומר על מידות A4 מדויקות', () => {
  for (const page of measurements.pages) {
    assert.equal(page.widthMm, A4_WIDTH_MM, `רוחב שגוי בעמוד ${page.n}`);
    assert.equal(page.heightMm, A4_HEIGHT_MM, `גובה שגוי בעמוד ${page.n}`);
  }
});

geoTest('אין גלישת תוכן מעבר לשטח הכתיבה בשום עמוד', () => {
  const overflowing = measurements.pages.filter(page => page.overflows).map(page => `${page.n} (${page.percent}%)`);
  assert.deepEqual(overflowing, [], `עמודים בגלישה: ${overflowing.join(', ')}`);
});

geoTest(`ניצול העמוד לפחות ${MIN_UTILIZATION}% בכל עמוד`, () => {
  const sparse = measurements.pages.filter(page => page.percent < MIN_UTILIZATION).map(page => `${page.n}:${page.percent}%`);
  assert.deepEqual(sparse, [], `עמודים דלילים: ${sparse.join(', ')}`);
});

geoTest('אין אזור גלילה בתוך דף A4', () => {
  for (const page of measurements.pages) {
    assert.equal(page.scrollableDescendants, 0, `עמוד ${page.n} מכיל אזור גלילה`);
  }
});

geoTest('אין גלילה אופקית במעטפת', () => {
  assert.equal(measurements.horizontalScroll, false);
});

geoTest('הכותרת התחתונה בת שתי שורות ונמצאת בתוך גבולות הדף', () => {
  for (const page of measurements.pages) {
    assert.equal(page.footerLines, 2, `עמוד ${page.n}: מספר שורות כותרת תחתית שגוי`);
    assert.equal(page.footerInside, true, `עמוד ${page.n}: הכותרת התחתונה חורגת מהדף`);
  }
});

geoTest('אין תווית מספרית הפוכה בסרטוטים', () => {
  assert.deepEqual(measurements.flippedLabels, [], `תוויות הפוכות: ${(measurements.flippedLabels || []).join(', ')}`);
});
