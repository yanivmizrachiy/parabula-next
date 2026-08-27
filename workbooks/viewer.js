const body=document.body;
const key=body.dataset.workbook;
const title=body.dataset.title||'חוברת';
const frame=document.getElementById('sheet');
const input=document.getElementById('page');
const totalEl=document.getElementById('total');
const stage=document.getElementById('stage');
const stageNote=document.getElementById('stage-note');
const open=document.getElementById('open');
const prev=document.getElementById('prev');
const next=document.getElementById('next');

let total=1;
let stages=[];

async function fetchJson(url){
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function loadWorkbookMeta(){
  try{
    const local=await fetchJson('manifest.json');
    if(Number.isInteger(Number(local.pageCount))&&Number(local.pageCount)>0){
      return {pages:Number(local.pageCount),stages:Array.isArray(local.stages)?local.stages:[]};
    }
  }catch(error){
    if(key==='circle')throw error;
  }
  const top=await fetchJson('../manifest.json');
  const entry=top.workbooks?.[key];
  const pages=Number(entry?.pages);
  if(!Number.isInteger(pages)||pages<1)throw new Error(`לא נמצא מספר דפים תקין עבור ${key}`);
  return {pages,stages:[]};
}

function currentStage(page){
  return stages.find(item=>page>=item.from&&page<=item.to);
}

function syncStage(page){
  if(!stage||!stages.length)return;
  const item=currentStage(page);
  if(!item)return;
  stage.value=item.id;
  stageNote.textContent=`${item.title} · עמודים ${item.from}–${item.to}`;
}

function go(value,{replaceHistory=true}={}){
  const page=Math.max(1,Math.min(total,Math.trunc(Number(value))||1));
  input.value=String(page);
  const url=`page-${page}.html`;
  frame.src=url;
  frame.title=`${title} — עמוד ${page}`;
  open.href=url;
  prev.disabled=page===1;
  next.disabled=page===total;
  syncStage(page);
  if(replaceHistory)history.replaceState(null,'',`#page=${page}`);
}

prev.addEventListener('click',()=>go(Number(input.value)-1));
next.addEventListener('click',()=>go(Number(input.value)+1));
input.addEventListener('change',()=>go(input.value));
input.addEventListener('keydown',event=>{if(event.key==='Enter')go(input.value)});
if(stage){
  stage.addEventListener('change',()=>{
    const item=stages.find(candidate=>candidate.id===stage.value);
    if(item)go(item.from);
  });
}
document.addEventListener('keydown',event=>{
  if(event.target===input||event.target===stage)return;
  if(event.key==='ArrowLeft')go(Number(input.value)-1);
  if(event.key==='ArrowRight')go(Number(input.value)+1);
});

loadWorkbookMeta().then(meta=>{
  total=meta.pages;
  stages=meta.stages;
  input.max=String(total);
  totalEl.textContent=String(total);
  if(stage&&stages.length){
    stage.hidden=false;
    stage.replaceChildren(...stages.map(item=>{
      const option=document.createElement('option');
      option.value=item.id;
      option.textContent=`${item.title} (${item.from}–${item.to})`;
      return option;
    }));
    stageNote.hidden=false;
  }else{
    stage?.setAttribute('hidden','');
    stageNote?.setAttribute('hidden','');
  }
  const match=location.hash.match(/page=(\d+)/);
  go(match?match[1]:1);
}).catch(error=>{
  console.error(error);
  totalEl.textContent='שגיאה';
  stageNote.hidden=false;
  stageNote.textContent='לא ניתן לטעון את מבנה החוברת';
  prev.disabled=true;
  next.disabled=true;
});
