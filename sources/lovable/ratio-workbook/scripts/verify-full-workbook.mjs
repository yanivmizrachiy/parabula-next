import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const inputHtml = path.resolve(process.argv[2] || 'preview/ratio-preview/full-workbook.html');
const outputDir = path.resolve(process.argv[3] || 'preview/ratio-preview/audit');

if (!fs.existsSync(inputHtml)) {
  throw new Error(`Preview HTML not found: ${inputHtml}`);
}
fs.mkdirSync(outputDir, { recursive: true });
const pagesDir = path.join(outputDir, 'pages');
fs.mkdirSync(pagesDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1200 },
  deviceScaleFactor: 1,
});

const consoleErrors = [];
const pageErrors = [];
const externalRequests = [];

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error)));
page.on('request', (request) => {
  try {
    const url = new URL(request.url());
    if (url.protocol === 'http:' || url.protocol === 'https:') externalRequests.push(request.url());
  } catch {
    // Ignore non-URL browser internals.
  }
});

await page.goto(pathToFileURL(inputHtml).href, { waitUntil: 'load' });
await page.waitForFunction(() => document.documentElement.dataset.workbookReady === 'true', null, { timeout: 30_000 });
await page.evaluate(() => document.fonts?.ready);

const audit = await page.evaluate(() => {
  const metaNode = document.getElementById('ratio-build-meta');
  const meta = metaNode?.textContent ? JSON.parse(metaNode.textContent) : null;
  const pages = [...document.querySelectorAll('.wb-page')];
  const teacherMarkers = document.querySelectorAll('.teacher-intro-page').length;
  const teacherHeadingCount = [...document.querySelectorAll('.page-header-title')]
    .filter((node) => node.textContent?.includes('למורה')).length;

  const physical = pages.map((node, index) => {
    const body = node.querySelector('.wb-body');
    const rect = node.getBoundingClientRect();
    const numberText = node.querySelector('.page-number')?.textContent?.trim() || '';
    const svgOutside = [...node.querySelectorAll('svg')].filter((svg) => {
      const r = svg.getBoundingClientRect();
      return r.left < rect.left - 1 || r.right > rect.right + 1 || r.top < rect.top - 1 || r.bottom > rect.bottom + 1;
    }).length;
    const imagesWithoutAlt = [...node.querySelectorAll('img')].filter((img) => !img.hasAttribute('alt')).length;
    const sourceKeys = [...node.querySelectorAll('.wb-group[data-source-key]')]
      .map((group) => group.getAttribute('data-source-key'))
      .filter(Boolean);

    return {
      physicalPage: index + 1,
      displayedNumber: Number(numberText),
      width: rect.width,
      height: rect.height,
      bodyClientHeight: body?.clientHeight ?? 0,
      bodyScrollHeight: body?.scrollHeight ?? 0,
      bodyOverflowPx: body ? Math.max(0, body.scrollHeight - body.clientHeight) : null,
      svgOutside,
      imagesWithoutAlt,
      sourceKeys: [...new Set(sourceKeys)],
    };
  });

  return {
    htmlReady: document.documentElement.dataset.workbookReady === 'true',
    workbookError: document.documentElement.dataset.workbookError || null,
    meta,
    teacherMarkers,
    teacherHeadingCount,
    physical,
  };
});

const failures = [];
if (!audit.htmlReady) failures.push('Workbook never reached ready state.');
if (audit.workbookError) failures.push(`Paginator reported: ${audit.workbookError}`);
if (!audit.meta) failures.push('Missing ratio-build-meta.');
if (audit.meta?.teacherPages !== 0) failures.push(`Build metadata reports ${audit.meta?.teacherPages} teacher pages.`);
if (audit.teacherMarkers !== 0) failures.push(`Found ${audit.teacherMarkers} teacher-intro-page elements.`);
if (audit.teacherHeadingCount !== 0) failures.push(`Found ${audit.teacherHeadingCount} teacher headings.`);
if (audit.meta?.firstStudentPage !== 1) failures.push('Metadata firstStudentPage is not 1.');
if (!Number.isInteger(audit.meta?.semanticPageCount) || audit.meta.semanticPageCount <= 0) {
  failures.push('Invalid semanticPageCount.');
}

const displayedNumbers = audit.physical.map((item) => item.displayedNumber);
const expectedNumbers = Array.from({ length: audit.physical.length }, (_, index) => index + 1);
if (JSON.stringify(displayedNumbers) !== JSON.stringify(expectedNumbers)) {
  failures.push(`Physical page numbers are not sequential from 1: ${displayedNumbers.join(', ')}`);
}

for (const item of audit.physical) {
  if (Math.abs(item.width - 793.7) > 3) failures.push(`Page ${item.physicalPage}: A4 width drift (${item.width}px).`);
  if (Math.abs(item.height - 1122.5) > 4) failures.push(`Page ${item.physicalPage}: A4 height drift (${item.height}px).`);
  if (item.bodyOverflowPx != null && item.bodyOverflowPx > 2) failures.push(`Page ${item.physicalPage}: body overflow ${item.bodyOverflowPx}px.`);
  if (item.svgOutside > 0) failures.push(`Page ${item.physicalPage}: ${item.svgOutside} SVG element(s) extend outside the A4 page.`);
  if (item.imagesWithoutAlt > 0) failures.push(`Page ${item.physicalPage}: ${item.imagesWithoutAlt} image(s) missing alt.`);
}

if (externalRequests.length > 0) failures.push(`Preview made ${externalRequests.length} external network request(s).`);
if (consoleErrors.length > 0) failures.push(`Browser console errors: ${consoleErrors.join(' | ')}`);
if (pageErrors.length > 0) failures.push(`Browser page errors: ${pageErrors.join(' | ')}`);

const pageLocators = page.locator('.wb-page');
for (let index = 0; index < audit.physical.length; index++) {
  await pageLocators.nth(index).screenshot({
    path: path.join(pagesDir, `page-${String(index + 1).padStart(3, '0')}.png`),
    animations: 'disabled',
  });
}

await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: path.join(outputDir, 'ratio-workbook-preview.pdf'),
  printBackground: true,
  preferCSSPageSize: true,
  tagged: true,
});

const result = {
  generatedAt: new Date().toISOString(),
  inputHtml,
  status: failures.length === 0 ? 'pass' : 'fail',
  failures,
  consoleErrors,
  pageErrors,
  externalRequests,
  semanticPages: audit.meta?.semanticPageCount ?? null,
  physicalPages: audit.physical.length,
  teacherPages: audit.meta?.teacherPages ?? null,
  firstStudentPage: audit.meta?.firstStudentPage ?? null,
  sourceCommit: audit.meta?.sourceCommit ?? null,
  buildId: audit.meta?.buildId ?? null,
  contentSha256: audit.meta?.contentSha256 ?? null,
  pages: audit.physical,
};

fs.writeFileSync(path.join(outputDir, 'audit.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(result, null, 2));

await browser.close();

if (failures.length > 0) {
  process.exitCode = 1;
}
