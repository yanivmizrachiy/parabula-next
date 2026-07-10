import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(root, rel));
const checks = [];
const add = (name, ok, details) => checks.push({ name, ok, details });
const releaseToken = '20260710003';
const browserMode = process.argv.includes('--browser');

const required = [
  'index.html',
  'index.js',
  'mobile-app.html',
  'mobile-app.css',
  'mobile-app.js',
  'mobile-app.webmanifest',
  'mobile-app-install.html',
  'mobile-app-install.js',
  'sw.js',
  'meta/topics.json',
  'meta/equations-master-map.json',
  'scripts/build-equations-pages.mjs'
];
for (const rel of required) add(`required:${rel}`, exists(rel), exists(rel) ? 'exists' : 'missing');

const forbiddenLegacy = [
  'mobile-topics.json',
  'preview/phone.html',
  'preview/phone.js',
  'preview/mobile.html',
  'preview/mobile-app.html',
  'preview/mobile-app.js',
  'preview/mobile-app.css',
  'preview/mobile-app-install.html',
  'preview/mobile-app-install.js',
  'preview/manifest.webmanifest',
  'preview/sw.js',
  'preview/install.html',
  '.github/workflows/one-time-clean-equations-mobile-css.yml',
  'scripts/one-time-clean-equations-mobile-css.mjs'
];
for (const rel of forbiddenLegacy) add(`legacy-absent:${rel}`, !exists(rel), exists(rel) ? 'must be removed' : 'absent');

let meta = null;
let equationsMap = null;
const files = {};
for (const rel of required.filter(rel => !rel.endsWith('.json'))) {
  try { files[rel] = read(rel); } catch { files[rel] = ''; }
}
try { meta = JSON.parse(read('meta/topics.json')); } catch (error) { add('meta-valid', false, error.message); }
try { equationsMap = JSON.parse(read('meta/equations-master-map.json')); } catch (error) { add('equations-map-valid', false, error.message); }

let equationsCss = '';
let generator = '';
try { equationsCss = read('styles/topics/equations.css'); } catch {}
try { generator = read('scripts/build-equations-pages.mjs'); } catch {}

if (meta) {
  const flat = (meta.topics || []).flatMap(topic => topic.pages || []);
  add('canonical-topic-count', (meta.topics || []).length === 8, `topics=${(meta.topics || []).length}`);
  add('canonical-page-count', flat.length === meta.totalPages && flat.length === 98, `pages=${flat.length}; declared=${meta.totalPages}`);
}

if (equationsMap) {
  const livePages = equationsMap.pages.filter(page => page.status === 'LIVE');
  const staleZoom = [];
  const staleRulesReferences = [];
  const missingCss = [];
  const pageLevelScreenMedia = [];

  for (const page of livePages) {
    const rel = `styles/pages/עמוד-${page.fileNum}.css`;
    if (!exists(rel)) {
      missingCss.push(rel);
      continue;
    }
    const text = read(rel);
    if (/zoom:\s*0\./.test(text)) staleZoom.push(rel);
    if (/STATE\/EQUATIONS_DESIGN_PASS_RULES\.md|PROJECT_RULES\.md/.test(text)) staleRulesReferences.push(rel);
    if (/@media\s+screen\s+and\s+\(max-width:\s*900px\)/.test(text)) pageLevelScreenMedia.push(rel);
  }

  add('all-live-equations-css-present', missingCss.length === 0, missingCss.length ? missingCss.join(', ') : `${livePages.length} files present`);
  add('no-page-level-equations-zoom', staleZoom.length === 0, staleZoom.length ? staleZoom.join(', ') : `${livePages.length} files clean`);
  add('no-stale-equations-rules-references', staleRulesReferences.length === 0, staleRulesReferences.length ? staleRulesReferences.join(', ') : `${livePages.length} files clean`);
  add('no-page-level-equations-mobile-media', pageLevelScreenMedia.length === 0, pageLevelScreenMedia.length ? pageLevelScreenMedia.join(', ') : `${livePages.length} files use shared mobile behavior only`);
}

const html = files['mobile-app.html'];
const css = files['mobile-app.css'];
const js = files['mobile-app.js'];
const indexHtml = files['index.html'];
const indexJs = files['index.js'];
const manifest = files['mobile-app.webmanifest'];
const installHtml = files['mobile-app-install.html'];
const installJs = files['mobile-app-install.js'];
const sw = files['sw.js'];

