import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'STATE', 'reports', 'a4-visual-audit');
fs.mkdirSync(outDir, { recursive: true });

const topics = JSON.parse(fs.readFileSync(path.join(root, 'meta', 'topics.json'), 'utf8'));
const pages = topics.topics.flatMap(topic => (topic.pages || []).map(page => ({...page, topicName: topic.name})));

function startServer(){
  const child = spawn(process.execPath, ['preview/server.mjs'], { cwd: root, stdio: ['ignore','pipe','pipe'] });
  child.stdout.on('data', d => process.stdout.write(String(d)));
  child.stderr.on('data', d => process.stderr.write(String(d)));
  return child;
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
let failures = 0;
const results = [];

try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } });

  for (const item of pages) {
    const url = `http://127.0.0.1:5179/${encodeURIComponent(item.file)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.evaluate(async () => {
      if (globalThis.MathJax?.startup?.promise) await globalThis.MathJax.startup.promise;
      if (document.fonts?.ready) await document.fonts.ready;
    }).catch(() => {});

    const audit = await page.locator('.a4-page').evaluate(el => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      width: Math.round(el.getBoundingClientRect().width),
      height: Math.round(el.getBoundingClientRect().height),
    }));

    const screenshot = path.join(outDir, `page-${String(item.number).padStart(3,'0')}.png`);
    await page.locator('.a4-page').screenshot({ path: screenshot, animations: 'disabled' });

    const overflowX = audit.scrollWidth > audit.clientWidth + 2;
    const overflowY = audit.scrollHeight > audit.clientHeight + 2;
    const ok = !overflowX && !overflowY;

    results.push({ number: item.number, file: item.file, topic: item.topicName, ok, audit, screenshot });

    if(ok) console.log(`[OK] ${item.file}`);
    else { failures++; console.error(`[FAIL] ${item.file} overflow`, audit); }
  }

  fs.writeFileSync(path.join(outDir, 'A4_VISUAL_AUDIT.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    checkedPages: pages.length,
    failures,
    results
  }, null, 2), 'utf8');

  if(failures > 0) process.exit(1);
  console.log('[SUCCESS] A4 visual audit passed');
} finally {
  if(browser) await browser.close();
  server.kill();
}
