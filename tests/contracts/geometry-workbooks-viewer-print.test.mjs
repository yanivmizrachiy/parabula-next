import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

function activeTextFiles(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...activeTextFiles(full));
    else if(/\.(html|css|js|mjs|json|md)$/.test(entry.name))out.push(full);
  }
  return out;
}

test('geometry landing derives counts from manifest and exposes full print for all books',()=>{
  const html=read('workbooks/index.html');
  const js=read('workbooks/index.js');
  assert.match(html,/href="index\.css"/);
  assert.match(html,/src="index\.js"/);
  for(const key of ['circle','cylinder','cone']){
    assert.match(html,new RegExp(`data-book-count="${key}"`));
    assert.match(html,new RegExp(`print\\.html\\?book=${key}`));
  }
  assert.match(js,/fetch\('manifest\.json'/);
  assert.doesNotMatch(html,/<div class="n">(?:101|38|46)<\/div>/);
});

test('circle and cylinder use the same manifest-driven viewer',()=>{
  const viewer=read('workbooks/viewer.js');
  const circle=read('workbooks/circle/index.html');
  const cylinder=read('workbooks/cylinder/index.html');
  assert.match(viewer,/fetchJson\('manifest\.json'\)/);
  assert.match(viewer,/fetchJson\('\.\.\/manifest\.json'\)/);
  for(const html of [circle,cylinder]){
    assert.match(html,/href="\.\.\/viewer\.css"/);
    assert.match(html,/src="\.\.\/viewer\.js"/);
    assert.match(html,/id="prev"/);
    assert.match(html,/id="next"/);
    assert.match(html,/id="page"/);
    assert.match(html,/id="total"/);
    assert.match(html,/הדפסה מלאה/);
    assert.doesNotMatch(html,/const total\s*=/);
  }
  assert.match(circle,/data-workbook="circle"/);
  assert.match(circle,/id="stage"/);
  assert.match(cylinder,/data-workbook="cylinder"/);
});

test('shared print entry assembles every workbook from canonical manifest data',()=>{
  const html=read('workbooks/print.html');
  const js=read('workbooks/print-workbook.js');
  const css=read('workbooks/print-workbook.css');
  assert.match(html,/src="print-workbook\.js"/);
  assert.match(html,/href="print-workbook\.css"/);
  for(const key of ['circle','cylinder','cone'])assert.match(js,new RegExp(`${key}:`));
  assert.match(js,/fetch\('manifest\.json'/);
  assert.match(js,/manifest\.workbooks\?\.\[key\]\?\.pages/);
  assert.match(js,/page-\$\{page\}\.html/);
  assert.match(js,/querySelectorAll\('\.a4-page'\)/);
  assert.match(js,/window\.print\(\)/);
  assert.match(css,/@page\{size:A4;margin:0\}/);
});

test('geometry workbooks have no active dependency on the retired repository',()=>{
  const files=activeTextFiles(path.join(root,'workbooks'));
  const offenders=files.filter(file=>fs.readFileSync(file,'utf8').includes('smartschool-hebrew-voice-notes'));
  assert.deepEqual(offenders,[]);
});
