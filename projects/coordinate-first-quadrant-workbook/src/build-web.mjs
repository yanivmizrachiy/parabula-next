import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const COORDINATE_WORKBOOK_FRAGMENTS = [
  'workbook-01.htmlfrag',
  'workbook-02.htmlfrag',
  'workbook-03.htmlfrag',
  'workbook-04.htmlfrag',
  'workbook-05-06.htmlfrag',
  'workbook-07-08.htmlfrag',
  'workbook-09-10.htmlfrag',
  'workbook-11-12.htmlfrag',
  'workbook-13-14.htmlfrag',
  'workbook-15.htmlfrag',
];

function normalizeInlineStyles(html, initialCss) {
  let css = `${initialCss.trim()}\n`;
  const styleClasses = new Map();
  let styleCounter = 0;

  const cleanHtml = html.replace(
    /<([A-Za-z][\w:-]*)([^<>]*?)\sstyle="([^"]*)"([^<>]*?)>/g,
    (_, tag, before, declarations, after) => {
      const normalized = declarations.trim().replace(/;\s*$/, '');
      let className = styleClasses.get(normalized);
      if (!className) {
        className = `generated-style-${++styleCounter}`;
        styleClasses.set(normalized, className);
      }

      let attributes = `${before}${after}`;
      if (/\bclass="[^"]*"/.test(attributes)) {
        attributes = attributes.replace(
          /\bclass="([^"]*)"/,
          (_match, classes) => `class="${classes} ${className}"`,
        );
      } else {
        attributes += ` class="${className}"`;
      }
      return `<${tag}${attributes}>`;
    },
  );

  for (const [declarations, className] of styleClasses.entries()) {
    css += `.${className}{${declarations}}\n`;
  }

  return { html: cleanHtml, css, generatedStyleClasses: styleClasses.size };
}

export function buildCoordinateWorkbookWeb({
  root = path.resolve(here, '..'),
  outputDir = path.join(root, 'dist'),
  includeStandalone = true,
} = {}) {
  const workbookDir = path.join(root, 'workbook');
  fs.mkdirSync(outputDir, { recursive: true });

  const standalone = COORDINATE_WORKBOOK_FRAGMENTS
    .map((name) => fs.readFileSync(path.join(workbookDir, name), 'utf8'))
    .join('');

  const pageIds = [...standalone.matchAll(/id="page-(\d{1,2})"/g)].map((match) => Number(match[1]));
  const uniquePages = [...new Set(pageIds)].sort((a, b) => a - b);
  if (
    pageIds.length !== 30
    || uniquePages.length !== 30
    || uniquePages.some((value, index) => value !== index + 1)
  ) {
    throw new Error(`Expected pages 1-30 exactly once; received ${JSON.stringify(pageIds)}`);
  }

  const styleMatch = standalone.match(/<style>([\s\S]*?)<\/style>/i);
  const scripts = [...standalone.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
  if (!styleMatch || scripts.length !== 1) {
    throw new Error('Expected one embedded style and one embedded script.');
  }

  const js = `${scripts[0][1].trim()}\n`;
  const separatedHtml = standalone
    .replace(styleMatch[0], '<link rel="stylesheet" href="workbook.css">')
    .replace(scripts[0][0], '<script src="workbook.js"></script>');
  const normalized = normalizeInlineStyles(separatedHtml, styleMatch[1]);

  if (/<style\b/i.test(normalized.html) || /\sstyle\s*=\s*["']/i.test(normalized.html)) {
    throw new Error('Inline CSS remained after normalization.');
  }

  const outputs = {
    index: path.join(outputDir, 'index.html'),
    css: path.join(outputDir, 'workbook.css'),
    js: path.join(outputDir, 'workbook.js'),
    standalone: path.join(outputDir, 'standalone-source.html'),
  };
  fs.writeFileSync(outputs.index, normalized.html);
  fs.writeFileSync(outputs.css, normalized.css);
  fs.writeFileSync(outputs.js, js);
  if (includeStandalone) fs.writeFileSync(outputs.standalone, standalone);

  return {
    pages: uniquePages.length,
    generatedStyleClasses: normalized.generatedStyleClasses,
    outputDir,
    outputs,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = buildCoordinateWorkbookWeb();
  console.log(`[coordinate-web] generated ${result.pages} pages in ${result.outputDir}`);
}
