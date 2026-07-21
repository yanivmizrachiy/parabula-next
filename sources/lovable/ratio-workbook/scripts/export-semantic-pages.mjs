import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const repoRoot = path.resolve(projectRoot, '..', '..', '..');
const outputRoot = path.join(repoRoot, 'preview', 'ratio-semantic');
const writeMode = process.argv.includes('--write');
const exportAll = process.argv.includes('--all');
const requestedPageArg = process.argv.find((arg) => arg.startsWith('--page='));
const requestedPage = requestedPageArg ? Number(requestedPageArg.split('=')[1]) : 1;

if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > 48) {
  throw new Error(`Invalid --page value: ${requestedPage}. Expected an integer from 1 to 48.`);
}

function ensureTrailingNewline(value) {
  return value.endsWith('\n') ? value : `${value}\n`;
}

function pageShell({ globalPage, localPage, totalPages, title, markup }) {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="../../vendor/fonts/rubik.css">
  <link rel="stylesheet" href="../../styles/a4-base.css">
  <link rel="stylesheet" href="ratio-semantic-base.css">
  <link rel="stylesheet" href="ratio-v2.css">
  <link rel="stylesheet" href="ratio-layout-fixes.css">
</head>
<body>
  <nav class="preview-nav" aria-label="פיילוט סמנטי של חוברת יחס">
    <div class="preview-nav-top">
      <div class="nav-side"><a class="nav-link" href="../../עמוד-${globalPage}.html">חזרה לדף הקיים</a></div>
      <div class="nav-meta">יחס — פיילוט סמנטי — עמוד ${localPage} / ${totalPages}</div>
      <div class="nav-side"></div>
    </div>
  </nav>
  <main class="a4-page ratio-semantic-page" data-ratio-semantic-page="${localPage}">
${markup}
    <footer class="gz-footer">
      <div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div>
      <div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div>
    </footer>
  </main>
</body>
</html>`;
}

const server = await createServer({
  root: projectRoot,
  appType: 'custom',
  server: { middlewareMode: true },
  logLevel: 'error',
});

try {
  const module = await server.ssrLoadModule('/src/data/worksheetPages.tsx');
  const pages = module.WORKSHEET_PAGES;
  if (!Array.isArray(pages) || pages.length !== 48) {
    throw new Error(`Expected 48 ratio source pages, found ${Array.isArray(pages) ? pages.length : 'invalid source'}.`);
  }

  const selected = exportAll ? pages : pages.filter((page) => page.id === requestedPage);
  const outputs = [];
  for (const page of selected) {
    const globalPage = 271 + page.id;
    const markup = renderToStaticMarkup(React.createElement(React.Fragment, null, page.component()));
    if (!markup.includes('worksheet-page')) {
      throw new Error(`Semantic render for ratio page ${page.id} is missing worksheet-page markup.`);
    }
    if (/<img[^>]+assets\/ratio\/page-\d{3}\.png/i.test(markup)) {
      throw new Error(`Semantic render for ratio page ${page.id} still contains a full-page PNG dependency.`);
    }
    const html = pageShell({
      globalPage,
      localPage: page.id,
      totalPages: pages.length,
      title: `עמוד ${page.id} — יחס — פיילוט סמנטי`,
      markup: markup.split('\n').map((line) => `    ${line}`).join('\n'),
    });
    outputs.push({
      path: path.join(outputRoot, `עמוד-${globalPage}.html`),
      content: ensureTrailingNewline(html),
    });
  }

  const cssSources = [
    ['src/ratio-v2.css', 'ratio-v2.css'],
    ['src/ratio-layout-fixes.css', 'ratio-layout-fixes.css'],
  ];
  for (const [source, target] of cssSources) {
    outputs.push({
      path: path.join(outputRoot, target),
      content: ensureTrailingNewline(fs.readFileSync(path.join(projectRoot, source), 'utf8')),
    });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    mode: exportAll ? 'all' : 'pilot',
    pages: selected.map((page) => ({ localPage: page.id, globalPage: 271 + page.id, title: page.title })),
    source: 'sources/lovable/ratio-workbook/src/data/worksheetPages.tsx',
    canonicalPagesChanged: false,
  };
  outputs.push({
    path: path.join(outputRoot, 'manifest.json'),
    content: `${JSON.stringify(manifest, null, 2)}\n`,
  });

  if (!writeMode) {
    console.log(JSON.stringify({ status: 'check-only', outputRoot, files: outputs.map((item) => path.relative(repoRoot, item.path)) }, null, 2));
    console.log('No files were written. Re-run with --write after the check succeeds.');
    process.exit(0);
  }

  fs.mkdirSync(outputRoot, { recursive: true });
  for (const output of outputs) {
    fs.writeFileSync(output.path, output.content, 'utf8');
  }
  console.log(JSON.stringify({ status: 'written', outputRoot, files: outputs.map((item) => path.relative(repoRoot, item.path)) }, null, 2));
} finally {
  await server.close();
}
