import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(root, rel));
const browserMode = process.argv.includes('--browser');
const checks = [];
const add = (name, ok, details = '') => checks.push({ name, ok, details });

const required = [
  'index.html', 'index.js', 'mobile-app.html', 'mobile-app.css', 'mobile-app.js',
  'mobile-app.webmanifest', 'sw.js', 'meta/topics.json', 'meta/equations-master-map.json',
  'scripts/build-equations-pages.mjs', 'scripts/validate-mobile-all-pages.mjs'
];
for (const rel of required) add(`required:${rel}`, exists(rel), exists(rel) ? 'exists' : 'missing');

const forbidden = [
  'mobile-topics.json', 'preview/phone.html', 'preview/phone.js', 'preview/mobile.html',
  'preview/mobile-app.html', 'preview/mobile-app.js', 'preview/mobile-app.css',
  'preview/mobile-app-install.html', 'preview/mobile-app-install.js', 'preview/manifest.webmanifest',
  'preview/sw.js', 'preview/install.html', 'mobile-app-install.html', 'mobile-app-install.js',
  'scripts/ship_mobile_release.sh', 'STATE/fix-canonical-rules-trigger.tmp'
];
for (const rel of forbidden) add(`legacy-absent:${rel}`, !exists(rel), exists(rel) ? 'must be removed' : 'absent');

let meta = null;
let equationsMap = null;
try { meta = JSON.parse(read('meta/topics.json')); } catch (error) { add('meta-valid', false, error.message); }
try { equationsMap = JSON.parse(read('meta/equations-master-map.json')); } catch (error) { add('equations-map-valid', false, error.message); }
const expectedTopicCount = meta?.topics?.length || 0;

if (meta) {
  const flat = (meta.topics || []).flatMap(topic => topic.pages || []);
  const rootPageCount = fs.readdirSync(root).filter(file => /^עמוד-\d+\.html$/.test(file)).length;
  add('canonical-topic-count', meta.topics.length >= 8, `topics=${meta.topics.length}`);
  add('canonical-page-count', flat.length === rootPageCount && flat.length === meta.totalPages, `pages=${flat.length}; rootFiles=${rootPageCount}; declared=${meta.totalPages}`);
}

const html = exists('mobile-app.html') ? read('mobile-app.html') : '';
const css = exists('mobile-app.css') ? read('mobile-app.css') : '';
const js = exists('mobile-app.js') ? read('mobile-app.js') : '';
const indexHtml = exists('index.html') ? read('index.html') : '';
const indexJs = exists('index.js') ? read('index.js') : '';
const manifest = exists('mobile-app.webmanifest') ? read('mobile-app.webmanifest') : '';
const equationsCss = exists('styles/topics/equations.css') ? read('styles/topics/equations.css') : '';
const generator = exists('scripts/build-equations-pages.mjs') ? read('scripts/build-equations-pages.mjs') : '';
const copyScript = exists('scripts/copy-static-site.mjs') ? read('scripts/copy-static-site.mjs') : '';

