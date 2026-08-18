import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

// Enforces CLAUDE.md §4: worksheet content must use the A4 page area without
// large unintended empty regions, overflow, or collision with the fixed footer.
// Measures educational content only; the credit footer itself does not inflate utilization.
//
// Usage:
//   node scripts/a4-utilization-audit.mjs            -> audit all pages
//   node scripts/a4-utilization-audit.mjs --min=70   -> custom global floor
//   node scripts/a4-utilization-audit.mjs עמוד-634.html עמוד-635.html

const ROOT = process.cwd();
const DEFAULT_MIN = 50;
const EPSILON = 2;

const BALANCED_BANDS = {
  'עמוד-634.html': { min: 80, max: 98 },
  'עמוד-635.html': { min: 80, max: 98 },
  'עמוד-636.html': { min: 80, max: 98 },
  'עמוד-637.html': { min: 80, max: 98 },
};

const EXCEPTIONS = {
  'עמוד-5.html': 'faithful sparse continuation page (פונקציות) — source has little content'
};
const genExPath = path.join(ROOT, 'meta', 'a4-utilization-exceptions.json');
if (fs.existsSync(genExPath)) {
  try {
    Object.assign(EXCEPTIONS, JSON.parse(fs.readFileSync(genExPath, 'utf8')));
  } catch { /* ignore malformed */ }
}
const minArg = process.argv.find((a) => a.startsWith('--min='));
const MIN_UTIL = minArg ? Number(minArg.split('=')[1]) : DEFAULT_MIN;

const fileArgs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const pages = (fileArgs.length
  ? fileArgs
  : fs.readdirSync(ROOT).filter((f) => /^עמוד-\d+\.html$/.test(f)))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

const server = spawn(process.execPath, ['preview/server.mjs'], { stdio: 'ignore' });
for (let i = 0; i < 40; i += 1) {
  try { await fetch('http://127.0.0.1:5179/preview'); break; } catch { await new Promise((r) => setTimeout(r, 500)); }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });

const results = [];
for (const file of pages) {
  await page.goto(`http://127.0.0.1:5179/${encodeURIComponent(file)}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(600);
  const metric = await page.evaluate(() => {
    const a4 = document.querySelector('main.a4-page');
    if (!a4) return null;
    const a4Rect = a4.getBoundingClientRect();
    const style = getComputedStyle(a4);
    const padTop = parseFloat(style.paddingTop) || 0;
    const padBottom = parseFloat(style.paddingBottom) || 0;
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    const usableTop = a4Rect.top + padTop;
    const usableBottom = a4Rect.bottom - padBottom;
    const usableLeft = a4Rect.left + padLeft;
    const usableRight = a4Rect.right - padRight;
    const footer = a4.querySelector(':scope > .gz-footer');
    const footerRect = footer?.getBoundingClientRect() ?? null;
    const block = a4.querySelector(':scope > .question-block');

    let lowestInside = usableTop;
    let rawLowest = usableTop;
    let rawLeft = usableRight;
    let rawRight = usableLeft;
    let paintedCount = 0;

    const candidates = block ? block.querySelectorAll('*') : a4.querySelectorAll('*');
    for (const el of candidates) {
      if (footer && (el === footer || footer.contains(el))) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.height === 0 && r.width === 0) continue;
      const isLeaf = el.children.length === 0;
      const paints = cs.borderTopWidth !== '0px' || cs.borderRightWidth !== '0px' || cs.borderBottomWidth !== '0px' || cs.borderLeftWidth !== '0px' ||
        (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') ||
        (cs.backgroundImage && cs.backgroundImage !== 'none');
      if (!isLeaf && !paints) continue;
      paintedCount += 1;
      rawLowest = Math.max(rawLowest, r.bottom);
      rawLeft = Math.min(rawLeft, r.left);
      rawRight = Math.max(rawRight, r.right);
      if (r.bottom <= a4Rect.bottom + 1) lowestInside = Math.max(lowestInside, r.bottom);
    }

    const util = Math.round(((lowestInside - usableTop) / Math.max(1, usableBottom - usableTop)) * 100);
    const overflowBottomPx = Math.max(0, rawLowest - usableBottom);
    const overflowLeftPx = paintedCount ? Math.max(0, usableLeft - rawLeft) : 0;
    const overflowRightPx = paintedCount ? Math.max(0, rawRight - usableRight) : 0;
    const footerOverlapPx = footerRect ? Math.max(0, rawLowest - footerRect.top) : 0;

    return {
      util,
      overflowBottomPx: Math.round(overflowBottomPx * 10) / 10,
      overflowLeftPx: Math.round(overflowLeftPx * 10) / 10,
      overflowRightPx: Math.round(overflowRightPx * 10) / 10,
      footerOverlapPx: Math.round(footerOverlapPx * 10) / 10,
      paintedCount,
    };
  });
  results.push({ file, ...(metric ?? { util: null }) });
}

await browser.close();
server.kill();

const minFor = (file) => BALANCED_BANDS[file]?.min ?? MIN_UTIL;
const maxFor = (file) => BALANCED_BANDS[file]?.max ?? null;
const below = results.filter((r) => r.util !== null && r.util < minFor(r.file) && !EXCEPTIONS[r.file]);
const above = results.filter((r) => {
  const max = maxFor(r.file);
  return max !== null && r.util !== null && r.util > max && !EXCEPTIONS[r.file];
});
const overflow = results.filter((r) => !EXCEPTIONS[r.file] && (
  (r.overflowBottomPx ?? 0) > EPSILON ||
  (r.overflowLeftPx ?? 0) > EPSILON ||
  (r.overflowRightPx ?? 0) > EPSILON ||
  (r.footerOverlapPx ?? 0) > EPSILON
));
const nulls = results.filter((r) => r.util === null);

console.log('A4_UTILIZATION_AUDIT');
console.log(`pages=${results.length} legacy_min=${MIN_UTIL}% overflow_epsilon=${EPSILON}px`);
for (const [file, band] of Object.entries(BALANCED_BANDS)) {
  if (pages.includes(file)) console.log(`  balanced ${file}: ${band.min}-${band.max}%`);
}
for (const r of [...results].sort((a, b) => (a.util ?? 0) - (b.util ?? 0)).slice(0, 12)) {
  const band = BALANCED_BANDS[r.file];
  const suffix = band ? ` target=${band.min}-${band.max}%` : '';
  const geometry = ` overflow=${r.overflowBottomPx ?? '?'} footer-overlap=${r.footerOverlapPx ?? '?'}`;
  console.log(`  ${r.util === null ? '??' : String(r.util).padStart(3)}%  ${r.file}${suffix}${geometry}`);
}
if (nulls.length) console.error(`MISSING .a4-page: ${nulls.map((r) => r.file).join(', ')}`);
if (below.length || above.length || overflow.length || nulls.length) {
  console.error(`A4_UTILIZATION_FAILED: utilization=${below.length + above.length}, overflow=${overflow.length}, missing=${nulls.length}`);
  for (const r of below) console.error(`- ${r.file}: ${r.util}% below ${minFor(r.file)}%`);
  for (const r of above) console.error(`- ${r.file}: ${r.util}% above ${maxFor(r.file)}% — preserve breathing room`);
  for (const r of overflow) console.error(`- ${r.file}: overflow bottom=${r.overflowBottomPx}px left=${r.overflowLeftPx}px right=${r.overflowRightPx}px footer-overlap=${r.footerOverlapPx}px`);
  process.exit(1);
}
console.log('A4_UTILIZATION_OK');
