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

// ── נושאי הניווט הם עלי תכנית הלימודים, לא מערך topics השטוח (CLAUDE.md §4.4) ──
const pagesByNode = new Map();
for (const topic of meta.topics || []) {
  for (const page of topic.pages || []) {
    if (!page.curriculumId) continue;
    if (!pagesByNode.has(page.curriculumId)) pagesByNode.set(page.curriculumId, []);
    pagesByNode.get(page.curriculumId).push(page);
  }
}
/** עלי תכנית הלימודים שיש בהם דפים, מהגדול לקטן. */
const populatedNodes = [...pagesByNode.entries()]
  .map(([id, pages]) => ({ id, pages }))
  .sort((a, b) => b.pages.length - a.pages.length);
const curriculumRootCount = (meta.curriculum?.nodes || []).length;

function contentType(filePath) {
  return ({
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2'
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
        res.writeHead(200, { 'Content-Type': contentType(filePath), 'Cache-Control': 'no-store' });
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

function attachDiagnostics(page, bucket, { includeConsole = true } = {}) {
  page.on('pageerror', error => bucket.push(`pageerror: ${error.message}`));
  if (includeConsole) {
    page.on('console', message => {
      if (message.type() === 'error') bucket.push(`console: ${message.text()}`);
    });
  }
  page.on('response', response => {
    if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) bucket.push(`http ${response.status()}: ${response.url()}`);
  });
}

async function ensurePanelOpen(page) {
  const collapsed = await page.locator('#topicsPanel').evaluate(node => node.classList.contains('is-collapsed'));
  if (collapsed) await page.locator('#toggleTopicsBtn').click();
}

/**
 * פותח את שרשרת האבות של הצומת בעץ תכנית הלימודים, עד שכפתור העלה נראה.
 * מזהי הצמתים נגזרים זה מזה בנקודות (CLAUDE.md §4.4).
 */
async function expandToNode(page, nodeId) {
  const parts = String(nodeId).split('.');
  for (let i = 1; i < parts.length; i += 1) {
    const id = parts.slice(0, i).join('.');
    const head = page.locator(`.topic-node[data-node-id="${id}"] > .topic-node-head`);
    if (await head.count() === 0) continue;
    if ((await head.getAttribute('aria-expanded')) === 'false') await head.click();
  }
}

async function chooseTopicAndPage(page, topic, pageMeta) {
  await ensurePanelOpen(page);
  const nodeId = pageMeta.curriculumId;
  if (!nodeId) throw new Error(`page ${pageMeta.file} has no curriculumId`);
  await expandToNode(page, nodeId);
  await page.locator(`.topic-btn[data-topic="${nodeId}"]`).click();
  const open = page.locator(`.page-card[data-file="${pageMeta.file}"] .page-open`);
  await open.waitFor({ state: 'visible' });
  await open.click();
  await waitForFrame(page, pageMeta.file);
}

async function waitForDialogOpen(page) {
  await page.waitForFunction(() => {
    const sheet = document.querySelector('#actionsSheet');
    const shell = document.querySelector('#appShell');
    return Boolean(sheet && !sheet.hidden && sheet.classList.contains('is-open') && sheet.contains(document.activeElement) && shell?.inert && document.body.classList.contains('sheet-open'));
  }, null, { timeout: 2500 });
}

async function closeDialogWithEscape(page) {
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('#actionsSheet')?.hidden === true, null, { timeout: 2500 });
}

async function runAndroid(origin, chromium) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, screen: { width: 412, height: 915 },
    deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'he-IL', serviceWorkers: 'block'
  });
  const page = await context.newPage();
  const diagnostics = [];
  attachDiagnostics(page, diagnostics);
  try {
    const topic = populatedNodes[0];
    const first = topic.pages[0];
    const second = topic.pages[1];
    const fifth = topic.pages[Math.min(4, topic.pages.length - 1)];

    await page.goto(`${origin}/?view=mobile`, { waitUntil: 'networkidle' });
    await page.waitForURL(/mobile-app\.html/);
    await page.locator('#topicStrip > .topic-node').first().waitFor({ state: 'visible' });
    await chooseTopicAndPage(page, topic, first);

    const baseGeometry = await page.evaluate(() => ({
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      nav: document.querySelector('.bottom-nav')?.getBoundingClientRect(),
      frame: document.querySelector('#mobilePageFrame')?.getBoundingClientRect(),
      buttons: [...document.querySelectorAll('button')]
        .filter(button => button.offsetParent !== null)
        .map(button => ({ id: button.id, width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height }))
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
    await page.locator(`.page-card[data-file="${first.file}"] .tp-check`).click();
    await page.locator('#selectionBar').waitFor({ state: 'visible' });
    const bars = await page.evaluate(() => ({
      selection: document.querySelector('#selectionBar')?.getBoundingClientRect(),
      nav: document.querySelector('.bottom-nav')?.getBoundingClientRect()
    }));
    add('selection-bar-no-overlap', bars.selection.bottom <= bars.nav.top + 1, JSON.stringify(bars));

    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#topicStrip > .topic-node').first().waitFor({ state: 'visible' });
    add('selection-restored-after-refresh', await page.locator('#selectionBar').isVisible(), await page.locator('#selectionCount').textContent());
    await page.locator('#selClear').click();

    await page.locator('#actionsBtn').click();
    await waitForDialogOpen(page);
    add('actions-dialog-focus', true, 'focus, inert and body lock active');
    await closeDialogWithEscape(page);
    add('actions-dialog-escape', true, 'closed by Escape');

    await page.locator('#actionsBtn').click();
    await waitForDialogOpen(page);
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
    // ניווט חכם (§5.5): בעמוד אמצעי בפרק שני הכפתורים פעילים, ו"הבא" מנווט
    // דף-דף בערימת הגלילה ומעדכן את הדף הנוכחי בפועל.
    add('scroll-nav-smart-enabled', scrollStart.prevDisabled === false && scrollStart.nextDisabled === false, JSON.stringify(scrollStart));
    const third = topic.pages[2];
    if (third) {
      await page.locator('#nextPageBtn').click();
      await page.waitForTimeout(800);
      add('scroll-next-navigates-stack', (await page.locator('#currentPageMeta').textContent())?.includes(`עמוד ${third.number}`), `${third.file}: ${await page.locator('#currentPageMeta').textContent()}`);
    }

    await page.evaluate(file => {
      const stack = document.querySelector('.m-scroll-stack');
      const target = [...(stack?.querySelectorAll('.m-sheet') || [])].find(sheet => sheet.dataset.file === file);
      if (stack && target) stack.scrollTop = target.offsetTop;
    }, fifth.file);
    await page.waitForTimeout(500);
    add('scroll-current-page-sync', (await page.locator('#currentPageMeta').textContent())?.includes(`עמוד ${fifth.number}`), `${fifth.file}: ${await page.locator('#currentPageMeta').textContent()}`);
    add('scroll-window-stays-bounded', await page.locator('.m-sheet iframe').count() <= 7, `iframes=${await page.locator('.m-sheet iframe').count()}`);

    const anotherTopic = populatedNodes.find(item => item.id !== topic.id && item.pages.length >= 2);
    if (anotherTopic) {
      await ensurePanelOpen(page);
      await expandToNode(page, anotherTopic.id);
      await page.locator(`.topic-btn[data-topic="${anotherTopic.id}"]`).click();
      await page.waitForTimeout(350);
      const firstStackFile = await page.locator('.m-sheet').first().getAttribute('data-file');
      add('scroll-topic-rebuild', firstStackFile === anotherTopic.pages[0].file, `actual=${firstStackFile}; expected=${anotherTopic.pages[0].file}`);
    }

    await page.locator('#actionsBtn').click();
    await waitForDialogOpen(page);
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
    const activeFile = await page.locator('.page-card.active').getAttribute('data-file').catch(() => null) || anotherTopic?.pages?.[0]?.file || first.file;
    const popupPromise = context.waitForEvent('page');
    await page.locator('#openLiveBtn').click();
    const popup = await popupPromise;
    const popupErrors = [];
    attachDiagnostics(popup, popupErrors, { includeConsole: false });
    await popup.waitForLoadState('domcontentloaded');
    await waitForFrame(popup, activeFile);
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
    diagnostics.push(...popupErrors);
    add('android-no-runtime-errors', diagnostics.length === 0, diagnostics.join(' | ') || 'none');
  } catch (error) {
    add('android-interaction-execution', false, error?.stack || String(error));
    add('android-failure-screenshot', true, await screenshot(page, 'android-failure'));
  } finally {
    await context.close();
    await browser.close();
  }
}

async function runWebKit(origin, webkit, devices) {
  const browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({ ...devices['iPhone 13'], locale: 'he-IL', serviceWorkers: 'block' });
  const page = await context.newPage();
  const diagnostics = [];
  attachDiagnostics(page, diagnostics, { includeConsole: false });
  try {
    const topic = populatedNodes.find(item => item.pages.length >= 2) || populatedNodes[0];
    await page.goto(`${origin}/?view=mobile`, { waitUntil: 'networkidle' });
    await page.waitForURL(/mobile-app\.html/);
    await chooseTopicAndPage(page, topic, topic.pages[0]);
    const state = await page.evaluate(() => ({
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      navVisible: document.querySelector('.bottom-nav')?.getBoundingClientRect().height > 0,
      frameVisible: document.querySelector('#mobilePageFrame')?.getBoundingClientRect().height > 0
    }));
    add('iphone-webkit-renders', state.navVisible && state.frameVisible, JSON.stringify(state));
    add('iphone-webkit-no-overflow', state.overflow <= 1, `overflow=${state.overflow}`);
    await page.locator('#actionsBtn').click();
    await waitForDialogOpen(page);
    await closeDialogWithEscape(page);
    add('iphone-dialog-escape', true, 'closed');
    add('iphone-no-page-errors', diagnostics.length === 0, diagnostics.join(' | ') || 'none');
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
    await page.locator('#topicStrip > .topic-node').first().waitFor({ state: 'visible' });
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('#topicStrip > .topic-node').first().waitFor({ state: 'visible' });
    }
    add('pwa-controller-active', await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), 'service worker controls page');
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#topicStrip > .topic-node').first().waitFor({ state: 'visible', timeout: 15000 });
    add('pwa-offline-shell', await page.locator('#topicStrip > .topic-node').count() === curriculumRootCount, `roots=${await page.locator('#topicStrip > .topic-node').count()}; expected=${curriculumRootCount}`);
    add('pwa-offline-status', await page.locator('#networkStatus').isVisible(), await page.locator('#networkStatus').textContent());
    await context.setOffline(false);
    const unexpected = diagnostics.filter(item => !/ERR_INTERNET_DISCONNECTED|Failed to fetch/i.test(item));
    add('pwa-no-unexpected-errors', unexpected.length === 0, unexpected.join(' | ') || 'none');
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
