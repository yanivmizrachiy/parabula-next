import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'meta', 'workbooks', 'pythagoras.json');
const topicsPath = path.join(root, 'meta', 'topics.json');
const errors = [];

const fail = (message) => errors.push(message);
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

if (!fs.existsSync(manifestPath)) {
  console.error('PYTHAGORAS_WORKBOOK_INVALID\n- חסר meta/workbooks/pythagoras.json');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const meta = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
const pages = manifest.pages ?? [];

if (manifest.id !== 'pythagoras') fail('manifest.id חייב להיות pythagoras');
if (manifest.name !== 'משפט פיתגורס') fail('שם החוברת חייב להיות משפט פיתגורס');
if (!Array.isArray(pages) || pages.length === 0) fail('רשימת דפי החוברת ריקה');
if (pages.some((n) => !Number.isInteger(n) || n <= 0)) fail('כל מזהה דף במניפסט חייב להיות מספר שלם חיובי');
if (new Set(pages).size !== pages.length) fail('המניפסט מכיל דף כפול');

const flatTopic = meta.topics.find((topic) => topic.name === 'משפט פיתגורס');
if (!flatTopic) fail('הנושא משפט פיתגורס חסר ב-meta/topics.json');

function findNode(nodes, id) {
  for (const node of nodes ?? []) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

const curriculumNode = findNode(meta.curriculum?.nodes, 'g7.geo.pythagoras');
if (!curriculumNode) fail('הצומת g7.geo.pythagoras חסר בעץ תכנית הלימודים');

const knownPythagorasPages = new Set([
  ...(flatTopic?.pages ?? []).map((page) => page.number),
  ...(curriculumNode?.pages ?? []),
]);
const manifestSet = new Set(pages);
const missing = [...knownPythagorasPages].filter((number) => !manifestSet.has(number)).sort((a, b) => a - b);
const unknown = pages.filter((number) => !knownPythagorasPages.has(number));
if (missing.length) fail(`דפי פיתגורס ידועים שחסרים בחוברת: ${missing.join(', ')}`);
if (unknown.length) fail(`דפים במניפסט שאינם מזוהים כפיתגורס במטא/תכנית: ${unknown.join(', ')}`);

const foundationFlags = [];
for (const [index, number] of pages.entries()) {
  const htmlFile = `עמוד-${number}.html`;
  const cssFile = `styles/pages/עמוד-${number}.css`;
  if (!fs.existsSync(path.join(root, htmlFile))) {
    fail(`עמוד ${index + 1}: חסר ${htmlFile}`);
    foundationFlags.push(false);
    continue;
  }
  if (!fs.existsSync(path.join(root, cssFile))) {
    fail(`עמוד ${index + 1}: חסר ${cssFile}`);
    foundationFlags.push(false);
    continue;
  }

  const html = read(htmlFile);
  const css = read(cssFile);
  foundationFlags.push(css.includes('pythagoras-foundations.css'));

  if (!/vendor\/fonts\/rubik\.css/u.test(html)) fail(`${htmlFile}: חסר גופן Rubik מקומי`);
  if (!/vendor\/mathjax\/tex-mml-chtml\.js/u.test(html)) fail(`${htmlFile}: חסר MathJax מקומי`);
  if (!/vendor\/mathjax\/tex-font\/chtml\/woff2/u.test(html)) fail(`${htmlFile}: MathJax אינו מצביע לגופני TeX המקומיים`);
  if (!/styles\/a4-base\.css/u.test(html)) fail(`${htmlFile}: חסר styles/a4-base.css`);
  if (!html.includes(`styles/pages/עמוד-${number}.css`)) fail(`${htmlFile}: אינו טוען את ה-CSS הקנוני של עצמו`);
  if (!/<html\s+[^>]*dir="rtl"/u.test(html)) fail(`${htmlFile}: חסר dir=rtl`);
  if (!/<main\s+class="[^"]*a4-page/u.test(html)) fail(`${htmlFile}: חסר main.a4-page`);

  const hasPythagorasLayer = /pythagoras(?:-foundations)?\.css/u.test(css);
  if (!hasPythagorasLayer) fail(`${cssFile}: אינו מחובר לשכבת פיתגורס המשותפת`);
}

/* כל דפי היסוד הם מקטע רציף ראשון בחוברת; אין דף יסוד שמופיע אחרי חומר מתקדם. */
let sawNonFoundation = false;
for (let i = 0; i < foundationFlags.length; i += 1) {
  if (!foundationFlags[i]) sawNonFoundation = true;
  else if (sawNonFoundation) fail(`עמוד חוברת ${i + 1}: דף יסוד מופיע אחרי תחילת החומר שאינו יסודות`);
}
if (!foundationFlags[0]) fail('החוברת חייבת להתחיל בדפי היסוד החדשים');

for (const required of [
  'pythagoras-workbook.html',
  'pythagoras-workbook.js',
  'styles/pythagoras-workbook.css',
  'styles/topics/pythagoras.css',
]) {
  if (!fs.existsSync(path.join(root, required))) fail(`חסר רכיב חוברת: ${required}`);
}

const reader = fs.existsSync(path.join(root, 'pythagoras-workbook.js')) ? read('pythagoras-workbook.js') : '';
for (const signal of ['DOMParser', 'namespaceSvgIds', 'ResizeObserver', 'MathJax.typesetPromise', 'data-workbook-page']) {
  if (!reader.includes(signal)) fail(`קורא החוברת חסר מנגנון: ${signal}`);
}

if (errors.length) {
  console.error('PYTHAGORAS_WORKBOOK_INVALID');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const foundationCount = foundationFlags.filter(Boolean).length;
console.log(`PYTHAGORAS_WORKBOOK_OK pages=${pages.length} foundations=${foundationCount} source=meta/workbooks/pythagoras.json`);
