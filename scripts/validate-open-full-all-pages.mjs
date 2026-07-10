import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const reportPath = path.join(root, 'meta', 'audit', 'open-full-all-pages.json');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
const allPages = (meta.topics || []).flatMap(topic => (topic.pages || []).map(page => ({ ...page, topic: page.topic || topic.name })));
const canonicalFiles = new Set(allPages.map(page => page.file));

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

function summarizeFailure(result) {
  return `${result.file}: ${result.failures.join(', ')}`;
}

async function waitForMath(page) {
  const equationCount = await page.locator('.problem-equation').count();
  if (!equationCount) return { equationCount: 0, mathJaxContainers: 0 };
  await page.waitForFunction(
    expected => document.querySelectorAll('mjx-container').length >= expected,
    equationCount,
    { timeout: 8000 }
  ).catch(() => {});
  return {
    equationCount,
    mathJaxContainers: await page.locator('mjx-container').count()
  };
}

async function ensureTopicsPanelOpen(app) {
  const panel = app.locator('#topicsPanel');
  if (await panel.evaluate(element => element.classList.contains('is-collapsed'))) {
    await app.locator('#toggleTopicsBtn').click();
  }
  await app.locator('#globalSearch').waitFor({ state: 'visible', timeout: 5000 });
}

async function run() {
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error('dist/index.html is missing. Run npm run build first.');
  }
  if (allPages.length !== 98 || allPages.length !== meta.totalPages) {
    throw new Error(`Expected 98 canonical pages; found ${allPages.length}, declared ${meta.totalPages}.`);
  }

  const { chromium } = await import('playwright');
  const { server, origin } = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    screen: { width: 412, height: 915 },
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
  const appConsoleErrors = [];
  app.on('pageerror', error => appErrors.push(error.message));
  app.on('console', message => {
    if (message.type() === 'error') appConsoleErrors.push(message.text());
  });

  const results = [];

  try {
    await app.goto(`${origin}/?view=mobile`, { waitUntil: 'networkidle' });
    await app.waitForURL(/mobile-app\.html/, { timeout: 10000 });
    await app.locator('.topic-btn').first().waitFor({ state: 'visible', timeout: 10000 });

    for (let index = 0; index < allPages.length; index += 1) {
      const pageMeta = allPages[index];
      const pageErrors = [];
      const consoleErrors = [];
      const failedResponses = [];
      let popup = null;
      let state = null;
      const failures = [];

      try {
        await ensureTopicsPanelOpen(app);
        await app.locator('#globalSearch').fill(pageMeta.file);
        const card = app.locator(`.page-card[data-file="${pageMeta.file}"]`);
        await card.waitFor({ state: 'visible', timeout: 10000 });
        if (await card.count() !== 1) failures.push('search-result-not-unique');
        await card.click();

        await app.waitForFunction(file => {
          const frame = document.querySelector('#mobilePageFrame');
          const current = decodeURIComponent(frame?.contentWindow?.location?.pathname || '');
          return current.endsWith(`/${file}`) && Boolean(frame?.contentDocument?.querySelector('.a4-page'));
        }, pageMeta.file, { timeout: 15000 });

        const popupPromise = context.waitForEvent('page', { timeout: 10000 });
        await app.locator('#openLiveBtn').click();
        popup = await popupPromise;
        popup.on('pageerror', error => pageErrors.push(error.message));
        popup.on('console', message => {
          if (message.type() === 'error') consoleErrors.push(message.text());
        });
        popup.on('response', response => {
          if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) {
            failedResponses.push(`${response.status()} ${response.url()}`);
          }
        });

        await popup.waitForLoadState('domcontentloaded', { timeout: 15000 });
        await popup.locator('.a4-page').waitFor({ state: 'visible', timeout: 15000 });
        await popup.evaluate(async () => {
          if (document.fonts?.ready) await document.fonts.ready;
        });
        const math = await waitForMath(popup);
        await popup.waitForTimeout(120);

        state = await popup.evaluate(() => {
          const a4 = document.querySelector('.a4-page');
          const nav = document.querySelector('.preview-nav');
          const rect = a4?.getBoundingClientRect();
          const navRect = nav?.getBoundingClientRect();
          const navHrefs = [...document.querySelectorAll('.preview-nav a[href]')].map(link => link.getAttribute('href'));
          return {
            url: location.href,
            title: document.title,
            openerIsNull: window.opener === null,
            hasA4: Boolean(a4),
            hasVisibleNav: Boolean(navRect && navRect.width > 0 && navRect.height > 0),
            navHrefs,
            a4Width: rect?.width || 0,
            a4Height: rect?.height || 0,
            a4Ratio: rect ? rect.height / rect.width : 0,
            pageLeft: rect?.left ?? 9999,
            pageRight: rect?.right ?? 9999,
            viewportWidth: window.innerWidth,
            horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
            rasterCount: document.querySelectorAll('.pdf-page').length,
            heading: document.querySelector('h1')?.textContent?.trim() || ''
          };
        });

        const decodedPath = decodeURIComponent(new URL(state.url).pathname);
        if (!decodedPath.endsWith(`/${pageMeta.file}`)) failures.push('wrong-url');
        if (!state.openerIsNull) failures.push('opener-not-isolated');
        if (!state.hasA4) failures.push('missing-a4-page');
        if (!state.hasVisibleNav) failures.push('missing-or-hidden-navigation');
        if (!state.title) failures.push('missing-title');
        if (!state.heading) failures.push('missing-heading');
        if (Math.abs(state.a4Ratio - (297 / 210)) >= 0.04) failures.push('invalid-a4-ratio');
        if (state.pageLeft < 8 || state.pageRight > state.viewportWidth - 8) failures.push('does-not-fit-mobile-width');
        if (state.horizontalOverflow > 1) failures.push('horizontal-overflow');
        if (pageErrors.length) failures.push('javascript-page-error');
        if (consoleErrors.length) failures.push('console-error');
        if (failedResponses.length) failures.push('failed-assets');
        if (math.equationCount && math.mathJaxContainers < math.equationCount) failures.push('mathjax-not-fully-rendered');

        const invalidNav = state.navHrefs
          .filter(Boolean)
          .filter(href => /^עמוד-\d+\.html$/.test(href))
          .filter(href => !canonicalFiles.has(href));
        if (invalidNav.length) failures.push('navigation-target-missing');

        state = { ...state, ...math, invalidNav };
      } catch (error) {
        failures.push('audit-exception');
        state = { error: error?.stack || error?.message || String(error) };
      } finally {
        if (popup && !popup.isClosed()) await popup.close().catch(() => {});
      }

      results.push({
        index: index + 1,
        file: pageMeta.file,
        topic: pageMeta.topic,
        number: pageMeta.number,
        title: pageMeta.title || pageMeta.h1 || '',
        ok: failures.length === 0,
        failures,
        pageErrors,
        consoleErrors,
        failedResponses,
        state
      });

      console.log(`[${index + 1}/${allPages.length}] ${pageMeta.file}: ${failures.length ? `FAIL ${failures.join(', ')}` : 'PASS'}`);
    }
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    await new Promise(resolve => server.close(resolve));
  }

  const failedPages = results.filter(result => !result.ok);
  const report = {
    generatedAt: new Date().toISOString(),
    status: failedPages.length || appErrors.length || appConsoleErrors.length ? 'fail' : 'pass',
    expectedPages: 98,
    testedPages: results.length,
    passedPages: results.length - failedPages.length,
    failedPages: failedPages.length,
    appErrors,
    appConsoleErrors,
    failureSummary: failedPages.map(summarizeFailure),
    pages: results
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    status: report.status,
    expectedPages: report.expectedPages,
    testedPages: report.testedPages,
    passedPages: report.passedPages,
    failedPages: report.failedPages,
    appErrors: report.appErrors,
    appConsoleErrors: report.appConsoleErrors,
    failureSummary: report.failureSummary
  }, null, 2));

  if (report.status !== 'pass') process.exit(1);
}

run().catch(error => {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    status: 'fail',
    expectedPages: 98,
    testedPages: 0,
    passedPages: 0,
    failedPages: 98,
    fatalError: error?.stack || error?.message || String(error)
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.error(report.fatalError);
  process.exit(1);
});
