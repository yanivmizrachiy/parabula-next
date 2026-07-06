import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'STATE', 'reports', 'pdf-export');
fs.mkdirSync(outDir, { recursive: true });

const topics = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
const allPages = topics.topics.flatMap(topic => (topic.pages || []).map(page => ({...page, topicName: topic.name})));
const sample = new Set([1, 9, 31, 42, 95, 96, 97, 98]);
const pages = allPages.filter(p => sample.has(p.number));

function startServer(){
  return spawn(process.execPath, ['preview/server.mjs'], { cwd: root, stdio: ['ignore','pipe','pipe'] });
}

async function waitForServer(){
  const start = Date.now();
  while(Date.now() - start < 15000){
    try {
      const res = await fetch('http://127.0.0.1:5179/preview');
      if(res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('Preview server did not start');
}

const server = startServer();
let browser;

try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage();

  for(const item of pages){
    const url = `http://127.0.0.1:5179/${encodeURIComponent(item.file)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.evaluate(async () => {
      if (globalThis.MathJax?.startup?.promise) await globalThis.MathJax.startup.promise;
      if (document.fonts?.ready) await document.fonts.ready;
    }).catch(() => {});

    const out = path.join(outDir, `page-${String(item.number).padStart(3,'0')}.pdf`);
    await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(`[PDF] ${item.file} -> ${out}`);
  }

  fs.writeFileSync(path.join(outDir, 'PDF_EXPORT_REPORT.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    pages: pages.map(p => p.number),
    outDir
  }, null, 2), 'utf8');

  console.log('[SUCCESS] PDF export sample completed');
} finally {
  if(browser) await browser.close();
  server.kill();
}
