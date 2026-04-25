import {
  appendQueryParams,
  escapeHtml,
  getTopic,
  loadCatalog,
  rememberPage,
  rememberedPageFile,
  rememberedTopic,
  resolvePageLinks,
  rootDataCandidates,
  sortPages
} from './preview/catalog-shared.js';

const VERSION = 'focus-20260425191539';

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
  topicsPanel: document.getElementById('topicsPanel'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  openLiveBtn: document.getElementById('openLiveBtn'),
  printBtn: document.getElementById('printBtn')
};

let catalog = null;
let activeTopic = '';
let visiblePages = [];
let currentIndex = -1;
let resizeTimer = null;

function updateButtons() {
  const has = !!currentPage();
  els.prevPageBtn.disabled = !has || currentIndex <= 0;
  els.nextPageBtn.disabled = !has || currentIndex >= visiblePages.length - 1;
  els.openLiveBtn.disabled = !has;
  els.printBtn.disabled = !has;
  document.querySelectorAll('.topic-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.topic === activeTopic);
  });
  document.querySelectorAll('.page-card').forEach((btn) => {
    btn.classList.toggle('active', has && btn.dataset.file === currentPage()?.file);
  });
}

function currentPage() {
  return currentIndex >= 0 ? visiblePages[currentIndex] : null;
}

function setProgress(page) {
  if (!page) {
    els.topicProgress.textContent = '—';
    els.globalProgress.textContent = '—';
    return;
  }
  els.topicProgress.textContent = `${currentIndex + 1} / ${visiblePages.length}`;
  const gi = catalog.flatPages.findIndex((entry) => entry.file === page.file);
  els.globalProgress.textContent = gi >= 0 ? `${gi + 1} / ${catalog.flatPages.length}` : '—';
}

function resizeReaderFrame() {
  try {
    const used =
      (document.querySelector('.topbar')?.offsetHeight || 0) +
      (document.querySelector('.reader-head')?.offsetHeight || 0) +
      (document.querySelector('.bottom-nav')?.offsetHeight || 0) +
      26;
    const free = Math.max(520, window.innerHeight - used);
    els.mobilePageFrame.style.height = `${free}px`;
    setTimeout(cleanupIframeUI, 40);
  } catch (error) {
    console.error(error);
  }
}

function cleanupIframeUI() {
  try {
    const frame = els.mobilePageFrame;
    const doc = frame.contentDocument || frame.contentWindow?.document;
    const win = frame.contentWindow;
    if (!doc || !win) return;

    if (!doc.getElementById('mobile-reader-cleanup-style')) {
      const style = doc.createElement('style');
      style.id = 'mobile-reader-cleanup-style';
      style.textContent = `
        .preview-nav{display:none !important;}
        html,body{
          margin:0 !important;
          padding:0 !important;
          width:100% !important;
          height:100% !important;
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
        }
      `;
      (doc.head || doc.documentElement).appendChild(style);
    }

    const page = doc.querySelector('.a4-page');
    if (!page) return;

    win.scrollTo(0, 0);
    page.style.transform = 'none';

    const rect = page.getBoundingClientRect();
    const vw = Math.max(doc.documentElement.clientWidth || 0, win.innerWidth || 0);
    const vh = Math.max(doc.documentElement.clientHeight || 0, win.innerHeight || 0);
    const scale = Math.min((vw - 8) / rect.width, (vh - 8) / rect.height, 1);

    page.style.transform = `scale(${scale})`;
    doc.body.style.minHeight = `${Math.ceil(rect.height * scale)}px`;
    doc.body.style.minWidth = `${Math.ceil(rect.width * scale)}px`;
    doc.documentElement.style.overflow = 'hidden';
    doc.body.style.overflow = 'hidden';
    requestAnimationFrame(() => { try { win.scrollTo(0, 0); } catch {} });
  } catch (error) {
    console.error('cleanupIframeUI failed', error);
  }
}

function showPage(file) {
  const idx = visiblePages.findIndex((page) => page.file === file);
  if (idx < 0) return;
  currentIndex = idx;
  const page = visiblePages[idx];
  const links = resolvePageLinks(page);
  els.mobileLoadingState.hidden = false;
  els.mobilePageFrame.src = appendQueryParams(links.localUrl, { mobile: 1, v: VERSION });
  els.currentPageTitle.textContent = page.title || page.h1 || page.file;
  els.currentPageMeta.textContent = `${page.topic} · עמוד ${page.number}`;
  rememberPage(page);
  setProgress(page);
  updateButtons();
  document.body.classList.add('focus-reading');
  els.topicsPanel.classList.add('is-collapsed');
  setTimeout(resizeReaderFrame, 50);
}

