import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
const allPages = (meta.topics || []).flatMap(topic =>
  (topic.pages || []).map(page => ({ ...page, topic: page.topic || topic.name }))
);
const canonicalFiles = new Set(allPages.map(page => page.file));

const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
  return [key, value];
}));
const shardIndex = Number(args['shard-index'] || 0);
const shardCount = Number(args['shard-count'] || 1);
if (!Number.isInteger(shardIndex) || !Number.isInteger(shardCount) || shardCount < 1 || shardIndex < 0 || shardIndex >= shardCount) {
  throw new Error(`Invalid shard configuration: index=${shardIndex}, count=${shardCount}`);
}

const pages = allPages.filter((_, index) => index % shardCount === shardIndex);
const reportDir = path.join(root, 'meta', 'audit');
const failureDir = path.join(reportDir, `mobile-layout-failures-shard-${shardIndex}`);
const reportPath = path.join(reportDir, `mobile-all-pages-shard-${shardIndex}.json`);
const expectedTopicCount = (meta.topics || []).length;
const viewports = [
  { name: 'android-small-portrait', width: 360, height: 800 },
  { name: 'android-target-portrait', width: 412, height: 915 },
  { name: 'android-landscape', width: 915, height: 412 }
];

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
  })[ext] || 'application/octet-stream';
}

async function startServer() {
  return await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === '/') pathname = '/index.html';
        const filePath = path.resolve(distDir, `.${pathname}`);
        const allowedPrefix = `${distDir}${path.sep}`;
        if (filePath !== distDir && !filePath.startsWith(allowedPrefix)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': contentType(filePath),
          'Cache-Control': 'no-store, max-age=0'
        });
        fs.createReadStream(filePath).pipe(res);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(error.message);
      }
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

function auditDocument(expectedTopics, surface) {
  const tolerance = 2;
  const issues = [];
  const a4 = document.querySelector('.a4-page');
  const rectOf = element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
  };
  const isVisible = element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
  };
  const contains = (outer, inner, extra = tolerance) =>
    inner.left >= outer.left - extra && inner.top >= outer.top - extra &&
    inner.right <= outer.right + extra && inner.bottom <= outer.bottom + extra;
  const intersectionArea = (a, b) => {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return width * height;
  };
  const describe = element => {
    const classes = [...element.classList].slice(0, 4).join('.');
    return `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${classes ? `.${classes}` : ''}`;
  };

  if (!a4) return { issues: [{ code: 'missing-a4-page', element: 'document' }], metrics: {} };

  const a4Rect = rectOf(a4);
  const viewportWidth = window.innerWidth;
  const documentOverflowX = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - viewportWidth;
  if (documentOverflowX > tolerance) issues.push({ code: 'document-horizontal-overflow', value: documentOverflowX });
  if (Math.abs((a4Rect.height / a4Rect.width) - (297 / 210)) > 0.04) {
    issues.push({ code: 'invalid-a4-ratio', value: a4Rect.height / a4Rect.width });
  }
  if (surface === 'open-full' && (a4Rect.left < 8 - tolerance || a4Rect.right > viewportWidth - 8 + tolerance)) {
    issues.push({ code: 'a4-does-not-fit-mobile-width', rect: a4Rect, viewportWidth });
  }

  const containedSelectors = [
    '.header-container', '.page-title', '.page-number', '.question-block', '.q-main', '.q-sub', '.q-text',
    '.eq-grid', '.eq-col', '.problem-block', '.problem-work', '.problem-figure', '.problem-equation',
    '.solution-space', '.problem-answer', '.answer-box', '.pdf-wrap', '.pdf-page', '.explain-box',
    '.math-table', '.multiple-choice', 'svg', 'img', 'mjx-container'
  ].join(',');
  for (const element of a4.querySelectorAll(containedSelectors)) {
    if (!isVisible(element)) continue;
    const rect = rectOf(element);
    if (!contains(a4Rect, rect, tolerance + 1)) {
      issues.push({ code: 'element-outside-a4', element: describe(element), rect });
    }
  }

  for (const block of a4.querySelectorAll('.problem-block')) {
    if (!isVisible(block)) continue;
    const blockRect = rectOf(block);
    for (const element of block.querySelectorAll('.problem-equation,.solution-space,.problem-answer,.answer-box')) {
      if (!isVisible(element)) continue;
      const rect = rectOf(element);
      if (!contains(blockRect, rect, tolerance)) {
        issues.push({ code: 'problem-child-outside-card', element: describe(element), rect, cardRect: blockRect });
      }
    }

    const equation = block.querySelector('.problem-equation');
    const solution = block.querySelector('.solution-space');
    const answer = block.querySelector('.problem-answer');
    const answerBox = block.querySelector('.problem-answer .answer-box');
    if (equation && solution && isVisible(equation) && isVisible(solution) && intersectionArea(rectOf(equation), rectOf(solution)) > 2) {
      issues.push({ code: 'equation-overlaps-solution-space', card: describe(block) });
    }
    if (solution && answer && isVisible(solution) && isVisible(answer) && intersectionArea(rectOf(solution), rectOf(answer)) > 2) {
      issues.push({ code: 'answer-overlaps-solution-space', card: describe(block) });
    }
    if (equation && answer && isVisible(equation) && isVisible(answer) && intersectionArea(rectOf(equation), rectOf(answer)) > 2) {
      issues.push({ code: 'answer-overlaps-equation', card: describe(block) });
    }
    if (answer && answerBox && isVisible(answer) && isVisible(answerBox) && !contains(rectOf(answer), rectOf(answerBox), tolerance)) {
      issues.push({ code: 'answer-box-outside-answer-row', answer: rectOf(answer), answerBox: rectOf(answerBox) });
    }
  }

  const clippingSelectors = '.page-title,.nav-meta,.topic-link,.q-text,.problem-equation,.problem-answer,.answer-box,.page-card strong,.page-card span';
  for (const element of document.querySelectorAll(clippingSelectors)) {
    if (!isVisible(element)) continue;
    const style = getComputedStyle(element);
    const widthClipped = element.scrollWidth - element.clientWidth > tolerance && style.overflowX !== 'visible';
    const heightClipped = element.scrollHeight - element.clientHeight > tolerance && style.overflowY !== 'visible';
    if (widthClipped || heightClipped) {
      issues.push({
        code: 'content-clipped', element: describe(element),
        clientWidth: element.clientWidth, scrollWidth: element.scrollWidth,
        clientHeight: element.clientHeight, scrollHeight: element.scrollHeight
      });
    }
  }

  if (surface === 'open-full') {
    const topicLinks = [...document.querySelectorAll('.preview-nav .topic-link')];
    if (topicLinks.length !== expectedTopics) {
      issues.push({ code: 'wrong-topic-link-count', expected: expectedTopics, actual: topicLinks.length });
    }
    const hiddenTopicLinks = topicLinks.filter(link => !isVisible(link)).map(describe);
    if (hiddenTopicLinks.length) issues.push({ code: 'hidden-topic-links', elements: hiddenTopicLinks });
  }

  return {
    issues,
    metrics: {
      a4: a4Rect,
      viewportWidth,
      viewportHeight: window.innerHeight,
      documentOverflowX,
      problemBlocks: a4.querySelectorAll('.problem-block').length,
      equations: a4.querySelectorAll('.problem-equation').length,
      mathJaxContainers: a4.querySelectorAll('mjx-container').length
    }
  };
}

