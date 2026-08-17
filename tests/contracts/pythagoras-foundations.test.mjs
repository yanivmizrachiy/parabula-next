import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FOUNDATION = [634,635,636,637,638,639,640,641,651,642,652,643,644,645,646,647,653,648,649,650];
const LEGACY = [...Array.from({length:22},(_,i)=>9+i),41];
const ADVANCED = [375,376,377,378,379,380];
const read = (file) => fs.readFileSync(path.join(ROOT,file),'utf8');
const meta = JSON.parse(read('meta/topics.json'));
const topic = meta.topics.find((t)=>t.name==='משפט פיתגורס');
if (!topic) throw new Error('הנושא משפט פיתגורס חסר במטא');
const visible = topic.pages.map((p)=>p.number);
const total = visible.length;
const titles = [...Array(5).fill('מושגים בסיסיים'),...Array(7).fill('חזקות ושורשים'),...Array(8).fill('משפט פיתגורס')];
const foundationNote = (html) => html.match(/<div class="foundation-note">([\s\S]*?)<\/div>/u)?.[1] ?? '';
const visibleText = (html) => html.replace(/<[^>]+>/gu,' ').replace(/\s+/gu,' ').trim();

function trianglePoints(d) {
  const tokens = d.replace(/,/g,' ').match(/[MLHVZ]|-?\d+(?:\.\d+)?/g) ?? [];
  const points=[]; let i=0,x=0,y=0;
  while (i<tokens.length) {
    const cmd=tokens[i++];
    if (cmd==='M' || cmd==='L') { x=Number(tokens[i++]); y=Number(tokens[i++]); points.push([x,y]); }
    else if (cmd==='H') { x=Number(tokens[i++]); points.push([x,y]); }
    else if (cmd==='V') { y=Number(tokens[i++]); points.push([x,y]); }
    else if (cmd==='Z') break;
  }
  return points.slice(0,3);
}
function angles(points) {
  const out=[];
  for (let i=0;i<3;i++) {
    const a=points[(i+2)%3], b=points[i], c=points[(i+1)%3];
    const u=[a[0]-b[0],a[1]-b[1]], v=[c[0]-b[0],c[1]-b[1]];
    const dot=u[0]*v[0]+u[1]*v[1];
    const nu=Math.hypot(...u), nv=Math.hypot(...v);
    out.push(Math.acos(Math.max(-1,Math.min(1,dot/(nu*nv))))*180/Math.PI);
  }
  return out;
}

test('דפי היסוד והחומר הוותיק נשמרים',()=>{
  assert.deepEqual(visible.slice(0,FOUNDATION.length),FOUNDATION);
  for (const n of [...LEGACY,...ADVANCED]) assert.ok(fs.existsSync(path.join(ROOT,`עמוד-${n}.html`)),`דף חסר: ${n}`);
});

