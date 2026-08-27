import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));
const fail=msg=>{throw new Error(`Circle canonical QA failed: ${msg}`)};
const manifest=JSON.parse(read('workbooks/circle/manifest.json'));
const top=JSON.parse(read('workbooks/manifest.json'));

if(manifest.canonicalRepository!=='yanivmizrachiy/razpages')fail('wrong canonical repository');
if(manifest.canonicalRoot!=='workbooks/circle')fail('wrong canonical root');
if(manifest.sourceOfTruth!==true||manifest.singleWorkbook!==true||manifest.graded!==true)fail('single graded source-of-truth flags missing');
const total=Number(manifest.pageCount);
if(!Number.isInteger(total)||total<1)fail('invalid pageCount');
if(Number(top.workbooks?.circle?.pages)!==total)fail('top manifest count mismatch');
if(top.workbooks?.circle?.entry!=='workbooks/circle/index.html')fail('wrong canonical circle entry');
if(top.workbooks?.circle?.sequenceRegistry!=='workbooks/circle/manifest.json')fail('top manifest missing sequence registry');

const pageFiles=fs.readdirSync(path.join(root,'workbooks/circle')).filter(n=>/^page-\d+\.html$/.test(n)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
if(pageFiles.length!==total)fail(`expected ${total} canonical pages, found ${pageFiles.length}`);
for(let i=1;i<=total;i++){if(pageFiles[i-1]!==`page-${i}.html`)fail(`sequence gap at ${i}`)}
const wrapper=read('workbooks/circle/page-1.html');
for(const marker of ["fetch('manifest.json'","canonical-circle-page","source/original-88/page-","source/targilim/","source/bbb/עמוד-","גליל וחרוט"]){if(!wrapper.includes(marker))fail(`canonical loader marker missing: ${marker}`)}
for(const name of pageFiles){if(read(`workbooks/circle/${name}`)!==wrapper)fail(`${name} is not using the single canonical loader`)}

const resolved=[];
for(let n=1;n<=total;n++){
  const s=manifest.segments.find(x=>n>=x.from&&n<=x.to);
  if(!s)fail(`no segment for canonical page ${n}`);
  let key;
  if(s.kind==='original')key=`original:${s.sourceStart+(n-s.from)}`;
  else if(s.kind==='targilim')key=`targilim:${s.source}`;
  else if(s.kind==='bbb'||s.kind==='bbb-fragment')key=`${s.kind}:${s.sourceStart+(n-s.from)}`;
  else fail(`unknown segment kind ${s.kind}`);
  if(resolved.includes(key))fail(`duplicate active mapping ${key}`);
  resolved.push(key);
}
if(resolved.length!==total)fail('resolved mapping count mismatch');

for(let i=1;i<=88;i++)if(!exists(`workbooks/circle/source/original-88/page-${i}.html`))fail(`missing preserved original circle page ${i}`);
for(const f of ['g8-06.html','g8-05.html','g8-01.html'])if(!exists(`workbooks/circle/source/targilim/${f}`))fail(`missing targilim source ${f}`);
for(let p=196;p<=205;p++)if(!exists(`workbooks/circle/source/bbb/עמוד-${p}.html`))fail(`missing BBB source page ${p}`);
for(const a of ['p04.png','p10.png','p11.png'])if(!exists(`workbooks/circle/source/bbb/assets/${a}`))fail(`missing BBB asset ${a}`);

const sourceText=[...Array.from({length:88},(_,i)=>read(`workbooks/circle/source/original-88/page-${i+1}.html`)),read('workbooks/circle/source/targilim/g8-06.html'),read('workbooks/circle/source/targilim/g8-05.html'),read('workbooks/circle/source/targilim/g8-01.html'),...Array.from({length:10},(_,i)=>read(`workbooks/circle/source/bbb/עמוד-${196+i}.html`))].join('\n');
for(const marker of ['המעגל הוא קו הגבול. העיגול הוא התחום שבתוך המעגל.','חוט, נעץ ועיפרון','קוטר, רדיוס ומיתר','זווית מרכזית וחלק מעיגול','העין של לונדון','המכרז העירוני','ראש העיר רוצה להכפיל את רדיוס הבריכה','מעגל שמרכזו בראשית הצירים'])if(!sourceText.includes(marker))fail(`missing source content: ${marker}`);

const fragment=read('workbooks/circle/source/bbb/עמוד-205.html');
const circlePos=fragment.indexOf('ראש העיר רוצה להכפיל את רדיוס הבריכה');
const cylinderPos=fragment.indexOf('גליל וחרוט');
if(circlePos<0||cylinderPos<0||circlePos>=cylinderPos)fail('BBB page 205 circle/cylinder boundary is invalid');
const fragSegment=manifest.segments.find(s=>s.kind==='bbb-fragment');
if(!fragSegment||fragSegment.from!==83||fragSegment.to!==83||fragSegment.sourceStart!==205)fail('BBB fragment must be canonical page 83 only');

let cursor=1;
for(const stage of manifest.stages){if(stage.from!==cursor)fail(`stage gap before ${stage.id}`);if(stage.to<stage.from)fail(`invalid stage ${stage.id}`);cursor=stage.to+1}
if(cursor!==total+1)fail('stages do not cover the full workbook');

const index=read('workbooks/circle/index.html');
const viewer=read('workbooks/viewer.js');
if(!index.includes('../viewer.js'))fail('reader is not connected to the shared viewer');
if(!viewer.includes("fetchJson('manifest.json')"))fail('shared viewer does not derive circle state from local manifest');
if(!index.includes('id="stage"'))fail('reader has no graded stage navigation');
if(!index.includes('../print.html?book=circle'))fail('reader has no full-workbook print action');
const rules=read('CLAUDE.md');
for(const marker of ['### 2.1 חוזה קנוני — מעגל, גליל וחרוט','`workbooks/circle/`','אין להשאיר חוברת מעגל נוספת או סדר חלופי פעיל'])if(!rules.includes(marker))fail(`CLAUDE.md geometry source-of-truth marker missing: ${marker}`);

console.log(`Circle canonical QA: PASS — ${total} pages, one graded sequence, all source families preserved.`);