add('mobile-uses-canonical-meta', js.includes('./meta/topics.json'), 'mobile-app.js must use meta/topics.json');
add('mobile-does-not-use-mirror', !js.includes('mobile-topics.json'), 'no mobile metadata mirror');
add('topics-open-at-boot', js.includes('setTopicsPanelOpen(true)'), 'topics panel must open at boot');
add('global-search-all-pages', js.includes('flatPages.filter'), 'search must filter the global page collection');
add('topic-grid-visible', css.includes('grid-template-columns:repeat(auto-fill') || css.includes('grid-template-columns:repeat(2'), 'topics use a visible wrapping grid');
add('search-input-present', html.includes('id="globalSearch"'), 'global search input exists');
add('safe-area-support', css.includes('safe-area-inset-bottom') && css.includes('safe-area-inset-top'), 'mobile shell supports phone safe areas');
add('visual-viewport-support', js.includes('visualViewport'), 'reader reacts to the real visible viewport');
add('mathjax-refit', js.includes('MathJax') && js.includes('fonts?.ready'), 'reader refits after math and fonts load');
add('observer-refit', js.includes('ResizeObserver') && js.includes('MutationObserver'), 'reader watches late layout changes');
add('single-reader-scale', js.includes("setProperty('transform', `scale(${scale})`, 'important')") && js.includes("setProperty('zoom', '1', 'important')"), 'mobile reader owns the scale operation');
add('canonical-a4-geometry', js.includes("setProperty('width', '210mm', 'important')") && js.includes("setProperty('height', '297mm', 'important')"), 'reader enforces real A4 geometry');
add('equations-print-layout-restored', js.includes("setProperty('padding', '10mm 18mm', 'important')") && js.includes('font-size:26px !important'), 'equations retain canonical A4 layout inside the reader');
add('unscaled-print-preparation', js.includes('prepareFrameForPrint') && js.includes("setProperty('transform', 'none', 'important')") && js.includes("setProperty('height', 'auto', 'important')"), 'printing removes screen scale and viewport height constraints');
add('print-restores-reader', js.includes("addEventListener('afterprint', scheduleFit") && js.includes('setTimeout(scheduleFit, 1200)'), 'reader restores after printing');
add('phone-detection-hardening', indexJs.includes('userAgentData') && indexJs.includes('pointer: coarse') && indexJs.includes('maxTouchPoints'), 'entry detects real phones even in desktop-site mode');
add('explicit-view-overrides', indexJs.includes("view === 'mobile'") && indexJs.includes("view === 'catalog'") && indexHtml.includes('?view=mobile') && indexHtml.includes('?view=catalog'), 'manual view choice remains available');
add('pwa-no-cache-update', js.includes("updateViaCache:'none'") && installJs.includes("updateViaCache:'none'"), 'service worker update bypasses stale HTTP cache');
add('pwa-controller-refresh', js.includes('controllerchange') && js.includes('SKIP_WAITING'), 'installed app activates and reloads the new worker');
add('shared-equations-mobile-owner', equationsCss.includes('@media screen and (max-width: 900px)') && equationsCss.includes('zoom: 1 !important'), 'shared topic CSS is the only direct-page mobile owner');
add('generator-does-not-create-zoom', !/zoom:\s*0\./.test(generator), 'equations generator must not emit page zoom');
add('generator-uses-canonical-rules', generator.includes('CLAUDE.md') && !generator.includes('STATE/EQUATIONS_DESIGN_PASS_RULES.md'), 'generator references only the canonical rules source');

const releaseFiles = {
  'index.html': indexHtml,
  'index.js': indexJs,
  'mobile-app.html': html,
  'mobile-app.js': js,
  'mobile-app.webmanifest': manifest,
  'mobile-app-install.html': installHtml,
  'mobile-app-install.js': installJs,
  'sw.js': sw
};
for (const [name, text] of Object.entries(releaseFiles)) {
  add(`release-token:${name}`, text.includes(releaseToken), `${name} must reference ${releaseToken}`);
  add(`no-stale-release:${name}`, !text.includes('20260710002'), `${name} must not reference the previous mobile release`);
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
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
  };
  return map[ext] || 'application/octet-stream';
}

