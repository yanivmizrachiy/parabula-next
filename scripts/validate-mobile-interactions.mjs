import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const auditDir = path.join(root, 'meta', 'audit');
const screenshotDir = path.join(auditDir, 'mobile-interaction-failures');
const reportPath = path.join(auditDir, 'mobile-interactions-validation.json');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
const checks = [];
const add = (name, ok, details = '') => checks.push({ name, ok: Boolean(ok), details });

function contentType(filePath) {
  return ({
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.woff': 'font/woff', '.woff2': 'font/woff2'
  })[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function startServer() {
  return await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === '/') pathname = '/index.html';
        const filePath = path.resolve(dist, `.${pathname}`);
        if (filePath !== dist && !filePath.startsWith(`${dist}${path.sep}`)) return res.writeHead(403).end('Forbidden');
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return res.writeHead(404).end('Not found');
        res.writeHead(200, { 'Content-Type': contentType(filePath), 'Cache-Control': 'no-store, max-age=0' });
        fs.createReadStream(filePath).pipe(res);
      } catch (error) { res.writeHead(500).end(error.message); }
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}

async function waitForFrame(page, file) {
  const deadline = Date.now() + 18000;
  while (Date.now() < deadline) {
    const frame = page.frames().find(candidate => {
      try { return decodeURIComponent(new URL(candidate.url()).pathname).endsWith(`/${file}`); }
      catch { return false; }
    });
    if (frame) {
      try {
        await frame.locator('.a4-page').waitFor({ state: 'visible', timeout: 1200 });
        await frame.evaluate(async () => {
          if (document.fonts?.ready) await document.fonts.ready;
          if (globalThis.MathJax?.startup?.promise) await globalThis.MathJax.startup.promise;
        });
        await page.waitForTimeout(180);
        return frame;
      } catch (error) {
        if (!/Execution context was destroyed|Frame was detached/i.test(String(error))) throw error;
      }
    }
    await page.waitForTimeout(100);
  }
  throw new Error(`Timed out waiting for ${file}`);
}

async function screenshot(page, name) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const target = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: target, fullPage: true, animations: 'disabled' }).catch(() => {});
  return path.relative(root, target);
}

function attachDiagnostics(page, bucket) {
  page.on('pageerror', error => bucket.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') bucket.push(`console: ${message.text()}`); });
  page.on('response', response => {
    if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) bucket.push(`http ${response.status()}: ${response.url()}`);
  });
}

async function ensurePanelOpen(page) {
  const collapsed = await page.locator('#topicsPanel').evaluate(node => node.classList.contains('is-collapsed'));
  if (collapsed) await page.locator('#toggleTopicsBtn').click();
}

async function chooseTopicAndPage(page, topic, pageMeta) {
  await ensurePanelOpen(page);
  await page.locator(`.topic-btn[data-topic="${topic.name}"]`).click();
  const open = page.locator(`.page-card[data-file="${pageMeta.file}"] .page-open`);
  await open.waitFor({ state: 'visible' });
  await open.click();
  await waitForFrame(page, pageMeta.file);
}

