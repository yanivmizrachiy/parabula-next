// Canonical standalone preview build for the ratio workbook.
// Produces one self-contained A4-ready HTML file without touching the public publishing repository.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const repoRoot = path.resolve(projectRoot, '..', '..', '..');
const outFile = path.resolve(process.argv[2] || path.join(projectRoot, 'full-workbook.html'));
const sourceCommit = process.env.GITHUB_SHA || process.env.RATIO_SOURCE_SHA || 'local-preview';
const buildId = process.env.GITHUB_RUN_ID || process.env.RATIO_BUILD_ID || 'local-preview';

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readEmbeddedRubikCss() {
  const fontsDir = path.join(repoRoot, 'vendor', 'fonts');
  const cssPath = path.join(fontsDir, 'rubik.css');
  if (!fs.existsSync(cssPath)) {
    throw new Error(`Missing required local Rubik font stylesheet: ${cssPath}`);
  }

  let css = fs.readFileSync(cssPath, 'utf8');
  css = css.replace(
    /url\((['"]?)(rubik\/[^)'\"]+\.woff2)\1\)/g,
    (_match, _quote, relativeFontPath) => {
      const fontPath = path.join(fontsDir, relativeFontPath);
      if (!fs.existsSync(fontPath)) {
        throw new Error(`Missing required local font file: ${fontPath}`);
      }
      return `url(data:font/woff2;base64,${fs.readFileSync(fontPath).toString('base64')})`;
    },
  );
  return css;
}

function readBuiltCss() {
  const distAssets = path.join(projectRoot, 'dist', 'assets');
  if (!fs.existsSync(distAssets)) {
    throw new Error(`Missing Vite build output: ${distAssets}. Run "npm run build" first.`);
  }

  const cssFiles = fs.readdirSync(distAssets).filter((file) => file.endsWith('.css')).sort();
  if (cssFiles.length === 0) {
    throw new Error(`No CSS files found in ${distAssets}.`);
  }
  return cssFiles.map((file) => fs.readFileSync(path.join(distAssets, file), 'utf8')).join('\n');
}

const rubikCss = readEmbeddedRubikCss();
const appCss = readBuiltCss();

const server = await createServer({
  root: projectRoot,
  appType: 'custom',
  server: { middlewareMode: true },
  logLevel: 'error',
});

const CHAP_TITLES = {
  '1': 'מושגים בסיסיים',
  '2': 'חלוקה ביחס נתון',
  '3': 'כתיבה והשוואת יחסים',
  '4': 'יחס מצומצם',
  '5': 'שמירת היחס',
  '6': 'יחס בגאומטריה ובכמויות',
  '7': 'פרופורציה',
  '8': 'יחס · שאלות מיצ״ב',
  '9': 'שאלות מתוך תוכנית הלימודים',
};

function chapterTitle(chapter) {
  const match = /^\s*(\d+)/.exec(chapter || '');
  return (match && CHAP_TITLES[match[1]]) || 'יחס';
}

let srcHtml = '';
let pageManifest = [];

try {
  const module = await server.ssrLoadModule('/src/data/worksheetPages.tsx');
  const layout = await server.ssrLoadModule('/src/components/worksheet/pages/PageLayout.tsx');
  const pages = module.WORKSHEET_PAGES;
  const { PageNumberScope } = layout;

  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('WORKSHEET_PAGES must be a non-empty array.');
  }

  const expectedIds = Array.from({ length: pages.length }, (_, index) => index + 1);
  const ids = pages.map((page) => page.id);
  if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) {
    throw new Error(`Student page numbers must be sequential from 1. Found: ${ids.join(', ')}`);
  }

  const keys = pages.map((page) => page.key);
  if (new Set(keys).size !== keys.length || keys.some((key) => typeof key !== 'string' || !key.trim())) {
    throw new Error('Every student page must have one unique stable key.');
  }

  if (pages.some((page) => page.credit === 'authors' || String(page.key).includes('teacher'))) {
    throw new Error('Teacher intro pages are forbidden in the student workbook build.');
  }

  const marker = '<div class="page-content">';
  for (const page of pages) {
    const markup = renderToStaticMarkup(
      React.createElement(PageNumberScope, { pageNumber: page.id }, page.component()),
    );
    if (markup.includes('teacher-intro-page') || markup.includes('יחס · למורה')) {
      throw new Error(`Teacher-only markup leaked into page ${page.id} (${page.key}).`);
    }

    const markerIndex = markup.indexOf(marker);
    if (markerIndex === -1) {
      throw new Error(`Page ${page.id} (${page.key}) has no .page-content element.`);
    }

    const inner = markup.slice(markerIndex + marker.length).replace(/<\/div><\/div>$/, '');
    const contentSha = sha256(inner);
    pageManifest.push({
      displayPage: page.id,
      key: page.key,
      title: page.title,
      chapter: page.chapter,
      contentSha256: contentSha,
    });

    srcHtml += `<div class="wb-srcpage" data-key="${page.key}" data-display-page="${page.id}" data-chapter="${chapterTitle(page.chapter)}">${inner}</div>`;
  }
} finally {
  await server.close();
}

const FOOTER = '<footer class="gz-footer"><div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div><div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div></footer>';

const buildMeta = {
  schemaVersion: 2,
  audience: 'student',
  sourceCommit,
  buildId,
  semanticPageCount: pageManifest.length,
  teacherPages: 0,
  firstStudentPage: 1,
  contentSha256: sha256(pageManifest.map((page) => `${page.key}:${page.contentSha256}`).join('\n')),
  pages: pageManifest,
};

const wbCss = `
:root{color-scheme:light}
*{box-sizing:border-box}
html,body{max-width:100%;overflow-x:hidden}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:#e9edf3;font-family:Rubik,Assistant,Arial,sans-serif;font-synthesis:none}
.wb-doc,.wb-src,.wb-page{direction:rtl}
.wb-doc{display:flex;flex-direction:column;align-items:center;gap:18px;padding:26px 0}
@media (max-width:820px){.wb-doc{gap:10px;padding:8px 0}}
.wb-src{display:none}
.wb-page{width:210mm;height:297mm;background:#fff;box-shadow:0 3px 18px rgba(15,23,42,.18);display:flex;flex-direction:column;overflow:hidden;position:relative;isolation:isolate}
.wb-page>.header-container{flex:0 0 auto}
.wb-page>.wb-body{flex:1 1 auto;min-height:0;height:auto;overflow:hidden;padding:3mm 14mm;display:flex;flex-direction:column;justify-content:flex-start;gap:12px}
.wb-group{break-inside:avoid;page-break-inside:avoid;min-width:0}
.wb-group>*+*{margin-top:6px}
.wb-page .question-content>p.text-center{text-align:right}
.worksheet-table{direction:rtl}
.wb-page>.gz-footer{flex:0 0 auto;text-align:center;direction:rtl;padding:2mm 9mm 2.4mm;border-top:1px solid #dbe3ee;line-height:1.22;background:#fff}
.wb-page>.gz-footer .f1{font-weight:600;font-size:10px;color:#1f2a44;margin-bottom:1px}
.wb-page>.gz-footer .f2{font-size:9px;color:#41506b}
.wb-pagination-error{position:fixed;z-index:99999;inset:12px 12px auto;background:#fff3f3;border:2px solid #b91c1c;color:#7f1d1d;padding:12px 16px;font:600 14px/1.5 Rubik,Arial,sans-serif;direction:ltr;white-space:pre-wrap}
@page{size:A4;margin:0}
@media print{
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  body{background:#fff}
  .wb-doc{gap:0;padding:0}
  .wb-page{box-shadow:none!important;page-break-after:always;page-break-inside:avoid}
  .wb-page:last-child{page-break-after:auto}
  .wb-pagination-error{display:none!important}
}
`;

const paginator = `
(function(){
  var done=false;

  function fail(message){
    document.documentElement.dataset.workbookError=message;
    var e=document.createElement('pre');
    e.className='wb-pagination-error';
    e.textContent='Ratio workbook pagination error:\\n'+message;
    document.body.appendChild(e);
    throw new Error(message);
  }

  function fitMobile(){
    var vw=document.documentElement.clientWidth||window.innerWidth||9999;
    var pageW=793.7;
    var pages=document.querySelectorAll('.wb-page');
    var scale=(vw<pageW+28)?Math.max(0.2,(vw-10)/pageW):'';
    for(var i=0;i<pages.length;i++){pages[i].style.zoom=scale;}
  }

  function run(){
    if(done)return;
    done=true;

    var doc=document.querySelector('.wb-doc');
    if(!doc)fail('Missing .wb-doc');
    var FOOT=${JSON.stringify(FOOTER)};
    var pageNumber=0;

    function newPage(title){
      pageNumber++;
      var p=document.createElement('section');
      p.className='wb-page worksheet-page';
      p.setAttribute('dir','rtl');
      p.setAttribute('data-physical-page',String(pageNumber));
      p.setAttribute('aria-label','עמוד '+pageNumber);
      var t=(title||'יחס');
      var headTitle=/^יחס/.test(t)?t:('יחס - '+t);
      p.innerHTML='<header class="header-container page-header"><span class="page-header-title page-title">'+headTitle+'</span><div class="page-number">'+pageNumber+'</div></header><div class="wb-body page-content"></div>'+FOOT;
      doc.appendChild(p);
      return p.querySelector('.wb-body');
    }

    var runs=[];
    [].forEach.call(document.querySelectorAll('.wb-src .wb-srcpage'),function(sourcePage){
      var chapter=sourcePage.getAttribute('data-chapter');
      var sourceKey=sourcePage.getAttribute('data-key')||'unknown';
      var groups=[];
      var current=[];

      [].forEach.call(sourcePage.children,function(child){
        if(child.classList.contains('q-separator')){
          if(current.length){groups.push({elements:current,key:sourceKey});current=[];}
        }else{
          current.push(child);
        }
      });
      if(current.length)groups.push({elements:current,key:sourceKey});

      var last=runs[runs.length-1];
      if(last&&last.chapter===chapter){
        groups.forEach(function(group){last.groups.push(group);});
      }else{
        runs.push({chapter:chapter,groups:groups});
      }
    });

    var GAP=12;
    function boxHeight(list){
      var h=0;
      for(var i=0;i<list.length;i++)h+=(i>0?GAP:0)+list[i].__h;
      return h;
    }

    runs.forEach(function(run){
      var first=newPage(run.chapter);
      var cs=getComputedStyle(first);
      var padT=parseFloat(cs.paddingTop)||0;
      var padB=parseFloat(cs.paddingBottom)||0;
      var cap=first.clientHeight-padT-padB-28;
      if(cap<=0)fail('Invalid A4 body capacity for chapter '+run.chapter);

      var boxes=run.groups.map(function(group){
        var b=document.createElement('div');
        b.className='wb-group';
        b.setAttribute('data-source-key',group.key);
        group.elements.forEach(function(element){b.appendChild(element);});
        first.appendChild(b);
        return b;
      });

      boxes.forEach(function(box){
        box.__h=box.getBoundingClientRect().height;
        if(!Number.isFinite(box.__h)||box.__h<=0){
          fail('Could not measure group '+box.getAttribute('data-source-key'));
        }
        if(box.__h>cap+1){
          fail('Single question/group is taller than one A4 body: '+box.getAttribute('data-source-key')+' ('+Math.round(box.__h)+'px > '+Math.round(cap)+'px)');
        }
      });
      boxes.forEach(function(box){first.removeChild(box);});

      var pages=[[]];
      var height=0;
      for(var i=0;i<boxes.length;i++){
        var addition=(height>0?GAP:0)+boxes[i].__h;
        if(height>0&&height+addition>cap){
          pages.push([boxes[i]]);
          height=boxes[i].__h;
        }else{
          pages[pages.length-1].push(boxes[i]);
          height+=addition;
        }
      }

      if(pages.length>=2){
        var lastIndex=pages.length-1;
        if(boxHeight(pages[lastIndex])<cap*0.55){
          var combined=pages[lastIndex-1].concat(pages[lastIndex]);
          var half=boxHeight(combined)/2;
          var firstHalf=[];
          var firstHalfHeight=0;
          for(var k=0;k<combined.length;k++){
            var amount=(firstHalfHeight>0?GAP:0)+combined[k].__h;
            if(firstHalf.length&&firstHalfHeight+amount-half>half-firstHalfHeight&&(combined.length-k)>0)break;
            firstHalf.push(combined[k]);
            firstHalfHeight+=amount;
          }
          if(firstHalf.length&&firstHalf.length<combined.length){
            var secondHalf=combined.slice(firstHalf.length);
            if(boxHeight(firstHalf)<=cap&&boxHeight(secondHalf)<=cap){
              pages[lastIndex-1]=firstHalf;
              pages[lastIndex]=secondHalf;
            }
          }
        }
      }

      pages.forEach(function(groups,pageIndex){
        var body=pageIndex===0?first:newPage(run.chapter);
        groups.forEach(function(box){body.appendChild(box);});
      });
    });

    [].forEach.call(document.querySelectorAll('.wb-page .wb-body'),function(body){
      var kids=body.children;
      if(kids.length>=2){
        var cs=getComputedStyle(body);
        var padT=parseFloat(cs.paddingTop)||0;
        var padB=parseFloat(cs.paddingBottom)||0;
        var contentH=kids[kids.length-1].getBoundingClientRect().bottom-kids[0].getBoundingClientRect().top;
        var avail=body.clientHeight-padT-padB-28;
        var leftover=avail-contentH;
        if(leftover>0){
          var extra=Math.min(leftover/(kids.length-1),200);
          body.style.gap=(GAP+extra)+'px';
        }
      }
      if(body.scrollHeight>body.clientHeight+2){
        fail('A4 overflow after pagination on physical page '+body.parentElement.getAttribute('data-physical-page'));
      }
    });

    [].forEach.call(document.querySelectorAll('.wb-src'),function(source){source.remove();});
    document.documentElement.dataset.workbookReady='true';
    document.documentElement.dataset.physicalPages=String(document.querySelectorAll('.wb-page').length);
    fitMobile();
  }

  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(run);}
  else if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run,{once:true});}
  else{run();}

  setTimeout(function(){if(!done)run();},1500);
  var resizeTimer;
  window.addEventListener('resize',function(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(function(){if(done)fitMobile();},150);
  });
})();
`;

const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="ratio-audience" content="student">
<meta name="ratio-source-commit" content="${sourceCommit}">
<meta name="ratio-build-id" content="${buildId}">
<meta name="ratio-semantic-pages" content="${pageManifest.length}">
<title>יחס ופרופורציה — כיתה ח׳ · חוברת תלמיד</title>
<style>
${rubikCss}
${appCss}
${wbCss}
</style>
<script id="ratio-build-meta" type="application/json">${JSON.stringify(buildMeta).replace(/</g, '\\u003c')}</script>
</head>
<body dir="rtl">
<div class="wb-doc" dir="rtl"></div>
<div class="wb-src" dir="rtl">${srcHtml}</div>
<script>${paginator}</script>
</body>
</html>`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, html, 'utf8');

const parsedOut = path.parse(outFile);
const artifactFile = path.join(parsedOut.dir, `${parsedOut.name}-artifact${parsedOut.ext || '.html'}`);
const artifactBody = `<title>יחס ופרופורציה — כיתה ח׳ · חוברת תלמיד</title>
<style>
${rubikCss}
${appCss}
${wbCss}
</style>
<script id="ratio-build-meta" type="application/json">${JSON.stringify(buildMeta).replace(/</g, '\\u003c')}</script>
<div class="wb-doc" dir="rtl"></div>
<div class="wb-src" dir="rtl">${srcHtml}</div>
<script>${paginator}</script>`;
fs.writeFileSync(artifactFile, artifactBody, 'utf8');

console.log(JSON.stringify({
  status: 'built-preview-only',
  audience: 'student',
  semanticPages: pageManifest.length,
  teacherPages: 0,
  sourceCommit,
  buildId,
  contentSha256: buildMeta.contentSha256,
  kb: Math.round(Buffer.byteLength(html) / 1024),
  out: outFile,
  artifact: artifactFile,
}, null, 2));
