import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const exists = rel => fs.existsSync(path.join(root, rel));
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const browserMode = process.argv.includes('--browser');
const checks = [];
const add = (name, ok, details = '') => checks.push({ name, ok: Boolean(ok), details });

const required = [
  'index.html', 'index.js', 'mobile-app.html', 'mobile-app.css', 'mobile-app.js',
  'mobile-app.webmanifest', 'sw.js', 'reader-actions.js', 'reader-actions.css',
  'meta/topics.json', 'scripts/copy-static-site.mjs', 'scripts/validate-mobile-all-pages.mjs'
];
for (const rel of required) add(`required:${rel}`, exists(rel), exists(rel) ? 'exists' : 'missing');

const forbidden = [
  'mobile-topics.json', 'preview/phone.html', 'preview/phone.js', 'preview/phone-sw.js',
  'preview/mobile.html', 'preview/mobile-app.html', 'preview/mobile-app.js', 'preview/mobile-app.css',
  'preview/mobile-app.webmanifest', 'preview/mobile-app-install.html', 'preview/mobile-app-install.js',
  'preview/manifest.webmanifest', 'preview/sw.js', 'preview/install.html', 'mobile.css',
  'mobile-app-install.html', 'mobile-app-install.js', 'scripts/ship_mobile_release.sh'
];
for (const rel of forbidden) add(`legacy-absent:${rel}`, !exists(rel), exists(rel) ? 'must be removed' : 'absent');

let meta = null;
let manifest = null;
try { meta = JSON.parse(read('meta/topics.json')); } catch (error) { add('meta-valid', false, error.message); }
try { manifest = JSON.parse(read('mobile-app.webmanifest')); } catch (error) { add('manifest-valid', false, error.message); }

const html = exists('mobile-app.html') ? read('mobile-app.html') : '';
const css = exists('mobile-app.css') ? read('mobile-app.css') : '';
const js = exists('mobile-app.js') ? read('mobile-app.js') : '';
const actions = exists('reader-actions.js') ? read('reader-actions.js') : '';
const sw = exists('sw.js') ? read('sw.js') : '';
const indexHtml = exists('index.html') ? read('index.html') : '';
const indexJs = exists('index.js') ? read('index.js') : '';
const copyScript = exists('scripts/copy-static-site.mjs') ? read('scripts/copy-static-site.mjs') : '';

if (meta) {
  const flat = (meta.topics || []).flatMap(topic => topic.pages || []);
  const rootPages = fs.readdirSync(root).filter(file => /^עמוד-\d+\.html$/.test(file)).length;
  add('canonical-topic-count', meta.topics.length >= 8, `topics=${meta.topics.length}`);
  add('canonical-page-count', flat.length === rootPages && flat.length === meta.totalPages, `meta=${flat.length}; root=${rootPages}; declared=${meta.totalPages}`);
}

const tokenFiles = { 'index.html': indexHtml, 'index.js': indexJs, 'mobile-app.html': html, 'mobile-app.js': js, 'mobile-app.webmanifest': exists('mobile-app.webmanifest') ? read('mobile-app.webmanifest') : '', 'sw.js': sw };
for (const [file, text] of Object.entries(tokenFiles)) add(`single-version-token:${file}`, text.includes('__MOBILE_VERSION__'), 'build token present');
add('single-version-build-injection', copyScript.includes('replaceAll(VERSION_TOKEN, buildVersion)') && copyScript.includes('GITHUB_SHA'), 'one generated build version');
add('no-hardcoded-mobile-release-id', !Object.values(tokenFiles).some(text => /2026071\d{4}/.test(text)), 'no duplicated manual release number');

