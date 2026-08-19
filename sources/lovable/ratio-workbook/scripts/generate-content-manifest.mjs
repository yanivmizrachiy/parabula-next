import crypto from 'node:crypto';
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

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
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

  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('WORKSHEET_PAGES must be a non-empty array.');
  }

  const expectedIds = Array.from({ length: pages.length }, (_, index) => index + 1);
  const ids = pages.map((page) => page.id);
  const keys = pages.map((page) => page.key);

  if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) {
    throw new Error(`Student page numbers must be sequential from 1. Found: ${ids.join(', ')}`);
  }
  if (new Set(keys).size !== keys.length || keys.some((key) => typeof key !== 'string' || !key.trim())) {
    throw new Error('Every ratio page must have one non-empty unique stable key.');
  }
  if (pages.some((page) => page.credit === 'authors' || String(page.key).includes('teacher'))) {
    throw new Error('Teacher intro pages are forbidden in the public/student WORKSHEET_PAGES list.');
  }

  const manifestPages = pages.map((page) => {
    const markup = renderToStaticMarkup(React.createElement(React.Fragment, null, page.component()));
    if (!markup.includes('worksheet-page')) {
      throw new Error(`Ratio page ${page.id} (${page.key}) failed semantic rendering.`);
    }
    if (markup.includes('teacher-intro-page') || markup.includes('יחס · למורה')) {
      throw new Error(`Teacher-only markup leaked into student page ${page.id} (${page.key}).`);
    }

    const fullPagePngDependencies = count(markup, /assets\/ratio\/page-\d{3}\.png/g);
    if (fullPagePngDependencies > 0) {
      throw new Error(`Ratio source page ${page.id} contains a forbidden full-page PNG dependency.`);
    }

    return {
      displayPage: page.id,
      key: page.key,
      title: page.title,
      chapter: page.chapter,
      credit: page.credit ?? 'yaniv',
      markupSha256: sha256(markup),
      observedStructure: {
        questionBlocks: count(markup, /class="question-block"/g),
        subQuestions: count(markup, /class="sub-question"/g),
        tables: count(markup, /<table\b/g),
        svgElements: count(markup, /<svg\b/g),
        answerLines: count(markup, /class="answer-line"/g),
        inlineBlanks: count(markup, /class="inline-blank"/g),
        checkboxes: count(markup, /class="worksheet-checkbox"/g),
        fullPagePngDependencies,
      },
      verification: {
        semanticRender: true,
        teacherOnlyMarkupAbsent: true,
        mathematicalReview: 'pending',
        contentReview: 'pending',
        visualDiff: 'pending',
        a4: 'pending',
        accessibility: 'pending',
        printPdf: 'pending',
      },
    };
  });

  const manifest = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    topic: 'יחס',
    audience: 'student',
    sourceOfTruth: 'src/data/worksheetPages.tsx',
    sourceCommit: process.env.GITHUB_SHA || null,
    invariants: {
      teacherIntroPagesIncluded: false,
      firstStudentPage: 1,
      sequentialDisplayNumbers: true,
      stableKeysRequired: true,
      contentChangesRequireExplicitApproval: true,
      unknownSourceDataMustNotBeGuessed: true,
      productionPublishRequiresExplicitUserApproval: true,
    },
    counts: {
      studentSemanticPages: pages.length,
      teacherPages: 0,
      chapters: new Set(pages.map((page) => page.chapter)).size,
    },
    workbookSha256: sha256(manifestPages.map((page) => `${page.key}:${page.markupSha256}`).join('\n')),
    pages: manifestPages,
  };

  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  if (!writeMode) {
    console.log(JSON.stringify({
      status: 'check-only',
      output: path.relative(projectRoot, outputPath),
      pages: manifest.pages.length,
      teacherPages: manifest.counts.teacherPages,
      workbookSha256: manifest.workbookSha256,
    }, null, 2));
    console.log('No manifest was written. Re-run with --write to create the reviewed preview manifest.');
    process.exit(0);
  }

  fs.writeFileSync(outputPath, serialized, 'utf8');
  console.log(JSON.stringify({
    status: 'written',
    output: path.relative(projectRoot, outputPath),
    pages: manifest.pages.length,
    workbookSha256: manifest.workbookSha256,
  }, null, 2));
} finally {
  await server.close();
}
