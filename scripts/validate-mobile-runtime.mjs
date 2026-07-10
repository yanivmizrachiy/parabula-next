import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const checks = [];
const add = (name, ok, details) => checks.push({ name, ok, details });

const required = [
  'mobile-app.html',
  'mobile-app.css',
  'mobile-app.js',
  'mobile-app.webmanifest',
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
let html = '';
let css = '';
let js = '';
let equationsCss = '';
let generator = '';
try { meta = JSON.parse(read('meta/topics.json')); } catch (error) { add('meta-valid', false, error.message); }
try { html = read('mobile-app.html'); } catch {}
try { css = read('mobile-app.css'); } catch {}
try { js = read('mobile-app.js'); } catch {}
try { equationsCss = read('styles/topics/equations.css'); } catch {}
try { generator = read('scripts/build-equations-pages.mjs'); } catch {}

if (meta) {
  const flat = (meta.topics || []).flatMap((topic) => topic.pages || []);
  add('canonical-topic-count', (meta.topics || []).length === 8, `topics=${(meta.topics || []).length}`);
  add('canonical-page-count', flat.length === meta.totalPages && flat.length === 98, `pages=${flat.length}; declared=${meta.totalPages}`);
}

add('mobile-uses-canonical-meta', js.includes("./meta/topics.json"), 'mobile-app.js must use meta/topics.json');
add('mobile-does-not-use-mirror', !js.includes('mobile-topics.json'), 'no mobile metadata mirror');
add('topics-open-at-boot', js.includes('setTopicsPanelOpen(true)'), 'topics panel must open at boot');
add('global-search-all-pages', js.includes('flatPages.filter'), 'search must filter the global page collection');
add('topic-grid-visible', css.includes('grid-template-columns:repeat(auto-fill'), 'topics use a visible wrapping grid');
add('search-input-present', html.includes('id="globalSearch"'), 'global search input exists');
add('single-reader-scale', js.includes('zoom:1 !important') && js.includes('width:210mm !important') && js.includes('transform = `scale(${scale})`'), 'mobile reader owns the only scale operation');
add('shared-equations-neutralizes-page-zoom', equationsCss.includes('zoom: 1 !important'), 'shared equations layer neutralizes stale page zoom');
add('generator-does-not-create-zoom', !/zoom:\s*0\./.test(generator), 'equations generator must not emit page zoom');

const failed = checks.filter((check) => !check.ok);
const report = {
  generatedAt: new Date().toISOString(),
  status: failed.length ? 'fail' : 'pass',
  checks
};

fs.mkdirSync(path.join(root, 'meta', 'audit'), { recursive: true });
fs.writeFileSync(path.join(root, 'meta', 'audit', 'mobile-runtime-validation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
