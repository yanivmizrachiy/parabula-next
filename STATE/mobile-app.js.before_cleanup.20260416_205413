const VERSION = 'clean-reader-1';
const els = {
  appMeta: document.getElementById('appMeta'),
  topicStrip: document.getElementById('topicStrip'),
  topicPages: document.getElementById('topicPages'),
  currentTopicTitle: document.getElementById('currentTopicTitle'),
  currentTopicMeta: document.getElementById('currentTopicMeta'),
  currentPageTitle: document.getElementById('currentPageTitle'),
  currentPageMeta: document.getElementById('currentPageMeta'),
  topicProgress: document.getElementById('topicProgress'),
  globalProgress: document.getElementById('globalProgress'),
  mobilePageFrame: document.getElementById('mobilePageFrame'),
  mobileLoadingState: document.getElementById('mobileLoadingState'),
  globalSearch: document.getElementById('globalSearch'),
  resumeMeta: document.getElementById('resumeMeta'),
  resumeLastBtn: document.getElementById('resumeLastBtn'),
  startBookBtn: document.getElementById('startBookBtn'),
  openInstallBtn: document.getElementById('openInstallBtn'),
  toggleTopicsBtn: document.getElementById('toggleTopicsBtn'),
  topicsPanel: document.getElementById('topicsPanel'),
  openBookStartBtn: document.getElementById('openBookStartBtn'),
  openTopicHomeBtn: document.getElementById('openTopicHomeBtn'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  openLiveBtn: document.getElementById('openLiveBtn'),
  printBtn: document.getElementById('printBtn')
};

const ROOT = 'https://yanivmizrachiy.github.io/parabula-next/';
let db = null;
let activeTopic = '';
let visiblePages = [];
let flatPages = [];
let currentIndex = -1;

function norm(v){ return String(v || '').trim().toLowerCase(); }

function esc(v){
  return String(v || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function pageUrl(page){
  if(!page) return 'about:blank';
  return page.siteUrl || (ROOT + page.file);
}

function currentPage(){
  return currentIndex >= 0 ? visiblePages[currentIndex] : null;
}

function updateButtons(){
  const has = !!currentPage();
  els.prevPageBtn.disabled = !has || currentIndex <= 0;
  els.nextPageBtn.disabled = !has || currentIndex >= visiblePages.length - 1;
  els.openLiveBtn.disabled = !has;
  els.printBtn.disabled = !has;

  document.querySelectorAll('.topic-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.topic === activeTopic);
  });

  document.querySelectorAll('.page-card').forEach(btn => {
    btn.classList.toggle('active', has && btn.dataset.file === currentPage().file);
  });
}

function setProgress(page){
  if(!page){
    els.topicProgress.textContent = '—';
    els.globalProgress.textContent = '—';
    return;
  }
  els.topicProgress.textContent = `בתוך הנושא: ${currentIndex + 1} / ${visiblePages.length}`;
  const gi = flatPages.findIndex(p => p.file === page.file);
  els.globalProgress.textContent = gi >= 0 ? `בכל הספר: ${gi + 1} / ${flatPages.length}` : '—';
}

function showPage(file){
  const idx = visiblePages.findIndex(p => p.file === file);
  if(idx < 0) return;
  currentIndex = idx;
  const page = visiblePages[idx];
  els.mobileLoadingState.hidden = false;
  const url = pageUrl(page);
  const sep = url.includes('?') ? '&' : '?';
  els.mobilePageFrame.src = `${url}${sep}mobile=1&v=${VERSION}`;
  els.currentPageTitle.textContent = page.title || page.h1 || page.file;
  els.currentPageMeta.textContent = `${page.topic} · עמוד ${page.number}`;
  setProgress(page);
  localStorage.setItem('parabula:lastFile', page.file);
  localStorage.setItem('parabula:lastTopic', page.topic || activeTopic);
  updateButtons();
}

function renderTopics(){
  els.topicStrip.innerHTML = '';
  (db?.topics || []).forEach(topic => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'topic-btn';
    b.dataset.topic = topic.name;
    b.textContent = `${topic.name} (${topic.count})`;
    b.onclick = () => {
      activeTopic = topic.name;
      renderPages();
      els.topicsPanel.scrollIntoView({behavior:'smooth', block:'start'});
    };
    els.topicStrip.appendChild(b);
  });
  updateButtons();
}

function renderPages(){
  const q = norm(els.globalSearch.value);
  const topic = (db?.topics || []).find(t => t.name === activeTopic) || (db?.topics || [])[0];
  activeTopic = topic?.name || '';
  visiblePages = (topic?.pages || []).slice().sort((a,b) => a.number - b.number).filter(p => {
    const hay = `${p.topic} ${p.title} ${p.h1} ${p.file} ${p.number}`;
    return !q || norm(hay).includes(q);
  });

  els.currentTopicTitle.textContent = activeTopic || 'נושא';
  els.currentTopicMeta.textContent = visiblePages.length ? `${visiblePages.length} דפים` : 'אין דפים להצגה';
  els.topicPages.innerHTML = '';

  if(!visiblePages.length){
    currentIndex = -1;
    els.topicPages.innerHTML = '<div class="empty-box">לא נמצאו דפים בתנאים שבחרת.</div>';
    els.currentPageTitle.textContent = 'לא נמצאו דפים';
    els.currentPageMeta.textContent = 'נסה חיפוש אחר או נושא אחר';
    els.mobilePageFrame.src = 'about:blank';
    setProgress(null);
    updateButtons();
    return;
  }

  visiblePages.forEach(page => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'page-card';
    b.dataset.file = page.file;
    b.innerHTML = `<strong>${esc(page.title || page.h1 || page.file)}</strong><span>${esc(page.topic || '')}</span><span>עמוד ${page.number}</span>`;
    b.onclick = () => {
      showPage(page.file);
      window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
    };
    els.topicPages.appendChild(b);
  });

  const lastFile = localStorage.getItem('parabula:lastFile');
  const target = lastFile && visiblePages.some(p => p.file === lastFile) ? lastFile : visiblePages[0].file;
  showPage(target);
}

