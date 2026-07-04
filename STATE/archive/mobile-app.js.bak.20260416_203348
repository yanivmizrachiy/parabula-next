const els = {
  appSummary: document.getElementById('appSummary'),
  topicStrip: document.getElementById('topicStrip'),
  topicCardsHome: document.getElementById('topicCardsHome'),
  currentTopicTitle: document.getElementById('currentTopicTitle'),
  currentTopicMeta: document.getElementById('currentTopicMeta'),
  globalSearch: document.getElementById('globalSearch'),
  topicPages: document.getElementById('topicPages'),
  currentPageTitle: document.getElementById('currentPageTitle'),
  currentPageMeta: document.getElementById('currentPageMeta'),
  topicProgress: document.getElementById('topicProgress'),
  globalProgress: document.getElementById('globalProgress'),
  mobilePageFrame: document.getElementById('mobilePageFrame'),
  mobileLoadingState: document.getElementById('mobileLoadingState'),
  mobileResumeMeta: document.getElementById('mobileResumeMeta'),
  resumeLastBtn: document.getElementById('resumeLastBtn'),
  startBookBtn: document.getElementById('startBookBtn'),
  openInstallBtn: document.getElementById('openInstallBtn'),
  openBookStartBtn: document.getElementById('openBookStartBtn'),
  openTopicHomeBtn: document.getElementById('openTopicHomeBtn'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  nextTopicBtn: document.getElementById('nextTopicBtn'),
  openLiveBtn: document.getElementById('openLiveBtn'),
  printBtn: document.getElementById('printBtn'),
  bottomBookStartBtn: document.getElementById('bottomBookStartBtn'),
  bottomTopicHomeBtn: document.getElementById('bottomTopicHomeBtn'),
  bottomPrevBtn: document.getElementById('bottomPrevBtn'),
  bottomNextBtn: document.getElementById('bottomNextBtn'),
  bottomTopicBtn: document.getElementById('bottomTopicBtn'),
  bottomOpenBtn: document.getElementById('bottomOpenBtn'),
  bottomPrintBtn: document.getElementById('bottomPrintBtn')
};


function dbg(msg){
  try{
    let box=document.getElementById('mobileDebugBox');
    if(!box){
      box=document.createElement('div');
      box.id='mobileDebugBox';
      box.style.position='fixed';
      box.style.left='8px';
      box.style.right='8px';
      box.style.bottom='78px';
      box.style.zIndex='99999';
      box.style.background='rgba(15,23,42,.92)';
      box.style.color='#fff';
      box.style.fontSize='12px';
      box.style.padding='8px 10px';
      box.style.borderRadius='12px';
      box.style.maxHeight='22vh';
      box.style.overflow='auto';
      box.style.direction='rtl';
      document.body.appendChild(box);
    }
    const line=document.createElement('div');
    line.textContent=msg;
    box.prepend(line);
    while(box.childNodes.length>10) box.removeChild(box.lastChild);
  }catch(e){}
}

function bindClick(el, fn, name){
  if(!el) return;
  el.onclick = null;
  el.addEventListener('click', function(ev){
    try{
      ev.preventDefault();
      ev.stopPropagation();
      dbg('לחיצה: ' + name);
      fn();
    }catch(err){
      dbg('שגיאה ב-' + name + ': ' + err.message);
      console.error(err);
    }
  }, {passive:false});
}

const APP_BASE = new URL('./', window.location.href);
let db = null;
let activeTopic = '';
let visiblePages = [];
let flatPages = [];
let currentIndex = -1;

function esc(v){
  return String(v || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
function norm(v){ return String(v || '').trim().toLowerCase(); }
function pageUrl(page){ return page?.siteUrl || new URL(page.file, APP_BASE).href; }
function currentPage(){ return currentIndex >= 0 ? visiblePages[currentIndex] : null; }

function updateButtons(){
  const has = !!currentPage();
  const prevDisabled = !has || currentIndex <= 0;
  const nextDisabled = !has || currentIndex >= visiblePages.length - 1;
  [els.prevPageBtn, els.bottomPrevBtn].forEach(b => b && (b.disabled = prevDisabled));
  [els.nextPageBtn, els.bottomNextBtn].forEach(b => b && (b.disabled = nextDisabled));
  [els.openLiveBtn, els.bottomOpenBtn, els.printBtn, els.bottomPrintBtn].forEach(b => b && (b.disabled = !has));
  document.querySelectorAll('.mobile-topic-btn').forEach(x => x.classList.toggle('active', x.dataset.topic === activeTopic));
  document.querySelectorAll('.mobile-page-card').forEach(x => x.classList.toggle('active', has && x.dataset.file === currentPage().file));
}

function setProgress(page){
  if(!page){
    els.topicProgress.textContent = '—';
    els.globalProgress.textContent = '—';
    return;
  }
  els.topicProgress.textContent = `בתוך הנושא: ${currentIndex + 1} / ${visiblePages.length}`;
  const gi = flatPages.findIndex(x => x.file === page.file);
  els.globalProgress.textContent = gi >= 0 ? `בכל הספר: ${gi + 1} / ${flatPages.length}` : '—';
}

function showPage(file){
  const idx = visiblePages.findIndex(p => p.file === file);
  if(idx < 0) return;
  currentIndex = idx;
  const page = visiblePages[idx];
  if(els.mobileLoadingState){
    els.mobileLoadingState.hidden = false;
    els.mobileLoadingState.textContent = 'טוען דף…';
  }
  const url = pageUrl(page);
  els.mobilePageFrame.src = `${url}${url.includes('?') ? '&' : '?'}mobile=1`;
  els.currentPageTitle.textContent = page.title || page.h1 || page.file;
  els.currentPageMeta.textContent = `${page.topic} · עמוד ${page.number}`;
  setProgress(page);
  localStorage.setItem('parabula:mobile-app:lastFile', page.file);
  localStorage.setItem('parabula:mobile-app:lastTopic', page.topic || activeTopic);
  updateButtons();
}

function renderTopics(){
  els.topicStrip.innerHTML = '';
  (db?.topics || []).forEach(topic => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mobile-topic-btn';
    b.dataset.topic = topic.name;
    b.textContent = `${topic.name} (${topic.count})`;
    b.onclick = () => { activeTopic = topic.name; renderPages(); };
    els.topicStrip.appendChild(b);
  });
  updateButtons();
}

function renderTopicCards(){
  if(!els.topicCardsHome) return;
  els.topicCardsHome.innerHTML = '';
  (db?.topics || []).forEach(topic => {
    const first = (topic.pages || []).slice().sort((a,b) => a.number - b.number)[0];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mobile-topic-home-card';
    b.dataset.topic = topic.name;
    b.innerHTML = `<strong>${esc(topic.name)}</strong><span>${topic.count} דפים</span><small>${first ? `מתחיל בעמוד ${first.number}` : 'ללא עמודים'}</small>`;
    b.onclick = () => {
      activeTopic = topic.name;
      renderTopics();
      renderPages();
      if(first) showPage(first.file);
    };
    els.topicCardsHome.appendChild(b);
  });
}

function renderPages(){
  const q = norm(els.globalSearch?.value);
  const topic = (db?.topics || []).find(t => t.name === activeTopic) || (db?.topics || [])[0];
  activeTopic = topic?.name || '';
  visiblePages = (topic?.pages || []).slice().sort((a,b) => a.number - b.number).filter(p => {
    const hay = `${p.topic} ${p.title} ${p.h1} ${p.file} ${p.number}`;
    return !q || norm(hay).includes(q);
  });

  els.currentTopicTitle.textContent = activeTopic || 'נושאים';
  els.currentTopicMeta.textContent = visiblePages.length ? `${visiblePages.length} דפים` : 'אין דפים להצגה';
  els.topicPages.innerHTML = '';

  if(!visiblePages.length){
    currentIndex = -1;
    els.topicPages.innerHTML = '<div class="mobile-empty">לא נמצאו דפים בתנאים שבחרת.</div>';
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
    b.className = 'mobile-page-card';
    b.dataset.file = page.file;
    b.innerHTML = `<strong>${esc(page.title || page.h1 || page.file)}</strong><span>עמוד ${page.number}</span><span>${esc(page.topic || '')}</span>`;
    b.onclick = () => showPage(page.file);
    els.topicPages.appendChild(b);
  });

  const remember = localStorage.getItem('parabula:mobile-app:lastFile');
  const target = remember && visiblePages.some(p => p.file === remember) ? remember : visiblePages[0].file;
  showPage(target);
}

function openCurrent(){ const p = currentPage(); if(p) window.open(pageUrl(p), '_blank', 'noopener,noreferrer'); }
function printCurrent(){ const p = currentPage(); if(p) window.open(pageUrl(p), '_blank', 'noopener,noreferrer'); }
function goPrev(){ if(currentIndex > 0) showPage(visiblePages[currentIndex - 1].file); }
function goNext(){ if(currentIndex >= 0 && currentIndex < visiblePages.length - 1) showPage(visiblePages[currentIndex + 1].file); }
function openTopicStart(){ if(visiblePages.length) showPage(visiblePages[0].file); }

function openBookStart(){
  if(!flatPages.length) return;
  const first = flatPages[0];
  activeTopic = first.topic || activeTopic;
  renderTopics();
  renderPages();
  showPage(first.file);
}

function openNextTopic(){
  if(!db?.topics?.length) return;
  const idx = db.topics.findIndex(t => t.name === activeTopic);
  const next = idx >= 0 ? (idx + 1) % db.topics.length : 0;
  activeTopic = db.topics[next].name;
  renderTopics();
  renderPages();
}

function resumeLast(){
  const lastFile = localStorage.getItem('parabula:mobile-app:lastFile');
  const lastTopic = localStorage.getItem('parabula:mobile-app:lastTopic');
  if(lastTopic) activeTopic = lastTopic;
  renderTopics();
  renderPages();
  if(lastFile && flatPages.some(p => p.file === lastFile)) showPage(lastFile);
}

function openInstall(){
  window.open(new URL('./mobile-app-install.html', APP_BASE).href, '_blank', 'noopener,noreferrer');
}

async function boot(){
  const response = await fetch(new URL('./mobile-topics.json', APP_BASE), { cache: 'no-store' });
  if(!response.ok) throw new Error(`topics fetch failed: ${response.status}`);
  db = await response.json();
  flatPages = (db.topics || []).flatMap(t => t.pages || []).sort((a,b) => a.number - b.number);
  els.appSummary.textContent = `${(db.topics || []).length} נושאים · ${db.totalPages || flatPages.length} דפים`;
  const lastFile = localStorage.getItem('parabula:mobile-app:lastFile');
  const lastTopic = localStorage.getItem('parabula:mobile-app:lastTopic');
  els.mobileResumeMeta.textContent = lastFile ? `מקום אחרון: ${lastTopic || 'ללא נושא'} · ${lastFile}` : 'אפשר להתחיל מהעמוד הראשון או להמשיך מהמקום האחרון.';
  activeTopic = lastTopic || db.topics?.[0]?.name || '';
  renderTopicCards();
  renderTopics();
  renderPages();
  if('serviceWorker' in navigator) navigator.serviceWorker.register(new URL('./sw.js', APP_BASE));
}

if(els.mobilePageFrame){
  els.mobilePageFrame.addEventListener('load', () => {
    if(els.mobileLoadingState) els.mobileLoadingState.hidden = true;
  });
}

els.globalSearch?.addEventListener('input', renderPages);
bindClick(els.prevPageBtn, goPrev, 'prevPageBtn');
bindClick(els.bottomPrevBtn, goPrev, 'bottomPrevBtn');
bindClick(els.nextPageBtn, goNext, 'nextPageBtn');
bindClick(els.bottomNextBtn, goNext, 'bottomNextBtn');
bindClick(els.openLiveBtn, openCurrent, 'openLiveBtn');
bindClick(els.bottomOpenBtn, openCurrent, 'bottomOpenBtn');
bindClick(els.printBtn, printCurrent, 'printBtn');
bindClick(els.bottomPrintBtn, printCurrent, 'bottomPrintBtn');
bindClick(els.nextTopicBtn, openNextTopic, 'nextTopicBtn');
bindClick(els.bottomTopicBtn, openNextTopic, 'bottomTopicBtn');
bindClick(els.openTopicHomeBtn, openTopicStart, 'openTopicHomeBtn');
bindClick(els.bottomTopicHomeBtn, openTopicStart, 'bottomTopicHomeBtn');
bindClick(els.openInstallBtn, openInstall, 'openInstallBtn');
bindClick(els.openBookStartBtn, openBookStart, 'openBookStartBtn');
bindClick(els.bottomBookStartBtn, openBookStart, 'bottomBookStartBtn');
bindClick(els.resumeLastBtn, resumeLast, 'resumeLastBtn');
bindClick(els.startBookBtn, openBookStart, 'startBookBtn');

boot().catch(error => {
  console.error(error);
  els.currentPageTitle.textContent = 'שגיאה בטעינת הספר';
  els.currentPageMeta.textContent = 'לא הצלחתי לטעון את דפי העבודה מהאתר.';
  if(els.topicPages) els.topicPages.innerHTML = '<div class="mobile-empty">אירעה שגיאה בטעינת הספר. נסה לרענן את הדף.</div>';
});