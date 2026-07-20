import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'STATE', 'reports', 'two-variable-systems-sync');
fs.mkdirSync(outDir, { recursive: true });

const order = [609, 601, 602, 603, 604, 605, 606, 607, 608, 610, 611, 612, 613, 614, 615];
const expected = new Map([
  [609, { selector: '.system-card', count: 4 }],
  [601, { selector: '.system-card', count: 5 }],
  [602, { selector: '.system-card', count: 5 }],
  [603, { selector: '.system-card', count: 5 }],
  [604, { selector: '.system-card', count: 4 }],
  [605, { selector: '.system-card', count: 3 }],
  [606, { selector: '.system-card', count: 3 }],
  [607, { selector: '.system-card', count: 2 }],
  [608, { selector: '.system-card', count: 2 }],
  [610, { selector: '.system-card', count: 6 }],
  [611, { selector: '.story-card', count: 4 }],
  [612, { selector: '.system-card', count: 4 }],
  [613, { selector: '.classification-card', count: 3 }],
  [614, { selector: '.challenge-card', count: 8 }],
  [615, { selector: '.challenge-card', count: 7 }],
]);

const server = spawn(process.execPath, ['preview/server.mjs'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stdout.on('data', (data) => process.stdout.write(String(data)));
server.stderr.on('data', (data) => process.stderr.write(String(data)));

async function waitForServer() {
  const start = Date.now();
  while (Date.now() - start < 15_000) {
    try {
      const response = await fetch('http://127.0.0.1:5179/preview');
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Preview server did not start');
}

let browser;
const results = [];
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } });

  for (let index = 0; index < order.length; index++) {
    const number = order[index];
    const file = `עמוד-${number}.html`;
    await page.goto(`http://127.0.0.1:5179/${encodeURIComponent(file)}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    await page.evaluate(async () => {
      if (globalThis.MathJax?.startup?.promise) await globalThis.MathJax.startup.promise;
      if (document.fonts?.ready) await document.fonts.ready;
    });

    const audit = await page.locator('.a4-page').evaluate((element, args) => {
      const navMeta = document.querySelector('.nav-meta')?.textContent?.trim() || '';
      const previous = [...document.querySelectorAll('.nav-link')].find((item) => item.textContent?.trim() === 'הקודם')?.getAttribute('href') || '';
      const next = [...document.querySelectorAll('.nav-link')].find((item) => item.textContent?.trim() === 'הבא')?.getAttribute('href') || '';
      return {
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        count: element.querySelectorAll(args.selector).length,
        navMeta,
        pageNumber: element.querySelector('.page-number')?.textContent?.trim() || '',
        previous,
        next,
        footerLines: element.querySelectorAll('.gz-footer > div').length,
        mathBlocks: element.querySelectorAll('mjx-container').length,
      };
    }, { selector: expected.get(number).selector });

    const expectedPrev = index === 0 ? 'עמוד-573.html' : `עמוד-${order[index - 1]}.html`;
    const expectedNext = index === order.length - 1 ? 'עמוד-531.html' : `עמוד-${order[index + 1]}.html`;
    const overflowX = audit.scrollWidth > audit.clientWidth + 2;
    const overflowY = audit.scrollHeight > audit.clientHeight + 2;
    const ok = !overflowX
      && !overflowY
      && audit.count === expected.get(number).count
      && audit.navMeta === `מערכת משוואות בשני נעלמים — עמוד ${index + 1} / ${order.length}`
      && audit.pageNumber === String(index + 1)
      && audit.previous === expectedPrev
      && audit.next === expectedNext
      && audit.footerLines === 2;

    const screenshot = path.join(outDir, `page-${number}.png`);
    await page.locator('.a4-page').screenshot({ path: screenshot, animations: 'disabled' });
    results.push({ number, file, ok, overflowX, overflowY, expectedCount: expected.get(number).count, audit, screenshot });
    console.log(`${ok ? '[OK]' : '[FAIL]'} ${file}`, audit);
  }

  const failures = results.filter((result) => !result.ok);
  fs.writeFileSync(path.join(outDir, 'audit.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), failures: failures.length, results }, null, 2)}\n`, 'utf8');
  if (failures.length) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.kill();
}
