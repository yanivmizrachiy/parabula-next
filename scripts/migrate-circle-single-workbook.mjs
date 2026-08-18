import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const circleDir = path.join(root, 'workbooks', 'circle');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, text) => fs.writeFileSync(path.join(root, rel), text, 'utf8');

const original = [];
for (let i = 1; i <= 88; i += 1) {
  const rel = `workbooks/circle/page-${i}.html`;
  if (!fs.existsSync(path.join(root, rel))) throw new Error(`Missing original circle page ${i}`);
  original.push({ kind: 'legacy-circle', source: rel, html: read(rel), originalPage: i });
}
const unexpected = fs.readdirSync(circleDir).filter(name => /^page-\d+\.html$/.test(name)).length;
if (unexpected !== 88) throw new Error(`Expected exactly 88 original circle pages before migration; found ${unexpected}`);
if (!original[0].html.includes('מושגים בסיסיים') || !original[0].html.includes('המעגל הוא קו הגבול. העיגול הוא התחום שבתוך המעגל.')) {
  throw new Error('Original circle opening page does not match the canonical remembered page');
}

function pageShell({ title, intro, body, provenance }) {
  return `<!doctype html>\n<html lang="he" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${title}</title>\n<meta name="circle-provenance" content="${provenance}">\n<link rel="stylesheet" href="styles.css">\n<style>.source-note{font-size:12px;color:#64748b;margin:1mm 0 2mm}.source-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3mm}.source-card{border:1px solid #cbd5e1;border-radius:3mm;padding:3mm;background:#fff}.source-card svg{width:100%;height:auto;max-height:54mm}.source-table{width:100%;border-collapse:collapse}.source-table th,.source-table td{border:1px solid #cbd5e1;padding:2mm;text-align:center}.source-table th{background:#f8fafc}.math-ltr{direction:ltr;unicode-bidi:isolate;display:inline-block}</style>\n</head>\n<body><main class="a4-page tight">\n<header class="page-header"><h1 class="page-title">${title}</h1><div class="page-number" aria-label="עמוד 0">0</div></header>\n<div class="anchor">${intro}</div>\n${body}\n</main></body></html>`;
}

function targilimDiameterChordPage() {
  const rows = [4,5,6,7].map(r => `<tr><td>${r}</td><td></td><td></td><td>כל קוטר הוא מיתר? כן / לא</td><td>כל מיתר הוא קוטר? כן / לא</td></tr>`).join('');
  return pageShell({
    title: 'קוטר, רדיוס ומיתר',
    provenance: 'targilim:G8-06@88352a5671fc5df7dc812136e686176a26c5fb0a',
    intro: 'משפחת G8-06: מחברים בין רדיוס לקוטר ומבחינים בין קוטר למיתר.',
    body: `<section class="task"><div class="task-row"><div class="task-num">1</div><div class="task-body"><p class="instruction">בציור רדיוס המעגל הוא <span class="math-ltr">r</span>. הקו האדום הוא קוטר, הכחול הוא רדיוס והירוק הוא מיתר. השלימו את הקשר בין הגדלים.</p><div class="visual-card"><svg viewBox="0 0 260 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="מעגל עם קוטר רדיוס ומיתר"><rect x="12" y="10" width="236" height="160" rx="14" fill="#eff6ff" stroke="#2563eb" stroke-width="1.8"/><circle cx="130" cy="88" r="55" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/><line x1="75" y1="88" x2="185" y2="88" stroke="#dc2626" stroke-width="3"/><line x1="130" y1="88" x2="185" y2="88" stroke="#1d4ed8" stroke-width="3"/><line x1="93" y1="55" x2="168" y2="122" stroke="#16a34a" stroke-width="2.5"/><text x="151" y="80" font-size="12" font-weight="800">r</text><text x="104" y="82" font-size="12" font-weight="800" fill="#dc2626">d=?</text><text x="130" y="181" font-size="11" font-weight="800" text-anchor="middle" fill="#334155">קוטר, רדיוס ומיתר</text></svg></div><div class="thinking"><span class="math-ltr">d = 2·r</span> &nbsp; | &nbsp; כל קוטר הוא מיתר שעובר דרך המרכז; מיתר אינו חייב לעבור דרך המרכז.</div></div></div></section><section class="task"><div class="task-row"><div class="task-num">2</div><div class="task-body"><p class="instruction">משפחת המקור משתמשת ברדיוסים 4, 5, 6, 7. השלימו לכל מקרה.</p><table class="source-table"><tr><th>r</th><th>d</th><th>קשר</th><th colspan="2">בדיקת מושגים</th></tr>${rows}</table></div></div></section>`
  });
}

