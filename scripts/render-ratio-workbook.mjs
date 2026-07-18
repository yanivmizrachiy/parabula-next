import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const root = process.cwd();
const appDir = path.join(root, 'sources', 'lovable', 'ratio-workbook');
const outputDir = path.join(root, 'assets', 'ratio');
const baseUrl = 'http://127.0.0.1:4173';
const pageCount = 48;
const expectedA4 = { width: 793.7, height: 1122.5 };

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)));
  });
}

async function waitForServer(url, timeoutMs = 45_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function sha256(filePath) {
  const bytes = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function pageFailures(pageNumber, geometry, consoleErrors) {
  const failures = [];
  const verticalOverflow = geometry.contentScrollHeight - geometry.contentClientHeight;
  const horizontalOverflow = geometry.contentScrollWidth - geometry.contentClientWidth;

  if (verticalOverflow > 1) failures.push(`vertical overflow ${verticalOverflow}px`);
  if (horizontalOverflow > 1) failures.push(`horizontal overflow ${horizontalOverflow}px`);
  if (Math.abs(geometry.width - expectedA4.width) > 2 || Math.abs(geometry.height - expectedA4.height) > 2) {
    failures.push(`not A4: ${geometry.width}×${geometry.height}`);
  }
  if (consoleErrors.length > 0) failures.push(`browser errors: ${consoleErrors.join(' | ')}`);

  return { page: pageNumber, verticalOverflow, horizontalOverflow, failures };
}

await fs.mkdir(outputDir, { recursive: true });
await run('npm', ['run', 'build'], { cwd: appDir });

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: appDir,
  stdio: 'ignore',
});

let browser;
let context;
try {
  await waitForServer(baseUrl);
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2,
    locale: 'he-IL',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  const pages = [];
  const failures = [];
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    consoleErrors.length = 0;
    const filename = `page-${String(pageNumber).padStart(3, '0')}.png`;
    const target = path.join(outputDir, filename);

    try {
      await page.goto(`${baseUrl}/render/${pageNumber}`, { waitUntil: 'networkidle' });
      await page.locator('[data-render-ready="true"]').waitFor({ state: 'visible' });
      await page.evaluate(async () => {
        if ('fonts' in document) await document.fonts.ready;
      });

      const geometry = await page.evaluate(() => {
        const sheet = document.querySelector('.worksheet-page');
        const content = document.querySelector('.page-content');
        if (!(sheet instanceof HTMLElement) || !(content instanceof HTMLElement)) {
          throw new Error('Missing worksheet page or content root');
        }
        const rect = sheet.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          contentClientHeight: content.clientHeight,
          contentScrollHeight: content.scrollHeight,
          contentClientWidth: content.clientWidth,
          contentScrollWidth: content.scrollWidth,
        };
      });

      await page.locator('.worksheet-page').screenshot({ path: target, animations: 'disabled' });
      const result = pageFailures(pageNumber, geometry, consoleErrors);
      failures.push(...result.failures.map((message) => ({ page: pageNumber, message })));
      pages.push({
        page: pageNumber,
        file: `assets/ratio/${filename}`,
        sha256: await sha256(target),
        widthCssPx: geometry.width,
        heightCssPx: geometry.height,
        verticalOverflow: result.verticalOverflow,
        horizontalOverflow: result.horizontalOverflow,
        status: result.failures.length === 0 ? 'pass' : 'fail',
        failures: result.failures,
      });
      process.stdout.write(`Rendered ratio page ${pageNumber}/${pageCount}: ${result.failures.length === 0 ? 'PASS' : `FAIL — ${result.failures.join('; ')}`}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ page: pageNumber, message });
      pages.push({ page: pageNumber, file: `assets/ratio/${filename}`, status: 'error', failures: [message] });
      process.stdout.write(`Rendered ratio page ${pageNumber}/${pageCount}: ERROR — ${message}\n`);
    }
  }

  const audit = {
    generatedAt: new Date().toISOString(),
    pageCount,
    passed: failures.length === 0,
    failureCount: failures.length,
    failures,
    pages,
  };
  await fs.writeFile(path.join(outputDir, 'audit-v2.json'), `${JSON.stringify(audit, null, 2)}\n`, 'utf8');

  if (failures.length > 0) {
    throw new Error(`Ratio render audit failed (${failures.length} findings): ${failures.map(({ page: failedPage, message }) => `p${failedPage} ${message}`).join(' | ')}`);
  }
} finally {
  if (context) await context.close();
  if (browser) await browser.close();
  preview.kill('SIGTERM');
}
