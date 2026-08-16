import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function fail(message) {
  console.error(`VERIFY FAIL: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function isPythagorasFoundationPage(n) {
  const page = Number(n);
  return Number.isInteger(page) && page >= 617 && page <= 633;
}

const pageFiles = fs.readdirSync(root).filter(name => /^עמוד-\d+\.html$/.test(name));
if (pageFiles.length === 0) fail('No canonical root pages found');

if (!fs.existsSync(path.join(root, 'styles', 'a4-base.css'))) {
  fail('Missing styles/a4-base.css');
}

if (!fs.existsSync(path.join(root, 'preview', 'index.html'))) {
  fail('Missing preview/index.html');
}

for (const file of pageFiles) {
  const full = path.join(root, file);
  const html = fs.readFileSync(full, 'utf8');
  const n = file.match(/^עמוד-(\d+)\.html$/)?.[1];

  if (!html.includes(`page-${n}`)) fail(`${file}: missing page-${n} class`);
  if (!html.includes('styles/a4-base.css')) fail(`${file}: missing styles/a4-base.css`);

  const hasPageCss = html.includes(`styles/pages/עמוד-${n}.css`);
  const hasCanonicalPythagorasFoundationCss =
    isPythagorasFoundationPage(n) && html.includes('styles/topics/pythagoras-foundations.css');
  if (!hasPageCss && !hasCanonicalPythagorasFoundationCss) {
    fail(`${file}: missing styles/pages/עמוד-${n}.css or approved canonical Pythagoras foundation topic CSS`);
  }

  if (/\sstyle\s*=\s*["']/.test(html)) fail(`${file}: inline CSS is forbidden`);
}

ok('Canonical contracts passed');