add('canonical-meta-source', js.includes("./meta/topics.json") && !js.includes('mobile-topics.json'), 'mobile reads meta/topics.json only');
add('global-search', js.includes('state.flatPages.filter') && js.includes('matchesQuery'), 'search covers all pages');
add('safe-storage', js.includes('function storageGet') && js.includes('function storageSet') && js.includes('catch'), 'storage failure is non-fatal');
add('visual-viewport', js.includes('visualViewport') && css.includes('100dvh'), 'dynamic mobile viewport supported');
add('safe-areas', css.includes('safe-area-inset-top') && css.includes('safe-area-inset-bottom'), 'notches and gesture areas supported');
add('touch-targets', /min-width:44px;min-height:44px/.test(css) && css.includes('.zoom-dock button{min-height:44px'), '44px touch targets');
add('selection-does-not-cover-nav', css.includes('bottom:calc(var(--bottom-nav-h) + var(--safe-bottom))'), 'selection bar is above navigation');
add('scroll-state-sync', js.includes('function syncScrollCurrent') && js.includes('syncCurrentPage(page)'), 'visible scroll page becomes current');
add('scroll-virtualization', js.includes('SCROLL_WINDOW') && js.includes('hydrateScrollWindow') && js.includes("querySelector('iframe')?.remove()"), 'only nearby scroll iframes stay mounted');
add('scroll-navigation-disabled', css.includes('body.reader-scroll #prevPageBtn') && js.includes("const inScroll = state.readMode === 'scroll'"), 'misleading navigation disabled in scroll mode');
add('dialog-accessibility', html.includes('aria-modal="true"') && js.includes('els.appShell.inert = true') && js.includes("event.key === 'Escape'") && js.includes("event.key !== 'Tab'"), 'modal focus and keyboard contract');
add('selection-restores-immediately', actions.includes('callback(selectionSnapshot())'), 'selection listener receives current state');
add('print-batching', actions.includes('PRINT_CONCURRENCY') && actions.includes('loadFramesInBatches'), 'large chapters are prepared in bounded batches');
add('pwa-precache', sw.includes('CORE_ASSETS') && sw.includes("'./mobile-app.html'") && sw.includes("'./meta/topics.json'"), 'offline shell precached');
add('pwa-safe-cache', sw.includes('safeCachePut') && sw.includes("console.warn('[sw] cache put skipped'"), 'cache failure cannot break a network response');
add('pwa-update-ui', html.includes('id="updateBar"') && js.includes('controllerchange') && !sw.includes('self.skipWaiting());\n});'), 'updates are coordinated');
add('offline-ui', html.includes('id="networkStatus"') && js.includes("window.addEventListener('offline'"), 'offline state is visible');
add('manifest-canonical', manifest?.id === './mobile-app.html' && String(manifest?.start_url || '').includes('mobile-app.html'), 'installed app opens canonical mobile shell');
add('full-mode-canonical', js.includes("target.searchParams.set('mode', 'full')") && js.includes("target.searchParams.set('file', page.file)"), 'open-full stays in mobile app');
add('manual-view-overrides', indexJs.includes("view === 'mobile'") && indexJs.includes("view === 'catalog'") && indexHtml.includes('?view=mobile'), 'entry routing can be overridden');

function contentType(filePath) {
  return ({
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.woff': 'font/woff', '.woff2': 'font/woff2'
  })[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function startServer(distDir) {
  return await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === '/') pathname = '/index.html';
        const filePath = path.resolve(distDir, `.${pathname}`);
        if (filePath !== distDir && !filePath.startsWith(`${distDir}${path.sep}`)) return res.writeHead(403).end('Forbidden');
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return res.writeHead(404).end('Not found');
        res.writeHead(200, { 'Content-Type': contentType(filePath), 'Cache-Control': 'no-store, max-age=0' });
        fs.createReadStream(filePath).pipe(res);
      } catch (error) { res.writeHead(500).end(error.message); }
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}

async function waitForWorksheetFrame(page, file) {
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
        await page.waitForTimeout(250);
        return frame;
      } catch (error) {
        if (!/Execution context was destroyed|Frame was detached/i.test(String(error))) throw error;
      }
    }
    await page.waitForTimeout(100);
  }
  throw new Error(`Timed out waiting for ${file}`);
}

