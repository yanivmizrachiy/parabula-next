import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import { buildPythagorasWorkbook } from '../pythagoras-workbook-model.js';

const meta = JSON.parse(fs.readFileSync('meta/topics.json', 'utf8'));
const workbook = buildPythagorasWorkbook(meta);
const expected = workbook.pages.map((page) => page.sourceNumber);
const expectedAdditional = workbook.pages
  .filter((page) => page.primaryTopic !== workbook.name)
  .map((page) => page.sourceNumber);
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

  const result = await page.evaluate(({ expectedPages, additionalPages }) => {
    const wrappers = [...document.querySelectorAll('.workbook-page-wrap')];
    const mains = wrappers.map((wrapper) => wrapper.querySelector('main.a4-page'));
    const allIds = [...document.querySelectorAll('#workbook [id]')].map((el) => el.id);
    const duplicateIds = [...new Set(allIds.filter((id, index) => allIds.indexOf(id) !== index))];
    const localNumbers = mains.map((main) => main?.querySelector('.page-number')?.textContent.trim());
    const sourceNumbers = mains.map((main) => Number(main?.dataset.sourcePage));
    const mathCount = document.querySelectorAll('#workbook mjx-container').length;
    const pageCssLinks = [...document.querySelectorAll('link[data-workbook-css]')].map((link) => link.getAttribute('href'));
    const uiFonts = mains.map((main) => main ? getComputedStyle(main).fontFamily : '');
    const badUiFonts = uiFonts
      .map((font, index) => ({ local: index + 1, source: expectedPages[index], font }))
      .filter((entry) => !/Rubik/u.test(entry.font));

    const additionalState = additionalPages.map((source) => {
      const main = mains.find((candidate) => Number(candidate?.dataset.sourcePage) === source);
      return {
        source,
        found: Boolean(main),
        title: main?.querySelector('.page-title')?.textContent.trim() ?? null,
        hasPythagorasClass: main?.classList.contains('pythagoras') ?? false,
        primaryTopic: main?.dataset.primaryTopic ?? null,
      };
    });

    const mathSvgSelector = [
      '.foundation-svg .pt',
      '.foundation-svg .lbl',
      '.pyt-tri-svg text',
      '.pyt-fig-svg text',
      '.pyt-rect-svg text',
      'svg.chart text[direction="ltr"]',
    ].join(',');
    const badMathFonts = [];
    let checkedSvgMath = 0;
    mains.forEach((main, index) => {
      if (!main) return;
      for (const element of main.querySelectorAll(mathSvgSelector)) {
        checkedSvgMath += 1;
        const font = getComputedStyle(element).fontFamily;
        if (!/PytTeX/u.test(font)) {
          badMathFonts.push({
            local: index + 1,
            source: expectedPages[index],
            tag: element.tagName,
            className: element.getAttribute('class') ?? '',
            text: element.textContent?.trim().slice(0, 40) ?? '',
            font,
          });
        }
      }
    });

    return {
      wrapperCount: wrappers.length,
      mainCount: mains.filter(Boolean).length,
      duplicateIds,
      localNumbers,
      sourceNumbers,
      additionalState,
      mathCount,
      pageCssCount: new Set(pageCssLinks).size,
      badUiFonts,
      badMathFonts,
      checkedSvgMath,
    };
  }, { expectedPages: expected, additionalPages: expectedAdditional });

  const errors = [...runtimeErrors];
  if (result.wrapperCount !== expected.length) errors.push(`wrappers=${result.wrapperCount}, expected=${expected.length}`);
  if (result.mainCount !== expected.length) errors.push(`a4 pages=${result.mainCount}, expected=${expected.length}`);
  if (result.duplicateIds.length) errors.push(`duplicate DOM ids: ${result.duplicateIds.join(', ')}`);
  if (JSON.stringify(result.sourceNumbers) !== JSON.stringify(expected)) errors.push('source page order differs from canonical meta-derived workbook');
  for (let i = 0; i < expected.length; i += 1) {
    if (result.localNumbers[i] !== String(i + 1)) errors.push(`local page ${i + 1} renders number ${result.localNumbers[i]}`);
  }
  for (const item of result.additionalState) {
    if (!item.found) errors.push(`cross-listed source page ${item.source} is missing from workbook`);
    if (item.title !== workbook.name) errors.push(`cross-listed source page ${item.source} has workbook title ${item.title}`);
    if (!item.hasPythagorasClass) errors.push(`cross-listed source page ${item.source} lacks shared pythagoras class`);
    if (!item.primaryTopic || item.primaryTopic === workbook.name) errors.push(`cross-listed source page ${item.source} lost its original primary-topic context`);
  }
  if (result.mathCount === 0) errors.push('MathJax produced no mjx-container elements');
  if (result.pageCssCount !== expected.length) errors.push(`page CSS links=${result.pageCssCount}, expected=${expected.length}`);
  if (result.badUiFonts.length) errors.push(`non-Rubik A4 pages: ${JSON.stringify(result.badUiFonts)}`);
  if (result.checkedSvgMath === 0) errors.push('no SVG math labels were checked');
  if (result.badMathFonts.length) errors.push(`non-PytTeX SVG math labels: ${JSON.stringify(result.badMathFonts.slice(0, 20))}`);

  if (errors.length) {
    console.error('PYTHAGORAS_WORKBOOK_BROWSER_INVALID');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`PYTHAGORAS_WORKBOOK_BROWSER_OK pages=${expected.length} primary=${workbook.primaryCount} additional=${workbook.additionalCount} math=${result.mathCount} svgMath=${result.checkedSvgMath} css=${result.pageCssCount}`);
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}
