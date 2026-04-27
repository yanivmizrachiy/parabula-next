const VERSION = 'focus-20260427002';
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
  toggleTopicsBtn: document.getElementById('toggleTopicsBtn'),
  openInstallBtn: document.getElementById('openInstallBtn'),
  topicsPanel: document.getElementById('topicsPanel'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  openLiveBtn: document.getElementById('openLiveBtn'),
  printBtn: document.getElementById('printBtn'),
  readerNotice: document.getElementById('readerNotice')
};

let db = null;
let activeTopic = '';
let visiblePages = [];
let flatPages = [];
let currentIndex = -1;
const PRINT_SELECTION_KEY = 'parabula-selection-v1';
let layoutNotice = '';

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
  const relativeFile = String(page.file || page.previewPath || '').replace(/^\//,'').trim();
  return relativeFile ? new URL(relativeFile, window.location.href).href : 'about:blank';
}
function currentPage(){
  return currentIndex >= 0 ? visiblePages[currentIndex] : null;
}
function matchesQuery(page, query){
  const searchableText = `${page?.topic || ''} ${page?.title || ''} ${page?.h1 || ''} ${page?.file || ''} ${page?.number || ''}`;
  return !query || norm(searchableText).includes(query);
}
function currentBookIndex(){
  const page = currentPage();
  return page ? flatPages.findIndex(p => p.file === page.file) : -1;
}
function setReaderNotice(message, { persistent = false } = {}){
  if(persistent){
    layoutNotice = message || '';
  }
  const text = message || layoutNotice;
  if(!els.readerNotice) return;
  els.readerNotice.hidden = !text;
  els.readerNotice.textContent = text || '';
}
function showTransientReaderNotice(message){
  if(!message) return;
  setReaderNotice(message);
  window.clearTimeout(window.__parabulaReaderNoticeTimeout);
  window.__parabulaReaderNoticeTimeout = window.setTimeout(() => {
    setReaderNotice(layoutNotice);
  }, 2400);
}
function updateButtons(){
  const has = !!currentPage();
  const bookIndex = currentBookIndex();
  els.prevPageBtn.disabled = !has || bookIndex <= 0;
  els.nextPageBtn.disabled = !has || bookIndex >= flatPages.length - 1;
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
  const topicPages = ((db?.topics || []).find(topic => topic.name === page.topic)?.pages || [])
    .slice()
    .sort((a,b) => a.number - b.number);
  const topicIndex = topicPages.findIndex(topicPage => topicPage.file === page.file);
  els.topicProgress.textContent = topicIndex >= 0
    ? `עמוד ${topicIndex + 1} מתוך ${topicPages.length} בנושא`
    : '—';
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
  return free;
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
      overflow-x:hidden !important;
      background:#ffffff !important;
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
      background:#ffffff !important;
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

    const isPhoneViewport = window.innerWidth <= 700;
    const widthScale = Math.min(hostWidth / rawWidth, 1);
    const fitHeightScale = Math.min(hostHeight / rawHeight, 1);
    const scale = isPhoneViewport ? widthScale : Math.min(widthScale, fitHeightScale, 1);
    const scaledWidth = Math.round(rawWidth * scale);
    const scaledHeight = Math.round(rawHeight * scale);
    const allowVerticalReaderScroll = isPhoneViewport && scaledHeight > hostHeight + 8;

    page.style.transform = `scale(${scale})`;
    page.style.transformOrigin = 'top center';

    doc.documentElement.style.width = '100%';
    doc.documentElement.style.minWidth = '0';
    doc.documentElement.style.overflowX = 'hidden';
    doc.documentElement.style.overflowY = allowVerticalReaderScroll ? 'auto' : 'hidden';
    doc.documentElement.style.background = '#ffffff';

    doc.body.style.width = '100%';
    doc.body.style.minWidth = '0';
    doc.body.style.minHeight = `${scaledHeight}px`;
    doc.body.style.height = allowVerticalReaderScroll ? 'auto' : `${scaledHeight}px`;
    doc.body.style.overflowX = 'hidden';
    doc.body.style.overflowY = allowVerticalReaderScroll ? 'auto' : 'hidden';
    doc.body.style.background = '#ffffff';
    doc.body.style.display = 'flex';
    doc.body.style.justifyContent = 'center';
    doc.body.style.alignItems = 'flex-start';
    doc.body.style.paddingBottom = allowVerticalReaderScroll ? '12px' : '0';

    const leftPad = Math.max(0, Math.round((hostWidth - scaledWidth) / 2));
    const logicalPad = leftPad / Math.max(scale, 0.001);
    page.style.marginLeft = `${logicalPad}px`;
    page.style.marginRight = `${logicalPad}px`;

    if(!allowVerticalReaderScroll && scaledHeight > 0){
      frame.style.height = `${Math.max(320, scaledHeight + 2)}px`;
    }

    setReaderNotice(
      allowVerticalReaderScroll
        ? 'מצב קריאה נייד: הדף הוגדל לרוחב כדי לשפר קריאות. גלול בתוך התצוגה כדי לראות את כל ה־A4.'
        : '',
      { persistent: true }
    );

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
function showPage(file){
  const idx = visiblePages.findIndex(p => p.file === file);
  if(idx < 0) return;
  currentIndex = idx;
  const page = visiblePages[idx];
  els.mobileLoadingState.hidden = false;
  setReaderNotice(layoutNotice, { persistent: true });
  const url = pageUrl(page);
  const sep = url.includes('?') ? '&' : '?';
  els.mobilePageFrame.src = `${url}${sep}mobile=1&reader=1&v=${VERSION}`;
  els.currentPageTitle.textContent = page.title || page.h1 || page.file;
  els.currentPageMeta.textContent = `${page.topic} · עמוד ${page.number}`;
  localStorage.setItem('parabula:lastFile', page.file);
  localStorage.setItem('parabula:lastTopic', page.topic || activeTopic);
  setProgress(page);
  updateButtons();
  document.body.classList.add('focus-reading');
  els.topicsPanel.classList.add('is-collapsed');
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
    b.onclick = () => {
      activeTopic = topic.name;
      const firstPage = (topic.pages || []).slice().sort((a,b) => a.number - b.number)[0];
      renderPages({ targetFile: firstPage?.file || null });
      els.topicsPanel.classList.remove('is-collapsed');
    };
    els.topicStrip.appendChild(b);
  });
  updateButtons();
}
function renderPages(options = {}){
  const { targetFile = null } = options;
  const q = norm(els.globalSearch.value);
  const topic = (db?.topics || []).find(t => t.name === activeTopic) || (db?.topics || [])[0];
  activeTopic = topic?.name || '';
  visiblePages = (topic?.pages || []).slice().sort((a,b) => a.number - b.number).filter(page => matchesQuery(page, q));

  els.topicPages.innerHTML = '';

  if(!visiblePages.length){
    currentIndex = -1;
    els.topicPages.innerHTML = '<div class="empty-box">לא נמצאו דפים.</div>';
    els.currentPageTitle.textContent = 'לא נמצאו דפים';
    els.currentPageMeta.textContent = 'נסה חיפוש אחר';
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
    b.onclick = () => showPage(page.file);
    els.topicPages.appendChild(b);
  });

  const currentFile = currentPage()?.file;
  const lastFile = localStorage.getItem('parabula:lastFile');
  const targetPriority = [targetFile, currentFile, lastFile, visiblePages[0]?.file];
  const target = targetPriority.find(file => (
    file && visiblePages.some(page => page.file === file)
  ));
  showPage(target);
}
function openCurrent(){
  const p = currentPage();
  if(p) window.open(pageUrl(p), '_blank', 'noopener,noreferrer');
}
function printCurrent(){
  const p = currentPage();
  if(!p) return;
  localStorage.setItem(PRINT_SELECTION_KEY, JSON.stringify([p.file]));
  const url = new URL('./preview/print.html', window.location.href);
  url.searchParams.set('files', p.file);
  url.searchParams.set('autopreview', '1');
  url.searchParams.set('source', 'mobile-app');
  url.searchParams.set('topic', p.topic || activeTopic);
  window.open(url.href, '_blank', 'noopener,noreferrer');
}
function goBookRelative(offset){
  const bookIndex = currentBookIndex();
  const previousTopic = currentPage()?.topic || '';
  const target = flatPages[bookIndex + offset];
  if(!target) return;
  activeTopic = target.topic || activeTopic;
  const query = norm(els.globalSearch.value);
  if(query && !matchesQuery(target, query)){
    els.globalSearch.value = '';
    showTransientReaderNotice('החיפוש נוקה כדי להמשיך ברצף הספר.');
  }else if(previousTopic && previousTopic !== target.topic){
    showTransientReaderNotice(`מעבר טבעי לנושא הבא: ${target.topic}`);
  }
  renderPages({ targetFile: target.file });
}
async function boot(){
  const r = await fetch(`${TOPICS_URL}?v=${VERSION}`, {cache:'no-store'});
  if(!r.ok) throw new Error('topics fetch failed: ' + r.status);
  db = await r.json();
  flatPages = (db.topics || []).flatMap(t => t.pages || []).sort((a,b) => a.number - b.number);
  els.appMeta.textContent = `${(db.topics || []).length} נושאים · ${db.totalPages || flatPages.length} דפים · מקור: meta/topics.json`;
  activeTopic = localStorage.getItem('parabula:lastTopic') || db.topics?.[0]?.name || '';
  renderTopics();
  renderPages();
  scheduleFit();
}

els.globalSearch.addEventListener('input', renderPages);
els.prevPageBtn.addEventListener('click', () => goBookRelative(-1));
els.nextPageBtn.addEventListener('click', () => goBookRelative(1));
els.openLiveBtn.addEventListener('click', openCurrent);
els.printBtn.addEventListener('click', printCurrent);
els.openInstallBtn?.addEventListener('click', () => {
  window.open(new URL('./mobile-app-install.html', window.location.href).href, '_blank', 'noopener,noreferrer');
});
els.toggleTopicsBtn.addEventListener('click', () => {
  els.topicsPanel.classList.toggle('is-collapsed');
  document.body.classList.toggle('focus-reading', els.topicsPanel.classList.contains('is-collapsed'));
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
