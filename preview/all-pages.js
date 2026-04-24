const BASE = new URL('../', window.location.href);
const DATA_URL = new URL('../meta/topics.json', BASE);
const STORE_KEY = 'parabula-all-pages-selection-v1';

const searchBox = document.getElementById('searchBox');
const topicFilter = document.getElementById('topicFilter');
const clearBtn = document.getElementById('clearBtn');
const printSelectedBtn = document.getElementById('printSelectedBtn');
const goTopicsBtn = document.getElementById('goTopicsBtn');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const copySelectionBtn = document.getElementById('copySelectionBtn');
const pagesGrid = document.getElementById('pagesGrid');
const totalPagesBadge = document.getElementById('totalPagesBadge');
const totalTopicsBadge = document.getElementById('totalTopicsBadge');
const selectionInfo = document.getElementById('selectionInfo');

let allPages = [];
let topics = [];
const selected = new Set();

function norm(v){ return String(v || '').trim().toLowerCase(); }

function saveSelection(){
  localStorage.setItem(STORE_KEY, JSON.stringify([...selected].sort()));
}

function loadSelection(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if(Array.isArray(arr)) arr.forEach(x => selected.add(x));
  }catch{}
}

function filteredPages(){
  const q = norm(searchBox.value);
  const topic = topicFilter.value;
  return allPages.filter(page => {
    if(topic !== '__all__' && page.topic !== topic) return false;
    if(!q) return true;
    return norm([page.title,page.h1,page.file,page.topic,page.number].join(' ')).includes(q);
  });
}

function updateSelectionInfo(){
  const count = selected.size;
  selectionInfo.textContent = count ? `נבחרו ${count} דפים` : 'לא נבחרו דפים';
}

function renderTopicOptions(){
  topicFilter.innerHTML = '<option value="__all__">כל הנושאים</option>' + topics.map(t => `<option value="${t}">${t}</option>`).join('');
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
        <a class="primary" href="${page.previewPath || ('/' + page.file)}" target="_blank" rel="noopener">פתח</a>
        <button class="soft" data-action="copy" data-url="${page.siteUrl || (BASE.origin + (page.previewPath || ('/' + page.file)))}">העתק קישור</button>
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
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch{
    return false;
  }
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
    btn.textContent = ok ? 'הועתק' : 'העתקה נכשלה';
    setTimeout(() => { btn.textContent = 'העתק קישור'; }, 1200);
  }
});

searchBox.addEventListener('input', renderPages);
topicFilter.addEventListener('change', renderPages);
clearBtn.addEventListener('click', () => {
  searchBox.value = '';
  topicFilter.value = '__all__';
  renderPages();
});
clearSelectionBtn.addEventListener('click', () => {
  selected.clear();
  saveSelection();
  renderPages();
});
copySelectionBtn.addEventListener('click', async () => {
  const picked = allPages.filter(p => selected.has(p.file));
  const text = picked.map(p => p.siteUrl || (BASE.origin + (p.previewPath || ('/' + p.file)))).join('\n');
  const ok = await copyText(text);
  selectionInfo.textContent = ok ? `הועתקו ${picked.length} קישורים` : 'העתקה נכשלה';
  setTimeout(updateSelectionInfo, 1400);
});
printSelectedBtn.addEventListener('click', () => {
  const picked = allPages.filter(p => selected.has(p.file));
  if(!picked.length){ window.print(); return; }
  const urls = picked.map(p => p.siteUrl || (BASE.origin + (p.previewPath || ('/' + p.file))));
  const win = window.open('', '_blank');
  if(!win) return;
  win.document.write('<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>הדפסה</title><style>body{font-family:Arial,sans-serif;margin:16px}iframe{width:100%;height:1120px;border:1px solid #ddd;border-radius:12px;margin:0 0 20px}h1{font-size:24px}</style></head><body><h1>הדפסת בחירה</h1>' + urls.map(u => `<iframe src="${u}"></iframe>`).join('') + '</body></html>');
  win.document.close();
  setTimeout(() => win.print(), 500);
});
goTopicsBtn.addEventListener('click', () => { location.href = './topics.html'; });

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