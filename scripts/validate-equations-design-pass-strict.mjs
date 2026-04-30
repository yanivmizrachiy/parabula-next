import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta/topics.json'), 'utf8'));
const topic = meta.topics.find((entry) => entry.name === 'משוואות');
const failures = [];
const marker = '/* EQUATIONS_DESIGN_PASS_20260429 */';

function fail(message) {
  failures.push(message);
}

function localIndex(page) {
  const match = String(page.title || '').match(/עמוד\s+(\d+)/);
  return match ? Number(match[1]) : Number(page.number || 0);
}

function cssPath(page) {
  return `styles/pages/${page.file.replace(/\.html$/, '.css')}`;
}

function pageClass(page) {
  const match = String(page.file || '').match(/עמוד-(\d+)\.html$/);
  return match ? `page-${match[1]}` : '';
}

if (!topic) fail('Missing exact topic: משוואות');
if (topic?.pages?.length !== 54) fail(`Expected 54 equations pages, got ${topic?.pages?.length ?? 0}`);

const pages = (topic?.pages || []).slice().sort((a, b) => localIndex(a) - localIndex(b));

for (const page of pages) {
  if (page.topic !== 'משוואות') fail(`${page.file} is not assigned to exact topic משוואות`);
  if (page.topic === 'משוואות ריבועיות') fail(`${page.file} incorrectly belongs to quadratic equations`);

  const rel = cssPath(page);
  const abs = path.join(root, rel);
  const cls = pageClass(page);
  if (!fs.existsSync(abs)) {
    fail(`Missing CSS file: ${rel}`);
    continue;
  }

  const css = fs.readFileSync(abs, 'utf8');
  if (!css.includes(marker)) fail(`${rel} is missing design-pass marker`);
  if (!css.includes(`.${cls} {`)) fail(`${rel} is missing scoped root .${cls}`);
  if (!css.includes(`.${cls} .question-block`)) fail(`${rel} does not scope question-block to .${cls}`);
  if (!css.includes(`.${cls} .pdf-wrap`)) fail(`${rel} does not scope pdf-wrap to .${cls}`);
  if (!css.includes(`.${cls} .pdf-page`)) fail(`${rel} does not scope pdf-page to .${cls}`);
  if (/^\.header-container\s*\{/m.test(css)) fail(`${rel} contains forbidden global .header-container override`);
  if (/^\.page-title\s*\{/m.test(css)) fail(`${rel} contains forbidden global .page-title override`);
  if (/^body,html,\.a4-page\s*\{/m.test(css)) fail(`${rel} contains forbidden global body/html/.a4-page override`);
  if (/EQUATIONS_STRICT_UNIFY/.test(css)) fail(`${rel} still contains legacy EQUATIONS_STRICT_UNIFY`);
}

if (failures.length) {
  console.error('VALIDATE_EQUATIONS_DESIGN_PASS_STRICT_FAILED');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log('VALIDATE_EQUATIONS_DESIGN_PASS_STRICT_OK');
console.log(`checked_css_files=${pages.length}`);
console.log('quadratic_equations_touched=0');
