import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const outputPath = path.join(projectRoot, 'content-manifest.json');
const writeMode = process.argv.includes('--write');

function count(markup, expression) {
  return (markup.match(expression) || []).length;
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
    throw new Error(`Expected exactly 48 ratio pages, found ${Array.isArray(pages) ? pages.length : 'invalid source'}.`);
  }

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    topic: 'יחס',
    sourceOfTruth: 'src/data/worksheetPages.tsx',
    policy: {
      contentChangesRequireExplicitApproval: true,
      unknownSourceDataMustNotBeGuessed: true,
      canonicalMigrationRequiresPerPageApproval: true,
    },
    pages: pages.map((page) => {
      const markup = renderToStaticMarkup(React.createElement(React.Fragment, null, page.component()));
      return {
        localPage: page.id,
        globalPage: 271 + page.id,
        title: page.title,
        chapter: page.chapter,
        observedStructure: {
          questionBlocks: count(markup, /class="question-block"/g),
          subQuestions: count(markup, /class="sub-question"/g),
          tables: count(markup, /<table\b/g),
          svgElements: count(markup, /<svg\b/g),
          answerLines: count(markup, /class="answer-line"/g),
          inlineBlanks: count(markup, /class="inline-blank"/g),
          checkboxes: count(markup, /class="worksheet-checkbox"/g),
          fullPagePngDependencies: count(markup, /assets\/ratio\/page-\d{3}\.png/g),
        },
        sourceEvidence: {
          externalSourceId: null,
          externalSourceHash: null,
          verifiedAgainstSource: false,
        },
        changeEvidence: {
          correctedVersion: null,
          approvalReference: null,
          addedBeyondSource: null,
        },
        verification: {
          semanticRender: markup.includes('worksheet-page'),
          mathematicalReview: 'pending',
          contentReview: 'pending',
          visualDiff: 'pending',
          a4: 'pending',
          accessibility: 'pending',
          printPdf: 'pending',
          canonicalReplacementApproved: false,
        },
      };
    }),
  };

  for (const page of manifest.pages) {
    if (!page.verification.semanticRender) {
      throw new Error(`Ratio page ${page.localPage} failed semantic rendering.`);
    }
    if (page.observedStructure.fullPagePngDependencies > 0) {
      throw new Error(`Ratio source page ${page.localPage} contains a forbidden full-page PNG dependency.`);
    }
  }

  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  if (!writeMode) {
    console.log(JSON.stringify({
      status: 'check-only',
      output: path.relative(projectRoot, outputPath),
      pages: manifest.pages.length,
      semanticPages: manifest.pages.filter((page) => page.verification.semanticRender).length,
    }, null, 2));
    console.log('No manifest was written. Re-run with --write after reviewing the check.');
    process.exit(0);
  }

  fs.writeFileSync(outputPath, serialized, 'utf8');
  console.log(JSON.stringify({ status: 'written', output: path.relative(projectRoot, outputPath), pages: manifest.pages.length }, null, 2));
} finally {
  await server.close();
}