add('mobile-uses-canonical-meta', js.includes('./meta/topics.json'), 'mobile-app.js reads meta/topics.json');
add('global-search-all-pages', js.includes('flatPages.filter'), 'search filters the global page collection');
add('topics-open-at-boot', js.includes('setTopicsPanelOpen(true)'), 'topics are discoverable at startup');
add('topic-grid-visible', css.includes('grid-template-columns:repeat(auto-fill') || css.includes('grid-template-columns:repeat(2'), 'topics use a wrapping grid');
add('safe-area-support', css.includes('safe-area-inset-bottom') && css.includes('safe-area-inset-top'), 'safe areas supported');
add('single-reader-scale', js.includes("setProperty('transform', `scale(${scale})`, 'important')") && js.includes("setProperty('width', '210mm', 'important')"), 'one canonical A4 scaler');
add('full-mode-routes-through-mobile-app', html.includes("target.searchParams.set('mode', 'full')") && html.includes("target.searchParams.set('file', file)"), 'Open Full uses the canonical mobile app');
add('full-mode-shell', css.includes('body.full-mode') && html.includes("document.body.classList.add('full-mode')"), 'canonical full-page shell exists');
add('full-mode-cache-bust', html.includes('mobile-app.css?v=20260710004') && html.includes('mobile-app.js?v=20260710004'), 'new full-mode assets use a fresh URL');
add('no-equations-viewport-reflow', !equationsCss.includes('width: calc(100vw') && !equationsCss.includes('padding: 4.8vw'), 'equations keep canonical A4 geometry');
add('generator-does-not-create-zoom', !/zoom:\s*0\./.test(generator), 'generator emits no legacy zoom');
add('generator-uses-canonical-rules', generator.includes('CLAUDE.md') && !generator.includes('STATE/EQUATIONS_DESIGN_PASS_RULES.md'), 'generator uses CLAUDE.md only');
add('pythagoras-assets-promoted-at-build', copyScript.includes('assets/pythagoras/vector/page-05.svg') && copyScript.includes('assets/pythagoras/vector/page-22.svg'), 'production build restores the required vectors');
add('single-real-install-flow', html.includes('id="installAppBtn"') && js.includes('beforeinstallprompt') && js.includes('appinstalled') && js.includes('display-mode: standalone'), 'one real PWA install flow');
add('manifest-starts-canonical-mobile', manifest.includes('mobile-app.html'), 'installed app opens the canonical mobile shell');
add('phone-detection-hardening', indexJs.includes('userAgentData') && indexJs.includes('pointer: coarse') && indexJs.includes('maxTouchPoints'), 'entry detects phones');
add('explicit-view-overrides', indexJs.includes("view === 'mobile'") && indexJs.includes("view === 'catalog'") && indexHtml.includes('?view=mobile') && indexHtml.includes('?view=catalog'), 'manual view overrides work');

if (equationsMap) {
  const livePages = equationsMap.pages.filter(page => page.status === 'LIVE');
  const missingCss = [];
  const staleZoom = [];
  const pageMedia = [];
  for (const page of livePages) {
    const rel = `styles/pages/עמוד-${page.fileNum}.css`;
    if (!exists(rel)) { missingCss.push(rel); continue; }
    const text = read(rel);
    if (/zoom:\s*0\./.test(text)) staleZoom.push(rel);
    if (/@media\s+screen\s+and\s+\(max-width:\s*900px\)/.test(text)) pageMedia.push(rel);
  }
  add('all-live-equations-css-present', missingCss.length === 0, missingCss.join(', ') || `${livePages.length} files present`);
  add('no-page-level-equations-zoom', staleZoom.length === 0, staleZoom.join(', ') || 'clean');
  add('no-page-level-equations-mobile-media', pageMedia.length === 0, pageMedia.join(', ') || 'canonical A4 only');
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.woff': 'font/woff', '.woff2': 'font/woff2'
  })[ext] || 'application/octet-stream';
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
      } catch (error) {
        res.writeHead(500).end(error.message);
      }
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }));
  });
}

async function waitForFrame(shell, file) {
  await shell.locator('#mobilePageFrame').waitFor({ state: 'attached', timeout: 15000 });
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const matchingFrame = shell.frames().find(frame => {
      try {
        return decodeURIComponent(new URL(frame.url()).pathname).endsWith(`/${file}`);
      } catch {
        return false;
      }
    });
    if (matchingFrame) {
      try {
        await matchingFrame.locator('.a4-page').waitFor({ state: 'visible', timeout: 1200 });
        await matchingFrame.evaluate(async () => {
          if (document.fonts?.ready) await document.fonts.ready;
          if (globalThis.MathJax?.startup?.promise) await globalThis.MathJax.startup.promise;
        });
        await shell.waitForTimeout(350);
        return;
      } catch (error) {
        if (!/Execution context was destroyed|Target page, context or browser has been closed/i.test(String(error))) throw error;
      }
    }
    await shell.waitForTimeout(100);
  }
  throw new Error(`Timed out waiting for stable worksheet frame: ${file}`);
}

async function readerState(shell) {
  return await shell.evaluate(() => {
    const frame = document.querySelector('#mobilePageFrame');
    const doc = frame?.contentDocument;
    const a4 = doc?.querySelector('.a4-page');
    if (!frame || !doc || !a4) return null;
    const rect = a4.getBoundingClientRect();
    return {
      frameWidth: frame.clientWidth, frameHeight: frame.clientHeight,
      left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom,
      ratio: rect.height / rect.width, transform: a4.style.transform,
      brokenImages: [...doc.images].filter(image => !image.complete || image.naturalWidth === 0).length,
      equations: doc.querySelectorAll('.problem-equation').length,
      mathJax: doc.querySelectorAll('mjx-container').length
    };
  });
}