async function runAndroid(origin, chromium) {
  const context = await chromium.launchPersistentContext('', {
    headless: true,
    viewport: { width: 412, height: 915 }, screen: { width: 412, height: 915 },
    deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'he-IL', serviceWorkers: 'block',
    userAgent: 'Mozilla/5.0 (Linux; Android 16; SM-S928B) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36'
  });
  const page = context.pages()[0] || await context.newPage();
  const diagnostics = [];
  attachDiagnostics(page, diagnostics);
  try {
    const topic = [...(meta.topics || [])].sort((a, b) => b.pages.length - a.pages.length)[0];
    const first = topic.pages[0];
    const second = topic.pages[1];
    const fifth = topic.pages[Math.min(4, topic.pages.length - 1)];

    await page.goto(`${origin}/?view=mobile`, { waitUntil: 'networkidle' });
    await page.waitForURL(/mobile-app\.html/);
    await page.locator('.topic-btn').first().waitFor({ state: 'visible' });
    await chooseTopicAndPage(page, topic, first);

    const baseGeometry = await page.evaluate(() => ({
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      nav: document.querySelector('.bottom-nav')?.getBoundingClientRect(),
      frame: document.querySelector('#mobilePageFrame')?.getBoundingClientRect(),
      buttons: [...document.querySelectorAll('button')].filter(button => button.offsetParent !== null).map(button => ({ id: button.id, width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height }))
    }));
    add('android-no-horizontal-overflow', baseGeometry.overflow <= 1, `overflow=${baseGeometry.overflow}`);
    const smallTargets = baseGeometry.buttons.filter(button => button.width < 43 || button.height < 43);
    add('android-touch-targets', smallTargets.length === 0, JSON.stringify(smallTargets));
    add('android-reader-above-nav', baseGeometry.frame.bottom <= baseGeometry.nav.top + 2, JSON.stringify({ frame: baseGeometry.frame, nav: baseGeometry.nav }));

    add('android-next-enabled', second ? !(await page.locator('#nextPageBtn').isDisabled()) : true, second?.file || 'single page');
    if (second) {
      await page.locator('#nextPageBtn').click();
      await waitForFrame(page, second.file);
      add('android-next-navigation', (await page.locator('#currentPageMeta').textContent())?.includes(`עמוד ${second.number}`), second.file);
    }

    await ensurePanelOpen(page);
    await page.locator('#selectModeBtn').click();
    const select = page.locator(`.page-card[data-file="${first.file}"] .tp-check`);
    await select.click();
    await page.locator('#selectionBar').waitFor({ state: 'visible' });
    const bars = await page.evaluate(() => ({
      selection: document.querySelector('#selectionBar')?.getBoundingClientRect(),
      nav: document.querySelector('.bottom-nav')?.getBoundingClientRect()
    }));
    add('selection-bar-no-overlap', bars.selection.bottom <= bars.nav.top + 1, JSON.stringify(bars));

    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.topic-btn').first().waitFor({ state: 'visible' });
    add('selection-restored-after-refresh', await page.locator('#selectionBar').isVisible(), await page.locator('#selectionCount').textContent());
    await page.locator('#selClear').click();

    await page.locator('#actionsBtn').click();
    await page.locator('#actionsSheet').waitFor({ state: 'visible' });
    const dialogState = await page.evaluate(() => ({
      focusInside: document.querySelector('#actionsSheet')?.contains(document.activeElement),
      inert: document.querySelector('#appShell')?.inert === true,
      bodyLocked: document.body.classList.contains('sheet-open')
    }));
    add('actions-dialog-focus', dialogState.focusInside && dialogState.inert && dialogState.bodyLocked, JSON.stringify(dialogState));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    add('actions-dialog-escape', await page.locator('#actionsSheet').isHidden(), 'closed by Escape');

    await page.locator('#actionsBtn').click();
    await page.locator('[data-mode="scroll"]').click();
    await page.locator('.m-scroll-stack').waitFor({ state: 'visible' });
    const scrollStart = await page.evaluate(() => ({
      sheets: document.querySelectorAll('.m-sheet').length,
      iframes: document.querySelectorAll('.m-sheet iframe').length,
      prevDisabled: document.querySelector('#prevPageBtn')?.disabled,
      nextDisabled: document.querySelector('#nextPageBtn')?.disabled
    }));
    add('scroll-all-placeholders', scrollStart.sheets === topic.pages.length, `sheets=${scrollStart.sheets}; expected=${topic.pages.length}`);
    add('scroll-virtualized-iframes', scrollStart.iframes <= 7, `iframes=${scrollStart.iframes}`);
    add('scroll-nav-disabled', scrollStart.prevDisabled && scrollStart.nextDisabled, JSON.stringify(scrollStart));

    await page.evaluate(file => {
      const stack = document.querySelector('.m-scroll-stack');
      const target = stack?.querySelector(`.m-sheet[data-file="${CSS.escape(file)}"]`);
      if (stack && target) stack.scrollTop = target.offsetTop;
    }, fifth.file);
    await page.waitForTimeout(500);
    add('scroll-current-page-sync', (await page.locator('#currentPageMeta').textContent())?.includes(`עמוד ${fifth.number}`), `${fifth.file}: ${await page.locator('#currentPageMeta').textContent()}`);
    const afterScrollIframes = await page.locator('.m-sheet iframe').count();
    add('scroll-window-stays-bounded', afterScrollIframes <= 7, `iframes=${afterScrollIframes}`);

    const anotherTopic = (meta.topics || []).find(item => item.name !== topic.name && item.pages.length >= 2);
    if (anotherTopic) {
      await ensurePanelOpen(page);
      await page.locator(`.topic-btn[data-topic="${anotherTopic.name}"]`).click();
      await page.waitForTimeout(350);
      const firstStackFile = await page.locator('.m-sheet').first().getAttribute('data-file');
      add('scroll-topic-rebuild', firstStackFile === anotherTopic.pages[0].file, `actual=${firstStackFile}; expected=${anotherTopic.pages[0].file}`);
    }

    await page.locator('#actionsBtn').click();
    await page.locator('[data-mode="single"]').click();
    await page.locator('#mobilePageFrame').waitFor({ state: 'visible' });
    add('scroll-to-single-restores-frame', await page.locator('#mobilePageFrame').isVisible(), 'frame visible');

    await page.setViewportSize({ width: 915, height: 412 });
    await page.waitForTimeout(450);
    const landscape = await page.evaluate(() => ({
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      nav: document.querySelector('.bottom-nav')?.getBoundingClientRect(),
      frame: document.querySelector('#mobilePageFrame')?.getBoundingClientRect()
    }));
    add('landscape-no-overflow', landscape.overflow <= 1, `overflow=${landscape.overflow}`);
    add('landscape-reader-above-nav', landscape.frame.bottom <= landscape.nav.top + 2, JSON.stringify(landscape));

    await page.setViewportSize({ width: 412, height: 915 });
    const currentFile = await page.locator('.page-card.active').getAttribute('data-file').catch(() => null) || anotherTopic?.pages?.[0]?.file || first.file;
    const popupPromise = context.waitForEvent('page');
    await page.locator('#openLiveBtn').click();
    const popup = await popupPromise;
    const popupDiagnostics = [];
    attachDiagnostics(popup, popupDiagnostics);
    await popup.waitForLoadState('domcontentloaded');
    await waitForFrame(popup, currentFile);
    const fullState = await popup.evaluate(() => ({
      full: document.body.classList.contains('full-mode'),
      scroll: document.body.classList.contains('reader-scroll'),
      prevDisabled: document.querySelector('#prevPageBtn')?.disabled,
      nextDisabled: document.querySelector('#nextPageBtn')?.disabled,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
    }));
    add('full-mode-forces-single', fullState.full && !fullState.scroll, JSON.stringify(fullState));
    add('full-mode-keeps-navigation', !(fullState.prevDisabled && fullState.nextDisabled), JSON.stringify(fullState));
    add('full-mode-no-overflow', fullState.overflow <= 1, `overflow=${fullState.overflow}`);
    await popup.close();
    diagnostics.push(...popupDiagnostics);

    add('android-no-runtime-errors', diagnostics.length === 0, diagnostics.join(' | ') || 'none');
  } catch (error) {
    add('android-interaction-execution', false, error?.stack || String(error));
    add('android-failure-screenshot', true, await screenshot(page, 'android-failure'));
  } finally {
    await context.close();
  }
}

