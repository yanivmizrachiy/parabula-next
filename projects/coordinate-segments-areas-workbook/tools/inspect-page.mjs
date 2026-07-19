// כלי אבחון קריאה־בלבד: מודד לכל בלוק בדף את גובהו ואת מידת החריגה.
// שימוש: node tools/inspect-page.mjs 3 5
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const wanted = process.argv.slice(2).map(Number);
if (!wanted.length) throw new Error('Usage: node tools/inspect-page.mjs <page> [page...]');

const indexPath = path.resolve(process.cwd(), 'dist', 'index.html');
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
await page.goto(pathToFileURL(indexPath).href, { waitUntil: 'networkidle' });

const report = await page.evaluate(numbers => {
  const mm = 96 / 25.4;
  return numbers.map(n => {
    const el = document.querySelector(`#page-${n}`);
    if (!el) return { page: n, missing: true };
    const body = el.querySelector('.wbody');
    const foot = el.querySelector('.wfoot');
    const blocks = [...body.children].map(child => ({
      tag: child.className,
      heightMm: Math.round((child.getBoundingClientRect().height / mm) * 10) / 10,
      text: (child.textContent || '').trim().slice(0, 45)
    }));
    const contentBottom = Math.max(...blocks.map((_, i) => body.children[i].getBoundingClientRect().bottom));
    return {
      page: n,
      overByMm: Math.round(((contentBottom - foot.getBoundingClientRect().top) / mm) * 10) / 10,
      blocks
    };
  });
}, wanted);

console.log(JSON.stringify(report, null, 2));
await browser.close();
