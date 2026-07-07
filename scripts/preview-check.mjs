import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const ROOT_PAGE_RE = /^עמוד-\d+\.html$/u;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchOk(url) {
  const res = await fetch(url, { redirect: 'manual' });
  if (res.status !== 200) {
    const body = await res.text().catch(() => '');
    throw new Error(`Expected 200 for ${url}, got ${res.status}${body ? `\n${body.slice(0, 500)}` : ''}`);
  }
  return res;
}

function collectFilesFromToc(toc) {
  const files = [];
  if (toc && Array.isArray(toc.topics)) {
    for (const topic of toc.topics) {
      if (!topic || !Array.isArray(topic.pages)) continue;
      for (const page of topic.pages) {
        if (page && typeof page.file === 'string') files.push(page.file);
      }
    }
  }
  if (toc && Array.isArray(toc.flat)) {
    for (const page of toc.flat) {
      if (page && typeof page.file === 'string') files.push(page.file);
    }
  }
  return files;
}

async function runHeadlessGuardrails(base, files) {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(45_000);
    page.setDefaultTimeout(45_000);

    const failures = [];

    for (const file of files) {
      const url = `${base}/${encodeURIComponent(file)}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      await page.evaluate(async () => {
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
        const tasks = [];
        try {
          if (document.fonts && document.fonts.ready) tasks.push(document.fonts.ready.catch(() => undefined));
        } catch {}
        try {
          const mathJax = globalThis.MathJax;
          if (mathJax && mathJax.startup && mathJax.startup.promise) tasks.push(mathJax.startup.promise.catch(() => undefined));
        } catch {}
        tasks.push(wait(150));
        await Promise.race([Promise.all(tasks), wait(1500)]);
      });

      const result = await page.evaluate(() => {
        function isRasterImageSrc(src) {
          const s = String(src || '').trim().toLowerCase();
          return s.endsWith('.png') || s.endsWith('.jpg') || s.endsWith('.jpeg') || s.endsWith('.webp') || s.endsWith('.gif');
        }

        const pageEl = document.querySelector('main.a4-page');
        const hasA4 = Boolean(pageEl);
        const hasHeader = Boolean(pageEl && pageEl.querySelector('.header-container'));
        const hasTitle = Boolean(pageEl && pageEl.querySelector('.page-title'));
        const hasNumber = Boolean(pageEl && pageEl.querySelector('.page-number'));

        let hasRasterImages = false;
        if (pageEl) {
          const imgs = Array.from(pageEl.querySelectorAll('img'));
          hasRasterImages = imgs.some(img => isRasterImageSrc(img.getAttribute('src')));
        }

        let overflowY = false;
        let overflowX = false;
        let scrollHeight = 0;
        let clientHeight = 0;
        let scrollWidth = 0;
        let clientWidth = 0;
        if (pageEl) {
          scrollHeight = pageEl.scrollHeight;
          clientHeight = pageEl.clientHeight;
          overflowY = scrollHeight > clientHeight + 1;
          scrollWidth = pageEl.scrollWidth;
          clientWidth = pageEl.clientWidth;
          overflowX = scrollWidth > clientWidth + 1;
        }

        let outOfBounds = false;
        if (pageEl) {
          const pageRect = pageEl.getBoundingClientRect();
          const pad = 0.5;
          const candidates = Array.from(pageEl.querySelectorAll('.pyt-footer, .eq-footer, .pyt-solutions, .eq-solutions, .solution-space, img, svg'));
          for (const el of candidates) {
            const r = el.getBoundingClientRect();
            if (r.left < pageRect.left - pad || r.right > pageRect.right + pad || r.top < pageRect.top - pad || r.bottom > pageRect.bottom + pad) {
              outOfBounds = true;
              break;
            }
          }
        }

        return { hasA4, hasHeader, hasTitle, hasNumber, hasRasterImages, overflowY, overflowX, outOfBounds, scrollHeight, clientHeight, scrollWidth, clientWidth };
      });

      const problems = [];
      if (!result.hasA4) problems.push('missing main.a4-page');
      if (!result.hasHeader) problems.push('missing .header-container');
      if (!result.hasTitle) problems.push('missing .page-title');
      if (!result.hasNumber) problems.push('missing .page-number');
      if (result.hasRasterImages) problems.push('raster image detected');
      if (result.overflowY) problems.push(`A4 vertical overflow (scrollHeight=${result.scrollHeight}, clientHeight=${result.clientHeight})`);
      if (result.overflowX) problems.push(`A4 horizontal overflow (scrollWidth=${result.scrollWidth}, clientWidth=${result.clientWidth})`);
      if (result.outOfBounds) problems.push('A4 out-of-bounds element(s) detected');

      if (problems.length > 0) failures.push({ file, problems });
    }

    return failures;
  } finally {
    await browser.close();
  }
}

async function startPreviewServer() {
  const child = spawn(process.execPath, ['preview/server.mjs'], {
    env: { ...process.env, HOST: '127.0.0.1', PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });

  const startedAt = Date.now();
  while (Date.now() - startedAt < 15_000) {
    const match = stdout.match(/Preview server running:\s*(http:\/\/[^\s]+)\/preview/u);
    if (match) return { child, base: match[1], getLogs: () => ({ stdout, stderr }) };
    if (child.exitCode != null) throw new Error(`Preview server exited early.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`);
    await sleep(50);
  }

  throw new Error(`Timed out waiting for preview server.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`);
}

async function stopPreviewServer(child) {
  if (!child || child.exitCode != null) return;
  child.kill('SIGTERM');
  const startedAt = Date.now();
  while (Date.now() - startedAt < 5_000) {
    if (child.exitCode != null) return;
    await sleep(50);
  }
  try { child.kill('SIGKILL'); } catch {}
}

async function main() {
  let server;

  try {
    server = await startPreviewServer();
    const base = server.base;

    await fetchOk(`${base}/preview`);
    const tocRes = await fetchOk(`${base}/api/toc`);
    const toc = await tocRes.json();

    const files = Array.from(new Set(collectFilesFromToc(toc)));
    const rootFiles = files.map(file => String(file || '').replace(/\\/g, '/')).filter(file => ROOT_PAGE_RE.test(file));

    if (rootFiles.length === 0) {
      const sample = files.slice(0, 10).join(', ');
      throw new Error(`/api/toc returned no root A4 pages. Sample: ${sample}`);
    }

    const failures = await runHeadlessGuardrails(base, rootFiles);
    if (failures.length > 0) {
      console.error('FAIL: headless A4 guardrails detected issues.');
      for (const failure of failures.slice(0, 30)) {
        console.error(`- ${failure.file}: ${failure.problems.join('; ')}`);
      }
      if (failures.length > 30) console.error(`... and ${failures.length - 30} more`);
      process.exitCode = 1;
      return;
    }

    console.log(`OK: preview server up (${base}), /preview=200, /api/toc ok (${files.length} entries; ${rootFiles.length} root A4 pages), headless guardrails ok`);
  } finally {
    if (server?.child) await stopPreviewServer(server.child);
  }
}

main().catch(err => {
  console.error(String(err?.stack || err));
  process.exitCode = 1;
});
