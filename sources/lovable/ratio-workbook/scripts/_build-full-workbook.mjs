// TEMP build tool — renders the complete ratio workbook as a single self-contained,
// print-ready HTML file with AUTOMATIC PAGINATION: every question flows and fills an A4
// page up to its limit, then continues on the next page. No crammed pages, no empty pages.
// Opening section (teacher-authored) credits Tanami & Krispin; the rest credits Yaniv.
// Deleted after use; not part of the repo's canonical pipeline.
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

const projectRoot = 'C:/Users/yaniv/Desktop/razpages/sources/lovable/ratio-workbook';
const repoRoot = 'C:/Users/yaniv/Desktop/razpages';
const outFile = process.argv[2] || path.join(projectRoot, 'full-workbook.html');

const fontsDir = path.join(repoRoot, 'vendor', 'fonts');
let rubikCss = fs.readFileSync(path.join(fontsDir, 'rubik.css'), 'utf8');
rubikCss = rubikCss.replace(/url\((rubik\/[^)]+\.woff2)\)/g, (_m, rel) =>
  `url(data:font/woff2;base64,${fs.readFileSync(path.join(fontsDir, rel)).toString('base64')})`);

const distAssets = path.join(projectRoot, 'dist', 'assets');
const cssFile = fs.readdirSync(distAssets).find((f) => f.endsWith('.css'));
const appCss = fs.readFileSync(path.join(distAssets, cssFile), 'utf8');

const server = await createServer({ root: projectRoot, appType: 'custom', server: { middlewareMode: true }, logLevel: 'error' });

// Clean, student-facing chapter titles shown in the blue page header (one per chapter).
// The header now names the section instead of a uniform "יחס", and a new chapter always
// starts on a fresh printed page (break-on-chapter-change in the paginator below).
const CHAP_TITLES = {
  '0': 'יחס ישר', '1': 'מושגים בסיסיים', '2': 'חלוקה ביחס נתון',
  '3': 'כתיבה והשוואת יחסים', '4': 'יחס מצומצם', '5': 'שמירת היחס',
  '6': 'יחס בגאומטריה ובכמויות', '7': 'פרופורציה', '8': 'יחס · שאלות מיצ״ב',
  '9': 'שאלות מתוך תוכנית הלימודים',
};
const chapTitle = (ch) => {
  const m = /^\s*(\d+)/.exec(ch || '');
  return (m && CHAP_TITLES[m[1]]) || 'יחס';
};

// Each source page becomes a <div class="wb-srcpage"> carrying its section + chapter title.
// The paginator flows same-chapter pages together and breaks between chapters.
let srcHtml = '';
try {
  const mod = await server.ssrLoadModule('/src/data/worksheetPages.tsx');
  const layout = await server.ssrLoadModule('/src/components/worksheet/pages/PageLayout.tsx');
  const { PageNumberScope } = layout;
  const marker = '<div class="page-content">';
  for (const page of mod.WORKSHEET_PAGES) {
    const markup = renderToStaticMarkup(
      React.createElement(PageNumberScope, { pageNumber: page.id }, page.component()),
    );
    const idx = markup.indexOf(marker);
    if (idx === -1) throw new Error(`page ${page.id}: no .page-content`);
    let inner = markup.slice(idx + marker.length).replace(/<\/div><\/div>$/, '');
    // Explanation pages = the supplied teacher-authored content (credited to the authors, and
    // headed "יחס · למורה"). Their attribution block (author names + curriculum link) is kept.
    const section = page.credit === 'authors' ? 'opening' : 'main';
    srcHtml += `<div class="wb-srcpage" data-section="${section}" data-chapter="${chapTitle(page.chapter)}">${inner}</div>`;
  }
} finally {
  await server.close();
}

const FOOT_AUTHORS = '<footer class="gz-footer"><div class="f1">ד"ר יחיאל תנעמי · איילת קריספין</div><div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div></footer>';
const FOOT_YANIV = '<footer class="gz-footer"><div class="f1">יניב רז - מדריך מחוזי חט"ב בעיר ירושלים</div><div class="f2">הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין</div></footer>';

