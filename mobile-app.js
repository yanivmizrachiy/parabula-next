const VERSION = 'parity-20260710001';
const TOPICS_URL = new URL('./meta/topics.json', window.location.href).href;

const els = {
  appMeta: document.getElementById('appMeta'),
  topicStrip: document.getElementById('topicStrip'),
  topicPages: document.getElementById('topicPages'),
  currentPageTitle: document.getElementById('currentPageTitle'),
  currentPageMeta: document.getElementById('currentPageMeta'),
  topicProgress: document.getElementById('topicProgress'),
  globalProgress: document.getElementById('globalProgress'),
  mobilePageFrame: document.getElementById('mobilePageFrame'),
  mobileLoadingState: document.getElementById('mobileLoadingState'),
  globalSearch: document.getElementById('globalSearch'),
  searchMeta: document.getElementById('searchMeta'),
  toggleTopicsBtn: document.getElementById('toggleTopicsBtn'),
  topicsPanel: document.getElementById('topicsPanel'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  openLiveBtn: document.getElementById('openLiveBtn'),
  printBtn: document.getElementById('printBtn')
};

let db = null;
let activeTopic = '';
let visiblePages = [];
let flatPages = [];
let currentIndex = -1;
let shownPage = null;

function norm(v){ return String(v || '').trim().toLowerCase(); }
function esc(v){
  return String(v || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
function pageUrl(page){
  if(!page) return 'about:blank';
  if(page.file) return new URL('./' + encodeURIComponent(page.file), window.location.href).href;
  return page.siteUrl || 'about:blank';
}
function topicPagesOf(name){
  const topic = (db?.topics || []).find(t => t.name === name);
  return (topic?.pages || []).slice().sort((a,b) => a.number - b.number);
}
function setTopicsPanelOpen(open){
  els.topicsPanel.classList.toggle('is-collapsed', !open);
  document.body.classList.toggle('focus-reading', !open);
  els.toggleTopicsBtn.setAttribute('aria-expanded', String(open));
}
function currentPage(){
  return currentIndex >= 0 ? visiblePages[currentIndex] : null;
}
function updateButtons(){
  const has = !!currentPage();
  els.prevPageBtn.disabled = !has || currentIndex <= 0;
  els.nextPageBtn.disabled = !has || currentIndex >= visiblePages.length - 1;
  els.openLiveBtn.disabled = !shownPage;
  els.printBtn.disabled = !shownPage;
  document.querySelectorAll('.topic-btn').forEach(btn => {
    const on = btn.dataset.topic === activeTopic;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('.page-card').forEach(btn => {
    const on = has && btn.dataset.file === currentPage().file;
    btn.classList.toggle('active', on);
    if(on) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });
}
function setProgress(page){
  if(!page){
    els.topicProgress.textContent = '—';
    els.globalProgress.textContent = '—';
    return;
  }
  const tp = topicPagesOf(page.topic);
  const ti = tp.findIndex(p => p.file === page.file);
  els.topicProgress.textContent = ti >= 0 ? `עמוד ${ti + 1} מתוך ${tp.length} בנושא` : '—';
  const gi = flatPages.findIndex(p => p.file === page.file);
  els.globalProgress.textContent = gi >= 0 ? `עמוד ${gi + 1} מתוך ${flatPages.length} בספר` : '—';
}
function setReaderFrameHeight(){
  const topbarH = document.querySelector('.topbar')?.offsetHeight || 0;
  const readerHeadH = document.querySelector('.reader-head')?.offsetHeight || 0;
  const bottomH = document.querySelector('.bottom-nav')?.offsetHeight || 0;
  const loadingH = els.mobileLoadingState.hidden ? 0 : (els.mobileLoadingState.offsetHeight || 0);
  const used = topbarH + readerHeadH + bottomH + loadingH + 48;
  const free = Math.max(380, window.innerHeight - used);
  els.mobilePageFrame.style.height = `${free}px`;
}
function injectMobileReaderStyles(doc){
  if(doc.getElementById('mobile-reader-cleanup-style')) return;
  const style = doc.createElement('style');
  style.id = 'mobile-reader-cleanup-style';
  style.textContent = `
    .preview-nav{display:none !important;}
    html,body{
      margin:0 !important;
      padding:0 !important;
      width:100% !important;
      min-width:0 !important;
      height:auto !important;
      min-height:100% !important;
      overflow:hidden !important;
      background:#eef3f8 !important;
    }
    body{
      display:flex !important;
      justify-content:center !important;
      align-items:flex-start !important;
    }
    .a4-page{
      margin:0 !important;
      box-shadow:none !important;
      transform-origin: top center !important;
      page-break-after:auto !important;
    }
    @media print{
      html,body{
        display:block !important;
        overflow:visible !important;
        height:auto !important;
        min-height:0 !important;
        background:#fff !important;
      }
      .a4-page{
        transform:none !important;
        margin:0 !important;
      }
    }
  `;
  (doc.head || doc.documentElement).appendChild(style);
}
function fitCurrentA4Page(){
  try{
    const frame = els.mobilePageFrame;
    const doc = frame.contentDocument || frame.contentWindow?.document;
    const win = frame.contentWindow;
    if(!doc || !win) return;
    injectMobileReaderStyles(doc);

    const page = doc.querySelector('.a4-page');
    if(!page) return;

    page.style.transform = 'none';
    page.style.marginLeft = '0';
    page.style.marginRight = '0';

    const hostWidth = Math.max(0, frame.clientWidth - 8);
    const hostHeight = Math.max(0, frame.clientHeight - 8);
    const rawWidth = page.scrollWidth || page.offsetWidth || page.getBoundingClientRect().width;
    const rawHeight = page.scrollHeight || page.offsetHeight || page.getBoundingClientRect().height;
    if(!rawWidth || !rawHeight || !hostWidth || !hostHeight) return;

    const scale = Math.min(hostWidth / rawWidth, hostHeight / rawHeight, 1);
    const scaledWidth = Math.round(rawWidth * scale);
    const scaledHeight = Math.round(rawHeight * scale);

    page.style.transform = `scale(${scale})`;
    page.style.transformOrigin = 'top center';

    doc.documentElement.style.width = '100%';
    doc.documentElement.style.minWidth = '0';
    doc.documentElement.style.overflow = 'hidden';
    doc.documentElement.style.background = '#eef3f8';

    doc.body.style.width = '100%';
    doc.body.style.minWidth = '0';
    doc.body.style.minHeight = `${scaledHeight}px`;
    doc.body.style.height = `${scaledHeight}px`;
    doc.body.style.overflow = 'hidden';
    doc.body.style.background = '#eef3f8';
    doc.body.style.display = 'flex';
    doc.body.style.justifyContent = 'center';
    doc.body.style.alignItems = 'flex-start';

    const leftPad = Math.max(0, Math.round((hostWidth - scaledWidth) / 2));
    const logicalPad = leftPad / Math.max(scale, 0.001);
    page.style.marginLeft = `${logicalPad}px`;
    page.style.marginRight = `${logicalPad}px`;

    try { win.scrollTo(0,0); } catch(e) {}
  }catch(e){
    console.error('fitCurrentA4Page failed', e);
  }
}
function scheduleFit(){
  setReaderFrameHeight();
  requestAnimationFrame(() => {
    fitCurrentA4Page();
    setTimeout(fitCurrentA4Page, 60);
    setTimeout(fitCurrentA4Page, 180);
  });
}
function showPage(file, opts = {}){
  const idx = visiblePages.findIndex(p => p.file === file);
  if(idx < 0) return;
  currentIndex = idx;
  const page = visiblePages[idx];
  shownPage = page;
  if(page.topic) activeTopic = page.topic;
  els.mobileLoadingState.hidden = false;
  const url = pageUrl(page);
  const sep = url.includes('?') ? '&' : '?';
  els.mobilePageFrame.src = `${url}${sep}mobile=1&reader=1&v=${VERSION}`;
  els.currentPageTitle.textContent = page.title || page.h1 || page.file;
  els.currentPageMeta.textContent = `${page.topic} · עמוד ${page.number}`;
  localStorage.setItem('parabula:lastFile', page.file);
  localStorage.setItem('parabula:lastTopic', page.topic || activeTopic);
  setProgress(page);
  updateButtons();
  if(opts.collapse !== false) setTopicsPanelOpen(false);
  scheduleFit();
}
function renderTopics(){
  els.topicStrip.innerHTML = '';
  (db?.topics || []).forEach(topic => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'topic-btn';
    b.dataset.topic = topic.name;
    b.textContent = `${topic.name} (${topic.count})`;
    b.setAttribute('aria-label', `נושא ${topic.name}, ${topic.count} דפים`);
    b.onclick = () => {
      activeTopic = topic.name;
      if(els.globalSearch.value) els.globalSearch.value = '';
      renderPages();
      setTopicsPanelOpen(true);
    };
    els.topicStrip.appendChild(b);
  });
  updateButtons();
}
function matchesQuery(page, q){
  const hay = norm(`${page.topic} ${page.title} ${page.h1} ${page.file} עמוד ${page.number}`);
  return hay.includes(q);
}
function renderPages(opts = {}){
  const q = norm(els.globalSearch.value);
  const searching = !!q;
  const curFile = currentPage()?.file || null;

  if(searching){
    visiblePages = flatPages.filter(p => matchesQuery(p, q));
    const topicsFound = new Set(visiblePages.map(p => p.topic)).size;
    els.searchMeta.hidden = false;
    els.searchMeta.textContent = visiblePages.length
      ? `נמצאו ${visiblePages.length} דפים ב-${topicsFound} נושאים בכל הספר`
      : 'לא נמצאו דפים תואמים בכל הספר';
  } else {
    const topic = (db?.topics || []).find(t => t.name === activeTopic) || (db?.topics || [])[0];
    activeTopic = topic?.name || '';
    visiblePages = (topic?.pages || []).slice().sort((a,b) => a.number - b.number);
    els.searchMeta.hidden = true;
    els.searchMeta.textContent = '';
  }

  currentIndex = curFile ? visiblePages.findIndex(p => p.file === curFile) : -1;
  els.topicPages.innerHTML = '';

  if(!visiblePages.length){
    els.topicPages.innerHTML = '<div class="empty-box">לא נמצאו דפים תואמים. נסה חיפוש אחר.</div>';
    updateButtons();
    return;
  }

  visiblePages.forEach(page => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'page-card';
    b.dataset.file = page.file;
    b.setAttribute('aria-label', `${page.title || page.h1 || page.file}, נושא ${page.topic || ''}, עמוד ${page.number}`);
    b.innerHTML = `<strong>${esc(page.title || page.h1 || page.file)}</strong><span>${esc(page.topic || '')}</span><span>עמוד ${page.number}</span>`;
    b.onclick = () => showPage(page.file);
    els.topicPages.appendChild(b);
  });

  if(opts.autoShow){
    const lastFile = localStorage.getItem('parabula:lastFile');
    const target = lastFile && visiblePages.some(p => p.file === lastFile) ? lastFile : visiblePages[0].file;
    showPage(target, {collapse: opts.collapse !== false});
    return;
  }

  updateButtons();
}
function openCurrent(){
  const p = shownPage || currentPage();
  if(p) window.open(pageUrl(p), '_blank', 'noopener,noreferrer');
}
function printCurrent(){
  const p = shownPage || currentPage();
  if(!p) return;
  try{
    const frame = els.mobilePageFrame;
    const win = frame.contentWindow;
    const doc = frame.contentDocument || win?.document;
    if(win && doc && doc.readyState === 'complete' && doc.querySelector('.a4-page')){
      win.focus();
      win.print();
      return;
    }
  }catch(e){
    console.error('iframe print failed, falling back to new tab', e);
  }
  window.open(pageUrl(p), '_blank', 'noopener,noreferrer');
}
async function boot(){
  const r = await fetch(`${TOPICS_URL}?v=${VERSION}`, {cache:'no-store'});
  if(!r.ok) throw new Error('topics fetch failed: ' + r.status);
  db = await r.json();
  flatPages = (db.topics || []).flatMap(t => t.pages || []).sort((a,b) => a.number - b.number);
  els.appMeta.textContent = `${(db.topics || []).length} נושאים · ${db.totalPages || flatPages.length} דפים · מקור: meta/topics.json`;
  activeTopic = localStorage.getItem('parabula:lastTopic') || db.topics?.[0]?.name || '';
  renderTopics();
  renderPages({autoShow: true, collapse: false});
  setTopicsPanelOpen(true);
  scheduleFit();
}

els.globalSearch.addEventListener('input', () => renderPages());
els.prevPageBtn.addEventListener('click', () => { if(currentIndex > 0) showPage(visiblePages[currentIndex - 1].file); });
els.nextPageBtn.addEventListener('click', () => { if(currentIndex >= 0 && currentIndex < visiblePages.length - 1) showPage(visiblePages[currentIndex + 1].file); });
els.openLiveBtn.addEventListener('click', openCurrent);
els.printBtn.addEventListener('click', printCurrent);
els.toggleTopicsBtn.addEventListener('click', () => {
  setTopicsPanelOpen(els.topicsPanel.classList.contains('is-collapsed'));
  setTimeout(scheduleFit, 40);
});
els.mobilePageFrame.addEventListener('load', () => {
  els.mobileLoadingState.hidden = true;
  scheduleFit();
});
window.addEventListener('resize', scheduleFit);
window.addEventListener('orientationchange', () => setTimeout(scheduleFit, 140));

boot().catch(err => {
  console.error(err);
  els.appMeta.textContent = 'שגיאה בטעינה';
  els.topicPages.innerHTML = '<div class="empty-box">אירעה שגיאה בטעינת הספר. נסה לרענן.</div>';
});

if ('serviceWorker' in navigator && !window.__parabulaSwRegistered) {
  window.__parabulaSwRegistered = true;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=20260416234242').then(reg => {
      if (reg.update) reg.update();
    }).catch(console.error);
  });
}
