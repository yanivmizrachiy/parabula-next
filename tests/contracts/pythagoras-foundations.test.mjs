import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const FOUNDATION=[634,635,636,637,638,639,640,641,651,642,652,643,644,645,646,647,653,648,649,650];
const LEGACY=[...Array.from({length:22},(_,i)=>9+i),41];
const ADVANCED=[375,376,377,378,379,380];
const read=(f)=>fs.readFileSync(path.join(ROOT,f),'utf8');
const meta=JSON.parse(read('meta/topics.json'));
const topic=meta.topics.find((t)=>t.name==='משפט פיתגורס');
if(!topic) throw new Error('הנושא משפט פיתגורס חסר במטא');
const visible=topic.pages.map((p)=>p.number);
const total=visible.length;
const titles=[...Array(5).fill('מושגים בסיסיים'),...Array(7).fill('חזקות ושורשים'),...Array(8).fill('משפט פיתגורס')];
const foundationNote=(html)=>html.match(/<div class="foundation-note">([\s\S]*?)<\/div>/u)?.[1]??'';
const visibleText=(html)=>html.replace(/<[^>]+>/gu,' ').replace(/\s+/gu,' ').trim();

function trianglePoints(d){
  const tokens=d.replace(/,/g,' ').match(/[MLHVZ]|-?\d+(?:\.\d+)?/g)??[];
  const pts=[];let i=0,x=0,y=0;
  while(i<tokens.length){const c=tokens[i++];if(c==='M'||c==='L'){x=Number(tokens[i++]);y=Number(tokens[i++]);pts.push([x,y]);}else if(c==='H'){x=Number(tokens[i++]);pts.push([x,y]);}else if(c==='V'){y=Number(tokens[i++]);pts.push([x,y]);}else if(c==='Z')break;}
  return pts.slice(0,3);
}
function angles(p){return p.map((_,i)=>{const a=p[(i+2)%3],b=p[i],c=p[(i+1)%3],u=[a[0]-b[0],a[1]-b[1]],v=[c[0]-b[0],c[1]-b[1]],dot=u[0]*v[0]+u[1]*v[1];return Math.acos(Math.max(-1,Math.min(1,dot/(Math.hypot(...u)*Math.hypot(...v)))))*180/Math.PI;});}

test('דפי היסוד והחומר הוותיק נשמרים',()=>{
  assert.deepEqual(visible.slice(0,FOUNDATION.length),FOUNDATION);
  for(const n of [...LEGACY,...ADVANCED]) assert.ok(fs.existsSync(path.join(ROOT,`עמוד-${n}.html`)),`דף חסר: ${n}`);
});