test('20 דפי היסוד משתמשים בשלוש משפחות כותרת בלבד ושומרים מבנה A4',()=>{
  FOUNDATION.forEach((n,i)=>{
    const html=read(`עמוד-${n}.html`);
    assert.match(html,/<html\s+lang="he"\s+dir="rtl"/u);
    assert.match(html,new RegExp(`משפט פיתגורס — עמוד ${i+1} \\/ ${total}`,'u'));
    assert.match(html,new RegExp(`<div class="page-number">${i+1}<\\/div>`,'u'));
    assert.ok(html.includes(`<h1 class="page-title">${titles[i]}</h1>`),`עמוד ${n}: כותרת משפחה שגויה`);
    assert.equal((html.match(/<h1\b/gu)||[]).length,1);
    assert.equal((html.match(/<h[2-6]\b/gu)||[]).length,0);
    assert.doesNotMatch(html,/\sstyle\s*=\s*["']/u);
    assert.match(read(`styles/pages/עמוד-${n}.css`),/@import url\("\.\.\/topics\/pythagoras-foundations\.css"\);/u);
  });
});

test('ההשלמות העליונות אינן נותנות לתלמיד את מילת המפתח',()=>{
  const notes=[634,635,636,637,638,639].map((n)=>foundationNote(read(`עמוד-${n}.html`)));
  for (const note of notes) assert.match(note,/foundation-fill/u,'בדף פתיחה/מושג נדרשת השלמה משמעותית');
  assert.doesNotMatch(visibleText(notes[0]),/90/u);
  assert.doesNotMatch(visibleText(notes[1]),/90/u);
  assert.doesNotMatch(visibleText(notes[2]),/ניצבים/u);
  assert.doesNotMatch(visibleText(notes[3]),/יתר|הארוכה/u);
  assert.doesNotMatch(visibleText(notes[4]),/ניצבים|יתר/u);
  assert.match(notes[0],/foundation-unit">°<\/span>/u);
  assert.match(notes[1],/foundation-unit">°<\/span>/u);
  assert.ok(read('עמוד-639.html').includes('\\cdot'),'כפל בהסבר חזקה שנייה חייב להיות בנקודה');
});

test('משימות הזיהוי אינן מגלות את התשובה מראש',()=>{
  const p1=read('עמוד-634.html');
  const p2=read('עמוד-635.html');
  const a1=p1.match(/angle-choice-grid">([\s\S]*?)<\/div><div class="q-main compact-instruction/u)?.[1] ?? '';
  const a2=p2.match(/triangle-choice-grid">([\s\S]*?)<\/div><div class="q-main compact-instruction/u)?.[1] ?? '';
  assert.doesNotMatch(a1,/class="mark"/u);
  assert.doesNotMatch(a2,/class="mark"/u);
  assert.doesNotMatch(a1,/aria-label="[^"]*(?:ישרה|90)/u);
  assert.doesNotMatch(a2,/aria-label="[^"]*(?:ישר־זווית|ישר זווית|90)/u);
  assert.equal((p1.match(/class="guided-ray-svg"/gu)||[]).length,2);
  assert.equal((p1.match(/marker-end="url\(#ray-arrow-[ab]\)"/gu)||[]).length,2);
});

test('משולשי הבחירה בעמוד 2 מדויקים: נכונים 90° ומסיחים רחוקים מ-90°',()=>{
  const p2=read('עמוד-635.html');
  const section=p2.match(/triangle-choice-grid">([\s\S]*?)<\/div><div class="q-main compact-instruction/u)?.[1] ?? '';
  const ds=[...section.matchAll(/<path class="edge" d="([^"]+)"/gu)].map((m)=>m[1]);
  assert.equal(ds.length,6);
  const all=ds.map((d)=>angles(trianglePoints(d)));
  for (const idx of [0,2,4]) assert.ok(Math.min(...all[idx].map((a)=>Math.abs(a-90)))<0.01,`פריט ${idx+1} חייב להיות 90° מדויק`);
  for (const idx of [1,3,5]) assert.ok(Math.min(...all[idx].map((a)=>Math.abs(a-90)))>4,`פריט ${idx+1} קרוב מדי ל-90°`);
});

test('שתי משימות ההשלמה בעמוד 2 מתחילות מצלעות מאונכות בדיוק',()=>{
  const html=read('עמוד-635.html');
  const paths=[...html.matchAll(/<path class="guide-edge" d="([^"]+)"/gu)].map((m)=>m[1]);
  assert.equal(paths.length,2);
  assert.equal(paths[0],'M55 92 H192 M55 92 V34');
  const m=paths[1].match(/M82 92 L(\d+) (\d+) M82 92 L(\d+) (\d+)/u);
  assert.ok(m);
  const u=[Number(m[1])-82,Number(m[2])-92],v=[Number(m[3])-82,Number(m[4])-92];
  assert.equal(u[0]*v[0]+u[1]*v[1],0);
});

test('קווי הגאומטריה דקים ונקיים להדפסה',()=>{
  const css=read('styles/topics/pythagoras-foundations.css');
  const edge=css.match(/\.pyt-foundation \.edge \{[^}]*stroke-width:\s*([\d.]+)px/usu)?.[1];
  const mark=css.match(/\.pyt-foundation \.mark \{[^}]*stroke-width:\s*([\d.]+)px/usu)?.[1];
  assert.ok(edge && Number(edge)<=2.2,'קווי הצלעות עבים מדי');
  assert.ok(mark && Number(mark)<=1.8,'סימוני הזווית עבים מדי');
});

test('עמוד 4 נותן נימוק אמיתי; עמוד 5 משמר תרגול לפי אורכים',()=>{
  const p4=read('עמוד-637.html');
  const p5=read('עמוד-638.html');
  assert.equal((p4.match(/data-required-reason-lines="2"/gu)||[]).length,6);
  assert.equal((p4.match(/class="reason-space"/gu)||[]).length,6);
  assert.ok((p5.match(/aria-label="כתבו את אורך היתר"/gu)||[]).length>=2);
  assert.match(p5,/6, 8, 10/u);
  assert.match(p5,/5, 12, 13/u);
});

test('חזקות ושורשים מופיעים לפני פתרון פיתגורס בדרך מלאה',()=>{
  assert.match(read('עמוד-639.html'),/\\cdot/u);
  assert.match(read('עמוד-641.html'),/\\sqrt/u);
  assert.match(read('עמוד-642.html'),/\\approx/u);
  for (const n of [651,652]) {
    const html=read(`עמוד-${n}.html`);
    assert.match(html,/x\^2/u);
    assert.match(html,/\\sqrt/u);
    assert.doesNotMatch(html,/±/u);
  }
});

test('דוגמאות הפתרון הקנוניות נשמרות',()=>{
  const p17=read('עמוד-653.html');
  for (const step of ['3^2+4^2=x^2','9+16=x^2','25=x^2','\\sqrt{25}=x','5=x']) assert.ok(p17.includes(step));
  assert.match(p17,/class="final-answer"/u);
  const p19=read('עמוד-649.html');
  for (const step of ['x^2+4^2=5^2','x^2+16=25','x^2=9','\\sqrt{9}=x','3=x']) assert.ok(p19.includes(step));
});

test('תרגילי פיתגורס מלאים מקבלים לפחות 5 שורות ותשובה סופית',()=>{
  for (const n of [647,653,648,649,650]) {
    const html=read(`עמוד-${n}.html`);
    const cards=(html.match(/(?:full-solution-card|equation-practice-card)/gu)||[]).length;
    const spaces=(html.match(/data-required-lines="5"/gu)||[]).length;
    const finals=(html.match(/class="student-final-answer"/gu)||[]).length;
    assert.ok(cards>=4,`עמוד ${n}: מעט מדי תרגול מלא`);
    assert.ok(spaces>=4,`עמוד ${n}: חסר מקום דרך מלא`);
    assert.ok(finals>=4,`עמוד ${n}: חסרה תשובה סופית`);
  }
});

test('תיבת סגנון 5 נשמרת',()=>{
  const css=read('styles/topics/pythagoras-foundations.css');
  assert.match(css,/\.foundation-fill \{[^}]*border: 1\.35px solid #1f2a44;[^}]*border-radius: 8px;[^}]*box-shadow:/u);
  for (const [cls,w] of [['number',58],['short',82],['term',118],['medium',112]]) assert.match(css,new RegExp(`\\.foundation-fill-${cls} \\{ width: ${w}px; \\}`,'u'));
});