function targilimSectorPage() {
  const cases = [[90,'רבע עיגול'],[120,'שליש עיגול'],[180,'חצי עיגול'],[270,'שלושה רבעים']];
  const cards = cases.map(([deg,label], idx) => {
    const endAngle=(-90+deg)*Math.PI/180, x=110+55*Math.cos(endAngle), y=88+55*Math.sin(endAngle), large=deg>180?1:0;
    return `<div class="source-card"><svg viewBox="0 0 260 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="זווית מרכזית ${deg} מעלות"><rect x="12" y="10" width="236" height="160" rx="14" fill="#fef3c7" stroke="#92400e" stroke-width="1.8"/><circle cx="110" cy="88" r="55" fill="#fff7ed" stroke="#92400e" stroke-width="2"/><path d="M110 88 L110 33 A55 55 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/><line x1="110" y1="88" x2="165" y2="88" stroke="#92400e" stroke-width="2"/><text x="137" y="80" font-size="12" font-weight="800">r=6</text><text x="118" y="112" font-size="15" font-weight="900" fill="#c2410c">${deg}°</text></svg><b>${label}</b><div>חלק מהעיגול: <span class="math-ltr">${deg}/360 = ____</span></div><div>שטח הגזרה בקירוב: ______ סמ״ר</div><div>אורך הקשת בקירוב: ______ ס״מ</div></div>`;
  }).join('');
  return pageShell({
    title: 'זווית מרכזית וחלק מעיגול',
    provenance: 'targilim:G8-05@88352a5671fc5df7dc812136e686176a26c5fb0a',
    intro: 'משפחת G8-05: ברדיוס 6 ס״מ מקשרים בין זווית מרכזית, חלק מן העיגול, שטח גזרה ואורך קשת.',
    body: `<section class="task"><div class="task-row"><div class="task-num">1</div><div class="task-body"><p class="instruction">לכל אחד מארבעת מקרי המקור השלימו את השבר, שטח הגזרה ואורך הקשת. השתמשו ב־π לפי הצורך.</p><div class="source-grid">${cards}</div></div></div></section>`
  });
}

function targilimCircAreaPage() {
  const rows = [3,4,5,6,7,8].map(r => `<tr><td>${r}</td><td></td><td></td><td></td><td></td></tr>`).join('');
  return pageShell({
    title: 'עיגול — היקף ושטח: כל מקרי המקור',
    provenance: 'targilim:G8-01@88352a5671fc5df7dc812136e686176a26c5fb0a',
    intro: 'משפחת G8-01 בוחרת רדיוס מתוך 3, 4, 5, 6, 7, 8 ס״מ ומבקשת היקף ושטח. כאן מופיעים כל מקרי המשפחה במקום בחירה אקראית.',
    body: `<section class="task"><div class="task-row"><div class="task-num">1</div><div class="task-body"><p class="instruction">השלימו לכל רדיוס תשובה מדויקת באמצעות π וגם קירוב באמצעות <span class="math-ltr">π≈3.14</span>.</p><table class="source-table"><tr><th>r בס״מ</th><th>C מדויק</th><th>C בקירוב</th><th>A מדויק</th><th>A בקירוב</th></tr>${rows}</table><div class="thinking"><span class="math-ltr">C=2·π·r</span> &nbsp;&nbsp; <span class="math-ltr">A=π·r²</span></div></div></div></section>`
  });
}

