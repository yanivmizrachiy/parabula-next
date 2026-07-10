import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const outDir = path.join(root, 'tmp-page16-audit');
fs.mkdirSync(outDir, { recursive: true });

function type(file) {
  const ext = path.extname(file).toLowerCase();
  return ({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'})[ext] || 'application/octet-stream';
}

const server = http.createServer((req,res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  let pathname = decodeURIComponent(url.pathname);
  if(pathname === '/') pathname = '/index.html';
  const file = path.resolve(distDir, `.${pathname}`);
  if(!file.startsWith(`${distDir}${path.sep}`) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, {'Content-Type': type(file), 'Cache-Control':'no-store'});
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve,reject) => { server.once('error',reject); server.listen(0,'127.0.0.1',resolve); });
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({
  viewport:{width:412,height:915}, screen:{width:412,height:915}, deviceScaleFactor:3,
  isMobile:true, hasTouch:true, locale:'he-IL',
  userAgent:'Mozilla/5.0 (Linux; Android 16; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  serviceWorkers:'block'
});

const results=[];
for(const n of [55,56,57]) {
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${origin}/${encodeURIComponent(`עמוד-${n}.html`)}`, {waitUntil:'networkidle'});
  await page.evaluate(async() => { if(globalThis.MathJax?.startup?.promise) await globalThis.MathJax.startup.promise; if(document.fonts?.ready) await document.fonts.ready; });
  await page.waitForTimeout(300);
  const metrics = await page.evaluate(() => {
    const a4=document.querySelector('.a4-page');
    const rect=a4?.getBoundingClientRect();
    const blocks=[...document.querySelectorAll('.problem-block')].map(el=>{
      const r=el.getBoundingClientRect();
      return {x:r.x,y:r.y,width:r.width,height:r.height};
    });
    const equations=[...document.querySelectorAll('.problem-equation')].map(el=>{
      const r=el.getBoundingClientRect();
      return {text:el.textContent.trim(),x:r.x,y:r.y,width:r.width,height:r.height,font:getComputedStyle(el).fontSize};
    });
    return {
      viewport:{width:innerWidth,height:innerHeight},
      document:{scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight},
      a4:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height,ratio:rect.height/rect.width}:null,
      navHeight:document.querySelector('.preview-nav')?.getBoundingClientRect().height||0,
      blocks,equations,
      grid:document.querySelector('.eq-grid')?.getBoundingClientRect().toJSON?.()||null
    };
  });
  await page.screenshot({path:path.join(outDir,`page-${n}-full.png`),fullPage:true,animations:'disabled'});
  await page.locator('.a4-page').screenshot({path:path.join(outDir,`page-${n}-a4.png`),animations:'disabled'});
  results.push({file:`עמוד-${n}.html`,errors,metrics});
  await page.close();
}
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(results,null,2));
await context.close();
await browser.close();
await new Promise(resolve=>server.close(resolve));
