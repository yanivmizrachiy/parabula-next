const manifestUrl = './meta/two-variable-systems-manifest.json';
const storageKey = 'parabula:systems-workbook-position';
const kindLabels = {
  systems: 'תרגול מערכות',
  stories: 'בעיות מילוליות וחקר',
  classification: 'מספר פתרונות',
  challenge: 'אתגר',
  reasoning: 'חשיבה מתמטית',
};

const elements = {
  frame: document.querySelector('#workbook-frame'),
  frameStage: document.querySelector('#frame-stage'),
  loading: document.querySelector('#loading-indicator'),
  pageList: document.querySelector('#page-list'),
  pageSelect: document.querySelector('#page-select'),
  previous: document.querySelector('#previous-button'),
  next: document.querySelector('#next-button'),
  title: document.querySelector('#current-page-title'),
  detail: document.querySelector('#current-page-detail'),
  progress: document.querySelector('#progress-bar'),
  stats: document.querySelector('#workbook-stats'),
  sidebarSummary: document.querySelector('#sidebar-summary'),
  openPage: document.querySelector('#open-page-link'),
  printPage: document.querySelector('#print-page-button'),
  copyLink: document.querySelector('#copy-link-button'),
  fullscreen: document.querySelector('#fullscreen-button'),
  viewer: document.querySelector('#viewer-panel'),
  menu: document.querySelector('#menu-button'),
  closeSidebar: document.querySelector('#close-sidebar-button'),
  backdrop: document.querySelector('#sidebar-backdrop'),
  toast: document.querySelector('#toast'),
  liveRegion: document.querySelector('#live-region'),
};

let manifest;
let currentIndex = 0;
let toastTimer;
const prefetched = new Set();
const swipeBoundTargets = new WeakSet();

const safeStorage = {
  get() {
    try { return Number(localStorage.getItem(storageKey)); } catch { return 0; }
  },
  set(value) {
    try { localStorage.setItem(storageKey, String(value)); } catch { /* storage may be unavailable */ }
  },
};

function pageHref(page) {
  return `עמוד-${page}.html`;
}

function primaryKind(page) {
  return Object.keys(page.taskKinds)[0] ?? 'systems';
}

function pageDetail(page) {
  const label = kindLabels[primaryKind(page)] ?? 'דף עבודה';
  return `${label} · ${page.taskCount} ${page.taskCount === 1 ? 'משימה' : 'משימות'}`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 2200);
}

function setSidebar(open) {
  document.body.classList.toggle('sidebar-open', open);
  elements.menu.setAttribute('aria-expanded', String(open));
  elements.backdrop.hidden = !open;
}

function prefetchPage(index) {
  if (!manifest || index < 0 || index >= manifest.pages.length) return;
  const href = pageHref(manifest.pages[index].page);
  if (prefetched.has(href)) return;
  prefetched.add(href);
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.append(link);
}

function updateUrl(index, replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set('p', String(index + 1));
  url.searchParams.delete('page');
  const method = replace ? 'replaceState' : 'pushState';
  history[method]({ index }, '', url);
}