async function startProductionServer(distDir) {
  return await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === '/') pathname = '/index.html';
        const filePath = path.resolve(distDir, `.${pathname}`);
        if (!filePath.startsWith(distDir)) {
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

async function runBrowserAudit() {
  const distDir = path.join(root, 'dist');
  if (!exists('dist/index.html')) {
    add('browser-production-build-present', false, 'dist/index.html missing; run npm run build before browser audit');
    return;
  }
  add('browser-production-build-present', true, 'testing the built dist artifact');

  let server = null;
  let browser = null;
  try {
    const { chromium } = await import('playwright');
    const started = await startProductionServer(distDir);
    server = started.server;
    browser = await chromium.launch({ headless: true });

    const pageErrors = [];
    const failedResponses = [];
    const phoneContext = await browser.newContext({
      viewport: { width: 412, height: 915 },
      screen: { width: 412, height: 915 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      locale: 'he-IL',
      userAgent: 'Mozilla/5.0 (Linux; Android 16; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
      serviceWorkers: 'block'
    });
    const phonePage = await phoneContext.newPage();
    phonePage.on('pageerror', error => pageErrors.push(error.message));
    phonePage.on('response', response => {
      if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) {
        failedResponses.push(`${response.status()} ${response.url()}`);
      }
    });

    await phonePage.goto(`${started.origin}/?view=mobile`, { waitUntil: 'networkidle' });
    await phonePage.waitForURL(/mobile-app\.html/, { timeout: 10000 });
    await phonePage.locator('.topic-btn').first().waitFor({ state: 'visible', timeout: 10000 });

    const topicState = await phonePage.locator('.topic-btn').evaluateAll(buttons => ({
      count: buttons.length,
      hidden: buttons.filter(button => {
        const style = getComputedStyle(button);
        const rect = button.getBoundingClientRect();
        return style.display === 'none' || style.visibility === 'hidden' || rect.width <= 0 || rect.height <= 0;
      }).length
    }));
    const expectedTopics = meta?.topics?.length || 0;
    add('browser-all-topics-rendered', topicState.count === expectedTopics, `rendered=${topicState.count}; expected=${expectedTopics}`);
    add('browser-all-topics-discoverable', topicState.hidden === 0, `hidden=${topicState.hidden}`);

    const appMetaText = (await phonePage.locator('#appMeta').textContent()) || '';
    add('browser-all-pages-declared', appMetaText.includes(String(meta?.totalPages || 98)), appMetaText.trim());

    const initialLayout = await phonePage.evaluate(() => {
      const root = document.documentElement;
      const strip = document.querySelector('.topic-strip');
      return {
        horizontalOverflow: Math.max(root.scrollWidth, document.body.scrollWidth) - window.innerWidth,
        topicStripOverflow: strip ? strip.scrollWidth - strip.clientWidth : 999
      };
    });
    add('browser-no-horizontal-overflow-portrait', initialLayout.horizontalOverflow <= 1, `overflow=${initialLayout.horizontalOverflow}px`);
    add('browser-topic-grid-does-not-scroll-sideways', initialLayout.topicStripOverflow <= 1, `overflow=${initialLayout.topicStripOverflow}px`);

    await phonePage.locator('#globalSearch').fill('עמוד-48.html');
    const pageEightCard = phonePage.locator('.page-card[data-file="עמוד-48.html"]');
    await pageEightCard.waitFor({ state: 'visible', timeout: 10000 });
    add('browser-global-search-finds-equations-page-8', await pageEightCard.count() === 1, 'עמוד-48.html found through global search');
    await pageEightCard.click();

    await phonePage.waitForFunction(() => {
      const frame = document.querySelector('#mobilePageFrame');
      return frame?.contentDocument?.readyState === 'complete' && Boolean(frame.contentDocument.querySelector('.a4-page'));
    }, null, { timeout: 15000 });
    await phonePage.waitForTimeout(1700);

    const readerState = await phonePage.evaluate(() => {
      const frame = document.querySelector('#mobilePageFrame');
      const doc = frame?.contentDocument;
      const a4 = doc?.querySelector('.a4-page');
      if (!frame || !doc || !a4) return null;
      const rect = a4.getBoundingClientRect();
      return {
        frameWidth: frame.clientWidth,
        frameHeight: frame.clientHeight,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        ratio: rect.height / rect.width,
        offsetWidth: a4.offsetWidth,
        offsetHeight: a4.offsetHeight,
        transform: a4.style.transform,
        equationCount: doc.querySelectorAll('.problem-equation').length,
        rasterCount: doc.querySelectorAll('.pdf-page').length,
        frameOverflow: Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth) - frame.clientWidth
      };
    });

    const fitsFrame = Boolean(readerState)
      && readerState.left >= -2
      && readerState.top >= -2
      && readerState.right <= readerState.frameWidth + 2
      && readerState.bottom <= readerState.frameHeight + 2;
    add('browser-equations-page-8-fits-reader', fitsFrame, JSON.stringify(readerState));
    add('browser-equations-page-8-a4-ratio', Boolean(readerState) && Math.abs(readerState.ratio - (297 / 210)) < 0.03, `ratio=${readerState?.ratio}`);
    add('browser-equations-page-8-live-math', readerState?.equationCount === 10 && readerState?.rasterCount === 0, `equations=${readerState?.equationCount}; raster=${readerState?.rasterCount}`);
    add('browser-reader-owns-one-scale', Boolean(readerState?.transform?.startsWith('scale(')), `transform=${readerState?.transform}`);
    add('browser-iframe-no-horizontal-overflow', Boolean(readerState) && readerState.frameOverflow <= 2, `overflow=${readerState?.frameOverflow}px`);

    await phonePage.evaluate(() => {
      const frame = document.querySelector('#mobilePageFrame');
      frame?.contentWindow?.dispatchEvent(new Event('beforeprint'));
    });
    const printState = await phonePage.evaluate(() => {
      const frame = document.querySelector('#mobilePageFrame');
      const doc = frame?.contentDocument;
      const a4 = doc?.querySelector('.a4-page');
      return a4 && doc ? {
        transform: a4.style.transform,
        bodyHeight: doc.body.style.height,
        bodyOverflow: doc.body.style.overflow,
        bodyDisplay: doc.body.style.display
      } : null;
    });
    add('browser-print-removes-screen-scale', printState?.transform === 'none', JSON.stringify(printState));
    add('browser-print-removes-viewport-clipping', printState?.bodyHeight === 'auto' && printState?.bodyOverflow === 'visible' && printState?.bodyDisplay === 'block', JSON.stringify(printState));
    await phonePage.evaluate(() => {
      const frame = document.querySelector('#mobilePageFrame');
      frame?.contentWindow?.dispatchEvent(new Event('afterprint'));
    });

    await phonePage.setViewportSize({ width: 915, height: 412 });
    await phonePage.waitForTimeout(1700);
    const landscapeState = await phonePage.evaluate(() => {
      const frame = document.querySelector('#mobilePageFrame');
      const doc = frame?.contentDocument;
      const a4 = doc?.querySelector('.a4-page');
      const rect = a4?.getBoundingClientRect();
      return {
        documentOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
        frameWidth: frame?.clientWidth || 0,
        frameHeight: frame?.clientHeight || 0,
        right: rect?.right || 9999,
        bottom: rect?.bottom || 9999
      };
    });
    add('browser-no-horizontal-overflow-landscape', landscapeState.documentOverflow <= 1, `overflow=${landscapeState.documentOverflow}px`);
    add('browser-a4-fits-landscape-reader', landscapeState.right <= landscapeState.frameWidth + 2 && landscapeState.bottom <= landscapeState.frameHeight + 2, JSON.stringify(landscapeState));

    add('browser-no-page-errors', pageErrors.length === 0, pageErrors.length ? pageErrors.join(' | ') : 'none');
    add('browser-no-failed-assets', failedResponses.length === 0, failedResponses.length ? failedResponses.join(' | ') : 'none');
    await phoneContext.close();

    const desktopSiteContext = await browser.newContext({
      viewport: { width: 980, height: 700 },
      screen: { width: 412, height: 915 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: true,
      locale: 'he-IL',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      serviceWorkers: 'block'
    });
    const desktopSitePage = await desktopSiteContext.newPage();
    await desktopSitePage.goto(`${started.origin}/`, { waitUntil: 'domcontentloaded' });
    await desktopSitePage.waitForURL(/mobile-app\.html/, { timeout: 10000 });
    add('browser-phone-detected-in-desktop-site-mode', /mobile-app\.html/.test(desktopSitePage.url()), desktopSitePage.url());

    await desktopSitePage.goto(`${started.origin}/?view=catalog`, { waitUntil: 'domcontentloaded' });
    await desktopSitePage.waitForURL(/catalog\.html/, { timeout: 10000 });
    add('browser-explicit-catalog-override-works', /catalog\.html/.test(desktopSitePage.url()), desktopSitePage.url());
    await desktopSiteContext.close();
  } catch (error) {
    add('browser-audit-execution', false, error?.stack || error?.message || String(error));
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server) await new Promise(resolve => server.close(resolve));
  }
}

if (browserMode) await runBrowserAudit();

const failed = checks.filter(check => !check.ok);
const report = {
  generatedAt: new Date().toISOString(),
  releaseToken,
  browserMode,
  status: failed.length ? 'fail' : 'pass',
  checks
};

fs.mkdirSync(path.join(root, 'meta', 'audit'), { recursive: true });
fs.writeFileSync(path.join(root, 'meta', 'audit', browserMode ? 'mobile-browser-validation.json' : 'mobile-runtime-validation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