const wbCss = `
:root{color-scheme:light}
*{box-sizing:border-box}
html,body{max-width:100%;overflow-x:hidden}
body{margin:0;background:#e9edf3;font-family:Rubik,Assistant,Arial,sans-serif}
.wb-doc,.wb-src,.wb-page{direction:rtl}
.wb-doc{display:flex;flex-direction:column;align-items:center;gap:18px;padding:26px 0}
/* Narrow screens (phones/tablets): the paginator scales each page to fit; keep tidy margins. */
@media (max-width:820px){ .wb-doc{gap:10px;padding:8px 0} }
.wb-src{display:none}
/* Each A4 page: header, body (flows the questions), footer pinned to the bottom. */
.wb-page{width:210mm;height:297mm;background:#fff;box-shadow:0 3px 18px rgba(15,23,42,.18);display:flex;flex-direction:column;overflow:hidden;position:relative}
.wb-page > .header-container{flex:0 0 auto}
.wb-page > .wb-body{flex:1 1 auto;min-height:0;height:auto;overflow:hidden;padding:3mm 14mm;display:flex;flex-direction:column;justify-content:flex-start;gap:12px}
.wb-group{break-inside:avoid}
.wb-group > * + *{margin-top:6px}
/* A bulleted statement reads from the right so the black bullet sits next to its first word. */
.wb-page .question-content > p.text-center{text-align:right}
/* Statement tables read right-to-left: the row-label/# column (first header cell) sits on the
   RIGHT, then הטענה, נכונה, לא נכונה flowing left — natural Hebrew order. (A previous LTR hack
   flipped this and put # on the left, which was wrong.) */
.worksheet-table{direction:rtl}
.wb-page.teacher-intro-page .page-number{display:none}
.wb-page > .gz-footer{flex:0 0 auto;text-align:center;direction:rtl;padding:2mm 9mm 2.4mm;border-top:1px solid #dbe3ee;line-height:1.22;background:#fff}
.wb-page > .gz-footer .f1{font-weight:600;font-size:10px;color:#1f2a44;margin-bottom:1px}
.wb-page > .gz-footer .f2{font-size:9px;color:#41506b}
/* Writable fractions in the teacher pages: clear boxes + a spaced bar, not clustered lines. */
.teacher-intro-page .teacher-fraction{min-width:30px;line-height:1.15;vertical-align:middle;padding:0 1px}
.teacher-intro-page .teacher-fraction .teacher-small-blank{border-bottom:none;width:22px;height:15px;margin:1.5px auto;background:#fff;box-shadow:inset 0 0 0 1px #cbd5e1;border-radius:2px}
.teacher-intro-page .teacher-fraction-line{border-top:1.7px solid #111827;margin:2.5px 0;width:100%}
/* Vessels must fit the A4 width (grid tracks were expanding past the page). */
.teacher-intro-page .vessel-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
.teacher-intro-page .vessel-card{min-width:0;min-height:300px}
.teacher-intro-page .teacher-vessel{height:190px}
@page{size:A4;margin:0}
@media print{
  body{background:#fff}
  .wb-doc{gap:0;padding:0}
  .wb-page{box-shadow:none!important;page-break-after:always;page-break-inside:avoid}
  .wb-page:last-child{page-break-after:auto}
}
`;