function renderTopics() {
  els.topicStrip.innerHTML = '';
  catalog.topics.forEach((topic) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'topic-btn';
    b.dataset.topic = topic.name;
    b.textContent = `${topic.name} (${topic.count})`;
    b.onclick = () => {
      activeTopic = topic.name;
      renderPages();
      els.topicsPanel.classList.remove('is-collapsed');
    };
    els.topicStrip.appendChild(b);
  });
  updateButtons();
}

function renderPages() {
  const q = String(els.globalSearch.value || '').trim().toLowerCase();
  const topic = getTopic(catalog, activeTopic) || catalog.topics[0];
  activeTopic = topic?.name || '';
  const basePages = sortPages(topic?.pages || []);
  visiblePages = basePages.filter((page) => {
    const hay = `${page.topic} ${page.title} ${page.h1} ${page.file} ${page.number}`.toLowerCase();
    return !q || hay.includes(q);
  });

  els.topicPages.innerHTML = '';

  if (!visiblePages.length) {
    currentIndex = -1;
    els.topicPages.innerHTML = '<div class="empty-box">לא נמצאו דפים.</div>';
    els.currentPageTitle.textContent = 'לא נמצאו דפים';
    els.currentPageMeta.textContent = 'נסה חיפוש אחר';
    els.mobilePageFrame.src = 'about:blank';
    setProgress(null);
    updateButtons();
    return;
  }

  visiblePages.forEach((page) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'page-card';
    b.dataset.file = page.file;
    b.innerHTML = `<strong>${escapeHtml(page.title || page.h1 || page.file)}</strong><span>${escapeHtml(page.topic || '')}</span><span>עמוד ${page.number}</span>`;
    b.onclick = () => showPage(page.file);
    els.topicPages.appendChild(b);
  });

  const remembered = rememberedPageFile();
  const target = remembered && visiblePages.some((page) => page.file === remembered)
    ? remembered
    : visiblePages[0].file;
  showPage(target);
}

function openCurrent() {
  const page = currentPage();
  if (!page) return;
  window.open(resolvePageLinks(page).liveUrl, '_blank', 'noopener,noreferrer');
}

function printCurrent() {
  const page = currentPage();
  if (!page) return;
  window.open(resolvePageLinks(page).localUrl, '_blank', 'noopener,noreferrer');
}

async function boot() {
  catalog = await loadCatalog(rootDataCandidates(window.location.href, { includeMobileMirror: true }));
  els.appMeta.textContent = `${catalog.topics.length} נושאים · ${catalog.totalPages} דפים`;
  activeTopic = rememberedTopic() || catalog.topics[0]?.name || '';
  renderTopics();
  renderPages();
  resizeReaderFrame();
}

els.globalSearch.addEventListener('input', renderPages);
els.prevPageBtn.addEventListener('click', () => { if (currentIndex > 0) showPage(visiblePages[currentIndex - 1].file); });
els.nextPageBtn.addEventListener('click', () => { if (currentIndex >= 0 && currentIndex < visiblePages.length - 1) showPage(visiblePages[currentIndex + 1].file); });
els.openLiveBtn.addEventListener('click', openCurrent);
els.printBtn.addEventListener('click', printCurrent);
els.toggleTopicsBtn.addEventListener('click', () => {
  els.topicsPanel.classList.toggle('is-collapsed');
  document.body.classList.toggle('focus-reading', els.topicsPanel.classList.contains('is-collapsed'));
  setTimeout(resizeReaderFrame, 50);
});
els.mobilePageFrame.addEventListener('load', () => {
  els.mobileLoadingState.hidden = true;
  cleanupIframeUI();
});
window.addEventListener('resize', () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeReaderFrame();
  }, 80);
});
boot().catch((error) => {
  console.error(error);
  els.appMeta.textContent = 'שגיאה בטעינת הדפים';
  els.topicPages.innerHTML = `<div class="empty-box">${escapeHtml(error.message)}</div>`;
});