async function runWebKit(origin, webkit, devices) {
  const browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({ ...devices['iPhone 13'], locale: 'he-IL', serviceWorkers: 'block' });
  const page = await context.newPage();
  const diagnostics = [];
  attachDiagnostics(page, diagnostics);
  try {
    const topic = (meta.topics || []).find(item => item.pages.length >= 2) || meta.topics[0];
    await page.goto(`${origin}/?view=mobile`, { waitUntil: 'networkidle' });
    await page.waitForURL(/mobile-app\.html/);
    await chooseTopicAndPage(page, topic, topic.pages[0]);
    const state = await page.evaluate(() => ({
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      safeBottom: getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom'),
      navVisible: document.querySelector('.bottom-nav')?.getBoundingClientRect().height > 0,
      frameVisible: document.querySelector('#mobilePageFrame')?.getBoundingClientRect().height > 0
    }));
    add('iphone-webkit-renders', state.navVisible && state.frameVisible, JSON.stringify(state));
    add('iphone-webkit-no-overflow', state.overflow <= 1, `overflow=${state.overflow}`);
    await page.locator('#actionsBtn').click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    add('iphone-dialog-escape', await page.locator('#actionsSheet').isHidden(), 'closed');
    add('iphone-no-runtime-errors', diagnostics.length === 0, diagnostics.join(' | ') || 'none');
  } catch (error) {
    add('iphone-interaction-execution', false, error?.stack || String(error));
    add('iphone-failure-screenshot', true, await screenshot(page, 'iphone-failure'));
  } finally {
    await context.close();
    await browser.close();
  }
}