async function runBrowserAudit() {
  const distDir = path.join(root, 'dist');
  if (!exists('dist/index.html')) {
    add('browser-production-build-present', false, 'dist/index.html missing; run npm run build first');
    return;
  }
  add('browser-production-build-present', true, 'testing built dist');

  let server;
  let browser;
  try {
    const { chromium } = await import('playwright');
    const started = await startServer(distDir);
    server = started.server;
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 }, screen: { width: 412, height: 915 },
      deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'he-IL',
      userAgent: 'Mozilla/5.0 (Linux; Android 16; SM-S928B) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36',
      serviceWorkers: 'block'
    });
    const page = await context.newPage();
    const pageErrors = [];
    const failedResponses = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) failedResponses.push(`${response.status()} ${response.url()}`);
    });

    await page.goto(`${started.origin}/?view=mobile`, { waitUntil: 'networkidle' });
    await page.waitForURL(/mobile-app\.html/);
    await page.locator('.topic-btn').first().waitFor({ state: 'visible' });
    add('browser-all-topics-rendered', await page.locator('.topic-btn').count() === expectedTopicCount, `expected=${expectedTopicCount}`);
    const shellOverflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
    add('browser-no-horizontal-overflow', shellOverflow <= 1, `overflow=${shellOverflow}`);

    await page.locator('#globalSearch').fill('עמוד-48.html');
    const card = page.locator('.page-card[data-file="עמוד-48.html"]');
    await card.waitFor({ state: 'visible' });
    await card.click();
    await waitForFrame(page, 'עמוד-48.html');
    const state = await readerState(page);
    add('browser-reader-fits', Boolean(state) && state.left >= -2 && state.top >= -2 && state.right <= state.frameWidth + 2 && state.bottom <= state.frameHeight + 2, JSON.stringify(state));
    add('browser-reader-a4-ratio', Boolean(state) && Math.abs(state.ratio - (297 / 210)) < 0.03, `ratio=${state?.ratio}`);
    add('browser-reader-one-scale', Boolean(state?.transform?.startsWith('scale(')), `transform=${state?.transform}`);
    add('browser-reader-assets', state?.brokenImages === 0, `brokenImages=${state?.brokenImages}`);

    const popupPromise = context.waitForEvent('page');
    await page.locator('#openLiveBtn').click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await waitForFrame(popup, 'עמוד-48.html');
    const popupUrl = new URL(popup.url());
    const fullState = await readerState(popup);
    const fullShell = await popup.evaluate(() => ({
      fullMode: document.body.classList.contains('full-mode'),
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      back: document.querySelector('#openLiveBtn')?.textContent?.trim()
    }));
    add('browser-open-full-canonical-url', popupUrl.pathname.endsWith('/mobile-app.html') && popupUrl.searchParams.get('mode') === 'full' && popupUrl.searchParams.get('file') === 'עמוד-48.html', popup.url());
    add('browser-open-full-shell', fullShell.fullMode && fullShell.back === 'חזרה' && fullShell.overflow <= 1, JSON.stringify(fullShell));
    add('browser-open-full-fits', Boolean(fullState) && fullState.left >= -2 && fullState.top >= -2 && fullState.right <= fullState.frameWidth + 2 && fullState.bottom <= fullState.frameHeight + 2, JSON.stringify(fullState));
    add('browser-open-full-isolated', await popup.evaluate(() => window.opener === null), 'noopener enforced');
    await popup.close();

    add('browser-no-page-errors', pageErrors.length === 0, pageErrors.join(' | ') || 'none');
    add('browser-no-failed-assets', failedResponses.length === 0, failedResponses.join(' | ') || 'none');
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
const report = {
  generatedAt: new Date().toISOString(),
  browserMode,
  status: failed.length ? 'fail' : 'pass',
  checks
};
fs.mkdirSync(path.join(root, 'meta', 'audit'), { recursive: true });
fs.writeFileSync(path.join(root, 'meta', 'audit', browserMode ? 'mobile-browser-validation.json' : 'mobile-runtime-validation.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
