import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const htmlPath = path.join(root, 'עמוד-95.html');
const pageCssPath = path.join(root, 'styles/pages/עמוד-95.css');
const sharedCssPath = path.join(root, 'styles/topics/equations.css');
const svgPath = path.join(root, 'pages/משוואות/assets/page-01.svg');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

for (const file of [htmlPath, pageCssPath, sharedCssPath, svgPath]) {
  check(fs.existsSync(file), `Missing required pilot file: ${path.relative(root, file)}`);
}

if (!failures.length) {
  const html = read(htmlPath);
  const pageCss = read(pageCssPath);
  const sharedCss = read(sharedCssPath);
  const svg = read(svgPath);

  check(html.includes('<html lang="he" dir="rtl">'), 'Pilot page must preserve Hebrew RTL root.');
  check(html.includes('href="styles/a4-base.css"'), 'Pilot page must keep a4-base.css.');
  check(html.includes('href="styles/topics/equations.css"'), 'Pilot page must load shared equations CSS.');
  check(html.includes('href="styles/pages/עמוד-95.css"'), 'Pilot page must keep page-local CSS.');
  check(html.includes('main class="a4-page page-95 equations-page"'), 'Pilot page must use main.a4-page.page-95.equations-page.');
  check(html.includes('משוואות — עמוד 1 / 54'), 'Pilot page nav-meta must show exact topic-local numbering.');
  check(html.includes('<div class="page-number">1</div>'), 'Pilot page badge must be topic-local page 1.');
  check(html.includes('aria-current="page">משוואות</a>'), 'Pilot page must mark equations as active topic.');
  check(html.includes('תחילת הנושא'), 'Pilot page 1 should not link backward into another topic.');
  check(html.includes('href="עמוד-42.html">הבא</a>'), 'Pilot page 1 next link must go to topic-local page 2.');
  check(html.includes('src="pages/משוואות/assets/page-01.svg"'), 'Pilot page must keep exact SVG asset.');
  check(!html.includes('משוואות ריבועיות'), 'Pilot page must not reference quadratic equations.');
  check(!/<style\b/i.test(html), 'Pilot page must not contain inline style blocks.');
  check(!/\sstyle\s*=/.test(html), 'Pilot page must not contain style attributes.');
  check(!/דמו|demo|placeholder/i.test(html), 'Pilot page must not contain demo/placeholder text.');

  check(sharedCss.includes('var(--border-light)'), 'Shared equations CSS must use project border token.');
  check(sharedCss.includes('var(--grid-line)'), 'Shared equations CSS must use project grid token.');
  check(sharedCss.includes('var(--bg-paper)'), 'Shared equations CSS must use project paper token.');
  check(sharedCss.includes('var(--bg-subtle)'), 'Shared equations CSS must use project subtle background token.');
  check(sharedCss.includes('var(--title-blue)'), 'Shared equations CSS must use project title blue token.');
  check(sharedCss.includes('var(--text-main)'), 'Shared equations CSS must use project text token.');
  check(sharedCss.includes('vector-effect: non-scaling-stroke'), 'Shared equations CSS must enforce non-scaling SVG strokes.');
  check(!/^\.header-container\s*\{/m.test(sharedCss), 'Shared equations CSS must not override global header-container.');
  check(!/^\.page-number\s*\{/m.test(sharedCss), 'Shared equations CSS must not override global page-number.');
  check(!/^\.page-title\s*\{/m.test(sharedCss), 'Shared equations CSS must not override global page-title.');

  check(pageCss.includes('EQUATIONS_DESIGN_PASS_20260429'), 'Pilot page CSS must keep the equations design marker.');
  check(pageCss.includes('.page-95.equations-page'), 'Pilot page CSS must scope only to page-95.equations-page.');
  check(!/^\.header-container\s*\{/m.test(pageCss), 'Pilot page CSS must not override global header-container.');
  check(!/^\.page-number\s*\{/m.test(pageCss), 'Pilot page CSS must not override global page-number.');
  check(!/^body,html,\.a4-page\s*\{/m.test(pageCss), 'Pilot page CSS must not override global body/html/a4-page.');

  check(svg.includes('<svg'), 'Pilot SVG must be a real SVG asset.');
  check(svg.includes('EQUATIONS_SVG_FONT_UNIFY'), 'Pilot SVG must contain the equations SVG font-unify marker.');
}

if (failures.length) {
  console.error('VALIDATE_EQUATIONS_PILOT_PAGE_1_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('VALIDATE_EQUATIONS_PILOT_PAGE_1_OK');
console.log('page=עמוד-95.html');
console.log('topic=משוואות');
console.log('quadratic_equations_touched=0');
console.log('status=pilot-shell-ready-visual-check-required');