function navigate(index, { replace = false, updateHistory = true } = {}) {
  if (!manifest) return;
  const nextIndex = Math.min(Math.max(index, 0), manifest.pages.length - 1);
  const page = manifest.pages[nextIndex];
  currentIndex = nextIndex;

  elements.frameStage.classList.add('is-loading');
  elements.frame.setAttribute('aria-busy', 'true');
  elements.frame.src = pageHref(page.page);
  elements.openPage.href = pageHref(page.page);
  elements.pageSelect.value = String(nextIndex);
  elements.previous.disabled = nextIndex === 0;
  elements.next.disabled = nextIndex === manifest.pages.length - 1;
  elements.title.textContent = `עמוד ${nextIndex + 1} מתוך ${manifest.totalPages}`;
  elements.detail.textContent = pageDetail(page);
  elements.progress.style.width = `${((nextIndex + 1) / manifest.totalPages) * 100}%`;
  elements.liveRegion.textContent = `נפתח עמוד ${nextIndex + 1} מתוך ${manifest.totalPages}. ${pageDetail(page)}`;
  document.title = `עמוד ${nextIndex + 1} — ${manifest.topic}`;

  for (const button of elements.pageList.querySelectorAll('button[data-index]')) {
    const active = Number(button.dataset.index) === nextIndex;
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  elements.pageList.querySelector(`button[data-index="${nextIndex}"]`)?.scrollIntoView({ block: 'nearest' });

  safeStorage.set(nextIndex + 1);
  if (updateHistory) updateUrl(nextIndex, replace);
  prefetchPage(nextIndex - 1);
  prefetchPage(nextIndex + 1);
}

function renderNavigation() {
  const fragment = document.createDocumentFragment();
  manifest.pages.forEach((page, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.index = String(index);
    button.innerHTML = `
      <span class="page-list-number">${index + 1}</span>
      <span class="page-list-copy">
        <strong>${kindLabels[primaryKind(page)] ?? 'דף עבודה'}</strong>
        <span>${page.taskCount} משימות · עמוד מקור ${page.page}</span>
      </span>`;
    button.addEventListener('click', () => {
      navigate(index);
      setSidebar(false);
    });
    item.append(button);
    fragment.append(item);

    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `עמוד ${index + 1} — ${kindLabels[primaryKind(page)] ?? 'דף עבודה'}`;
    elements.pageSelect.append(option);
  });
  elements.pageList.append(fragment);
  elements.stats.textContent = `${manifest.totalPages} דפי עבודה · ${manifest.totalTasks} משימות`;
  elements.sidebarSummary.textContent = `${manifest.totalPages} דפים · ${manifest.totalTasks} משימות`;
}

function initialIndex() {
  const params = new URLSearchParams(window.location.search);
  const requestedPosition = Number(params.get('p'));
  if (Number.isInteger(requestedPosition) && requestedPosition >= 1 && requestedPosition <= manifest.totalPages) {
    return requestedPosition - 1;
  }
  const requestedPage = Number(params.get('page'));
  const pageIndex = manifest.pages.findIndex((page) => page.page === requestedPage);
  if (pageIndex >= 0) return pageIndex;
  const storedPosition = safeStorage.get();
  if (Number.isInteger(storedPosition) && storedPosition >= 1 && storedPosition <= manifest.totalPages) {
    return storedPosition - 1;
  }
  return 0;
}

function bindSwipe(target) {
  if (!target || swipeBoundTargets.has(target)) return;
  swipeBoundTargets.add(target);
  let startX = 0;
  let startY = 0;
  target.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  }, { passive: true });
  target.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    if (deltaX < 0) navigate(currentIndex + 1);
    else navigate(currentIndex - 1);
  }, { passive: true });
}

function bindEvents() {
  elements.previous.addEventListener('click', () => navigate(currentIndex - 1));
  elements.next.addEventListener('click', () => navigate(currentIndex + 1));
  elements.pageSelect.addEventListener('change', () => navigate(Number(elements.pageSelect.value)));
  elements.menu.addEventListener('click', () => setSidebar(true));
  elements.closeSidebar.addEventListener('click', () => setSidebar(false));
  elements.backdrop.addEventListener('click', () => setSidebar(false));

  elements.frame.addEventListener('load', () => {
    elements.frameStage.classList.remove('is-loading');
    elements.frame.setAttribute('aria-busy', 'false');
    try { bindSwipe(elements.frame.contentDocument); } catch { /* same-origin access may be temporarily unavailable */ }
  });

  elements.printPage.addEventListener('click', () => {
    try { elements.frame.contentWindow?.print(); } catch { window.open(elements.openPage.href, '_blank', 'noopener'); }
  });

  elements.copyLink.addEventListener('click', async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('p', String(currentIndex + 1));
    try {
      await navigator.clipboard.writeText(url.href);
      showToast('הקישור לדף הועתק');
    } catch {
      window.prompt('העתיקו את הקישור:', url.href);
    }
  });

  elements.fullscreen.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await elements.viewer.requestFullscreen();
      else await document.exitFullscreen();
    } catch { showToast('מסך מלא אינו זמין במכשיר זה'); }
  });

  document.addEventListener('fullscreenchange', () => {
    elements.fullscreen.textContent = document.fullscreenElement ? 'יציאה ממסך מלא' : 'מסך מלא';
  });

  document.addEventListener('keydown', (event) => {
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(currentIndex + 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); navigate(currentIndex - 1); }
    if (event.key === 'Home') { event.preventDefault(); navigate(0); }
    if (event.key === 'End') { event.preventDefault(); navigate(manifest.pages.length - 1); }
    if (event.key === 'Escape') setSidebar(false);
  });

  window.addEventListener('popstate', (event) => {
    const index = Number.isInteger(event.state?.index) ? event.state.index : initialIndex();
    navigate(index, { updateHistory: false });
  });

  bindSwipe(elements.frameStage);
}

async function start() {
  elements.frameStage.classList.add('is-loading');
  try {
    const response = await fetch(manifestUrl, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`manifest request failed: ${response.status}`);
    manifest = await response.json();
    if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) throw new Error('manifest has no pages');
    renderNavigation();
    bindEvents();
    navigate(initialIndex(), { replace: true });
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  } catch (error) {
    console.error(error);
    elements.loading.textContent = 'לא ניתן לטעון את תוכן החוברת.';
    elements.stats.textContent = 'שגיאה בטעינת החוברת';
    elements.detail.innerHTML = '<a href="עמוד-609.html">פתיחת הדף הראשון ישירות</a>';
  }
}

start();