async function runOffline(origin, chromium) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, screen: { width: 412, height: 915 },
    deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'he-IL', serviceWorkers: 'allow'
  });
  const page = await context.newPage();
  const diagnostics = [];
  attachDiagnostics(page, diagnostics);
  try {
    await page.goto(`${origin}/mobile-app.html`, { waitUntil: 'networkidle' });
    await page.locator('.topic-btn').first().waitFor({ state: 'visible' });
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('.topic-btn').first().waitFor({ state: 'visible' });
    }
    add('pwa-controller-active', await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), 'service worker controls page');
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.topic-btn').first().waitFor({ state: 'visible', timeout: 15000 });
    add('pwa-offline-shell', await page.locator('.topic-btn').count() === meta.topics.length, `topics=${await page.locator('.topic-btn').count()}`);
    add('pwa-offline-status', await page.locator('#networkStatus').isVisible(), await page.locator('#networkStatus').textContent());
    await context.setOffline(false);
    const expectedOfflineErrors = diagnostics.filter(item => !/ERR_INTERNET_DISCONNECTED|Failed to fetch/i.test(item));
    add('pwa-no-unexpected-errors', expectedOfflineErrors.length === 0, expectedOfflineErrors.join(' | ') || 'none');
  } catch (error) {
    add('pwa-offline-execution', false, error?.stack || String(error));
    add('pwa-failure-screenshot', true, await screenshot(page, 'pwa-offline-failure'));
  } finally {
    await context.setOffline(false).catch(() => {});
    await context.close();
    await browser.close();
  }
}

async function main() {
  if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('dist/index.html missing; run npm run build first');
  const { chromium, webkit, devices } = await import('playwright');
  const { server, origin } = await startServer();
  try {
    await runAndroid(origin, chromium);
    await runWebKit(origin, webkit, devices);
    await runOffline(origin, chromium);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  const failed = checks.filter(check => !check.ok);
  const report = { generatedAt: new Date().toISOString(), status: failed.length ? 'fail' : 'pass', checks };
  fs.mkdirSync(auditDir, { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (failed.length) process.exit(1);
}

main().catch(error => {
  fs.mkdirSync(auditDir, { recursive: true });
  const report = { generatedAt: new Date().toISOString(), status: 'fail', checks, fatal: error?.stack || String(error) };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
});