const paginator = `
(function(){
  var done=false;
  function run(){
  if(done)return; done=true;
  var doc=document.querySelector('.wb-doc');
  var FA=${JSON.stringify(FOOT_AUTHORS)}, FY=${JSON.stringify(FOOT_YANIV)};
  var n=0;
  function newPage(section,title){
    n++;
    var p=document.createElement('div');
    p.className='wb-page worksheet-page'+(section==='opening'?' teacher-intro-page':'');
    p.setAttribute('dir','rtl');
    var _t=(title||'יחס');
    var headTitle=(section==='opening')?'יחס · למורה':(/^יחס/.test(_t)?_t:('יחס - '+_t));
    p.innerHTML='<header class="header-container page-header"><span class="page-header-title page-title">'+headTitle+'</span><div class="page-number">'+n+'</div></header><div class="wb-body page-content"></div>'+(section==='opening'?FA:FY);
    doc.appendChild(p);
    return p.querySelector('.wb-body');
  }
  // Build chapter "runs" — consecutive source pages that share a chapter title.
  var runs=[];
  [].forEach.call(document.querySelectorAll('.wb-src .wb-srcpage'),function(sp){
    var section=sp.getAttribute('data-section'), chapter=sp.getAttribute('data-chapter');
    var groups=[];
    if(section==='opening'){ [].forEach.call(sp.children,function(c){groups.push([c]);}); }
    else {
      var cur=[];
      [].forEach.call(sp.children,function(c){
        if(c.classList.contains('q-separator')){ if(cur.length){groups.push(cur);cur=[];} }
        else cur.push(c);
      });
      if(cur.length)groups.push(cur);
    }
    var last=runs[runs.length-1];
    if(last && last.chapter===chapter && last.section===section){ groups.forEach(function(g){last.groups.push(g);}); }
    else runs.push({section:section,chapter:chapter,groups:groups});
  });
  var GAP=12;
  function boxH(list){ var h=0; for(var i=0;i<list.length;i++){ h+=(i>0?GAP:0)+list[i].__h; } return h; }
  // Paginate each chapter run: measure each question's real height, then GREEDILY pack each A4
  // page up to capacity (full pages). If the chapter's LAST page ends up sparse (a lone/short
  // question stranded), rebalance just the last two pages so both are comfortably full. Nothing
  // ever exceeds the page, so nothing is clipped.
  runs.forEach(function(run){
    var first=newPage(run.section,run.chapter);
    var cs=getComputedStyle(first);
    var padT=parseFloat(cs.paddingTop)||0, padB=parseFloat(cs.paddingBottom)||0;
    // Keep a small safety margin below the clip line: measured heights can settle a few px larger
    // once web fonts finish, so pack a touch conservatively — nothing is ever cut off.
    var cap=first.clientHeight - padT - padB - 28;
    var boxes=run.groups.map(function(g){ var b=document.createElement('div'); b.className='wb-group'; g.forEach(function(el){b.appendChild(el);}); first.appendChild(b); return b; });
    boxes.forEach(function(b){ b.__h=b.getBoundingClientRect().height; });
    boxes.forEach(function(b){ first.removeChild(b); });
    var pages=[[]]; var h=0;
    for(var i=0;i<boxes.length;i++){
      var a=(h>0?GAP:0)+boxes[i].__h;
      if(h>0 && h+a>cap){ pages.push([boxes[i]]); h=boxes[i].__h; }
      else { pages[pages.length-1].push(boxes[i]); h+=a; }
    }
    if(pages.length>=2){
      var L=pages.length-1;
      if(boxH(pages[L]) < cap*0.55){
        var combined=pages[L-1].concat(pages[L]);
        var half=boxH(combined)/2;
        var A=[], hA=0;
        for(var k=0;k<combined.length;k++){
          var aa=(hA>0?GAP:0)+combined[k].__h;
          if(A.length && hA+aa-half > half-hA && (combined.length-k)>0){ break; }
          A.push(combined[k]); hA+=aa;
        }
        if(A.length && A.length<combined.length){ pages[L-1]=A; pages[L]=combined.slice(A.length); }
      }
    }
    pages.forEach(function(grp,pi){
      var bd = pi===0 ? first : newPage(run.section,run.chapter);
      grp.forEach(function(b){ bd.appendChild(b); });
    });
  });
  // Content stays TOP-aligned; the remaining height on each page is spread as EQUAL gaps between
  // questions — proportional and capped so it is generous breathing room, never a giant gap.
  [].forEach.call(document.querySelectorAll('.wb-page .wb-body'),function(body){
    var kids=body.children;
    if(kids.length<2) return;
    var cs=getComputedStyle(body);
    var padT=parseFloat(cs.paddingTop)||0, padB=parseFloat(cs.paddingBottom)||0;
    var contentH=kids[kids.length-1].getBoundingClientRect().bottom - kids[0].getBoundingClientRect().top;
    var avail=body.clientHeight - padT - padB - 28;
    var leftover=avail - contentH;
    if(leftover<=0) return;
    var extra=Math.min(leftover/(kids.length-1), 200);
    body.style.gap=(GAP+extra)+'px';
  });
  // Renumber pages sequentially by DOM order. The teacher ("למורה") opening pages are NOT numbered
  // (the student page count starts at 1 on the first non-teacher page).
  var _i=0; [].forEach.call(document.querySelectorAll('.wb-page'),function(pg){var el=pg.querySelector('.page-number'); if(!el)return; if(pg.classList.contains('teacher-intro-page')){el.textContent='';}else{el.textContent=(++_i);}});
  [].forEach.call(document.querySelectorAll('.wb-src'),function(s){s.remove();});
  fitMobile();
  }
  // Mobile/narrow screens: scale each A4 page to fit the viewport width so a whole page is
  // readable with vertical scrolling only — no horizontal scrolling, no overflow. Uses CSS zoom
  // (scales the layout box too, unlike transform) so pages stack cleanly. Reruns on resize/rotate.
  function fitMobile(){
    var vw=document.documentElement.clientWidth||window.innerWidth||9999;
    var pageW=793.7; // 210mm
    var pages=document.querySelectorAll('.wb-page');
    var scale=(vw < pageW+28) ? Math.max(0.2,(vw-10)/pageW) : '';
    for(var i=0;i<pages.length;i++){ pages[i].style.zoom=scale; }
  }
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(run);}
  setTimeout(run,1500);
  var _rt; window.addEventListener('resize',function(){ clearTimeout(_rt); _rt=setTimeout(function(){ if(done) fitMobile(); },150); });
})();
`;

const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>יחס ופרופורציה — כיתה ח׳ · חוברת מלאה</title>
<style>
${rubikCss}
${appCss}
${wbCss}
</style>
</head>
<body dir="rtl">
<div class="wb-doc" dir="rtl"></div>
<div class="wb-src" dir="rtl">${srcHtml}</div>
<script>${paginator}</script>
</body>
</html>`;

fs.writeFileSync(outFile, html, 'utf8');

// Also emit the Artifact-ready file (claude.ai strips <html>/<head>/<body>, so we hand it the
// <title> + <style> + body content directly). Keeps the local preview and the published
// artifact byte-identical in content.
const artifactBody = `<title>יחס ופרופורציה — כיתה ח׳ · חוברת מלאה</title>
<style>
${rubikCss}
${appCss}
${wbCss}
</style>
<div class="wb-doc" dir="rtl"></div>
<div class="wb-src" dir="rtl">${srcHtml}</div>
<script>${paginator}</script>`;
const artifactFile = outFile.replace(/-full\.html$/, '-artifact.html');
fs.writeFileSync(artifactFile, artifactBody, 'utf8');
console.log(JSON.stringify({ kb: Math.round(Buffer.byteLength(html) / 1024), out: outFile, artifact: artifactFile }));
