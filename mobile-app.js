const VERSION = 'mobile-hardening-20260710003';
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
let frameResizeObserver = null;
let frameMutationObserver = null;

function norm(value){
  return String(value || '').trim().toLowerCase();
}

function esc(value){
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pageUrl(page){
  if(!page) return 'about:blank';
  if(page.file) return new URL(`./${encodeURIComponent(page.file)}`, window.location.href).href;
  return page.siteUrl || 'about:blank';
}

function topicPagesOf(name){
  const topic = (db?.topics || []).find(item => item.name === name);
  return (topic?.pages || []).slice();
}

function currentPage(){
  return currentIndex >= 0 ? visiblePages[currentIndex] : null;
}

function setTopicsPanelOpen(open){
  els.topicsPanel.classList.toggle('is-collapsed', !open);
  document.body.classList.toggle('focus-reading', !open);
  els.toggleTopicsBtn.setAttribute('aria-expanded', String(open));
  els.toggleTopicsBtn.textContent = open ? 'הסתר נושאים' : 'נושאים ודפים';
}

function updateButtons(){
  const hasPage = Boolean(currentPage());
  els.prevPageBtn.disabled = !hasPage || currentIndex <= 0;
  els.nextPageBtn.disabled = !hasPage || currentIndex >= visiblePages.length - 1;
  els.openLiveBtn.disabled = !shownPage;
  els.printBtn.disabled = !shownPage;

  document.querySelectorAll('.topic-btn').forEach(button => {
    const active = button.dataset.topic === activeTopic;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  document.querySelectorAll('.page-card').forEach(button => {
    const active = hasPage && button.dataset.file === currentPage().file;
    button.classList.toggle('active', active);
    if(active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

function setProgress(page){
  if(!page){
    els.topicProgress.textContent = '—';
    els.globalProgress.textContent = '—';
    return;
  }

  const topicPages = topicPagesOf(page.topic);
  const topicIndex = topicPages.findIndex(item => item.file === page.file);
  const globalIndex = flatPages.findIndex(item => item.file === page.file);
  els.topicProgress.textContent = topicIndex >= 0 ? `עמוד ${topicIndex + 1} מתוך ${topicPages.length} בנושא` : '—';
  els.globalProgress.textContent = globalIndex >= 0 ? `עמוד ${globalIndex + 1} מתוך ${flatPages.length} בספר` : '—';
}

function viewportHeight(){
  return Math.max(0, Math.round(window.visualViewport?.height || window.innerHeight || 0));
}

function setReaderFrameHeight(){
  const topbarHeight = document.querySelector('.topbar')?.offsetHeight || 0;
  const readerHeadHeight = document.querySelector('.reader-head')?.offsetHeight || 0;
  const bottomHeight = document.querySelector('.bottom-nav')?.offsetHeight || 0;
  const loadingHeight = els.mobileLoadingState.hidden ? 0 : (els.mobileLoadingState.offsetHeight || 0);
  const usedHeight = topbarHeight + readerHeadHeight + bottomHeight + loadingHeight + 48;
  els.mobilePageFrame.style.height = `${Math.max(380, viewportHeight() - usedHeight)}px`;
}

function injectMobileReaderStyles(doc){
  if(doc.getElementById('mobile-reader-cleanup-style')) return;

  const style = doc.createElement('style');
  style.id = 'mobile-reader-cleanup-style';
  style.textContent = `
    .preview-nav{display:none !important;zoom:1 !important;}
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
    html body .a4-page,
    html body .a4-page.equations-page{
      width:210mm !important;
      height:297mm !important;
      min-width:210mm !important;
      max-width:none !important;
      margin:0 !important;
      box-shadow:none !important;
      zoom:1 !important;
      transform:none;
      transform-origin:center top !important;
      page-break-after:auto !important;
      flex-shrink:0 !important;
    }
    html body .a4-page.equations-page{
      padding:10mm 18mm !important;
    }
    html body .a4-page.equations-page .header-container{
      margin-bottom:8px !important;
      padding-bottom:6px !important;
      border-bottom-width:4px !important;
    }
    html body .a4-page.equations-page .page-title{
      font-size:26px !important;
    }
    html body .a4-page.equations-page .page-number{
      width:32px !important;
      height:32px !important;
      font-size:16px !important;
    }
    html body .a4-page.equations-page .pdf-wrap{
      border-radius:8px !important;
    }
    @media print{
      html,body{
        display:block !important;
        overflow:visible !important;
        height:auto !important;
        min-height:0 !important;
        background:#fff !important;
      }
      html body .a4-page,
      html body .a4-page.equations-page{
        width:210mm !important;
        height:297mm !important;
        min-width:210mm !important;
        max-width:none !important;
        zoom:1 !important;
        transform:none !important;
        margin:0 !important;
      }
      html body .a4-page.equations-page{
        padding:10mm 18mm !important;
      }
    }
  `;
  (doc.head || doc.documentElement).appendChild(style);
}

function enforceCanonicalPageGeometry(page){
  page.style.setProperty('width', '210mm', 'important');
  page.style.setProperty('height', '297mm', 'important');
  page.style.setProperty('min-width', '210mm', 'important');
  page.style.setProperty('max-width', 'none', 'important');
  page.style.setProperty('margin', '0', 'important');
  page.style.setProperty('zoom', '1', 'important');
  page.style.setProperty('flex-shrink', '0', 'important');
  page.style.setProperty('transform-origin', 'center top', 'important');
  if(page.classList.contains('equations-page')){
    page.style.setProperty('padding', '10mm 18mm', 'important');
  }
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

    enforceCanonicalPageGeometry(page);
    page.style.setProperty('transform', 'none', 'important');

    const hostWidth = Math.max(0, frame.clientWidth - 8);
    const hostHeight = Math.max(0, frame.clientHeight - 8);
    const rawRect = page.getBoundingClientRect();
    const rawWidth = page.offsetWidth || page.scrollWidth || rawRect.width;
    const rawHeight = page.offsetHeight || page.scrollHeight || rawRect.height;
    if(!rawWidth || !rawHeight || !hostWidth || !hostHeight) return;

    const scale = Math.min(hostWidth / rawWidth, hostHeight / rawHeight, 1);
    const scaledHeight = Math.max(1, Math.round(rawHeight * scale));
    page.style.setProperty('transform', `scale(${scale})`, 'important');

    doc.documentElement.style.setProperty('width', '100%', 'important');
    doc.documentElement.style.setProperty('min-width', '0', 'important');
    doc.documentElement.style.setProperty('overflow', 'hidden', 'important');
    doc.documentElement.style.setProperty('background', '#eef3f8', 'important');

    doc.body.style.setProperty('width', '100%', 'important');
    doc.body.style.setProperty('min-width', '0', 'important');
    doc.body.style.setProperty('min-height', `${scaledHeight}px`, 'important');
    doc.body.style.setProperty('height', `${scaledHeight}px`, 'important');
    doc.body.style.setProperty('overflow', 'hidden', 'important');
    doc.body.style.setProperty('background', '#eef3f8', 'important');
    doc.body.style.setProperty('display', 'flex', 'important');
    doc.body.style.setProperty('justify-content', 'center', 'important');
    doc.body.style.setProperty('align-items', 'flex-start', 'important');

    try{ win.scrollTo(0, 0); }catch{}
  }catch(error){
    console.error('fitCurrentA4Page failed', error);
  }
}

function scheduleFit(){
  setReaderFrameHeight();
  requestAnimationFrame(fitCurrentA4Page);
  [60, 180, 500, 1200].forEach(delay => setTimeout(fitCurrentA4Page, delay));
}

function prepareFrameForPrint(doc){
  const page = doc?.querySelector('.a4-page');
  if(!doc || !page) return false;

  enforceCanonicalPageGeometry(page);
  page.style.setProperty('transform', 'none', 'important');
  doc.documentElement.style.setProperty('overflow', 'visible', 'important');
  doc.documentElement.style.setProperty('height', 'auto', 'important');
  doc.body.style.setProperty('overflow', 'visible', 'important');
  doc.body.style.setProperty('height', 'auto', 'important');
  doc.body.style.setProperty('min-height', '0', 'important');
  doc.body.style.setProperty('display', 'block', 'important');
  doc.body.style.setProperty('background', '#fff', 'important');
  return true;
}

function watchFrameContent(){
  try{
    frameResizeObserver?.disconnect();
    frameMutationObserver?.disconnect();

    const doc = els.mobilePageFrame.contentDocument || els.mobilePageFrame.contentWindow?.document;
    const page = doc?.querySelector('.a4-page');
    if(!doc || !page) return;

    if('ResizeObserver' in window){
      frameResizeObserver = new ResizeObserver(scheduleFit);
      frameResizeObserver.observe(page);
    }

    frameMutationObserver = new MutationObserver(scheduleFit);
    frameMutationObserver.observe(page, {childList:true, subtree:true});

    doc.fonts?.ready?.then(scheduleFit).catch(() => {});
    doc.defaultView?.MathJax?.startup?.promise?.then(scheduleFit).catch(() => {});
    doc.defaultView?.addEventListener('beforeprint', () => prepareFrameForPrint(doc));
    doc.defaultView?.addEventListener('afterprint', scheduleFit);
  }catch(error){
    console.error('watchFrameContent failed', error);
  }
}

function showPage(file, options = {}){
  const index = visiblePages.findIndex(page => page.file === file);
  if(index < 0) return;

  currentIndex = index;
  const page = visiblePages[index];
  shownPage = page;
  if(page.topic) activeTopic = page.topic;

  els.mobileLoadingState.hidden = false;
  const url = pageUrl(page);
  const separator = url.includes('?') ? '&' : '?';
  els.mobilePageFrame.src = `${url}${separator}mobile=1&reader=1&v=${VERSION}`;
  els.currentPageTitle.textContent = page.title || page.h1 || page.file;
  els.currentPageMeta.textContent = `${page.topic} · עמוד ${page.number}`;
  localStorage.setItem('parabula:lastFile', page.file);
  localStorage.setItem('parabula:lastTopic', page.topic || activeTopic);
  setProgress(page);
  updateButtons();
  if(options.collapse !== false) setTopicsPanelOpen(false);
  scheduleFit();
}

function renderTopics(){
  els.topicStrip.innerHTML = '';
  (db?.topics || []).forEach(topic => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'topic-btn';
    button.dataset.topic = topic.name;
    button.textContent = `${topic.name} (${topic.count})`;
    button.setAttribute('aria-label', `נושא ${topic.name}, ${topic.count} דפים`);
    button.onclick = () => {
      activeTopic = topic.name;
      if(els.globalSearch.value) els.globalSearch.value = '';
      renderPages({autoShow:true, collapse:false});
      setTopicsPanelOpen(true);
    };
    els.topicStrip.appendChild(button);
  });
  updateButtons();
}

function matchesQuery(page, query){
  return norm(`${page.topic} ${page.title} ${page.h1} ${page.file} עמוד ${page.number}`).includes(query);
}

function renderPages(options = {}){
  const query = norm(els.globalSearch.value);
  const previousFile = currentPage()?.file || null;

  if(query){
    visiblePages = flatPages.filter(page => matchesQuery(page, query));
    const topicsFound = new Set(visiblePages.map(page => page.topic)).size;
    els.searchMeta.hidden = false;
    els.searchMeta.textContent = visiblePages.length
      ? `נמצאו ${visiblePages.length} דפים ב-${topicsFound} נושאים בכל הספר`
      : 'לא נמצאו דפים תואמים בכל הספר';
  }else{
    const topic = (db?.topics || []).find(item => item.name === activeTopic) || (db?.topics || [])[0];
    activeTopic = topic?.name || '';
    visiblePages = (topic?.pages || []).slice();
    els.searchMeta.hidden = true;
    els.searchMeta.textContent = '';
  }

  currentIndex = previousFile ? visiblePages.findIndex(page => page.file === previousFile) : -1;
  els.topicPages.innerHTML = '';

  if(!visiblePages.length){
    els.topicPages.innerHTML = '<div class="empty-box">לא נמצאו דפים תואמים. נסה חיפוש אחר.</div>';
    updateButtons();
    return;
  }

  visiblePages.forEach(page => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'page-card';
    button.dataset.file = page.file;
    button.setAttribute('aria-label', `${page.title || page.h1 || page.file}, נושא ${page.topic || ''}, עמוד ${page.number}`);
    button.innerHTML = `<strong>${esc(page.title || page.h1 || page.file)}</strong><span>${esc(page.topic || '')}</span><span>עמוד ${page.number}</span>`;
    button.onclick = () => showPage(page.file);
    els.topicPages.appendChild(button);
  });

  if(options.autoShow){
    const rememberedFile = localStorage.getItem('parabula:lastFile');
    const targetFile = rememberedFile && visiblePages.some(page => page.file === rememberedFile)
      ? rememberedFile
      : visiblePages[0].file;
    showPage(targetFile, {collapse:options.collapse !== false});
    return;
  }

  updateButtons();
}

function openCurrent(){
  const page = shownPage || currentPage();
  if(page) window.open(pageUrl(page), '_blank', 'noopener,noreferrer');
}

function printCurrent(){
  const page = shownPage || currentPage();
  if(!page) return;

  try{
    const frame = els.mobilePageFrame;
    const win = frame.contentWindow;
    const doc = frame.contentDocument || win?.document;
    if(win && doc && doc.readyState === 'complete' && prepareFrameForPrint(doc)){
      win.addEventListener('afterprint', scheduleFit, {once:true});
      win.focus();
      win.print();
      setTimeout(scheduleFit, 1200);
      return;
    }
  }catch(error){
    console.error('iframe print failed, falling back to new tab', error);
  }

  window.open(pageUrl(page), '_blank', 'noopener,noreferrer');
}

async function boot(){
  const response = await fetch(`${TOPICS_URL}?v=${VERSION}`, {cache:'no-store'});
  if(!response.ok) throw new Error(`topics fetch failed: ${response.status}`);

  db = await response.json();
  flatPages = (db.topics || []).flatMap(topic => topic.pages || []);
  els.appMeta.textContent = `${(db.topics || []).length} נושאים · ${db.totalPages || flatPages.length} דפים · מקור: meta/topics.json`;
  activeTopic = localStorage.getItem('parabula:lastTopic') || db.topics?.[0]?.name || '';
  renderTopics();
  renderPages({autoShow:true, collapse:false});
  setTopicsPanelOpen(true);
  scheduleFit();
}

els.globalSearch.addEventListener('input', () => renderPages());
els.prevPageBtn.addEventListener('click', () => {
  if(currentIndex > 0) showPage(visiblePages[currentIndex - 1].file);
});
els.nextPageBtn.addEventListener('click', () => {
  if(currentIndex >= 0 && currentIndex < visiblePages.length - 1) showPage(visiblePages[currentIndex + 1].file);
});
els.openLiveBtn.addEventListener('click', openCurrent);
els.printBtn.addEventListener('click', printCurrent);
els.toggleTopicsBtn.addEventListener('click', () => {
  setTopicsPanelOpen(els.topicsPanel.classList.contains('is-collapsed'));
  setTimeout(scheduleFit, 40);
});
els.mobilePageFrame.addEventListener('load', () => {
  els.mobileLoadingState.hidden = true;
  watchFrameContent();
  scheduleFit();
});
window.addEventListener('resize', scheduleFit);
window.addEventListener('orientationchange', () => setTimeout(scheduleFit, 140));
window.addEventListener('pageshow', scheduleFit);
window.visualViewport?.addEventListener('resize', scheduleFit);
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'visible') scheduleFit();
});

boot().catch(error => {
  console.error(error);
  els.appMeta.textContent = 'שגיאה בטעינה';
  els.topicPages.innerHTML = '<div class="empty-box">אירעה שגיאה בטעינת הספר. נסה לרענן.</div>';
});

if('serviceWorker' in navigator && !window.__parabulaSwRegistered){
  window.__parabulaSwRegistered = true;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`./sw.js?v=${VERSION}`, {updateViaCache:'none'}).then(registration => {
      registration.update?.();
      registration.waiting?.postMessage({type:'SKIP_WAITING'});
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if(worker.state === 'installed' && navigator.serviceWorker.controller){
            worker.postMessage({type:'SKIP_WAITING'});
          }
        });
      });
    }).catch(console.error);
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const reloadKey = `parabula:sw-reloaded:${VERSION}`;
    if(sessionStorage.getItem(reloadKey)) return;
    sessionStorage.setItem(reloadKey, '1');
    window.location.reload();
  });
}
