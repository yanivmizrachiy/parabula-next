const els = {
  topicStrip: document.getElementById('topicStrip'),
  appSummary: document.getElementById('appSummary'),
  currentTopicTitle: document.getElementById('currentTopicTitle'),
  currentTopicMeta: document.getElementById('currentTopicMeta'),
  globalSearch: document.getElementById('globalSearch'),
  topicPages: document.getElementById('topicPages'),
  currentPageTitle: document.getElementById('currentPageTitle'),
  currentPageMeta: document.getElementById('currentPageMeta'),
  topicProgress: document.getElementById('topicProgress'),
  globalProgress: document.getElementById('globalProgress'),
  mobilePageFrame: document.getElementById('mobilePageFrame'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  openLiveBtn: document.getElementById('openLiveBtn'),
  printBtn: document.getElementById('printBtn'),
  bottomPrevBtn: document.getElementById('bottomPrevBtn'),
  bottomNextBtn: document.getElementById('bottomNextBtn'),
  bottomOpenBtn: document.getElementById('bottomOpenBtn'),
  bottomPrintBtn: document.getElementById('bottomPrintBtn'),
  nextTopicBtn: document.getElementById('nextTopicBtn'),
  bottomTopicBtn: document.getElementById('bottomTopicBtn'),
  openTopicHomeBtn: document.getElementById('openTopicHomeBtn'),
  bottomTopicHomeBtn: document.getElementById('bottomTopicHomeBtn'),
  openInstallBtn: document.getElementById('openInstallBtn'),
  openBookStartBtn: document.getElementById('openBookStartBtn'),
  bottomBookStartBtn: document.getElementById('bottomBookStartBtn'),
  mobileLoadingState: document.getElementById('mobileLoadingState'),
  mobileResumeMeta: document.getElementById('mobileResumeMeta'),
  resumeLastBtn: document.getElementById('resumeLastBtn'),
  startBookBtn: document.getElementById('startBookBtn'),
  topicCardsHome: document.getElementById('topicCardsHome')
};

const APP_BASE = new URL('./', window.location.href);
let db = null;
let activeTopic = '';
let visiblePages = [];
let flatPages = [];
let currentIndex = -1;

function norm(value) {
  return String(value || '').trim().toLowerCase();
}

function htmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pageUrl(page) {
  if (!page) return 'about:blank';
  if (page.siteUrl) return page.siteUrl;
  return new URL(page.file, APP_BASE).href;
}

function getCurrentPage() {
  return currentIndex >= 0 ? visiblePages[currentIndex] : null;
}

function updateButtons() {
  const hasPage = !!getCurrentPage();
  const disablePrev = !hasPage || currentIndex <= 0;
  const disableNext = !hasPage || currentIndex >= visiblePages.length - 1;

  [els.prevPageBtn, els.bottomPrevBtn].forEach((btn) => { if (btn) btn.disabled = disablePrev; });
  [els.nextPageBtn, els.bottomNextBtn].forEach((btn) => { if (btn) btn.disabled = disableNext; });
  [els.openLiveBtn, els.bottomOpenBtn, els.printBtn, els.bottomPrintBtn].forEach((btn) => { if (btn) btn.disabled = !hasPage; });

  document.querySelectorAll('.mobile-topic-btn').forEach((node) => {
    node.classList.toggle('active', node.dataset.topic === activeTopic);
  });
  document.querySelectorAll('.mobile-page-card').forEach((node) => {
    const active = hasPage && node.dataset.file === getCurrentPage().file;
    node.classList.toggle('active', active);
  });
}

function setProgress(page) {
  if (!page) {
    els.topicProgress.textContent = '—';
    els.globalProgress.textContent = '—';
    return;
  }
  els.topicProgress.textContent = `בתוך הנושא: ${currentIndex + 1} / ${visiblePages.length}`;
  const globalIndex = flatPages.findIndex((item) => item.file === page.file);
  els.globalProgress.textContent = globalIndex >= 0 ? `בכל הספר: ${globalIndex + 1} / ${flatPages.length}` : '—';
}

function showPage(file) {
  const idx = visiblePages.findIndex((page) => page.file === file);
  if (idx === -1) return;
  currentIndex = idx;
  const page = visiblePages[idx];
  if (els.mobileLoadingState) {
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

function renderTopicCards() {
  if (!els.topicCardsHome) return;
  els.topicCardsHome.innerHTML = '';
  (db?.topics || []).forEach((topic) => {
    const firstPage = (topic.pages || []).slice().sort((a, b) => a.number - b.number)[0];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-topic-home-card';
    button.dataset.topic = topic.name;
    button.innerHTML = `<strong>${htmlEscape(topic.name)}</strong><span>${topic.count} דפים</span><small>${firstPage ? `מתחיל בעמוד ${firstPage.number}` : 'ללא עמודים'}</small>`;
    button.addEventListener('click', () => {
      activeTopic = topic.name;
      renderTopics();
      renderPages();
      if (firstPage) showPage(firstPage.file);
    });
    els.topicCardsHome.appendChild(button);
  });
}

function renderTopics() {
  els.topicStrip.innerHTML = '';
  (db?.topics || []).forEach((topic) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-topic-btn';
    button.dataset.topic = topic.name;
    button.textContent = `${topic.name} (${topic.count})`;
    button.addEventListener('click', () => {
      activeTopic = topic.name;
      renderPages();
    });
    els.topicStrip.appendChild(button);
  });
  updateButtons();
}

function renderPages() {
  const query = norm(els.globalSearch?.value);
  const topic = (db?.topics || []).find((item) => item.name === activeTopic) || (db?.topics || [])[0];
  activeTopic = topic?.name || '';
  visiblePages = (topic?.pages || []).slice().sort((a, b) => a.number - b.number).filter((page) => {
    const haystack = `${page.topic} ${page.title} ${page.h1} ${page.file} ${page.number}`;
    return !query || norm(haystack).includes(query);
  });

  els.currentTopicTitle.textContent = activeTopic || 'נושאים';
  els.currentTopicMeta.textContent = visiblePages.length ? `${visiblePages.length} דפים` : 'אין דפים להצגה';
  els.topicPages.innerHTML = '';

  if (!visiblePages.length) {
    currentIndex = -1;
    els.topicPages.innerHTML = '<div class="mobile-empty">לא נמצאו דפים בתנאים שבחרת.</div>';
    els.currentPageTitle.textContent = 'לא נמצאו דפים';
    els.currentPageMeta.textContent = 'נסה חיפוש אחר או נושא אחר';
    els.mobilePageFrame.src = 'about:blank';
    setProgress(null);
    updateButtons();
    return;
  }

  visiblePages.forEach((page) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-page-card';
    button.dataset.file = page.file;
    button.innerHTML = `<strong>${htmlEscape(page.title || page.h1 || page.file)}</strong><span>עמוד ${page.number}</span><span>${htmlEscape(page.topic || '')}</span>`;
    button.addEventListener('click', () => showPage(page.file));
    els.topicPages.appendChild(button);
  });

  const rememberFile = localStorage.getItem('parabula:mobile-app:lastFile');
  const target = rememberFile && visiblePages.some((page) => page.file === rememberFile) ? rememberFile : visiblePages[0].file;
  showPage(target);
}

function openCurrent() {
  const page = getCurrentPage();
  if (page) window.open(pageUrl(page), '_blank', 'noopener,noreferrer');
}

function printCurrent() {
  const page = getCurrentPage();
  if (page) window.open(pageUrl(page), '_blank', 'noopener,noreferrer');
}

function goPrev() { if (currentIndex > 0) showPage(visiblePages[currentIndex - 1].file); }
function goNext() { if (currentIndex >= 0 && currentIndex < visiblePages.length - 1) showPage(visiblePages[currentIndex + 1].file); }
function openTopicStart() { if (visiblePages.length) showPage(visiblePages[0].file); }

function openBookStart() {
  if (!flatPages.length) return;
  const first = flatPages[0];
  activeTopic = first.topic || activeTopic;
  renderTopics();
  renderPages();
  showPage(first.file);
}

function openNextTopic() {
  if (!db?.topics?.length) return;
  const idx = db.topics.findIndex((topic) => topic.name === activeTopic);
  const next = idx >= 0 ? (idx + 1) % db.topics.length : 0;
  activeTopic = db.topics[next].name;
  renderTopics();
  renderPages();
}

function resumeLast() {
  const lastFile = localStorage.getItem('parabula:mobile-app:lastFile');
  const lastTopic = localStorage.getItem('parabula:mobile-app:lastTopic');
  if (lastTopic) activeTopic = lastTopic;
  renderTopics();
  renderPages();
  if (lastFile && flatPages.some((page) => page.file === lastFile)) showPage(lastFile);
}

function openInstall() {
  window.open(new URL('./mobile-app-install.html', APP_BASE).href, '_blank', 'noopener,noreferrer');
}

async function boot() {
  const response = await fetch(new URL('./mobile-topics.json', APP_BASE), { cache: 'no-store' });
  if (!response.ok) throw new Error(`topics fetch failed: ${response.status}`);
  db = await response.json();
  flatPages = (db.topics || []).flatMap((topic) => topic.pages || []).sort((a, b) => a.number - b.number);
  els.appSummary.textContent = `${(db.topics || []).length} נושאים · ${db.totalPages || flatPages.length} דפים`;
  const lastFile = localStorage.getItem('parabula:mobile-app:lastFile');
  const lastTopic = localStorage.getItem('parabula:mobile-app:lastTopic');
  els.mobileResumeMeta.textContent = lastFile ? `מקום אחרון: ${lastTopic || 'ללא נושא'} · ${lastFile}` : 'אפשר להתחיל מהעמוד הראשון או להמשיך מהמקום האחרון.';
  activeTopic = lastTopic || db.topics?.[0]?.name || '';
  renderTopicCards();
  renderTopics();
  renderPages();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register(new URL('./sw.js', APP_BASE));
}

if (els.mobilePageFrame) {
  els.mobilePageFrame.addEventListener('load', () => {
    if (els.mobileLoadingState) els.mobileLoadingState.hidden = true;
  });
}

els.globalSearch?.addEventListener('input', renderPages);
els.prevPageBtn?.addEventListener('click', goPrev);
els.bottomPrevBtn?.addEventListener('click', goPrev);
els.nextPageBtn?.addEventListener('click', goNext);
els.bottomNextBtn?.addEventListener('click', goNext);
els.openLiveBtn?.addEventListener('click', openCurrent);
els.bottomOpenBtn?.addEventListener('click', openCurrent);
els.printBtn?.addEventListener('click', printCurrent);
els.bottomPrintBtn?.addEventListener('click', printCurrent);
els.nextTopicBtn?.addEventListener('click', openNextTopic);
els.bottomTopicBtn?.addEventListener('click', openNextTopic);
els.openTopicHomeBtn?.addEventListener('click', openTopicStart);
els.bottomTopicHomeBtn?.addEventListener('click', openTopicStart);
els.openInstallBtn?.addEventListener('click', openInstall);
els.openBookStartBtn?.addEventListener('click', openBookStart);
els.bottomBookStartBtn?.addEventListener('click', openBookStart);
els.resumeLastBtn?.addEventListener('click', resumeLast);
els.startBookBtn?.addEventListener('click', openBookStart);

boot().catch((error) => {
  console.error(error);
  els.currentPageTitle.textContent = 'שגיאה בטעינת הספר';
  els.currentPageMeta.textContent = 'לא הצלחתי לטעון את דפי העבודה מהאתר.';
  if (els.topicPages) els.topicPages.innerHTML = '<div class="mobile-empty">אירעה שגיאה בטעינת הספר. נסה לרענן את הדף.</div>';
});
