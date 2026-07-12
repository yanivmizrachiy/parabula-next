import fs from 'node:fs';
import path from 'node:path';

// Replaces CDN dependencies (Google Fonts Rubik + jsDelivr MathJax) in the
// root worksheet pages with the self-hosted copies under vendor/, so pages
// load faster and print correctly with no internet connection.
//
// Usage:
//   node scripts/vendorize-cdn.mjs --check   -> list pages still on CDN, exit 1 if any
//   node scripts/vendorize-cdn.mjs           -> rewrite pages in place
//
// Safe by design: only touches <head> resource references, never worksheet
// content. Run npm test + npm run verify afterwards.

const root = process.cwd();
const checkOnly = process.argv.includes('--check');

const FONT_LINK = '<link rel="stylesheet" href="vendor/fonts/rubik.css" />';
const MATHJAX_SRC = 'vendor/mathjax/tex-mml-chtml.js';
const FONT_URL_CONF = "chtml: { fontURL: 'vendor/mathjax/tex-font/chtml/woff2' }";

const pages = fs.readdirSync(root).filter((f) => /^עמוד-\d+\.html$/.test(f));
const cdnPattern = /fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net/;

let touched = 0;
const stillCdn = [];

for (const file of pages) {
  const p = path.join(root, file);
  let html = fs.readFileSync(p, 'utf8');
  if (!cdnPattern.test(html)) continue;

  if (checkOnly) {
    stillCdn.push(file);
    continue;
  }

  const before = html;

  // 1. Google Fonts: drop preconnect hints, swap the css2 link for the local file.
  html = html.replace(/[ \t]*<link[^>]*rel="preconnect"[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*\/?>[ \t]*\r?\n?/g, '');
  html = html.replace(/<link[^>]*fonts\.googleapis\.com\/css2\?family=Rubik[^>]*\/?>/g, FONT_LINK);

  // 2. MathJax loader: point at the vendored bundle (any es5 build name).
  html = html.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/mathjax@[34](?:\/es5)?\/[\w-]+\.js/g, MATHJAX_SRC);

  // 3. MathJax font URL: the vendored bundle would otherwise still pull its
  //    math fonts from the CDN. Inject chtml.fontURL into the config object.
  if (html.includes(MATHJAX_SRC) && !html.includes('fontURL')) {
    html = html.replace(
      /MathJax\s*=\s*\{\s*tex:\s*(\{[^}]*\})\s*\}/,
      (m, texConf) => `MathJax = { tex: ${texConf}, ${FONT_URL_CONF} }`
    );
    if (!html.includes('fontURL')) {
      // Page loads MathJax without a config script — add one just before the loader.
      html = html.replace(
        /(<script[^>]*src="vendor\/mathjax\/tex-mml-chtml\.js")/,
        `<script>MathJax = { ${FONT_URL_CONF} };</script>\n  $1`
      );
    }
  }

  if (html !== before) {
    fs.writeFileSync(p, html);
    touched += 1;
    console.log(`vendorized: ${file}`);
  }
}

if (checkOnly) {
  if (stillCdn.length) {
    console.error(`VENDORIZE_CHECK: ${stillCdn.length} pages still reference CDNs`);
    for (const f of stillCdn.slice(0, 10)) console.error(`- ${f}`);
    process.exit(1);
  }
  console.log('VENDORIZE_CHECK_OK: no CDN references in worksheet pages');
  process.exit(0);
}

console.log(`VENDORIZE_DONE: rewrote ${touched} pages`);
