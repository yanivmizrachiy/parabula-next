import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const FOUNDATION=[634,635,636,637,638,639,640,641,651,642,652,643,644,645,646,647,653,648,649,650];
const TITLES=[...Array(5).fill('מושגים בסיסיים'),...Array(7).fill('חזקות ושורשים'),...Array(8).fill('משפט פיתגורס')];
const read=(f)=>fs.readFileSync(path.join(ROOT,f),'utf8');
const meta=JSON.parse(read('meta/topics.json'));
const topic=meta.topics.find((t)=>t.name==='משפט פיתגורס');
if(!topic) throw new Error('הנושא משפט פיתגורס חסר');
const VISIBLE=topic.pages.map((p)=>p.number);
const TOTAL=VISIBLE.length;
const htmlOf=(n)=>read(`עמוד-${n}.html`);
const textOf=(html)=>html.replace(/<script\b[\s\S]*?<\/script>/giu,' ').replace(/<style\b[\s\S]*?<\/style>/giu,' ').replace(/<nav\b[\s\S]*?<\/nav>/giu,' ').replace(/<footer\b[\s\S]*?<\/footer>/giu,' ').replace(/<[^>]+>/gu,' ').replace(/&nbsp;|&#160;/gu,' ').replace(/&quot;/gu,'"').replace(/&amp;/gu,'&').replace(/\s+/gu,' ').trim();
const footer1='יניב רז - מדריך מחוזי חט"ב בעיר ירושלים';
const footer2='הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין';

test('כל דפי פיתגורס הרשומים במטא עומדים בחוזה המבני',()=>{
  assert.deepEqual(VISIBLE.slice(0,FOUNDATION.length),FOUNDATION);
  const issues=[];
  VISIBLE.forEach((n,i)=>{
    const file=`עמוד-${n}.html`;
    if(!fs.existsSync(path.join(ROOT,file))){issues.push(`${file}: חסר`);return;}
    const html=htmlOf(n);
    if(!/<html\s+lang="he"\s+dir="rtl"/u.test(html)) issues.push(`${file}: RTL`);
    if((html.match(/<h1\b/gu)||[]).length!==1) issues.push(`${file}: h1 יחיד`);
    if((html.match(/<h[2-6]\b/gu)||[]).length!==0) issues.push(`${file}: כותרות משנה אסורות`);
    if(!html.includes(`משפט פיתגורס — עמוד ${i+1} / ${TOTAL}`)) issues.push(`${file}: מספור מקומי`);
    if(!html.includes(footer1)||!html.includes(footer2)) issues.push(`${file}: footer`);
    if(/\sstyle\s*=\s*["']/u.test(html)) issues.push(`${file}: inline style`);
    if(/(?:שאלה|תרגיל)\s*\d+/u.test(textOf(html))) issues.push(`${file}: מספור שאלות גלוי`);
  });
  assert.deepEqual(issues,[],'\n'+issues.join('\n'));
});

test('כתיב וסימן כפל נקיים בכל הרצף',()=>{
  const issues=[];
  for(const n of VISIBLE){
    const html=htmlOf(n); const text=textOf(html);
    if(/פיטגורס/u.test(text)) issues.push(`עמוד-${n}: פיטגורס`);
    if(/זוית/u.test(text)) issues.push(`עמוד-${n}: זוית`);
    if(/ישר זווית/u.test(html)) issues.push(`עמוד-${n}: ישר זווית`);
    if(/(?:יתר[^.]{0,45}אלכסונ|אלכסונ[^.]{0,45}יתר)/u.test(text)) issues.push(`עמוד-${n}: אלכסון כשם ליתר`);
    if(/×/u.test(html)) issues.push(`עמוד-${n}: × אסור`);
    if(/\\times\b/u.test(html)) issues.push(`עמוד-${n}: \\times אסור`);
    // בודקים את ה-HTML הגולמי, כדי שלא לחבר בטעות תוויות SVG נפרדות כמו 8, x, 5.
    if(/\b\d+\s*[xX]\s*\d+\b/u.test(html)) issues.push(`עמוד-${n}: x/X כסימן כפל`);
  }
  assert.deepEqual(issues,[],'\n'+issues.join('\n'));
});

test('כותרות 20 דפי היסוד הן שלוש משפחות בלבד',()=>{
  FOUNDATION.forEach((n,i)=>{
    const m=htmlOf(n).match(/<h1 class="page-title">([^<]+)<\/h1>/u);
    assert.equal(m?.[1],TITLES[i],`עמוד ${n}`);
  });
});

test('עקרונות מתמטיים קריטיים נשמרים',()=>{
  const p4=htmlOf(637),p5=htmlOf(638);
  assert.ok(p4.includes('מול הזווית הישרה'));
  assert.ok(p4.includes('ביותר במשולש'));
  assert.ok(p5.includes('הצלע הארוכה ביותר'));
  assert.ok(htmlOf(639).includes('\\cdot'));
  assert.ok(htmlOf(641).includes('\\sqrt'));
  assert.ok(htmlOf(642).includes('\\approx'));
  assert.ok(htmlOf(646).includes('a^2+b^2=c^2'));
  for(const n of [651,652]){
    const h=htmlOf(n); assert.match(h,/x\^2/u); assert.ok(h.includes('\\sqrt')); assert.doesNotMatch(h,/±/u);
  }
  const canonical=htmlOf(653);
  for(const s of ['3^2+4^2=x^2','9+16=x^2','25=x^2','\\sqrt{25}=x','5=x']) assert.ok(canonical.includes(s),s);
  const leg=htmlOf(649);
  assert.ok(leg.includes('x^2+4^2=5^2')); assert.ok(leg.includes('3=x'));
});

test('עמוד 33 דורש דרך מלאה ותשובה סופית לכל אחד משני הסעיפים',()=>{
  const html=htmlOf(21),css=read('styles/pages/עמוד-21.css');
  assert.equal((html.match(/class="solution-space"/gu)||[]).length,2);
  assert.equal((html.match(/class="pyt-final-answer"/gu)||[]).length,2);
  assert.equal((html.match(/הַציגו את דרך הפתרון:/gu)||[]).length,2);
  assert.match(html,/חשבו את היקף הטרפז/u);
  assert.doesNotMatch(html,/הקיף הטרפז/u);
  assert.match(css,/\.page-21 \.solution-space \{[^}]*min-height:\s*110px/u);
});

test('הניווט של כל דפי הנושא רציף ונגזר מהמטא',()=>{
  const issues=[];
  VISIBLE.forEach((n,i)=>{
    const html=htmlOf(n);
    if(i>0&&!html.includes(`href="עמוד-${VISIBLE[i-1]}.html"`)) issues.push(`עמוד ${n}: קודם`);
    if(i<VISIBLE.length-1&&!html.includes(`href="עמוד-${VISIBLE[i+1]}.html"`)) issues.push(`עמוד ${n}: הבא`);
  });
  assert.deepEqual(issues,[],'\n'+issues.join('\n'));
});
