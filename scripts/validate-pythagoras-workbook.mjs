import fs from 'node:fs';
import path from 'node:path';
import { buildPythagorasWorkbook } from '../pythagoras-workbook-model.js';

const root = process.cwd();
const topicsPath = path.join(root, 'meta', 'topics.json');
const errors = [];

const fail = (message) => errors.push(message);
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

function readCssGraph(relative, seen = new Set()) {
  const normalized = relative.replaceAll('\\', '/');
  if (seen.has(normalized)) return '';
  seen.add(normalized);
  const absolute = path.join(root, normalized);
  if (!fs.existsSync(absolute)) return '';
  const text = fs.readFileSync(absolute, 'utf8');
  let combined = `\n/* ${normalized} */\n${text}`;
  const importRe = /@import\s+url\(["']?([^"')]+)["']?\)\s*;/gu;
  for (const match of text.matchAll(importRe)) {
    const imported = path.posix.normalize(path.posix.join(path.posix.dirname(normalized), match[1]));
    combined += readCssGraph(imported, seen);
  }
  return combined;
}

const meta = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
let workbook;
try {
  workbook = buildPythagorasWorkbook(meta);
} catch (error) {
  fail(error.message);
  workbook = { pages: [] };
}
const pages = workbook.pages ?? [];
if (!pages.length) fail('חוברת פיתגורס ריקה');

/* אין מקור מטא־דאטה שני לחוברת: כל הסדר והחברות נגזרים מ-meta/topics.json בלבד. */
if (fs.existsSync(path.join(root, 'meta', 'workbooks', 'pythagoras.json'))) {
  fail('אסור meta/workbooks/pythagoras.json — מקור המטא־דאטה היחיד הוא meta/topics.json');
}

const foundationFlags = [];
for (const page of pages) {
  const index = page.workbookNumber - 1;
  const number = page.sourceNumber;
  const htmlFile = page.file || `עמוד-${number}.html`;
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
  const cssGraph = readCssGraph(cssFile);
  const usesFoundationLayer = cssGraph.includes('pythagoras-foundations.css');
  const isCurriculumApplication = /class="[^"]*\bpyt-curriculum\b/u.test(html);
  foundationFlags.push(usesFoundationLayer && !isCurriculumApplication);

  if (!/vendor\/fonts\/rubik\.css/u.test(html)) fail(`${htmlFile}: חסר גופן Rubik מקומי`);
  if (!/vendor\/mathjax\/tex-mml-chtml\.js/u.test(html)) fail(`${htmlFile}: חסר MathJax מקומי`);
  if (!/vendor\/mathjax\/tex-font\/chtml\/woff2/u.test(html)) fail(`${htmlFile}: MathJax אינו מצביע לגופני TeX המקומיים`);
  if (!/styles\/a4-base\.css/u.test(html)) fail(`${htmlFile}: חסר styles/a4-base.css`);
  if (!html.includes(`styles/pages/עמוד-${number}.css`)) fail(`${htmlFile}: אינו טוען את ה-CSS הקנוני של עצמו`);
  if (!/<html\s+[^>]*dir="rtl"/u.test(html)) fail(`${htmlFile}: חסר dir=rtl`);
  if (!/<main\s+class="[^"]*a4-page/u.test(html)) fail(`${htmlFile}: חסר main.a4-page`);
  if (!cssGraph.includes('pythagoras.css')) fail(`${cssFile}: שרשרת ה-CSS אינה מגיעה ל-styles/topics/pythagoras.css`);
}

/* מדיניות MathJax/שרטוטים היא כלל רוחבי של כל הפרויקט ונאכפת רק דרך
   scripts/validate-math-rendering.mjs. אין לשכפל כאן איסורים מקומיים. */

/* דפי היסוד האמיתיים הם מקטע רציף ראשון. דפי תוכנית הלימודים רשאים להשתמש
   באותה שכבת CSS מאוחר יותר בלי להפוך שוב ל"יסודות". */
let sawNonFoundation = false;
for (let i = 0; i < foundationFlags.length; i += 1) {
  if (!foundationFlags[i]) sawNonFoundation = true;
  else if (sawNonFoundation) fail(`עמוד חוברת ${i + 1}: דף יסוד מופיע אחרי תחילת החומר שאינו יסודות`);
}
if (!foundationFlags[0]) fail('החוברת חייבת להתחיל בדפי היסוד החדשים');

for (const required of [
  'pythagoras-workbook.html',
  'pythagoras-workbook.js',
  'pythagoras-workbook-model.js',
  'styles/pythagoras-workbook.css',
  'styles/topics/pythagoras.css',
]) {
  if (!fs.existsSync(path.join(root, required))) fail(`חסר רכיב חוברת: ${required}`);
}

const reader = fs.existsSync(path.join(root, 'pythagoras-workbook.js')) ? read('pythagoras-workbook.js') : '';
for (const signal of ['buildPythagorasWorkbook', 'DOMParser', 'namespaceSvgIds', 'ResizeObserver', 'MathJax.typesetPromise', 'dataset.workbookPage']) {
  if (!reader.includes(signal)) fail(`קורא החוברת חסר מנגנון: ${signal}`);
}
if (!reader.includes("const META_URL = 'meta/topics.json'")) fail('קורא החוברת חייב לקרוא meta/topics.json ישירות');

if (errors.length) {
  console.error('PYTHAGORAS_WORKBOOK_INVALID');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const foundationCount = foundationFlags.filter(Boolean).length;
console.log(`PYTHAGORAS_WORKBOOK_OK pages=${pages.length} primary=${workbook.primaryCount} additional=${workbook.additionalCount} foundations=${foundationCount} source=meta/topics.json`);
