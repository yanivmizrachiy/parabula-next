const BOOKS={
  circle:{title:'חוברת המעגל',mode:'pages'},
  cylinder:{title:'חוברת הגליל',mode:'pages'},
  cone:{title:'חוברת החרוט',mode:'document'}
};

const params=new URLSearchParams(location.search);
const key=params.get('book');
const book=BOOKS[key];
const title=document.getElementById('print-title');
const status=document.getElementById('print-status');
const output=document.getElementById('print-output');
const frame=document.getElementById('print-loader');
const printButton=document.getElementById('print-button');
const adoptedStyles=new Set();

function fail(message){
  output.setAttribute('aria-busy','false');
  output.innerHTML=`<div class="print-error"><strong>לא ניתן להכין את החוברת להדפסה.</strong><br>${message}</div>`;
  status.textContent='שגיאה';
  printButton.disabled=true;
}

async function fetchManifest(){
  const response=await fetch('manifest.json',{cache:'no-store'});
  if(!response.ok)throw new Error(`manifest HTTP ${response.status}`);
  return response.json();
}

function waitForRenderable(url,{minimumPages=1,timeoutMs=30000}={}){
  return new Promise((resolve,reject)=>{
    const started=Date.now();
    let settled=false;
    const cleanup=()=>{settled=true;clearInterval(timer)};
    const timer=setInterval(async()=>{
      if(settled)return;
      if(Date.now()-started>timeoutMs){cleanup();reject(new Error(`פג זמן הטעינה של ${url}`));return}
      try{
        const doc=frame.contentDocument;
        if(!doc||doc.readyState==='loading')return;
        if(doc.querySelector('.loading'))return;
        if(doc.body?.textContent?.includes('שגיאה בטעינת העמוד')){
          cleanup();reject(new Error(`שגיאה בתוך ${url}`));return;
        }
        const pages=doc.querySelectorAll('.a4-page');
        if(pages.length<minimumPages)return;
        const mathjax=doc.defaultView?.MathJax;
        if(mathjax?.startup?.promise)await mathjax.startup.promise.catch(()=>{});
        if(doc.fonts?.ready)await doc.fonts.ready.catch(()=>{});
        cleanup();resolve(doc);
      }catch(error){
        if(frame.src&&new URL(frame.src).origin!==location.origin){cleanup();reject(error)}
      }
    },100);
    frame.src=url;
  });
}

function adoptHeadStyles(doc){
  for(const node of doc.head.querySelectorAll('link[rel="stylesheet"],style')){
    if(node.tagName==='LINK'){
      const href=node.href;
      if(!href||adoptedStyles.has(`link:${href}`))continue;
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=href;
      document.head.append(link);
      adoptedStyles.add(`link:${href}`);
      continue;
    }
    const text=node.textContent||'';
    const key=`style:${text}`;
    if(adoptedStyles.has(key))continue;
    const style=document.createElement('style');
    style.textContent=text;
    document.head.append(style);
    adoptedStyles.add(key);
  }
}

function makeAbsolute(value,base){
  if(!value||value.startsWith('#')||value.startsWith('data:')||value.startsWith('mailto:')||value.startsWith('tel:')||value.startsWith('javascript:'))return value;
  try{return new URL(value,base).href}catch{return value}
}

function absolutizeTree(root,base){
  const selectors=[['src'],['href'],['poster']];
  for(const [attr] of selectors){
    for(const node of root.querySelectorAll(`[${attr}]`)){
      const value=node.getAttribute(attr);
      if(value)node.setAttribute(attr,makeAbsolute(value,base));
    }
  }
  for(const image of root.querySelectorAll('image[href]')){
    const value=image.getAttribute('href');
    if(value)image.setAttribute('href',makeAbsolute(value,base));
  }
}

function appendPages(doc,pages){
  adoptHeadStyles(doc);
  for(const source of pages){
    const clone=source.cloneNode(true);
    clone.classList.add('print-workbook-page');
    absolutizeTree(clone,doc.baseURI);
    output.append(clone);
  }
}

async function buildPagedWorkbook(total){
  for(let page=1;page<=total;page+=1){
    status.textContent=`מכין עמוד ${page} מתוך ${total}`;
    const doc=await waitForRenderable(`${key}/page-${page}.html`);
    const pages=[...doc.querySelectorAll('.a4-page')];
    if(pages.length!==1)throw new Error(`עמוד ${page}: ציפיתי לדף A4 יחיד ומצאתי ${pages.length}`);
    appendPages(doc,pages);
  }
}

async function buildDocumentWorkbook(total){
  status.textContent='מכין את כל דפי החרוט';
  const doc=await waitForRenderable(`${key}/index.html`,{minimumPages:total});
  const pages=[...doc.querySelectorAll('.a4-page')];
  if(pages.length!==total)throw new Error(`ציפיתי ל-${total} דפים ומצאתי ${pages.length}`);
  appendPages(doc,pages);
}

async function main(){
  if(!book){fail('החוברת המבוקשת אינה קיימת.');return}
  title.textContent=`${book.title} — הדפסה מלאה`;
  document.title=`${book.title} — הדפסה מלאה`;
  const manifest=await fetchManifest();
  const total=Number(manifest.workbooks?.[key]?.pages);
  if(!Number.isInteger(total)||total<1)throw new Error('מספר הדפים אינו תקין ב-manifest');
  if(book.mode==='pages')await buildPagedWorkbook(total);
  else await buildDocumentWorkbook(total);
  output.setAttribute('aria-busy','false');
  status.textContent=`מוכן: ${total} עמודים`;
  printButton.disabled=false;
}

printButton.addEventListener('click',()=>window.print());
main().catch(error=>{console.error(error);fail(error.message||String(error))});
