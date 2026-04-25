import {
  appendQueryParams,
  filterPages,
  loadCatalog,
  previewDataCandidates,
  rememberPage,
  rememberedPageFile,
  resolvePageLinks
} from './catalog-shared.js';

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
const resultsInfo = document.getElementById('resultsInfo');
const currentPageTitle = document.getElementById('currentPageTitle');
const currentPageMeta = document.getElementById('currentPageMeta');
const currentTopicBadge = document.getElementById('currentTopicBadge');
const currentPositionBadge = document.getElementById('currentPositionBadge');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const openLocalBtn = document.getElementById('openLocalBtn');
const openLiveBtn = document.getElementById('openLiveBtn');
const viewerEmpty = document.getElementById('viewerEmpty');
const viewerWrap = document.getElementById('viewerWrap');
const pageViewer = document.getElementById('pageViewer');
const mobilePrintBtn = document.getElementById('mobilePrintBtn');
const mobileShareBtn = document.getElementById('mobileShareBtn');
const mobileDownloadBtn = document.getElementById('mobileDownloadBtn');
const mobileClearBtn = document.getElementById('mobileClearBtn');

let catalog = null;
let visiblePages = [];
let currentFile = '';
const selected = new Set();

function saveSelection() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...selected].sort()));
}

function loadSelection() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr)) arr.forEach((file) => selected.add(file));
  } catch {}
}

function selectedPages() {
  return catalog.flatPages.filter((page) => selected.has(page.file));
}

function filteredPagesList() {
  return filterPages(catalog.flatPages, {
    query: searchBox.value,
    topic: topicFilter.value
  });
}

function updateSelectionInfo(extra = '') {
  const count = selected.size;
  selectionInfo.textContent = extra || (count ? `נבחרו ${count} דפים` : 'לא נבחרו דפים');
}

function renderTopicOptions() {
  topicFilter.innerHTML = '<option value="__all__">כל הנושאים</option>'
    + catalog.topicNames.map((topic) => `<option value="${topic}">${topic}</option>`).join('');
}

function selectionText() {
  return selectedPages().map((page) => resolvePageLinks(page).liveUrl).join('\n');
}

function downloadText(filename, text) {
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

function ensureCurrentPage() {
  if (!visiblePages.length) {
    currentFile = '';
    return null;
  }

  if (currentFile && visiblePages.some((page) => page.file === currentFile)) {
    return catalog.byFile.get(currentFile) || visiblePages[0];
  }

  const remembered = rememberedPageFile();
  if (remembered && visiblePages.some((page) => page.file === remembered)) {
    currentFile = remembered;
    return catalog.byFile.get(remembered) || visiblePages[0];
  }

  currentFile = visiblePages[0].file;
  return visiblePages[0];
}

function currentPage() {
  return currentFile ? (catalog.byFile.get(currentFile) || null) : null;
}

function currentVisibleIndex() {
  return visiblePages.findIndex((page) => page.file === currentFile);
}

function setCurrentPage(file) {
  const page = catalog.byFile.get(file);
  if (!page) return;
  currentFile = page.file;
  rememberPage(page);
  renderPages();
}

function pageCard(page) {
  const isSelected = selected.has(page.file);
  const isCurrent = currentFile === page.file;
  const links = resolvePageLinks(page);

  return `
    <article class="page-card ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}" data-file="${page.file}">
      <div class="page-top">
        <div>
          <div class="page-title">${page.title || page.file}</div>
          <div class="page-meta">${page.h1 || ''}</div>
        </div>
        <div class="page-num">עמוד ${page.number ?? ''}</div>
      </div>
      <div class="page-meta">${page.topic || ''}</div>
      <div class="page-actions">
        <button class="primary" data-action="view" data-file="${page.file}">צפה כאן</button>
        <a href="${links.localUrl}" target="_blank" rel="noopener">פתח מקומית</a>
        <button class="soft" data-action="copy" data-url="${links.liveUrl}">העתק קישור</button>
        <button data-action="toggle" data-file="${page.file}">${isSelected ? 'הסר מהבחירה' : 'בחר'}</button>
      </div>
    </article>
  `;
}

function renderPages() {
  visiblePages = filteredPagesList();
  totalPagesBadge.textContent = `${catalog.totalPages} דפים`;
  totalTopicsBadge.textContent = `${catalog.topics.length} נושאים`;
  resultsInfo.textContent = visiblePages.length
    ? `מוצגים ${visiblePages.length} דפים מתוך ${catalog.totalPages}`
    : 'לא נמצאו דפים לפי הסינון הנוכחי';
  updateSelectionInfo();

  const page = ensureCurrentPage();
  if (!visiblePages.length) {
    pagesGrid.innerHTML = '<div class="empty">לא נמצאו דפים לפי הסינון הנוכחי</div>';
    renderViewer();
    return;
  }

  if (page && currentFile !== page.file) currentFile = page.file;
  pagesGrid.innerHTML = visiblePages.map(pageCard).join('');
  renderViewer();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function shareText(title, text, url = '') {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return true;
    }
  } catch {}
  return copyText(url || text);
}

function printPicked() {
  const picked = selectedPages();
  const pages = picked.length ? picked : (currentPage() ? [currentPage()] : []);
  if (!pages.length) return;

  const urls = pages.map((page) => resolvePageLinks(page).localUrl);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write('<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>הדפסה / PDF</title><style>body{font-family:Arial,sans-serif;margin:16px}iframe{width:100%;height:1120px;border:1px solid #ddd;border-radius:12px;margin:0 0 20px}h1{font-size:24px}</style></head><body><h1>הדפסה / שמירה כ-PDF</h1>' + urls.map((url) => `<iframe src="${url}"></iframe>`).join('') + '</body></html>');
  win.document.close();
  setTimeout(() => win.print(), 500);
}

