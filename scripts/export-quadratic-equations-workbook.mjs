import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { pages } from '../sources/quadratic-equations/workbook-data.mjs';

const root = process.cwd();
const tempDir = path.join(root, 'tmp', 'pdfs', 'quadratic-workbook-pages');
const outputDir = path.join(root, 'output', 'pdf');
const outputFile = path.join(outputDir, 'משוואות-ריבועיות-כיתה-ט-246-תרגילים.pdf');

if (!tempDir.startsWith(path.join(root, 'tmp', 'pdfs'))) throw new Error('unsafe temporary path');
fs.rmSync(tempDir, { recursive: true, force: true });
fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const server = spawn(process.execPath, ['preview/server.mjs'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PORT: '5187' },
});

const waitForServer = async () => {
  const started = Date.now();
  while (Date.now() - started < 20_000) {
    try {
      const response = await fetch('http://127.0.0.1:5187/preview');
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('preview server did not start');
};

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const browserPage = await browser.newPage({ viewport: { width: 1280, height: 1600 } });

  for (const [index, workbookPage] of pages.entries()) {
    const file = `עמוד-${workbookPage.globalNumber}.html`;
    await browserPage.goto(`http://127.0.0.1:5187/${encodeURIComponent(file)}`, { waitUntil: 'domcontentloaded' });
    await browserPage.waitForFunction(() => Boolean(globalThis.MathJax?.startup?.promise), null, { timeout: 15_000 });
    await browserPage.evaluate(async () => {
      await globalThis.MathJax.startup.promise;
      if (document.fonts?.ready) await document.fonts.ready;
    });
    await browserPage.waitForFunction(expected => {
      const equations = document.querySelectorAll('.equation');
      const rendered = document.querySelectorAll('.equation mjx-container');
      return equations.length === expected && rendered.length === expected;
    }, workbookPage.exercises.length, { timeout: 15_000 });
    const metrics = await browserPage.locator('.a4-page').evaluate(element => ({
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }));
    if (metrics.scrollHeight > metrics.clientHeight + 1 || metrics.scrollWidth > metrics.clientWidth + 1) {
      throw new Error(`${file}: A4 overflow ${JSON.stringify(metrics)}`);
    }
    const tempFile = path.join(tempDir, `${String(index + 1).padStart(2, '0')}.pdf`);
    await browserPage.pdf({
      path: tempFile,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    console.log(`[${index + 1}/${pages.length}] ${file}`);
  }

  const mergeCode = [
    'from pathlib import Path',
    'from pypdf import PdfReader, PdfWriter',
    'import sys',
    'src, dst = Path(sys.argv[1]), Path(sys.argv[2])',
    'writer = PdfWriter()',
    'for pdf in sorted(src.glob("*.pdf")):',
    '    reader = PdfReader(str(pdf))',
    '    for page in reader.pages: writer.add_page(page)',
    'writer.add_metadata({"/Title": "משוואות ריבועיות - 246 תרגילים לכיתה ט", "/Author": "יניב רז"})',
    'with dst.open("wb") as handle: writer.write(handle)',
  ].join('\n');
  const merged = spawnSync('python', ['-c', mergeCode, tempDir, outputFile], { cwd: root, stdio: 'inherit' });
  if (merged.status !== 0) throw new Error(`PDF merge failed with exit code ${merged.status}`);

  const size = fs.statSync(outputFile).size;
  console.log(`נוצר PDF בן ${pages.length} עמודים: ${outputFile} (${size} bytes)`);
} finally {
  if (browser) await browser.close();
  server.kill();
}
