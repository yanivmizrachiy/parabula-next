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
const titles=[...Array(5).fill('מושגים בסיסיים'),...Array(7).fill('חזקות ושורשים'),...Array(FOUNDATION.length-12).fill('משפט פיתגורס')];
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

test('אין הוראות ביניים גנריות ואין אותיות יתומות בכרטיסי עובדה (הוראת יניב)',()=>{
  for(const n of FOUNDATION){
    const html=read(`עמוד-${n}.html`);
    assert.doesNotMatch(html,/<div class="q-text">(?:השלימו|בצעו|פתרו)\.<\/div>/u,`עמוד ${n}: הוראת ביניים גנרית — ההוראה חייבת לתאר תוכן`);
    assert.equal((html.match(/(?:concept-check|statement|text-practice)"><span class="draw-label"/gu)||[]).length,0,`עמוד ${n}: אות סימון יתומה בכרטיס עובדה`);
  }
});

test('ההשלמות העליונות אינן נותנות את מילת המפתח',()=>{
  const notes=[634,635,636,637,638,639].map((n)=>foundationNote(read(`עמוד-${n}.html`)));
  for(const note of notes) assert.match(note,/foundation-fill/u);
  assert.doesNotMatch(visibleText(notes[0]),/90/u);assert.doesNotMatch(visibleText(notes[2]),/ניצבים/u);assert.doesNotMatch(visibleText(notes[3]),/יתר|הארוכה/u);assert.doesNotMatch(visibleText(notes[4]),/ניצבים|יתר/u);
  // עמוד 2: 90° מודפס (הושלם כבר בעמוד 1); המילים ישר/ישרה הן ההשלמה (הוראת יניב, 2026-08-18)
  assert.match(visibleText(notes[1]),/90°/u);assert.doesNotMatch(visibleText(notes[1]),/ישרה/u);
  assert.equal((notes[1].match(/foundation-fill-short/gu)||[]).length,2,'עמוד 2: שתי השלמות מילוליות');
  assert.match(notes[0],/foundation-unit">°<\/span>/u);assert.ok(read('עמוד-639.html').includes('\\cdot'));
});

test('משימות הזיהוי אינן מגלות את התשובה מראש',()=>{
  const p1=read('עמוד-634.html'),p2=read('עמוד-635.html');
  const a1=p1.match(/angle-choice-grid">([\s\S]*?)<\/div><div class="q-main compact-instruction/u)?.[1]??'';
  const a2=p2.match(/triangle-choice-grid">([\s\S]*?)<\/div><div class="q-main compact-instruction/u)?.[1]??'';
  assert.doesNotMatch(a1,/class="mark"/u);assert.doesNotMatch(a2,/class="mark"/u);assert.doesNotMatch(a1,/aria-label="[^"]*(?:ישרה|90)/u);assert.doesNotMatch(a2,/aria-label="[^"]*(?:ישר־זווית|ישר זווית|90)/u);
  assert.equal((p1.match(/class="guided-ray-svg"/gu)||[]).length,2);
  // הקרן הנתונה מסתיימת בקו מקווקו (יותר מקובל), לא בראש חץ (הוראת יניב, 2026-08-18)
  assert.doesNotMatch(p1,/marker-end|ray-arrow|guide-arrow/u,'עמוד 1: אין חצים על הקרן המודרכת');
  assert.equal((p1.match(/class="guide-ray-ext"/gu)||[]).length,2,'עמוד 1: קו מקווקו בהמשך כל קרן');
  assert.match(read('styles/pages/עמוד-634.css'),/\.guide-ray-ext \{[^}]*stroke-dasharray/us,'הקו המקווקו מוגדר ב-CSS');
});

test('משולשי הבחירה בעמוד 2 מדויקים ואינם כוללים מסיח כמעט-ישר',()=>{
  const p2=read('עמוד-635.html');const section=p2.match(/triangle-choice-grid">([\s\S]*?)<\/div><div class="q-main/u)?.[1]??'';const ds=[...section.matchAll(/<path class="edge" d="([^"]+)"/gu)].map((m)=>m[1]);assert.equal(ds.length,6);const all=ds.map((d)=>angles(trianglePoints(d)));for(const idx of [0,2,4])assert.ok(Math.min(...all[idx].map((a)=>Math.abs(a-90)))<0.01);for(const idx of [1,3,5])assert.ok(Math.min(...all[idx].map((a)=>Math.abs(a-90)))>4);
});

test('שתי משימות ההשלמה בעמוד 2 מדורגות: חסר יתר ואז חסר ניצב',()=>{
  const paths=[...read('עמוד-635.html').matchAll(/<path class="guide-edge" d="([^"]+)"/gu)].map((m)=>m[1]);
  assert.equal(paths.length,2);
  // א: שני ניצבים נפגשים בזווית הישרה
  assert.equal(paths[0],'M55 92 H190 M55 92 V30');
  // ב: יתר A-C וניצב C-B; הצלע החסרה A-B מאונכת לניצב הנתון
  const m=paths[1].match(/M(\d+) (\d+) L(\d+) (\d+) M\d+ \d+ V(\d+)/u);assert.ok(m,'משימה ב: מבנה יתר+ניצב');
  const A=[+m[1],+m[2]],C=[+m[3],+m[4]],B=[+m[3],+m[5]];
  const AB=[B[0]-A[0],B[1]-A[1]],BC=[C[0]-B[0],C[1]-B[1]];
  assert.equal(AB[0]*BC[0]+AB[1]*BC[1],0,'משימה ב: הצלע החסרה חייבת ליצור 90° מדויק');
});

test('קווי הגאומטריה דקים ונקיים להדפסה',()=>{
  const css=read('styles/topics/pythagoras-foundations.css');
  const edge=css.match(/\.pyt-foundation \.foundation-svg \.edge \{[^}]*stroke-width:\s*([\d.]+)(?:px)?/us)?.[1];
  const mark=css.match(/\.pyt-foundation \.foundation-svg \.mark \{[^}]*stroke-width:\s*([\d.]+)(?:px)?/us)?.[1];
  assert.ok(edge&&Number(edge)<=2.2,`קווי הצלעות עבים מדי: ${edge}`);assert.ok(mark&&Number(mark)<=1.8,`סימוני הזווית עבים מדי: ${mark}`);
});

test('עמוד 4 הוא פוסטר סימון־יתר (משולשים מגוונים, בלי נימוק); עמוד 5 משמר תרגול לפי אורכים',()=>{
  const p4=read('עמוד-637.html'),p5=read('עמוד-638.html');
  // הוראת יניב (2026-08-18): פוסטר מלא-עמוד, סימון היתר בלבד, בלי נימוק
  assert.match(p4,/סמנו את היתר בכל אחד מהמשולשים ישרי־הזווית הבאים/u);
  assert.doesNotMatch(p4,/reason-space|נימוק|required-reason/u,'בעמוד 4 אין נימוק');
  assert.equal((p4.match(/<svg class="hyp-poster"/gu)||[]).length,1,'פוסטר יחיד');
  // 8 משולשים ישרי־זווית מחושבים; כל אחד עם צלע ראשית וסימון זווית ישרה
  const edges=[...p4.matchAll(/<path class="edge" d="M(-?[\d.]+) (-?[\d.]+) L(-?[\d.]+) (-?[\d.]+) L(-?[\d.]+) (-?[\d.]+) Z"/gu)];
  assert.equal(edges.length,8,'שמונה משולשים');
  for(const m of edges){
    const A=[+m[1],+m[2]],B=[+m[3],+m[4]],C=[+m[5],+m[6]];
    const ang=(V,X,Y)=>{const a=[X[0]-V[0],X[1]-V[1]],b=[Y[0]-V[0],Y[1]-V[1]];return Math.acos((a[0]*b[0]+a[1]*b[1])/(Math.hypot(...a)*Math.hypot(...b)))*180/Math.PI;};
    const mx=Math.max(ang(A,B,C),ang(B,A,C),ang(C,A,B));
    assert.ok(Math.abs(mx-90)<0.6,`משולש ללא זווית ישרה מדויקת (${mx.toFixed(1)}°)`);
  }
  assert.equal((p4.match(/class="mark"/gu)||[]).length,8,'סימון זווית ישרה בכל משולש');
  assert.ok((p5.match(/aria-label="כתבו את אורך היתר"/gu)||[]).length>=2);assert.match(p5,/6, 8, 10/u);assert.match(p5,/5, 12, 13/u);
});

test('חזקות ושורשים מופיעים לפני פתרון פיתגורס בדרך מלאה',()=>{
  assert.match(read('עמוד-639.html'),/\\cdot/u);assert.match(read('עמוד-641.html'),/\\sqrt/u);assert.match(read('עמוד-642.html'),/\\approx/u);for(const n of [651,652]){const h=read(`עמוד-${n}.html`);assert.match(h,/x\^2/u);assert.match(h,/\\sqrt/u);assert.doesNotMatch(h,/±/u);}
});

test('דוגמאות הפתרון הקנוניות נשמרות',()=>{
  const p17=read('עמוד-653.html');for(const s of ['3^2+4^2=x^2','9+16=x^2','25=x^2','\\sqrt{25}=x','5=x'])assert.ok(p17.includes(s));assert.match(p17,/class="final-answer"/u);const p19=read('עמוד-649.html');for(const s of ['x^2+4^2=5^2','x^2+16=25','x^2=9','\\sqrt{9}=x','3=x'])assert.ok(p19.includes(s));
});

test('תרגילי פיתגורס מלאים מקבלים מרחב דרך ותשובה סופית',()=>{
  for(const n of [647,653,648,649,650]){const html=read(`עמוד-${n}.html`);assert.ok((html.match(/data-required-lines="5"/gu)||[]).length>=4,`עמוד ${n}: חסר מקום דרך`);assert.ok((html.match(/class="student-final-answer"/gu)||[]).length>=4,`עמוד ${n}: חסרה תשובה סופית`);}
});

test('עמוד 647: שש שאלות חישוביות עם משטח פתרון משבצות ללא שורות מודפסות',()=>{
  const html=read('עמוד-647.html');
  assert.equal((html.match(/class="full-solution-space"/gu)||[]).length,6,'נדרשות 6 שאלות בעמוד');
  assert.equal((html.match(/class="student-final-answer"/gu)||[]).length,6,'תשובה סופית לכל שאלה');
  const shared=read('styles/topics/pythagoras-foundations.css');
  const block=shared.match(/\.pyt-foundation \.full-solution-space \{[^}]*\}/us)?.[0]??'';
  assert.match(block,/background-size:\s*12px 12px/u,'משטח הפתרון הוא דף משבצות 12px');
  assert.match(block,/print-color-adjust:\s*exact/u,'המשבצות חייבות להישמר בהדפסה');
  assert.doesNotMatch(block,/repeating-linear-gradient/u,'אין שורות מודפסות');
  const workBlock=shared.match(/\.pyt-foundation \.work-lines \{[^}]*\}/us)?.[0]??'';
  assert.match(workBlock,/background-size:\s*12px 12px/u,'גם work-lines הוא דף משבצות אחיד');
  assert.equal((html.match(/student-final-answer">\\\((x|y|z)=\\\)/gu)||[]).length,6,'כל תשובה סופית מרונדרת ב-MathJax, לא טקסט עם סוגריים');
});

test('גופן מתמטי אחיד: תוויות SVG משתמשות בגופני TeX של MathJax מה-vendor',()=>{
  const css=read('styles/topics/pythagoras-foundations.css');
  assert.match(css,/@font-face \{[^}]*PytTeX[^}]*mjx-tex-n\.woff2/us,'מספרים בגופן tex-n');
  assert.match(css,/@font-face \{[^}]*PytTeXMathItalic[^}]*mjx-tex-mi\.woff2/us,'משתנים בגופן tex-mi');
  assert.match(css,/\.foundation-svg \.lbl \{[^}]*'PytTeX'/us,'תוויות מקבלות את גופן ה-TeX');
});

test('כל קו שרטוט בדפי היסוד מקבל stroke או fill מוגדר (רגרסיית קווים בלתי נראים)',()=>{
  const cssAll=[
    'styles/topics/pythagoras-foundations.css',
    ...FOUNDATION.map((n)=>`styles/pages/עמוד-${n}.css`),
  ].filter((f)=>fs.existsSync(path.join(ROOT,f))).map((f)=>read(f)).join('\n');
  const styled=(cls)=>{
    const re=new RegExp(`[^{}]*\\.${cls}[^{}]*\\{([^{}]*)\\}`,'gu');let m;
    while((m=re.exec(cssAll))){if(/(?:stroke|fill)\s*:\s*(?!none)/u.test(m[1]))return true;}
    return false;
  };
  for(const n of FOUNDATION){
    const html=read(`עמוד-${n}.html`);
    for(const svg of html.matchAll(/<svg\b[^>]*>([\s\S]*?)<\/svg>/gu)){
      for(const el of svg[1].matchAll(/<(?:path|line|polyline|polygon)\b[^>]*>/gu)){
        const tag=el[0];
        if(/\b(?:stroke|fill)\s*=/u.test(tag))continue;
        const cls=tag.match(/class="([^"]*)"/u);
        assert.ok(cls,`עמוד ${n}: אלמנט קו ללא class וללא stroke/fill`);
        const ok=cls[1].trim().split(/\s+/u).some(styled);
        assert.ok(ok,`עמוד ${n}: class="${cls[1]}" ללא חוק stroke/fill — קו בלתי נראה`);
      }
    }
  }
});

test('תיבת סגנון 5 נשמרת',()=>{
  const css=read('styles/topics/pythagoras-foundations.css');assert.match(css,/\.foundation-fill \{[^}]*border: 1\.35px solid #1f2a44;[^}]*border-radius: 8px;[^}]*box-shadow:/u);for(const [c,w] of [['number',58],['short',82],['term',118],['medium',112]])assert.match(css,new RegExp(`\\.foundation-fill-${c} \\{ width: ${w}px; \\}`,'u'));
});