function renderViewer() {
  const page = currentPage();
  const idx = currentVisibleIndex();
  const hasVisible = visiblePages.length > 0;

  if (!page || !hasVisible || idx < 0) {
    currentPageTitle.textContent = hasVisible ? 'בחר דף להצגה' : 'אין דפים להצגה';
    currentPageMeta.textContent = hasVisible ? 'ה־viewer יציג כאן את הדף הנבחר' : 'נסה לשנות חיפוש או נושא';
    currentTopicBadge.textContent = '—';
    currentPositionBadge.textContent = '—';
    pageViewer.src = 'about:blank';
    viewerWrap.hidden = true;
    viewerEmpty.hidden = false;
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;
    openLocalBtn.href = '#';
    openLiveBtn.href = '#';
    return;
  }

  const links = resolvePageLinks(page);
  currentPageTitle.textContent = page.title || page.h1 || page.file;
  currentPageMeta.textContent = `${page.topic || 'ללא נושא'} · ${page.file}`;
  currentTopicBadge.textContent = page.topic || 'ללא נושא';
  currentPositionBadge.textContent = `${idx + 1} / ${visiblePages.length}`;
  openLocalBtn.href = links.localUrl;
  openLiveBtn.href = links.liveUrl;
  pageViewer.src = appendQueryParams(links.localUrl, { preview: 1 });
  viewerWrap.hidden = false;
  viewerEmpty.hidden = true;
  prevPageBtn.disabled = idx <= 0;
  nextPageBtn.disabled = idx >= visiblePages.length - 1;
}

pagesGrid.addEventListener('click', async (event) => {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === 'toggle') {
    const file = btn.dataset.file;
    if (selected.has(file)) selected.delete(file);
    else selected.add(file);
    saveSelection();
    renderPages();
    return;
  }

  if (action === 'view') {
    setCurrentPage(btn.dataset.file);
    return;
  }

  if (action === 'copy') {
    const ok = await copyText(btn.dataset.url || '');
    updateSelectionInfo(ok ? 'הקישור הועתק' : 'העתקה נכשלה');
    setTimeout(() => updateSelectionInfo(), 1200);
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
  const text = selectionText();
  const ok = text ? await copyText(text) : false;
  updateSelectionInfo(ok ? `הועתקו ${selected.size} קישורים` : 'העתקה נכשלה');
  setTimeout(() => updateSelectionInfo(), 1400);
});
shareSelectionBtn.addEventListener('click', async () => {
  const text = selectionText();
  const ok = text ? await shareText('Parabula - בחירת דפים', text, text) : false;
  updateSelectionInfo(ok ? 'הבחירה נשלחה / הועתקה' : 'השליחה נכשלה');
  setTimeout(() => updateSelectionInfo(), 1400);
});
downloadSelectionBtn.addEventListener('click', () => {
  const picked = selectedPages();
  const text = selectionText();
  if (!picked.length) {
    updateSelectionInfo('אין בחירה להורדה');
    setTimeout(() => updateSelectionInfo(), 1200);
    return;
  }
  downloadText('parabula-selected-pages-links.txt', text);
  updateSelectionInfo(`ירדו ${picked.length} קישורים כקובץ`);
  setTimeout(() => updateSelectionInfo(), 1400);
});
printSelectedBtn.addEventListener('click', printPicked);
goTopicsBtn.addEventListener('click', () => {
  location.href = './topics.html';
});
mobilePrintBtn.addEventListener('click', printPicked);
mobileShareBtn.addEventListener('click', async () => {
  const text = selectionText();
  const ok = text ? await shareText('Parabula - בחירת דפים', text, text) : false;
  updateSelectionInfo(ok ? 'הבחירה נשלחה / הועתקה' : 'השליחה נכשלה');
  setTimeout(() => updateSelectionInfo(), 1400);
});
mobileDownloadBtn.addEventListener('click', () => {
  const picked = selectedPages();
  const text = selectionText();
  if (!picked.length) {
    updateSelectionInfo('אין בחירה להורדה');
    setTimeout(() => updateSelectionInfo(), 1200);
    return;
  }
  downloadText('parabula-selected-pages-links.txt', text);
  updateSelectionInfo(`ירדו ${picked.length} קישורים כקובץ`);
  setTimeout(() => updateSelectionInfo(), 1400);
});
mobileClearBtn.addEventListener('click', () => {
  selected.clear();
  saveSelection();
  renderPages();
});
prevPageBtn.addEventListener('click', () => {
  const idx = currentVisibleIndex();
  if (idx > 0) setCurrentPage(visiblePages[idx - 1].file);
});
nextPageBtn.addEventListener('click', () => {
  const idx = currentVisibleIndex();
  if (idx >= 0 && idx < visiblePages.length - 1) setCurrentPage(visiblePages[idx + 1].file);
});

async function boot() {
  catalog = await loadCatalog(previewDataCandidates());
  loadSelection();
  renderTopicOptions();
  renderPages();
}

boot().catch((error) => {
  console.error(error);
  pagesGrid.innerHTML = '<div class="empty">שגיאה בטעינת כל הדפים</div>';
  resultsInfo.textContent = 'שגיאה בטעינת מטא־דאטה';
});
