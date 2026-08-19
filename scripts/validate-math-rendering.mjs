import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];

const pages = fs
  .readdirSync(root)
  .filter((name) => /^עמוד-\d+\.html$/u.test(name))
  .sort((a, b) => Number(a.match(/\d+/u)?.[0] ?? 0) - Number(b.match(/\d+/u)?.[0] ?? 0));

const fail = (file, message) => errors.push(`${file}: ${message}`);

for (const file of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const hasMathJaxConfig = /\bMathJax\b/u.test(html);
  const hasTexMarkup = /\\\(|\$\$/u.test(html);
  const usesMath = hasMathJaxConfig || hasTexMarkup;

  if (/<canvas\b/iu.test(html)) {
    fail(file, 'Canvas אסור בדף A4 קנוני; שרטוט מתמטי חדש חייב להיות וקטורי וניתן להדפסה');
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
  errors.push('לא נמצאו דפי עמוד-N.html קנוניים לסריקה');
}

if (errors.length) {
  console.error('MATH_RENDERING_INVALID');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`MATH_RENDERING_OK pages=${pages.length} source=CLAUDE.md math=self-hosted-mathjax drawings=vector-canonical raster=source-allowed`);
