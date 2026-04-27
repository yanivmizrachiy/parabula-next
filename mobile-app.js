const VERSION = 'focus-20260427004';
const TOPICS_URL = new URL('./meta/topics.json', window.location.href).href;
const READER_MODE_KEY = 'parabula:readerMode';
const READER_MODES = Object.freeze({
  FULL: 'full',
  ZOOM: 'zoom'
});
// Real-phone testing showed that enlarged mode needs to be visibly bigger than full-page mode
// without jumping so far that horizontal panning becomes awkward immediately.
// Applied as: Math.max(fullScale * ZOOM_SCALE_MULTIPLIER, fullScale + ZOOM_SCALE_ADDEND).
const ZOOM_SCALE_MULTIPLIER = 1.22;
const ZOOM_SCALE_ADDEND = 0.12;

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
  readerNotice: document.getElementById('readerNotice'),
  readerModeFullBtn: document.getElementById('readerModeFullBtn'),
  readerModeZoomBtn: document.getElementById('readerModeZoomBtn')
};

let db = null;
let activeTopic = '';
let visiblePages = [];
let flatPages = [];
let currentIndex = -1;
const PRINT_SELECTION_KEY = 'parabula-selection-v1';
let layoutNotice = '';
let readerMode = localStorage.getItem(READER_MODE_KEY) === READER_MODES.ZOOM
  ? READER_MODES.ZOOM
  : READER_MODES.FULL;

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
function pageLocalOrder(page){
  const title = String(page?.title || page?.h1 || '');
  const titleMatch = title.match(/עמוד\s+(\d+)/);
  if(titleMatch) return Number(titleMatch[1]);
  const fileMatch = String(page?.file || '').match(/עמוד-(\d+)\.html/);
  return Number(page?.number || fileMatch?.[1] || 0);
}
function sortTopicPages(pages){
  return (pages || []).slice().sort((a,b) => (
    pageLocalOrder(a) - pageLocalOrder(b)
    || Number(a.number || 0) - Number(b.number || 0)
    || String(a.file || '').localeCompare(String(b.file || ''), 'he')
  ));
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
function updateReaderModeButtons(){
  document.body.dataset.readerMode = readerMode;
  els.readerModeFullBtn?.classList.toggle('active', readerMode === READER_MODES.FULL);
  els.readerModeZoomBtn?.classList.toggle('active', readerMode === READER_MODES.ZOOM);
  els.readerModeFullBtn?.setAttribute('aria-pressed', String(readerMode === READER_MODES.FULL));
  els.readerModeZoomBtn?.setAttribute('aria-pressed', String(readerMode === READER_MODES.ZOOM));
}
function setReaderMode(mode, { announce = true } = {}){
  if(!Object.values(READER_MODES).includes(mode)){
    updateReaderModeButtons();
    return;
  }
  const changed = mode !== readerMode;
  readerMode = mode;
  localStorage.setItem(READER_MODE_KEY, readerMode);
  updateReaderModeButtons();
  if(changed){
    scheduleFit();
  }
  if(changed && announce){
    showTransientReaderNotice(
      mode === READER_MODES.FULL
        ? 'מצב עמוד מלא: כל רוחב ה־A4 נשאר גלוי בלי חיתוך צד.'
        : 'מצב קריאה מוגדלת: הדף גדול יותר. אפשר לגלול בתוך הקורא ימינה/שמאלה ולמעלה/למטה.'
    );
  }
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
  updateReaderModeButtons();
}
function setProgress(page){
  if(!page){
    els.topicProgress.textContent = '—';
    els.globalProgress.textContent = '—';
    return;
  }
  const topicPages = sortTopicPages((db?.topics || []).find(topic => topic.name === page.topic)?.pages || []);
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
  const noticeH = els.readerNotice.hidden ? 0 : (els.readerNotice.offsetHeight || 0);
  const toolsH = document.querySelector('.reader-tools')?.offsetHeight || 0;
  const used = topbarH + readerHeadH + bottomH + loadingH + noticeH + toolsH + 48;
  const free = Math.max(380, window.innerHeight - used);
  els.mobilePageFrame.style.height = `${free}px`;
  return free;
}
function ensureReaderContainers(doc){
  const page = doc.querySelector('.a4-page');
  if(!page) return null;
  let stage = doc.getElementById('mobile-reader-stage');
  if(!stage){
    stage = doc.createElement('div');
    stage.id = 'mobile-reader-stage';
  }
  let canvas = doc.getElementById('mobile-reader-canvas');
  if(!canvas){
    canvas = doc.createElement('div');
    canvas.id = 'mobile-reader-canvas';
  }
  if(stage.parentElement !== doc.body){
    doc.body.prepend(stage);
  }
  if(canvas.parentElement !== stage){
    stage.appendChild(canvas);
  }
  if(page.parentElement !== canvas){
    canvas.appendChild(page);
  }
  stage.setAttribute('data-mobile-reader-stage', 'true');
  canvas.setAttribute('data-mobile-reader-canvas', 'true');
  return { page, stage, canvas };
}
function calculateZoomScale(fullScale, isPhoneViewport){
  if(!isPhoneViewport) return fullScale;
  // The multiplier keeps enlarged mode noticeably bigger than full-page mode,
  // while the additive floor guarantees a visible bump even when fullScale is very small.
  return Math.min(1, Math.max(fullScale * ZOOM_SCALE_MULTIPLIER, fullScale + ZOOM_SCALE_ADDEND));
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
      height:100% !important;
      min-height:100% !important;
      overflow:hidden !important;
      background:#ffffff !important;
    }
    body{
      direction:ltr !important;
    }
    #mobile-reader-stage{
      width:100% !important;
      height:100% !important;
      overflow:auto !important;
      -webkit-overflow-scrolling:touch !important;
      background:#ffffff !important;
    }
    #mobile-reader-canvas{
      position:relative !important;
      margin:0 auto !important;
      background:#ffffff !important;
    }
    .a4-page{
      position:absolute !important;
      top:0 !important;
      left:0 !important;
      right:auto !important;
      margin:0 !important;
      box-shadow:none !important;
      transform-origin: top left !important;
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
    if(!doc) return;
    injectMobileReaderStyles(doc);

    const reader = ensureReaderContainers(doc);
    if(!reader) return;
    const { page, stage, canvas } = reader;

    page.style.transform = 'none';
    page.style.width = '';
    page.style.height = '';
    canvas.style.width = '';
    canvas.style.minWidth = '';
    canvas.style.height = '';
    stage.style.overflowX = 'hidden';
    stage.style.overflowY = 'auto';
    stage.style.padding = '0 0 12px';

    const hostWidth = Math.max(0, frame.clientWidth - 4);
    const hostHeight = Math.max(0, frame.clientHeight - 4);
    const rawWidth = page.scrollWidth || page.offsetWidth || page.getBoundingClientRect().width;
    const rawHeight = page.scrollHeight || page.offsetHeight || page.getBoundingClientRect().height;
    if(!rawWidth || !rawHeight || !hostWidth || !hostHeight) return;

    const isPhoneViewport = window.innerWidth <= 700;
    const horizontalInset = isPhoneViewport ? 6 : 12;
    const safeWidth = Math.max(0, hostWidth - horizontalInset * 2);
    const widthScale = Math.min(safeWidth / rawWidth, 1);
    const fitHeightScale = Math.min(hostHeight / rawHeight, 1);
    const fullScale = isPhoneViewport ? widthScale : Math.min(widthScale, fitHeightScale, 1);
    const zoomScale = calculateZoomScale(fullScale, isPhoneViewport);
    const scale = readerMode === READER_MODES.ZOOM ? zoomScale : fullScale;
    const scaledWidth = Math.round(rawWidth * scale);
    const scaledHeight = Math.round(rawHeight * scale);
    const allowHorizontalPan = readerMode === READER_MODES.ZOOM && scaledWidth > hostWidth;

    page.style.transform = `scale(${scale})`;
    page.style.transformOrigin = 'top left';
    page.style.width = `${rawWidth}px`;
    page.style.height = `${rawHeight}px`;
    canvas.style.width = `${scaledWidth}px`;
    canvas.style.minWidth = `${scaledWidth}px`;
    canvas.style.height = `${scaledHeight}px`;
    canvas.style.margin = '0 auto';

    doc.documentElement.style.width = '100%';
    doc.documentElement.style.minWidth = '0';
    doc.documentElement.style.overflow = 'hidden';
    doc.documentElement.style.background = '#ffffff';

    doc.body.style.width = '100%';
    doc.body.style.minWidth = '0';
    doc.body.style.minHeight = '100%';
    doc.body.style.height = '100%';
    doc.body.style.overflow = 'hidden';
    doc.body.style.background = '#ffffff';
    stage.style.overflowX = allowHorizontalPan ? 'auto' : 'hidden';
    stage.style.overflowY = 'auto';
    stage.style.padding = allowHorizontalPan ? `0 ${horizontalInset}px 12px` : '0 0 12px';

    setReaderNotice(
      readerMode === READER_MODES.ZOOM
        ? 'מצב קריאה מוגדלת: הדף גדול יותר לקריאה. גלול בתוך התצוגה ימינה/שמאלה ולמעלה/למטה כדי לראות את כל ה־A4 בלי חיתוך מפתיע.'
        : 'מצב עמוד מלא: כל רוחב ה־A4 מוצג בתוך הקורא בלי חיתוך צד. אפשר לגלול למטה כדי להשלים את העמוד.',
      { persistent: true }
    );

    stage.scrollTop = 0;
    // The stage itself is laid out in LTR because RTL iframe layout made centering drift on
    // narrow screens. Once centering is stabilized that way, enlarged mode scrolls to the far
    // edge first so the natural RTL reading start of the worksheet stays visible.
    const rtlReadingStart = stage.clientWidth > 0
      ? Math.max(0, scaledWidth + horizontalInset * 2 - stage.clientWidth)
      : 0;
    stage.scrollLeft = allowHorizontalPan ? rtlReadingStart : 0;
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
      const firstPage = sortTopicPages(topic.pages || [])[0];
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
  visiblePages = sortTopicPages(topic?.pages || []).filter(page => matchesQuery(page, q));

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
  flatPages = (db.topics || []).flatMap(t => sortTopicPages(t.pages || []));
  els.appMeta.textContent = `${(db.topics || []).length} נושאים · ${db.totalPages || flatPages.length} דפים · מקור: meta/topics.json`;
  activeTopic = localStorage.getItem('parabula:lastTopic') || db.topics?.[0]?.name || '';
  updateReaderModeButtons();
  renderTopics();
  renderPages();
  scheduleFit();
}

els.globalSearch.addEventListener('input', renderPages);
els.prevPageBtn.addEventListener('click', () => goBookRelative(-1));
els.nextPageBtn.addEventListener('click', () => goBookRelative(1));
els.openLiveBtn.addEventListener('click', openCurrent);
els.printBtn.addEventListener('click', printCurrent);
els.readerModeFullBtn?.addEventListener('click', () => setReaderMode(READER_MODES.FULL));
els.readerModeZoomBtn?.addEventListener('click', () => setReaderMode(READER_MODES.ZOOM));
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
