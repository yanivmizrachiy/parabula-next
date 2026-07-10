import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const checks = [];
const add = (name, ok, details) => checks.push({ name, ok, details });
const releaseToken = '20260710003';

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
  'meta/topics.json'
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
  'preview/install.html'
];
for (const rel of forbiddenLegacy) add(`legacy-absent:${rel}`, !exists(rel), exists(rel) ? 'must be removed' : 'absent');

let meta = null;
const files = {};
for (const rel of required.filter(rel => rel !== 'meta/topics.json')) {
  try { files[rel] = read(rel); } catch { files[rel] = ''; }
}
try { meta = JSON.parse(read('meta/topics.json')); } catch (error) { add('meta-valid', false, error.message); }

let equationsCss = '';
let generator = '';
try { equationsCss = read('styles/topics/equations.css'); } catch {}
try { generator = read('scripts/build-equations-pages.mjs'); } catch {}

if (meta) {
  const flat = (meta.topics || []).flatMap(topic => topic.pages || []);
  add('canonical-topic-count', (meta.topics || []).length === 8, `topics=${(meta.topics || []).length}`);
  add('canonical-page-count', flat.length === meta.totalPages && flat.length === 98, `pages=${flat.length}; declared=${meta.totalPages}`);
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
add('equations-print-layout-restored', js.includes("setProperty('padding', '10mm 18mm', 'important')") && js.includes('font-size:26px !important'), 'equations mobile media rules are neutralized inside the A4 reader');
add('unscaled-print-preparation', js.includes('prepareFrameForPrint') && js.includes("setProperty('transform', 'none', 'important')") && js.includes("setProperty('height', 'auto', 'important')"), 'printing removes screen scale and viewport height constraints');
add('print-restores-reader', js.includes("addEventListener('afterprint', scheduleFit") && js.includes('setTimeout(scheduleFit, 1200)'), 'reader restores after printing');
add('phone-detection-hardening', indexJs.includes('userAgentData') && indexJs.includes('pointer: coarse') && indexJs.includes('maxTouchPoints'), 'entry detects real phones even in desktop-site mode');
add('explicit-view-overrides', indexJs.includes("view === 'mobile'") && indexJs.includes("view === 'catalog'") && indexHtml.includes('?view=mobile') && indexHtml.includes('?view=catalog'), 'manual view choice remains available');
add('pwa-no-cache-update', js.includes("updateViaCache:'none'") && installJs.includes("updateViaCache:'none'"), 'service worker update bypasses stale HTTP cache');
add('pwa-controller-refresh', js.includes('controllerchange') && js.includes('SKIP_WAITING'), 'installed app activates and reloads the new worker');
add('shared-equations-neutralizes-page-zoom', equationsCss.includes('zoom: 1 !important'), 'shared equations layer neutralizes stale page zoom');
add('generator-does-not-create-zoom', !/zoom:\s*0\./.test(generator), 'equations generator must not emit page zoom');

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

const failed = checks.filter(check => !check.ok);
const report = {
  generatedAt: new Date().toISOString(),
  releaseToken,
  status: failed.length ? 'fail' : 'pass',
  checks
};

fs.mkdirSync(path.join(root, 'meta', 'audit'), { recursive: true });
fs.writeFileSync(path.join(root, 'meta', 'audit', 'mobile-runtime-validation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