function openCurrent(){
  const p = currentPage();
  if(!p) return;
  window.open(pageUrl(p), '_blank', 'noopener,noreferrer');
}

function printCurrent(){
  const p = currentPage();
  if(!p) return;
  window.open(pageUrl(p), '_blank', 'noopener,noreferrer');
}

function openBookStart(){
  if(!flatPages.length) return;
  const first = flatPages[0];
  activeTopic = first.topic || activeTopic;
  renderTopics();
  renderPages();
  showPage(first.file);
}

function openTopicStart(){
  if(visiblePages.length) showPage(visiblePages[0].file);
}

function resumeLast(){
  const lastTopic = localStorage.getItem('parabula:lastTopic');
  const lastFile = localStorage.getItem('parabula:lastFile');
  if(lastTopic) activeTopic = lastTopic;
  renderTopics();
  renderPages();
  if(lastFile && flatPages.some(p => p.file === lastFile)) showPage(lastFile);
}

async function boot(){
  const r = await fetch('./mobile-topics.json?v=' + VERSION, {cache:'no-store'});
  if(!r.ok) throw new Error('topics fetch failed: ' + r.status);
  db = await r.json();
  flatPages = (db.topics || []).flatMap(t => t.pages || []).sort((a,b) => a.number - b.number);
  els.appMeta.textContent = `${(db.topics || []).length} נושאים · ${db.totalPages || flatPages.length} דפים`;
  const lastFile = localStorage.getItem('parabula:lastFile');
  const lastTopic = localStorage.getItem('parabula:lastTopic');
  els.resumeMeta.textContent = lastFile ? `מקום אחרון: ${lastTopic || 'ללא נושא'} · ${lastFile}` : 'אפשר להתחיל מהעמוד הראשון או להמשיך מהמקום האחרון.';
  activeTopic = lastTopic || db.topics?.[0]?.name || '';
  renderTopics();
  renderPages();
}

els.globalSearch.addEventListener('input', renderPages);
els.resumeLastBtn.addEventListener('click', resumeLast);
els.startBookBtn.addEventListener('click', openBookStart);
els.openBookStartBtn.addEventListener('click', openBookStart);
els.openTopicHomeBtn.addEventListener('click', openTopicStart);
els.prevPageBtn.addEventListener('click', () => { if(currentIndex > 0) showPage(visiblePages[currentIndex - 1].file); });
els.nextPageBtn.addEventListener('click', () => { if(currentIndex >= 0 && currentIndex < visiblePages.length - 1) showPage(visiblePages[currentIndex + 1].file); });
els.openLiveBtn.addEventListener('click', openCurrent);
els.printBtn.addEventListener('click', printCurrent);
els.openInstallBtn.addEventListener('click', () => window.open('./mobile-app-install.html', '_blank', 'noopener,noreferrer'));
els.toggleTopicsBtn.addEventListener('click', () => {
  els.topicsPanel.scrollIntoView({behavior:'smooth', block:'start'});
});

els.mobilePageFrame.addEventListener('load', () => {
  els.mobileLoadingState.hidden = true;
});

boot().catch(err => {
  console.error(err);
  els.appMeta.textContent = 'שגיאה בטעינה';
  els.topicPages.innerHTML = '<div class="empty-box">אירעה שגיאה בטעינת הספר. נסה לרענן את הדף.</div>';
});
