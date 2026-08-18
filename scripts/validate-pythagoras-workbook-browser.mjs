import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const manifest = JSON.parse(fs.readFileSync('meta/workbooks/pythagoras.json', 'utf8'));
const expected = manifest.pages;
const server = spawn(process.execPath, ['preview/server.mjs'], { stdio: 'ignore' });

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch('http://127.0.0.1:5179/pythagoras-workbook.html');
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('preview server did not become ready');
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });

  await page.goto('http://127.0.0.1:5179/pythagoras-workbook.html', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForFunction(() => document.querySelector('#workbook-status')?.textContent.includes('חוברת מלאה'), null, {
    timeout: 90000,
  });

  const result = await page.evaluate((expectedPages) => {
    const wrappers = [...document.querySelectorAll('.workbook-page-wrap')];
    const mains = wrappers.map((wrapper) => wrapper.querySelector('main.a4-page'));
    const allIds = [...document.querySelectorAll('#workbook [id]')].map((el) => el.id);
    const duplicateIds = [...new Set(allIds.filter((id, index) => allIds.indexOf(id) !== index))];
    const localNumbers = mains.map((main) => main?.querySelector('.page-number')?.textContent.trim());
    const sourceNumbers = mains.map((main) => Number(main?.dataset.sourcePage));
    const advanced = mains.find((main) => Number(main?.dataset.sourcePage) === 375);
    const mathCount = document.querySelectorAll('#workbook mjx-container').length;
    const pageCssLinks = [...document.querySelectorAll('link[data-workbook-css]')].map((link) => link.getAttribute('href'));
    const computedRubik = mains[0] ? getComputedStyle(mains[0]).fontFamily : '';
    const advancedMathLabel = advanced?.querySelector('svg.chart text[direction="ltr"]');
    const advancedMathFont = advancedMathLabel ? getComputedStyle(advancedMathLabel).fontFamily : '';

    return {
      wrapperCount: wrappers.length,
      mainCount: mains.filter(Boolean).length,
      duplicateIds,
      localNumbers,
      sourceNumbers,
      advancedLocal: advanced?.dataset.workbookPage ?? null,
      advancedNumber: advanced?.querySelector('.page-number')?.textContent.trim() ?? null,
      advancedHasPythagorasClass: advanced?.classList.contains('pythagoras') ?? false,
      mathCount,
      pageCssCount: new Set(pageCssLinks).size,
      computedRubik,
      advancedMathFont,
      expectedPages,
    };
  }, expected);

  const errors = [...runtimeErrors];
  if (result.wrapperCount !== expected.length) errors.push(`wrappers=${result.wrapperCount}, expected=${expected.length}`);
  if (result.mainCount !== expected.length) errors.push(`a4 pages=${result.mainCount}, expected=${expected.length}`);
  if (result.duplicateIds.length) errors.push(`duplicate DOM ids: ${result.duplicateIds.join(', ')}`);
  if (JSON.stringify(result.sourceNumbers) !== JSON.stringify(expected)) errors.push('source page order differs from canonical manifest');
  for (let i = 0; i < expected.length; i += 1) {
    if (result.localNumbers[i] !== String(i + 1)) errors.push(`local page ${i + 1} renders number ${result.localNumbers[i]}`);
  }
  if (result.advancedLocal !== '48' || result.advancedNumber !== '48') errors.push('source page 375 is not local workbook page 48');
  if (!result.advancedHasPythagorasClass) errors.push('source page 375 did not receive the shared pythagoras class in workbook context');
  if (result.mathCount === 0) errors.push('MathJax produced no mjx-container elements');
  if (result.pageCssCount !== expected.length) errors.push(`page CSS links=${result.pageCssCount}, expected=${expected.length}`);
  if (!/Rubik/u.test(result.computedRubik)) errors.push(`workbook UI font is not Rubik: ${result.computedRubik}`);
  if (result.advancedMathFont && !/PytTeX/u.test(result.advancedMathFont)) errors.push(`advanced SVG math font is not PytTeX: ${result.advancedMathFont}`);

  if (errors.length) {
    console.error('PYTHAGORAS_WORKBOOK_BROWSER_INVALID');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`PYTHAGORAS_WORKBOOK_BROWSER_OK pages=${expected.length} math=${result.mathCount} css=${result.pageCssCount}`);
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}
