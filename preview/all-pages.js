const BASE = new URL('../', window.location.href);
const DATA_URL = new URL('meta/topics.json', BASE);
const STORE_KEY = 'parabula-all-pages-selection-v1';

const searchBox = document.getElementById('searchBox');
const topicFilter = document.getElementById('topicFilter');
const clearBtn = document.getElementById('clearBtn');
const printSelectedBtn = document.getElementById('printSelectedBtn');
const goTopicsBtn = document.getElementById('goTopicsBtn');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const copySelectionBtn = document.getElementById('copySelectionBtn');
const shareSelectionBtn = document.getElementById('shareSelectionBtn');
const downloadSelectionBtn = document.getElementById('downloadSelectionBtn');
const pagesGrid = document.getElementById('pagesGrid');
const totalPagesBadge = document.getElementById('totalPagesBadge');
const totalTopicsBadge = document.getElementById('totalTopicsBadge');
const selectionInfo = document.getElementById('selectionInfo');
const mobilePrintBtn = document.getElementById('mobilePrintBtn');
const mobileShareBtn = document.getElementById('mobileShareBtn');
const mobileDownloadBtn = document.getElementById('mobileDownloadBtn');
const mobileClearBtn = document.getElementById('mobileClearBtn');

let allPages = [];
let topics = [];
const selected = new Set();

function norm(v){ return String(v || '').trim().toLowerCase(); }
function saveSelection(){ localStorage.setItem(STORE_KEY, JSON.stringify([...selected].sort())); }
function loadSelection(){ try{ const raw = localStorage.getItem(STORE_KEY); const arr = raw ? JSON.parse(raw) : []; if(Array.isArray(arr)) arr.forEach(x => selected.add(x)); }catch{} }

function filteredPages(){
  const q = norm(searchBox.value);
  const topic = topicFilter.value;
  return allPages.filter(page => {
    if(topic !== '__all__' && page.topic !== topic) return false;
    if(!q) return true;
    return norm([page.title,page.h1,page.file,page.topic,page.number].join(' ')).includes(q);
  });
}

function selectedPages(){ return allPages.filter(p => selected.has(p.file)); }

function updateSelectionInfo(extra=''){
  const count = selected.size;
  selectionInfo.textContent = extra || (count ? `נבחרו ${count} דפים` : 'לא נבחרו דפים');
}

function renderTopicOptions(){
  topicFilter.innerHTML = '<option value="__all__">כל הנושאים</option>' + topics.map(t => `<option value="${t}">${t}</option>`).join('');
}

function resolvePageUrl(page){
  if(page?.siteUrl) return page.siteUrl;
  const rel = String(page?.previewPath || page?.file || '').replace(/^\//, '');
  return new URL(rel, BASE).href;
}

function pageUrl(page){
  return resolvePageUrl(page);
}

function selectionText(){
  return selectedPages().map(pageUrl).join('\n');
}

function downloadText(filename, text){
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function pageCard(page){
  const isSelected = selected.has(page.file);
  return `
    <article class="page-card ${isSelected ? 'selected' : ''}" data-file="${page.file}">
      <div class="page-top">
        <div>
          <div class="page-title">${page.title || page.file}</div>
          <div class="page-meta">${page.h1 || ''}</div>
        </div>
        <div class="page-num">עמוד ${page.number ?? ''}</div>
      </div>
      <div class="page-meta">${page.topic || ''}</div>
      <div class="page-actions">
        <a class="primary" href="${resolvePageUrl(page)}" target="_blank" rel="noopener">פתח</a>
        <button class="soft" data-action="copy" data-url="${pageUrl(page)}">העתק קישור</button>
        <button class="soft" data-action="share" data-url="${pageUrl(page)}" data-title="${page.title || page.file}">שלח</button>
        <button data-action="toggle" data-file="${page.file}">${isSelected ? 'הסר מהבחירה' : 'בחר'}</button>
      </div>
    </article>
  `;
}

function renderPages(){
  const pages = filteredPages();
  totalPagesBadge.textContent = `${allPages.length} דפים`;
  totalTopicsBadge.textContent = `${topics.length} נושאים`;
  updateSelectionInfo();
  if(!pages.length){
    pagesGrid.innerHTML = '<div class="empty">לא נמצאו דפים לפי הסינון הנוכחי</div>';
    return;
  }
  pagesGrid.innerHTML = pages.map(pageCard).join('');
}

async function copyText(text){
  try{ await navigator.clipboard.writeText(text); return true; }catch{ return false; }
}

async function shareText(title, text, url=''){
  try{
    if(navigator.share){
      await navigator.share({ title, text, url });
      return true;
    }
  }catch{}
  return copyText(url || text);
}

function printPicked(){
  const picked = selectedPages();
  if(!picked.length){ window.print(); return; }
  const urls = picked.map(pageUrl);
  const win = window.open('', '_blank');
  if(!win) return;
  win.document.write('<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>הדפסה / PDF</title><style>body{font-family:Arial,sans-serif;margin:16px}iframe{width:100%;height:1120px;border:1px solid #ddd;border-radius:12px;margin:0 0 20px}h1{font-size:24px}</style></head><body><h1>הדפסה / שמירה כ-PDF</h1>' + urls.map(u => `<iframe src="${u}"></iframe>`).join('') + '</body></html>');
  win.document.close();
  setTimeout(() => win.print(), 500);
}

pagesGrid.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if(!btn) return;
  const action = btn.dataset.action;
  if(action === 'toggle'){
    const file = btn.dataset.file;
    if(selected.has(file)) selected.delete(file); else selected.add(file);
    saveSelection();
    renderPages();
  } else if(action === 'copy'){
    const ok = await copyText(btn.dataset.url || '');
    updateSelectionInfo(ok ? 'הקישור הועתק' : 'העתקה נכשלה');
    setTimeout(() => updateSelectionInfo(), 1200);
  } else if(action === 'share'){
    const ok = await shareText(btn.dataset.title || 'Parabula', btn.dataset.url || '', btn.dataset.url || '');
    updateSelectionInfo(ok ? 'הקישור נשלח / הועתק' : 'השליחה נכשלה');
    setTimeout(() => updateSelectionInfo(), 1400);
  }
});