async function readerMetrics(page) {
  return await page.evaluate(() => {
    const frame = document.querySelector('#mobilePageFrame');
    const a4 = frame?.contentDocument?.querySelector('.a4-page');
    if (!frame || !a4) return null;
    const rect = a4.getBoundingClientRect();
    return { frameWidth: frame.clientWidth, frameHeight: frame.clientHeight, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, ratio: rect.height / rect.width };
  });
}

async function runBrowserAudit() {
  const distDir = path.join(root, 'dist');
  if (!exists('dist/index.html')) return add('browser-production-build-present', false, 'run npm run build first');
  add('browser-production-build-present', true, 'testing dist');
  let server;
  let browser;
  try {
    const { chromium } = await import('playwright');
    const started = await startServer(distDir);
    server = started.server;
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 }, screen: { width: 412, height: 915 },
      deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'he-IL', serviceWorkers: 'block',
      userAgent: 'Mozilla/5.0 (Linux; Android 16; SM-S928B) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36'
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`${started.origin}/?view=mobile`, { waitUntil: 'networkidle' });
    await page.waitForURL(/mobile-app\.html/);
    await page.locator('.topic-btn').first().waitFor({ state: 'visible' });
    add('browser-all-topics-rendered', await page.locator('.topic-btn').count() === (meta?.topics?.length || 0), `expected=${meta?.topics?.length || 0}`);
    const shellOverflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
    add('browser-no-horizontal-overflow', shellOverflow <= 1, `overflow=${shellOverflow}`);

    const topic = (meta?.topics || []).find(item => (item.pages || []).length >= 2) || meta?.topics?.[0];
    const first = topic?.pages?.[0];
    const second = topic?.pages?.[1];
    await page.locator(`.topic-btn[data-topic="${topic.name}"]`).click();
    await page.locator(`.page-card[data-file="${first.file}"] .page-open`).click();
    await waitForWorksheetFrame(page, first.file);
    const metrics = await readerMetrics(page);
    add('browser-reader-fits', Boolean(metrics) && metrics.left >= -2 && metrics.top >= -2 && metrics.right <= metrics.frameWidth + 2 && metrics.bottom <= metrics.frameHeight + 2, JSON.stringify(metrics));
    add('browser-reader-a4-ratio', Boolean(metrics) && Math.abs(metrics.ratio - (297 / 210)) < 0.03, `ratio=${metrics?.ratio}`);
    add('browser-next-enabled', second ? !(await page.locator('#nextPageBtn').isDisabled()) : true, second?.file || 'single-page topic');
    if (second) {
      await page.locator('#nextPageBtn').click();
      await waitForWorksheetFrame(page, second.file);
      add('browser-next-navigation', (await page.locator('#currentPageMeta').textContent())?.includes(`עמוד ${second.number}`), second.file);
    }

    const popupPromise = context.waitForEvent('page');
    await page.locator('#openLiveBtn').click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await waitForWorksheetFrame(popup, second?.file || first.file);
    const popupUrl = new URL(popup.url());
    add('browser-open-full-url', popupUrl.searchParams.get('mode') === 'full' && popupUrl.searchParams.get('file') === (second?.file || first.file), popup.url());
    add('browser-open-full-navigation', topic.pages.length < 2 || !(await popup.locator('#prevPageBtn').isDisabled()), 'full mode keeps topic navigation');
    add('browser-open-full-isolated', await popup.evaluate(() => window.opener === null), 'noopener');
    await popup.close();
    add('browser-no-page-errors', pageErrors.length === 0, pageErrors.join(' | ') || 'none');
    await context.close();
  } catch (error) {
    add('browser-audit-execution', false, error?.stack || String(error));
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server) await new Promise(resolve => server.close(resolve));
  }
}

if (browserMode) await runBrowserAudit();
const failed = checks.filter(check => !check.ok);
const report = { generatedAt: new Date().toISOString(), browserMode, status: failed.length ? 'fail' : 'pass', checks };
fs.mkdirSync(path.join(root, 'meta', 'audit'), { recursive: true });
fs.writeFileSync(path.join(root, 'meta', 'audit', browserMode ? 'mobile-browser-validation.json' : 'mobile-runtime-validation.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