test('20 דפי היסוד משתמשים בשלוש משפחות כותרת בלבד ושומרים מבנה A4',()=>{
  FOUNDATION.forEach((n,i)=>{const html=read(`עמוד-${n}.html`);assert.match(html,/<html\s+lang="he"\s+dir="rtl"/u);assert.ok(html.includes(`משפט פיתגורס — עמוד ${i+1} / ${total}`));assert.ok(html.includes(`<div class="page-number">${i+1}</div>`));assert.ok(html.includes(`<h1 class="page-title">${titles[i]}</h1>`),`עמוד ${n}: כותרת שגויה`);assert.equal((html.match(/<h1\b/gu)||[]).length,1);assert.equal((html.match(/<h[2-6]\b/gu)||[]).length,0);assert.doesNotMatch(html,/\sstyle\s*=\s*["']/u);assert.match(read(`styles/pages/עמוד-${n}.css`),/@import url\("\.\.\/topics\/pythagoras-foundations\.css"\);/u);});
});

test('ההשלמות העליונות אינן נותנות את מילת המפתח',()=>{
  const notes=[634,635,636,637,638,639].map((n)=>foundationNote(read(`עמוד-${n}.html`)));
  for(const note of notes) assert.match(note,/foundation-fill/u);
  assert.doesNotMatch(visibleText(notes[0]),/90/u);assert.doesNotMatch(visibleText(notes[1]),/90/u);assert.doesNotMatch(visibleText(notes[2]),/ניצבים/u);assert.doesNotMatch(visibleText(notes[3]),/יתר|הארוכה/u);assert.doesNotMatch(visibleText(notes[4]),/ניצבים|יתר/u);
  assert.match(notes[0],/foundation-unit">°<\/span>/u);assert.match(notes[1],/foundation-unit">°<\/span>/u);assert.ok(read('עמוד-639.html').includes('\\cdot'));
});

test('משימות הזיהוי אינן מגלות את התשובה מראש',()=>{
  const p1=read('עמוד-634.html'),p2=read('עמוד-635.html');
  const a1=p1.match(/angle-choice-grid">([\s\S]*?)<\/div><div class="q-main compact-instruction/u)?.[1]??'';
  const a2=p2.match(/triangle-choice-grid">([\s\S]*?)<\/div><div class="q-main compact-instruction/u)?.[1]??'';
  assert.doesNotMatch(a1,/class="mark"/u);assert.doesNotMatch(a2,/class="mark"/u);assert.doesNotMatch(a1,/aria-label="[^"]*(?:ישרה|90)/u);assert.doesNotMatch(a2,/aria-label="[^"]*(?:ישר־זווית|ישר זווית|90)/u);
  assert.equal((p1.match(/class="guided-ray-svg"/gu)||[]).length,2);assert.equal((p1.match(/marker-end="url\(#ray-arrow-[ab]\)"/gu)||[]).length,2);
});

test('משולשי הבחירה בעמוד 2 מדויקים ואינם כוללים מסיח כמעט-ישר',()=>{
  const p2=read('עמוד-635.html');const section=p2.match(/triangle-choice-grid">([\s\S]*?)<\/div><div class="q-main compact-instruction/u)?.[1]??'';const ds=[...section.matchAll(/<path class="edge" d="([^"]+)"/gu)].map((m)=>m[1]);assert.equal(ds.length,6);const all=ds.map((d)=>angles(trianglePoints(d)));for(const idx of [0,2,4])assert.ok(Math.min(...all[idx].map((a)=>Math.abs(a-90)))<0.01);for(const idx of [1,3,5])assert.ok(Math.min(...all[idx].map((a)=>Math.abs(a-90)))>4);
});

test('שתי משימות ההשלמה בעמוד 2 מתחילות מצלעות מאונכות בדיוק',()=>{
  const paths=[...read('עמוד-635.html').matchAll(/<path class="guide-edge" d="([^"]+)"/gu)].map((m)=>m[1]);assert.equal(paths.length,2);assert.equal(paths[0],'M55 92 H192 M55 92 V34');const m=paths[1].match(/M82 92 L(\d+) (\d+) M82 92 L(\d+) (\d+)/u);assert.ok(m);const u=[+m[1]-82,+m[2]-92],v=[+m[3]-82,+m[4]-92];assert.equal(u[0]*v[0]+u[1]*v[1],0);
});

test('קווי הגאומטריה דקים ונקיים להדפסה',()=>{
  const css=read('styles/topics/pythagoras-foundations.css');
  const edge=css.match(/\.pyt-foundation \.foundation-svg \.edge \{[^}]*stroke-width:\s*([\d.]+)(?:px)?/us)?.[1];
  const mark=css.match(/\.pyt-foundation \.foundation-svg \.mark \{[^}]*stroke-width:\s*([\d.]+)(?:px)?/us)?.[1];
  assert.ok(edge&&Number(edge)<=2.2,`קווי הצלעות עבים מדי: ${edge}`);assert.ok(mark&&Number(mark)<=1.8,`סימוני הזווית עבים מדי: ${mark}`);
});

test('עמוד 4 נותן ארבע שורות נימוק אמיתיות; עמוד 5 משמר תרגול לפי אורכים',()=>{
  const p4=read('עמוד-637.html'),p5=read('עמוד-638.html'),css4=read('styles/pages/עמוד-637.css');
  assert.equal((p4.match(/data-required-reason-lines="4"/gu)||[]).length,6);
  assert.equal((p4.match(/class="reason-space"/gu)||[]).length,6);
  assert.match(css4,/\.page-637 \.reason-space \{[^}]*min-height:\s*120px/us);
  assert.ok((p5.match(/aria-label="כתבו את אורך היתר"/gu)||[]).length>=2);assert.match(p5,/6, 8, 10/u);assert.match(p5,/5, 12, 13/u);
});

test('חזקות ושורשים מופיעים לפני פתרון פיתגורס בדרך מלאה',()=>{
  assert.match(read('עמוד-639.html'),/\\cdot/u);assert.match(read('עמוד-641.html'),/\\sqrt/u);assert.match(read('עמוד-642.html'),/\\approx/u);for(const n of [651,652]){const h=read(`עמוד-${n}.html`);assert.match(h,/x\^2/u);assert.match(h,/\\sqrt/u);assert.doesNotMatch(h,/±/u);}
});

test('דוגמאות הפתרון הקנוניות נשמרות',()=>{
  const p17=read('עמוד-653.html');for(const s of ['3^2+4^2=x^2','9+16=x^2','25=x^2','\\sqrt{25}=x','5=x'])assert.ok(p17.includes(s));assert.match(p17,/class="final-answer"/u);const p19=read('עמוד-649.html');for(const s of ['x^2+4^2=5^2','x^2+16=25','x^2=9','\\sqrt{9}=x','3=x'])assert.ok(p19.includes(s));
});

test('תרגילי פיתגורס מלאים מקבלים לפחות 5 שורות ותשובה סופית',()=>{
  for(const n of [647,653,648,649,650]){const html=read(`עמוד-${n}.html`);assert.ok((html.match(/data-required-lines="5"/gu)||[]).length>=4,`עמוד ${n}: חסר מקום דרך`);assert.ok((html.match(/class="student-final-answer"/gu)||[]).length>=4,`עמוד ${n}: חסרה תשובה סופית`);}
});

test('תיבת סגנון 5 נשמרת',()=>{
  const css=read('styles/topics/pythagoras-foundations.css');assert.match(css,/\.foundation-fill \{[^}]*border: 1\.35px solid #1f2a44;[^}]*border-radius: 8px;[^}]*box-shadow:/u);for(const [c,w] of [['number',58],['short',82],['term',118],['medium',112]])assert.match(css,new RegExp(`\\.foundation-fill-${c} \\{ width: ${w}px; \\}`,'u'));
});
