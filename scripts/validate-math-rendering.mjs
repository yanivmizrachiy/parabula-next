import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const archiveDirectoryNames = new Set(['source', 'sources']);
const rootPagePattern = /^עמוד-\d+\.html$/u;

const fail = (file, message) => errors.push(`${file}: ${message}`);
const toRepoPath = (absolutePath) => path.relative(root, absolutePath).split(path.sep).join('/');

function collectHtmlFiles(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (archiveDirectoryNames.has(entry.name.toLowerCase())) continue;
      files.push(...collectHtmlFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && /\.html$/iu.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files;
}

function collectCanonicalPages() {
  const canonicalPages = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && rootPagePattern.test(entry.name))
    .map((entry) => path.join(root, entry.name));

  const workbooksRoot = path.join(root, 'workbooks');
  if (fs.existsSync(workbooksRoot)) {
    canonicalPages.push(...collectHtmlFiles(workbooksRoot));
  }

  return [...new Set(canonicalPages)].sort((a, b) =>
    toRepoPath(a).localeCompare(toRepoPath(b), 'he', { numeric: true }),
  );
}

function getVisibleNonMathText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/giu, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/giu, ' ')
    .replace(/\\\([\s\S]*?\\\)/gu, ' ')
    .replace(/\$\$[\s\S]*?\$\$/gu, ' ')
    .replace(/<[^>]+>/gu, ' ');
}

const pages = collectCanonicalPages();

for (const absolutePath of pages) {
  const file = toRepoPath(absolutePath);
  const html = fs.readFileSync(absolutePath, 'utf8');
  const hasMathJaxConfig = /\bMathJax\b/u.test(html);
  const hasTexMarkup = /\\\(|\$\$/u.test(html);
  const usesMath = hasMathJaxConfig || hasTexMarkup;
  const visibleNonMathText = getVisibleNonMathText(html);

  if (/<canvas\b/iu.test(html)) {
    fail(file, 'Canvas אסור בדף A4 קנוני; שרטוט מתמטי חדש חייב להיות וקטורי וניתן להדפסה');
  }

  if (/<(?:object|embed)\b/iu.test(html)) {
    fail(file, 'object/embed אסורים בחומר קנוני; שרטוט מתמטי חייב להיות HTML/SVG וקטורי מקומי');
  }

  if (/\bkatex\b/iu.test(html)) {
    fail(file, 'KaTeX אסור בדף קנוני; מנוע הרינדור המתמטי היחיד הוא MathJax המקומי');
  }

  if (/https?:\/\/[^"'\s>]*(?:mathjax|mathjax-tex-font)/iu.test(html)) {
    fail(file, 'MathJax וגופני TeX חייבים להיות self-hosted מתוך vendor/ ולא להיטען מהרשת');
  }

  if (/class=["'][^"']*\b(?:root-symbol|root-radicand)\b[^"']*["']/iu.test(html)) {
    fail(file, 'אסור לבנות סימן שורש ידנית מתווים/CSS; יש להשתמש ב-TeX/MathJax');
  }

  if (/√/u.test(visibleNonMathText)) {
    fail(file, 'סימן שורש גלוי אסור כ-Unicode; יש לכתוב את הביטוי ב-TeX/MathJax');
  }

  for (const match of html.matchAll(/<[^>]+class=["'][^"']*\bmissing-root-expression\b[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/giu)) {
    if (!/\\\(|\$\$/u.test(match[1])) {
      fail(file, 'missing-root-expression חייב להיות ביטוי TeX/MathJax');
    }
  }

  if (usesMath && !/vendor\/mathjax\/tex-mml-chtml\.js/u.test(html)) {
    fail(file, 'דף עם מתמטיקה חייב לטעון את MathJax המקומי vendor/mathjax/tex-mml-chtml.js');
  }

  if (usesMath && !/vendor\/mathjax\/tex-font\/chtml\/woff2/u.test(html)) {
    fail(file, 'דף עם מתמטיקה חייב להפנות לגופני TeX המקומיים של MathJax');
  }
}

if (!pages.length) {
  errors.push('לא נמצאו דפי HTML קנוניים לסריקה בשורש או תחת workbooks/');
}

if (errors.length) {
  console.error('MATH_RENDERING_INVALID');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`MATH_RENDERING_OK surfaces=${pages.length} source=CLAUDE.md math=self-hosted-mathjax drawings=vector-canonical raster=source-allowed archives=source-sources-excluded`);