function stripPreviewNav(html) {
  return html.replace(/\s*<nav class="preview-nav"[\s\S]*?<\/nav>\s*/i, '\n');
}
function rebaseBbb(html) {
  return html
    .replace(/href="vendor\//g, 'href="../../vendor/')
    .replace(/src="vendor\//g, 'src="../../vendor/')
    .replace(/href="styles\//g, 'href="../../styles/')
    .replace(/src="pages\/bbb\//g, 'src="../../pages/bbb/');
}
function importBbbFull(globalPage) {
  const rel = `עמוד-${globalPage}.html`;
  let html = read(rel);
  html = stripPreviewNav(rebaseBbb(html));
  html = html.replace('<head>', `<head>\n    <meta name="circle-provenance" content="razpages:${rel}; bbb:geometry8/topics/t01_circle.py">`);
  return html;
}
function importBbbPartial205() {
  let html = read('עמוד-205.html');
  const marker = '<h2 class="chapter-bar"><span class="chapter-letter">ג</span><span class="chapter-name">גליל וחרוט</span>';
  const cut = html.indexOf(marker);
  if (cut < 0) throw new Error('Could not find cylinder/cone boundary in עמוד-205.html');
  const footer = html.indexOf('<footer class="gz-footer">', cut);
  if (footer < 0) throw new Error('Could not find footer in עמוד-205.html');
  html = html.slice(0, cut) + '        </div>\n    ' + html.slice(footer);
  html = stripPreviewNav(rebaseBbb(html));
  html = html.replace('<head>', '<head>\n    <meta name="circle-provenance" content="razpages:עמוד-205.html(circle-fragment); bbb:geometry8/topics/t01_circle.py">');
  if (html.includes('גליל וחרוט') || html.includes('נפח הגלילים')) throw new Error('Partial BBB page 205 still contains cylinder/cone content');
  if (!html.includes('ראש העיר רוצה להכפיל את רדיוס הבריכה')) throw new Error('Partial BBB page 205 lost circle continuation question');
  return html;
}

const bbb = [];
for (let p = 196; p <= 204; p += 1) bbb.push({ kind: 'bbb', source: `עמוד-${p}.html`, html: importBbbFull(p) });
bbb.push({ kind: 'bbb', source: 'עמוד-205.html#circle-only', html: importBbbPartial205() });
if (!bbb[0].html.includes('חוט, נעץ ועיפרון')) throw new Error('BBB circle opening source marker missing');
if (!bbb.some(p => p.html.includes('העין של לונדון'))) throw new Error('BBB London Eye source marker missing');
if (!bbb.some(p => p.html.includes('המכרז העירוני'))) throw new Error('BBB municipal tender source marker missing');

const seq = [];
for (const page of original) {
  seq.push(page);
  if (page.originalPage === 20) seq.push({ kind: 'targilim', source: 'G8-06', html: targilimDiameterChordPage() });
  if (page.originalPage === 40) {
    seq.push({ kind: 'targilim', source: 'G8-05', html: targilimSectorPage() });
    seq.push({ kind: 'targilim', source: 'G8-01', html: targilimCircAreaPage() });
  }
  if (page.originalPage === 70) seq.push(...bbb);
}
if (seq.length !== 101) throw new Error(`Expected 101 final circle pages, got ${seq.length}`);

function renumber(html, pageNo) {
  let out = html.replace(/<div class="page-number"[^>]*>[\s\S]*?<\/div>/, `<div class="page-number" aria-label="עמוד ${pageNo}">${pageNo}</div>`);
  if (out === html) throw new Error(`Page ${pageNo} has no page-number element`);
  out = out.replace(/<title>([^<]*?)(?:\s+[—–-]\s*\d+)?<\/title>/i, (_, title) => `<title>${title.replace(/\s+$/,'')} — ${pageNo}</title>`);
  return out;
}

for (const name of fs.readdirSync(circleDir)) {
  if (/^page-\d+\.html$/.test(name)) fs.unlinkSync(path.join(circleDir, name));
}
seq.forEach((entry, idx) => write(`workbooks/circle/page-${idx + 1}.html`, renumber(entry.html, idx + 1)));

const stages = [
  { id: 'basics', title: 'יסודות — מעגל ועיגול', from: 1, to: 10 },
  { id: 'parts', title: 'מרכז, רדיוס, קוטר ומיתר', from: 11, to: 21 },
  { id: 'measure', title: 'π, היקף, שטח וזווית מרכזית', from: 22, to: 43 },
  { id: 'advanced', title: 'נוסחאות ותרגול מתקדם', from: 44, to: 60 },
  { id: 'applications', title: 'יישומים, אוריינות ומידול', from: 61, to: 73 },
  { id: 'bbb-enrichment', title: 'יחידת העשרה וסיכום', from: 74, to: 83 },
  { id: 'coordinates', title: 'מעגל במערכת צירים', from: 84, to: 101 }
];
const manifest = {
  canonicalRepository: 'yanivmizrachiy/razpages',
  canonicalRoot: 'workbooks/circle',
  sourceOfTruth: true,
  singleWorkbook: true,
  graded: true,
  pageCount: seq.length,
  entry: 'index.html',
  stages,
  sourceImports: {
    originalCircle: { sourceRepository: 'yanivmizrachiy/smartschool-hebrew-voice-notes', originalPages: 88, preservedRelativeOrder: true },
    targilim: { sourceRepository: 'yanivmizrachiy/targilim', sourcePath: 'generator/g8-01.js', sourceCommit: '88352a5671fc5df7dc812136e686176a26c5fb0a', families: ['G8-06','G8-05','G8-01'], canonicalPages: [21,42,43] },
    bbb: { sourceRepository: 'yanivmizrachiy/bbb', sourcePath: 'geometry8/topics/t01_circle.py', sourceCommit: 'ad12425c6b2e1d4dac84030a5cd865c2b03d3804', renderedSources: ['עמוד-196.html','עמוד-197.html','עמוד-198.html','עמוד-199.html','עמוד-200.html','עמוד-201.html','עמוד-202.html','עמוד-203.html','עמוד-204.html','עמוד-205.html#circle-only'], canonicalRange: [74,83] }
  }
};
write('workbooks/circle/manifest.json', JSON.stringify(manifest, null, 2) + '\n');

const reader = `<!doctype html>\n<html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>חוברת המעגל</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033}.bar{position:sticky;top:0;z-index:10;background:#fff;border-bottom:1px solid #d9e2ef;padding:10px 14px;display:flex;gap:9px;align-items:center;justify-content:center;flex-wrap:wrap}.title{font-weight:900;font-size:19px;margin-inline-end:8px}.sub{font-size:13px;color:#52627a}button,a,input,select{font:inherit}button,.link,select,input{border:1px solid #b9c8da;background:#fff;border-radius:10px;padding:8px 10px;color:#172033}.link{text-decoration:none}button{cursor:pointer}button:hover,.link:hover{background:#eef4fb}input{width:72px;text-align:center}select{max-width:240px}.stage-label{font-size:12px;color:#52627a}.frame-wrap{max-width:1050px;margin:14px auto;padding:0 10px}iframe{display:block;width:100%;height:calc(100vh - 98px);min-height:760px;border:1px solid #ced9e8;border-radius:14px;background:#fff;box-shadow:0 8px 30px rgba(42,61,89,.08)}@media(max-width:760px){.title{width:100%;text-align:center}.sub{display:none}.bar{gap:6px}.stage-label{display:none}select{max-width:180px}iframe{height:calc(100vh - 185px);min-height:620px}}</style></head><body><nav class="bar" aria-label="ניווט בחוברת"><span class="title">חוברת המעגל</span><span class="sub">חוברת אחת · מדורגת · ממוספרת</span><span class="stage-label">שלב:</span><select id="stage" aria-label="מעבר בין שלבי החוברת"></select><button id="prev" type="button">הקודם</button><span>עמוד <input id="page" type="number" min="1" value="1" inputmode="numeric"> מתוך <strong id="total">—</strong></span><button id="next" type="button">הבא</button><a id="open" class="link" href="page-1.html" target="_blank" rel="noopener">פתח דף מלא</a><a class="link" href="../index.html">כל החוברות</a></nav><div class="frame-wrap"><iframe id="sheet" title="חוברת המעגל — עמוד 1" src="page-1.html"></iframe></div><script>const input=document.getElementById('page'),frame=document.getElementById('sheet'),open=document.getElementById('open'),totalEl=document.getElementById('total'),stage=document.getElementById('stage');let total=1,stages=[];function stageFor(n){return stages.find(s=>n>=s.from&&n<=s.to)}function syncStage(n){const s=stageFor(n);if(s)stage.value=s.id}function go(n){n=Math.max(1,Math.min(total,Number(n)||1));input.value=n;const u=\`page-\${n}.html\`;frame.src=u;frame.title=\`חוברת המעגל — עמוד \${n}\`;open.href=u;syncStage(n);history.replaceState(null,'',\`#page=\${n}\`)}document.getElementById('prev').onclick=()=>go(Number(input.value)-1);document.getElementById('next').onclick=()=>go(Number(input.value)+1);input.onchange=()=>go(input.value);stage.onchange=()=>{const s=stages.find(x=>x.id===stage.value);if(s)go(s.from)};fetch('manifest.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(\`HTTP \${r.status}\`);return r.json()}).then(m=>{total=Number(m.pageCount);stages=m.stages||[];input.max=String(total);totalEl.textContent=String(total);stage.replaceChildren(...stages.map(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=\`\${s.title} (\${s.from}–\${s.to})\`;return o}));const match=location.hash.match(/page=(\\d+)/);go(match?match[1]:1)}).catch(err=>{totalEl.textContent='שגיאה';console.error(err)});</script></body></html>`;
write('workbooks/circle/index.html', reader);

let topManifest = JSON.parse(read('workbooks/manifest.json'));
topManifest.workbooks.circle.pages = seq.length;
topManifest.workbooks.circle.entry = 'workbooks/circle/index.html';
topManifest.workbooks.circle.firstPage = 'workbooks/circle/page-1.html';
topManifest.workbooks.circle.sequenceRegistry = 'workbooks/circle/manifest.json';
topManifest.workbooks.circle.graded = true;
write('workbooks/manifest.json', JSON.stringify(topManifest, null, 2) + '\n');

let home = read('workbooks/index.html');
home = home.replace(/<a class="card" href="circle\/index\.html"><div class="n">\d+<\/div><div class="t">מעגל<\/div><div class="d">[\s\S]*?<\/div><span class="badge">פתח חוברת<\/span><\/a>/, `<a class="card" href="circle/index.html"><div class="n">${seq.length}</div><div class="t">מעגל</div><div class="d">כל חומרי המעגל המאוחדים בחוברת אחת: מן המושגים הבסיסיים, דרך היקף ושטח, יישומים והעשרה, ועד מערכת צירים.</div><span class="badge">פתח חוברת מדורגת</span></a>`);
write('workbooks/index.html', home);

let rules = read('CLAUDE.md');
const oldBullet = '- **מעגל:** החוברת נפתחת מן היסודות — מעגל לעומת עיגול, מרכז, רדיוס וקוטר — וממשיכה כרצף אחד. אין להשאיר חוברת מעגל נוספת או סדר חלופי פעיל.';
const newBullet = '- **מעגל — חוברת מעגל קנונית יחידה:** `workbooks/circle/` מרכז את כל חומר התלמיד הפעיל בנושא מעגל שאותר בחוברת המקור, ב־BBB וב־targilim, בתוך רצף פדגוגי מדורג וממוספר אחד. החוברת נפתחת מן היסודות — מעגל לעומת עיגול, מרכז, רדיוס וקוטר — ומתקדמת להיקף ושטח, מיתר וזווית מרכזית, יישומים ואוריינות, העשרה ולבסוף מערכת צירים. `workbooks/circle/manifest.json` הוא רישום הרצף הטכני והשלבים. אין ליצור או לתחזק חוברת מעגל פעילה נוספת או סדר חלופי; דפי מעגל שמשולבים בחוברת כללית אחרת יכולים להישאר כחלק מן החוברת הכללית, אך אינם מקור אמת או חוברת מעגל מתחרה.';
if (!rules.includes(oldBullet)) throw new Error('Could not find exact circle source-of-truth bullet in CLAUDE.md');
rules = rules.replace(oldBullet, newBullet);
write('CLAUDE.md', rules);

write('workbooks/circle/qa.mjs', "import '../../scripts/qa-circle-canonical.mjs';\n");

console.log(`Built one canonical graded circle workbook with ${seq.length} pages.`);
console.log('Mapping: original 1–20, G8-06, original 21–40, G8-05, G8-01, original 41–70, BBB circle enrichment, original 71–88.');