searchBox.addEventListener('input', renderPages);
topicFilter.addEventListener('change', renderPages);
clearBtn.addEventListener('click', () => { searchBox.value = ''; topicFilter.value = '__all__'; renderPages(); });
clearSelectionBtn.addEventListener('click', () => { selected.clear(); saveSelection(); renderPages(); });
copySelectionBtn.addEventListener('click', async () => {
  const text = selectionText();
  const ok = await copyText(text);
  updateSelectionInfo(ok ? `הועתקו ${selected.size} קישורים` : 'העתקה נכשלה');
  setTimeout(() => updateSelectionInfo(), 1400);
});
shareSelectionBtn.addEventListener('click', async () => {
  const text = selectionText();
  const ok = await shareText('Parabula - בחירת דפים', text, text);
  updateSelectionInfo(ok ? 'הבחירה נשלחה / הועתקה' : 'השליחה נכשלה');
  setTimeout(() => updateSelectionInfo(), 1400);
});
downloadSelectionBtn.addEventListener('click', () => {
  const picked = selectedPages();
  const text = selectionText();
  if(!picked.length){ updateSelectionInfo('אין בחירה להורדה'); setTimeout(() => updateSelectionInfo(), 1200); return; }
  downloadText('parabula-selected-pages-links.txt', text);
  updateSelectionInfo(`ירדו ${picked.length} קישורים כקובץ`);
  setTimeout(() => updateSelectionInfo(), 1400);
});
printSelectedBtn.addEventListener('click', printPicked);
goTopicsBtn.addEventListener('click', () => { location.href = './topics.html'; });
mobilePrintBtn.addEventListener('click', printPicked);
mobileShareBtn.addEventListener('click', async () => {
  const text = selectionText();
  const ok = await shareText('Parabula - בחירת דפים', text, text);
  updateSelectionInfo(ok ? 'הבחירה נשלחה / הועתקה' : 'השליחה נכשלה');
  setTimeout(() => updateSelectionInfo(), 1400);
});
mobileDownloadBtn.addEventListener('click', () => {
  const picked = selectedPages();
  const text = selectionText();
  if(!picked.length){ updateSelectionInfo('אין בחירה להורדה'); setTimeout(() => updateSelectionInfo(), 1200); return; }
  downloadText('parabula-selected-pages-links.txt', text);
  updateSelectionInfo(`ירדו ${picked.length} קישורים כקובץ`);
  setTimeout(() => updateSelectionInfo(), 1400);
});
mobileClearBtn.addEventListener('click', () => { selected.clear(); saveSelection(); renderPages(); });

async function boot(){
  const response = await fetch(DATA_URL);
  const payload = await response.json();
  const rawTopics = Array.isArray(payload?.topics) ? payload.topics : [];
  allPages = rawTopics.flatMap(t => Array.isArray(t.pages) ? t.pages : []).sort((a,b)=>(a.number ?? 0) - (b.number ?? 0));
  topics = rawTopics.map(t => t.name).filter(Boolean).sort((a,b)=>String(a).localeCompare(String(b),'he'));
  loadSelection();
  renderTopicOptions();
  renderPages();
}

boot().catch((error) => {
  console.error(error);
  pagesGrid.innerHTML = '<div class="empty">שגיאה בטעינת כל הדפים</div>';
});