async function ensureTopicsPanelOpen(app) {
  const panel = app.locator('#topicsPanel');
  if (await panel.evaluate(element => element.classList.contains('is-collapsed'))) {
    await app.locator('#toggleTopicsBtn').click();
  }
  await app.locator('#globalSearch').waitFor({ state: 'visible', timeout: 6000 });
}

async function waitForPageReady(page) {
  await page.locator('.a4-page').waitFor({ state: 'visible', timeout: 15000 });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    if (globalThis.MathJax?.startup?.promise) await globalThis.MathJax.startup.promise;
  });
  await page.waitForTimeout(120);
}

async function captureFailure(page, file, viewport, surface) {
  fs.mkdirSync(failureDir, { recursive: true });
  const safeFile = file.replace(/\.html$/i, '').replace(/[^\p{L}\p{N}-]+/gu, '-');
  const target = path.join(failureDir, `${safeFile}__${viewport}__${surface}.png`);
  await page.screenshot({ path: target, fullPage: true, animations: 'disabled' }).catch(() => {});
  return path.relative(root, target);
}

async function run() {
  if (!fs.existsSync(path.join(distDir, 'index.html'))) throw new Error('dist/index.html missing; run npm run build first');
  if (allPages.length !== meta.totalPages || allPages.length !== 98) {
    throw new Error(`Expected 98 pages; found ${allPages.length}; declared ${meta.totalPages}`);
  }

  const { chromium } = await import('playwright');
  const { server, origin } = await startServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        screen: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        locale: 'he-IL',
        userAgent: 'Mozilla/5.0 (Linux; Android 16; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
        serviceWorkers: 'block'
      });
      context.setDefaultTimeout(10000);
      const app = await context.newPage();
      const appErrors = [];
      app.on('pageerror', error => appErrors.push(error.message));
      await app.goto(`${origin}/?view=mobile`, { waitUntil: 'networkidle' });
      await app.waitForURL(/mobile-app\.html/, { timeout: 10000 });
      await app.locator('.topic-btn').first().waitFor({ state: 'visible', timeout: 10000 });

      const topicCount = await app.locator('.topic-btn').count();
      const appShellIssues = [];
      if (topicCount !== expectedTopicCount) appShellIssues.push({ code: 'wrong-app-topic-count', expected: expectedTopicCount, actual: topicCount });
      const appOverflow = await app.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
      if (appOverflow > 2) appShellIssues.push({ code: 'app-horizontal-overflow', value: appOverflow });

      for (const pageMeta of pages) {
        const result = {
          file: pageMeta.file,
          topic: pageMeta.topic,
          viewport: viewport.name,
          surfaces: {},
          issues: [...appShellIssues],
          pageErrors: [],
          consoleErrors: [],
          failedResponses: [],
          screenshots: []
        };
        let popup = null;
        try {
          await ensureTopicsPanelOpen(app);
          await app.locator('#globalSearch').fill(pageMeta.file);
          const card = app.locator(`.page-card[data-file="${pageMeta.file}"]`);
          await card.waitFor({ state: 'visible', timeout: 10000 });
          if (await card.count() !== 1) result.issues.push({ code: 'search-result-not-unique' });
          await card.click();

          await app.waitForFunction(file => {
            const frame = document.querySelector('#mobilePageFrame');
            const pathname = decodeURIComponent(frame?.contentWindow?.location?.pathname || '');
            return pathname.endsWith(`/${file}`) && Boolean(frame?.contentDocument?.querySelector('.a4-page'));
          }, pageMeta.file, { timeout: 15000 });
          await app.waitForTimeout(180);

          const iframeAudit = await app.evaluate(({ expectedTopics }) => {
            const frame = document.querySelector('#mobilePageFrame');
            return frame?.contentWindow?.eval(`(${auditDocument.toString()})(${expectedTopics}, 'app-reader')`) || { issues: [{ code: 'missing-reader-frame' }], metrics: {} };
          }, { expectedTopics: expectedTopicCount });
          result.surfaces.appReader = iframeAudit;
          result.issues.push(...iframeAudit.issues.map(issue => ({ ...issue, surface: 'app-reader' })));

          const popupPromise = context.waitForEvent('page', { timeout: 10000 });
          await app.locator('#openLiveBtn').click();
          popup = await popupPromise;
          popup.on('pageerror', error => result.pageErrors.push(error.message));
          popup.on('console', message => {
            if (message.type() === 'error') result.consoleErrors.push(message.text());
          });
          popup.on('response', response => {
            if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) {
              result.failedResponses.push(`${response.status()} ${response.url()}`);
            }
          });
          await popup.waitForLoadState('domcontentloaded', { timeout: 15000 });
          await waitForPageReady(popup);

          const decodedPath = decodeURIComponent(new URL(popup.url()).pathname);
          if (!decodedPath.endsWith(`/${pageMeta.file}`)) result.issues.push({ code: 'wrong-open-full-url', actual: decodedPath });
          if (!(await popup.evaluate(() => window.opener === null))) result.issues.push({ code: 'opener-not-isolated' });

          const openFullAudit = await popup.evaluate(auditDocument, expectedTopicCount, 'open-full');
          result.surfaces.openFull = openFullAudit;
          result.issues.push(...openFullAudit.issues.map(issue => ({ ...issue, surface: 'open-full' })));

          const navTargets = await popup.locator('.preview-nav a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')));
          const invalidTargets = navTargets.filter(href => /^עמוד-\d+\.html$/.test(href || '') && !canonicalFiles.has(href));
          if (invalidTargets.length) result.issues.push({ code: 'navigation-target-missing', targets: invalidTargets });
        } catch (error) {
          result.issues.push({ code: 'audit-exception', message: error?.message || String(error) });
        } finally {
          if (result.pageErrors.length) result.issues.push({ code: 'javascript-page-error', errors: result.pageErrors });
          if (result.consoleErrors.length) result.issues.push({ code: 'console-error', errors: result.consoleErrors });
          if (result.failedResponses.length) result.issues.push({ code: 'failed-assets', responses: result.failedResponses });
          if (appErrors.length) result.issues.push({ code: 'app-page-error', errors: [...appErrors] });

          if (result.issues.length) {
            result.screenshots.push(await captureFailure(app, pageMeta.file, viewport.name, 'app-reader'));
            if (popup && !popup.isClosed()) result.screenshots.push(await captureFailure(popup, pageMeta.file, viewport.name, 'open-full'));
          }
          if (popup && !popup.isClosed()) await popup.close().catch(() => {});
        }
        result.ok = result.issues.length === 0;
        results.push(result);
        console.log(`[shard ${shardIndex + 1}/${shardCount}] [${viewport.name}] ${pageMeta.file}: ${result.ok ? 'PASS' : `FAIL ${result.issues.map(issue => issue.code).join(', ')}`}`);
      }
      await context.close();
    }
  } finally {
    await browser.close().catch(() => {});
    await new Promise(resolve => server.close(resolve));
  }

  const failed = results.filter(result => !result.ok);
  const report = {
    generatedAt: new Date().toISOString(),
    shardIndex,
    shardCount,
    totalCanonicalPages: allPages.length,
    pagesInShard: pages.length,
    viewportCount: viewports.length,
    checksRun: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    status: failed.length ? 'fail' : 'pass',
    failureSummary: failed.map(result => ({ file: result.file, viewport: result.viewport, codes: result.issues.map(issue => issue.code) })),
    results
  };
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ status: report.status, shardIndex, checksRun: report.checksRun, passed: report.passed, failed: report.failed, failureSummary: report.failureSummary }, null, 2));
  if (failed.length) process.exit(1);
}

run().catch(error => {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), shardIndex, shardCount, status: 'fail', fatalError: error?.stack || String(error) }, null, 2)}\n`);
  console.error(error);
  process.exit(1);
});
