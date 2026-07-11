import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

// Enforces CLAUDE.md §5: worksheet content must use the A4 page area —
// no large unintended empty regions. Measures, per page, how far down the
// A4 sheet the lowest visible content element reaches (utilization = lowest
// content bottom / usable page height, in percent) and fails pages below
// the threshold.
//
// Usage:
//   node scripts/a4-utilization-audit.mjs            -> audit all pages
//   node scripts/a4-utilization-audit.mjs --min=70   -> custom threshold
//
// The threshold is deliberately a floor for "clearly wasted page", not a
// perfection target: legacy layouts pass, new regressions are caught.

const ROOT = process.cwd();
const DEFAULT_MIN = 50;

// Documented exceptions (CLAUDE.md §5): pages whose emptiness is faithful to
// the source material and must NOT be stretched artificially.
const EXCEPTIONS = {
  'עמוד-5.html': 'faithful sparse continuation page (פונקציות) — source has little content'
};
// Generated sparse chapter-tail exceptions from imported books (import-bbb.mjs).
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
  await page.waitForTimeout(600); // let MathJax/fonts settle
  const util = await page.evaluate(() => {
    const a4 = document.querySelector('main.a4-page');
    if (!a4) return null;
    const a4Rect = a4.getBoundingClientRect();
    const style = getComputedStyle(a4);
    const padBottom = parseFloat(style.paddingBottom) || 0;
    const usableBottom = a4Rect.bottom - padBottom;
    const usableTop = a4Rect.top + (parseFloat(style.paddingTop) || 0);
    let lowest = usableTop;
    for (const el of a4.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.height === 0 && r.width === 0) continue;
      // Only visible CONTENT counts: leaf elements, or elements that paint
      // something themselves (border/background). Invisible flex containers
      // stretched to full height must not inflate the measurement.
      const isLeaf = el.children.length === 0;
      const paints = cs.borderBottomWidth !== '0px' ||
        (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent');
      if (!isLeaf && !paints) continue;
      if (r.bottom > lowest && r.bottom <= a4Rect.bottom + 1) lowest = r.bottom;
    }
    return Math.round(((lowest - usableTop) / (usableBottom - usableTop)) * 100);
  });
  results.push({ file, util });
}

await browser.close();
server.kill();

const offenders = results.filter((r) => r.util !== null && r.util < MIN_UTIL && !EXCEPTIONS[r.file]);
const nulls = results.filter((r) => r.util === null);

console.log('A4_UTILIZATION_AUDIT');
console.log(`pages=${results.length} min_required=${MIN_UTIL}%`);
for (const r of [...results].sort((a, b) => (a.util ?? 0) - (b.util ?? 0)).slice(0, 8)) {
  console.log(`  ${r.util === null ? '??' : String(r.util).padStart(3)}%  ${r.file}`);
}
if (nulls.length) console.error(`MISSING .a4-page: ${nulls.map((r) => r.file).join(', ')}`);
if (offenders.length) {
  console.error(`A4_UTILIZATION_FAILED: ${offenders.length} pages below ${MIN_UTIL}%`);
  for (const r of offenders) console.error(`- ${r.file}: ${r.util}%`);
  process.exit(1);
}
console.log('A4_UTILIZATION_OK');
