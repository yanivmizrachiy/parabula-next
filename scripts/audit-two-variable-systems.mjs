import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'STATE', 'reports', 'two-variable-systems');
fs.mkdirSync(outDir, { recursive: true });

const expectedCards = new Map([
  [601, 5], [602, 5], [603, 5], [604, 4],
  [605, 3], [606, 3], [607, 2], [608, 2],
]);

const server = spawn(process.execPath, ['preview/server.mjs'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stdout.on('data', (data) => process.stdout.write(String(data)));
server.stderr.on('data', (data) => process.stderr.write(String(data)));

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 15_000) {
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
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } });

  for (const [number, expected] of expectedCards) {
    const file = `עמוד-${number}.html`;
    const url = `http://127.0.0.1:5179/${encodeURIComponent(file)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    await page.evaluate(async () => {
      if (globalThis.MathJax?.startup?.promise) await globalThis.MathJax.startup.promise;
      if (document.fonts?.ready) await document.fonts.ready;
    });

    const audit = await page.locator('.a4-page').evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      cards: element.querySelectorAll('.system-card').length,
      mathBlocks: element.querySelectorAll('.system-math mjx-container').length,
      finalAnswers: element.querySelectorAll('.final-answer').length,
      footerLines: element.querySelectorAll('.gz-footer > div').length,
    }));

    const overflowX = audit.scrollWidth > audit.clientWidth + 2;
    const overflowY = audit.scrollHeight > audit.clientHeight + 2;
    const ok = !overflowX && !overflowY
      && audit.cards === expected
      && audit.mathBlocks === expected
      && audit.finalAnswers === expected
      && audit.footerLines === 2;

    const screenshot = path.join(outDir, `page-${number}.png`);
    await page.locator('.a4-page').screenshot({ path: screenshot, animations: 'disabled' });
    results.push({ number, file, expectedCards: expected, ok, overflowX, overflowY, audit, screenshot });
    console.log(`${ok ? '[OK]' : '[FAIL]'} ${file}`, audit);
  }

  const failures = results.filter((result) => !result.ok);
  fs.writeFileSync(
    path.join(outDir, 'audit.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), failures: failures.length, results }, null, 2)}\n`,
    'utf8',
  );
  if (failures.length) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.kill();
}
