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
const expectedTopicCount = (meta.topics || []).length;

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
        if (filePath !== distDir && !filePath.startsWith(`${distDir}${path.sep}`)) {
          res.writeHead(403).end('Forbidden');
          return;
        }
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType(filePath), 'Cache-Control': 'no-store, max-age=0' });
        fs.createReadStream(filePath).pipe(res);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }).end(error.message);
      }
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

function auditWorksheet() {
  const tolerance = 3;
  const issues = [];
  const page = document.querySelector('.a4-page');
  if (!page) return { issues: [{ code: 'missing-a4-page' }], metrics: {} };

  const rect = element => {
    const value = element.getBoundingClientRect();
    return { left: value.left, top: value.top, right: value.right, bottom: value.bottom, width: value.width, height: value.height };
  };
  const visible = element => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && box.width > 0 && box.height > 0;
  };
  const contains = (outer, inner, extra = tolerance) =>
    inner.left >= outer.left - extra && inner.top >= outer.top - extra &&
    inner.right <= outer.right + extra && inner.bottom <= outer.bottom + extra;
  const overlap = (a, b) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
    Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const describe = element => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${element.classList.length ? `.${[...element.classList].slice(0, 4).join('.')}` : ''}`;

  const pageRect = rect(page);
  if (Math.abs((pageRect.height / pageRect.width) - (297 / 210)) > 0.04) {
    issues.push({ code: 'invalid-a4-ratio', value: pageRect.height / pageRect.width });
  }
  if (pageRect.left < -tolerance || pageRect.right > window.innerWidth + tolerance) {
    issues.push({ code: 'a4-outside-reader', rect: pageRect, viewportWidth: window.innerWidth });
  }
  const htmlOverflow = getComputedStyle(document.documentElement).overflowX;
  const bodyOverflow = getComputedStyle(document.body).overflowX;
  if (!['hidden', 'clip'].includes(htmlOverflow) || !['hidden', 'clip'].includes(bodyOverflow)) {
    issues.push({ code: 'reader-overflow-not-clipped', htmlOverflow, bodyOverflow });
  }

  const containedSelectors = [
    '.header-container', '.page-title', '.page-number', '.question-block', '.q-main', '.q-sub', '.q-text',
    '.eq-grid', '.eq-col', '.problem-block', '.problem-work', '.problem-figure', '.problem-equation',
    '.solution-space', '.problem-answer', '.answer-box', '.pdf-wrap', '.pdf-page', '.pyt-content', '.pyt-image',
    '.explain-box', '.math-table', '.multiple-choice', 'svg', 'img', 'mjx-container'
  ].join(',');
  for (const element of page.querySelectorAll(containedSelectors)) {
    if (!visible(element)) continue;
    const elementRect = rect(element);
    if (!contains(pageRect, elementRect, tolerance + 2)) {
      issues.push({ code: 'element-outside-a4', element: describe(element), rect: elementRect });
    }
  }

  for (const image of page.querySelectorAll('img')) {
    if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
      issues.push({ code: 'broken-image', src: image.getAttribute('src') || '' });
    }
  }

  for (const block of page.querySelectorAll('.problem-block')) {
    if (!visible(block)) continue;
    const blockRect = rect(block);
    for (const element of block.querySelectorAll('.problem-equation,.solution-space,.problem-answer,.answer-box')) {
      if (visible(element) && !contains(blockRect, rect(element), tolerance)) {
        issues.push({ code: 'problem-child-outside-card', element: describe(element) });
      }
    }
    const equation = block.querySelector('.problem-equation');
    const solution = block.querySelector('.solution-space');
    const answer = block.querySelector('.problem-answer');
    const answerBox = block.querySelector('.problem-answer .answer-box');
    if (equation && solution && visible(equation) && visible(solution) && overlap(rect(equation), rect(solution)) > 3) {
      issues.push({ code: 'equation-overlaps-solution-space' });
    }
    if (solution && answer && visible(solution) && visible(answer) && overlap(rect(solution), rect(answer)) > 3) {
      issues.push({ code: 'answer-overlaps-solution-space' });
    }
    if (equation && answer && visible(equation) && visible(answer) && overlap(rect(equation), rect(answer)) > 3) {
      issues.push({ code: 'answer-overlaps-equation' });
    }
    if (answer && answerBox && visible(answer) && visible(answerBox) && !contains(rect(answer), rect(answerBox), tolerance)) {
      issues.push({ code: 'answer-box-outside-answer-row' });
    }
  }

  const equationCount = page.querySelectorAll('.problem-equation').length;
  const mathJaxCount = page.querySelectorAll('mjx-container').length;
  if (equationCount && mathJaxCount < equationCount) {
    issues.push({ code: 'mathjax-not-fully-rendered', equationCount, mathJaxCount });
  }

  return {
    issues,
    metrics: {
      a4: pageRect,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      problemBlocks: page.querySelectorAll('.problem-block').length,
      equations: equationCount,
      mathJaxContainers: mathJaxCount,
      images: page.querySelectorAll('img').length
    }
  };
}

async function waitForReaderReady(shell, file) {
  await shell.waitForFunction(expectedFile => {
    const frame = document.querySelector('#mobilePageFrame');
    const pathname = decodeURIComponent(frame?.contentWindow?.location?.pathname || '');
    return pathname.endsWith(`/${expectedFile}`) && Boolean(frame?.contentDocument?.querySelector('.a4-page'));
  }, file, { timeout: 15000 });
  await shell.evaluate(async () => {
    const frame = document.querySelector('#mobilePageFrame');
    const doc = frame?.contentDocument;
    const win = frame?.contentWindow;
    if (doc?.fonts?.ready) await doc.fonts.ready;
    if (win?.MathJax?.startup?.promise) await win.MathJax.startup.promise;
  });
  await shell.waitForTimeout(260);
}

async function selectPage(shell, file) {
  const panel = shell.locator('#topicsPanel');
  if (await panel.evaluate(element => element.classList.contains('is-collapsed'))) {
    await shell.locator('#toggleTopicsBtn').click();
  }
  const search = shell.locator('#globalSearch');
  await search.waitFor({ state: 'visible', timeout: 6000 });
  await search.fill(file);
  const card = shell.locator(`.page-card[data-file="${file}"]`);
  await card.waitFor({ state: 'visible', timeout: 10000 });
  if (await card.count() !== 1) throw new Error(`Search result is not unique for ${file}`);
  await card.click();
  await waitForReaderReady(shell, file);
}

async function auditFrame(shell, auditSource) {
  return await shell.evaluate(source => {
    const frame = document.querySelector('#mobilePageFrame');
    if (!frame?.contentWindow) return { issues: [{ code: 'missing-reader-frame' }], metrics: {} };
    return frame.contentWindow.eval(`(${source})()`);
  }, auditSource);
}

async function frameNavigationTargets(shell) {
  return await shell.evaluate(() => {
    const doc = document.querySelector('#mobilePageFrame')?.contentDocument;
    return [...(doc?.querySelectorAll('.preview-nav a[href]') || [])].map(link => link.getAttribute('href'));
  });
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
  if (allPages.length !== 98 || allPages.length !== meta.totalPages) {
    throw new Error(`Expected 98 pages; found ${allPages.length}; declared ${meta.totalPages}`);
  }

  const { chromium } = await import('playwright');
  const { server, origin } = await startServer();
  const browser = await chromium.launch({ headless: true });
  const auditSource = auditWorksheet.toString();
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

      const shellIssues = [];
      const topicCount = await app.locator('.topic-btn').count();
      if (topicCount !== expectedTopicCount) shellIssues.push({ code: 'wrong-app-topic-count', expected: expectedTopicCount, actual: topicCount });
      const shellOverflow = await app.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
      if (shellOverflow > 2) shellIssues.push({ code: 'app-horizontal-overflow', value: shellOverflow });

      for (const pageMeta of pages) {
        const result = {
          file: pageMeta.file,
          topic: pageMeta.topic,
          viewport: viewport.name,
          surfaces: {},
          issues: [...shellIssues],
          pageErrors: [],
          consoleErrors: [],
          failedResponses: [],
          screenshots: []
        };
        let popup = null;

        try {
          await selectPage(app, pageMeta.file);
          const appReaderAudit = await auditFrame(app, auditSource);
          result.surfaces.appReader = appReaderAudit;
          result.issues.push(...appReaderAudit.issues.map(issue => ({ ...issue, surface: 'app-reader' })));

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
          const popupUrl = new URL(popup.url());
          if (!popupUrl.pathname.endsWith('/mobile-app.html') || popupUrl.searchParams.get('mode') !== 'full' || popupUrl.searchParams.get('file') !== pageMeta.file) {
            result.issues.push({ code: 'wrong-open-full-url', actual: popup.url() });
          }
          if (!(await popup.evaluate(() => window.opener === null))) result.issues.push({ code: 'opener-not-isolated' });
          await waitForReaderReady(popup, pageMeta.file);

          const fullShell = await popup.evaluate(() => ({
            fullMode: document.body.classList.contains('full-mode'),
            overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
            backText: document.querySelector('#openLiveBtn')?.textContent?.trim() || '',
            visibleFrame: Boolean(document.querySelector('#mobilePageFrame')?.getBoundingClientRect().height)
          }));
          if (!fullShell.fullMode) result.issues.push({ code: 'missing-full-mode-shell' });
          if (fullShell.overflow > 2) result.issues.push({ code: 'full-shell-horizontal-overflow', value: fullShell.overflow });
          if (fullShell.backText !== 'חזרה') result.issues.push({ code: 'missing-full-mode-back-action' });
          if (!fullShell.visibleFrame) result.issues.push({ code: 'hidden-full-mode-frame' });

          const openFullAudit = await auditFrame(popup, auditSource);
          result.surfaces.openFull = openFullAudit;
          result.issues.push(...openFullAudit.issues.map(issue => ({ ...issue, surface: 'open-full' })));

          const navTargets = await frameNavigationTargets(popup);
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
