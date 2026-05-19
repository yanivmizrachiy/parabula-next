/**
 * catalog.js — Premium Digital Textbook Layer
 * Parabula Next · Hebrew RTL
 *
 * Data source: meta/topics.json (read-only, never modified here)
 * No demo content. No hardcoded page data. Everything from fetch().
 */

'use strict';

/* ═══════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════ */
const state = {
  topics: [],          // full topics array from topics.json
  allPages: [],        // flat array of all pages with topicName injected
  activeTopic: null,   // current topic name string
  activePage: null,    // current page object
  searchQuery: '',     // current search string
  viewerOpen: false,
};

/* ═══════════════════════════════════════════
   DOM REFS
   ═══════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const dom = {
  stateLoading:       $('stateLoading'),
  stateError:         $('stateError'),
  stateSearch:        $('stateSearch'),
  stateTopic:         $('stateTopic'),
  stateHome:          $('stateHome'),
  errorMsg:           $('errorMsg'),
  retryBtn:           $('retryBtn'),
  topicsNav:          $('topicsNav'),
  topicTitle:         $('topicTitle'),
  topicCount:         $('topicCount'),
  topicSubtitle:      $('topicSubtitle'),
  topicPagesGrid:     $('topicPagesGrid'),
  searchResultsTitle: $('searchResultsTitle'),
  searchResultsCount: $('searchResultsCount'),
  searchResultsGrid:  $('searchResultsGrid'),
  homeTopicsGrid:     $('homeTopicsGrid'),
  viewer:             $('viewer'),
  viewerFrame:        $('viewerFrame'),
  viewerTopicLabel:   $('viewerTopicLabel'),
  viewerPageTitle:    $('viewerPageTitle'),
  viewerProgress:     $('viewerProgress'),
  btnPrev:            $('btnPrev'),
  btnNext:            $('btnNext'),
  btnPrint:           $('btnPrint'),
  btnOpen:            $('btnOpen'),
  btnCloseViewer:     $('btnCloseViewer'),
  globalSearch:       $('globalSearch'),
  clearSearch:        $('clearSearch'),
  statPages:          $('statPages'),
  statTopics:         $('statTopics'),
  mobileMenuBtn:      $('mobileMenuBtn'),
  sidebar:            $('sidebar'),
  sidebarOverlay:     $('sidebarOverlay'),
  mobileBottomNav:    $('mobileBottomNav'),
  mbPrev:             $('mbPrev'),
  mbNext:             $('mbNext'),
  mbTopics:           $('mbTopics'),
  mbPrint:            $('mbPrint'),
};

/* ═══════════════════════════════════════════
   TOPIC ICONS (cosmetic, no data dependency)
   ═══════════════════════════════════════════ */
const TOPIC_ICONS = {
  'משוואות':           '⚖️',
  'משוואות ריבועיות':  '📐',
  'משפט פיתגורס':      '📏',
  'גיאומטריה':         '📐',
  'פונקציות':          '📈',
  'סדרות וחוקיות':     '🔢',
  'פילוג מורחב':       '📚',
};

function topicIcon(name) {
  return TOPIC_ICONS[name] || '📋';
}

/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */
async function init() {
  showState('loading');
  dom.retryBtn.addEventListener('click', init);
  dom.btnPrint.addEventListener('click', handlePrint);
  dom.btnCloseViewer.addEventListener('click', closeViewer);
  dom.btnPrev.addEventListener('click', () => navigatePage(-1));
  dom.btnNext.addEventListener('click', () => navigatePage(1));
  dom.globalSearch.addEventListener('input', handleSearch);
  dom.clearSearch.addEventListener('click', clearSearch);
  dom.mobileMenuBtn.addEventListener('click', toggleSidebar);
  dom.sidebarOverlay.addEventListener('click', closeSidebar);
  dom.mbPrev.addEventListener('click', () => navigatePage(-1));
  dom.mbNext.addEventListener('click', () => navigatePage(1));
  dom.mbTopics.addEventListener('click', toggleSidebar);
  dom.mbPrint.addEventListener('click', handlePrint);

  document.addEventListener('keydown', handleKeyboard);

  try {
    await loadData();
    readURLState();
  } catch (err) {
    showError(`שגיאת טעינה: ${err.message || String(err)}`);
    console.error('[catalog] load error:', err);
  }
}

/* ═══════════════════════════════════════════
   DATA LOADING
   ═══════════════════════════════════════════ */
async function loadData() {
  // Absolute URL + timestamp cache-bust bypasses SW cache and CDN cache
  const dataUrl = new URL('meta/topics.json', window.location.href).href + '?v=' + Date.now();
  let res;
  try {
    res = await fetch(dataUrl, { cache: 'no-store' });
  } catch (fetchErr) {
    throw new Error(`fetch נכשל: ${fetchErr.message}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.url}`);

  let data;
  try {
    data = await res.json();
  } catch (jsonErr) {
    throw new Error(`JSON parse נכשל: ${jsonErr.message}`);
  }

  if (!data.topics || !Array.isArray(data.topics)) {
    throw new Error('topics.json missing valid topics array');
  }

  state.topics = data.topics;
  state.allPages = [];

  for (const topic of state.topics) {
    const pages = topic.pages || [];
    pages.forEach((page, idx) => {
      state.allPages.push({
        ...page,
        topicName:  topic.name,
        topicIndex: idx + 1,          // 1-based position within topic
        topicTotal: pages.length,
      });
    });
  }

  // Sort allPages by page number ascending
  state.allPages.sort((a, b) => a.number - b.number);

  // Update header stats
  dom.statPages.textContent = `${data.totalPages} דפים`;
  dom.statTopics.textContent = `${state.topics.length} נושאים`;

  renderSidebar();
  renderHome();
  // Explicitly hide error state before showing home (belt-and-suspenders)
  dom.stateError.hidden = true;
  showState('home');
}

/* ═══════════════════════════════════════════
   URL STATE
   ═══════════════════════════════════════════ */
function readURLState() {
  const params = new URLSearchParams(window.location.search);
  const topicParam = params.get('topic');
  const pageParam  = params.get('page');

  if (topicParam) {
    const topic = state.topics.find(t => t.name === topicParam);
    if (topic) {
      selectTopic(topic.name, false);
      if (pageParam) {
        const page = state.allPages.find(
          p => p.topicName === topicParam && String(p.number) === pageParam
        );
        if (page) openViewer(page);
      }
      return;
    }
  }
}

function pushURL(topicName, pageNum) {
  const params = new URLSearchParams();
  if (topicName) params.set('topic', topicName);
  if (pageNum != null) params.set('page', String(pageNum));
  const url = params.toString() ? `?${params}` : window.location.pathname;
  window.history.pushState({}, '', url);
}

/* ═══════════════════════════════════════════
   RENDER: SIDEBAR
   ═══════════════════════════════════════════ */
function renderSidebar() {
  dom.topicsNav.innerHTML = '';
  for (const topic of state.topics) {
    const btn = document.createElement('button');
    btn.className = 'topic-nav-item';
    btn.type = 'button';
    btn.dataset.topic = topic.name;
    btn.setAttribute('aria-label', `${topic.name}, ${topic.count} דפים`);
    btn.innerHTML = `
      <span class="topic-nav-name">${escHtml(topic.name)}</span>
      <span class="topic-nav-count">${topic.count}</span>
    `;
    btn.addEventListener('click', () => {
      selectTopic(topic.name);
      closeSidebar();
    });
    dom.topicsNav.appendChild(btn);
  }
}

/* ═══════════════════════════════════════════
   RENDER: HOME
   ═══════════════════════════════════════════ */
function renderHome() {
  dom.homeTopicsGrid.innerHTML = '';
  for (const topic of state.topics) {
    const card = document.createElement('div');
    card.className = 'home-topic-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${topic.name} — ${topic.count} דפים`);
    card.innerHTML = `
      <div class="home-topic-icon">${topicIcon(topic.name)}</div>
      <div class="home-topic-name">${escHtml(topic.name)}</div>
      <div class="home-topic-count">${topic.count} דפים</div>
    `;
    card.addEventListener('click', () => selectTopic(topic.name));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTopic(topic.name); }
    });
    dom.homeTopicsGrid.appendChild(card);
  }
}

/* ═══════════════════════════════════════════
   SELECT TOPIC
   ═══════════════════════════════════════════ */
function selectTopic(topicName, updateURL = true) {
  state.activeTopic = topicName;
  state.activePage  = null;
  state.searchQuery = '';
  dom.globalSearch.value = '';
  dom.clearSearch.hidden = true;

  // Update sidebar active state
  dom.topicsNav.querySelectorAll('.topic-nav-item').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.topic === topicName);
  });

  const topic = state.topics.find(t => t.name === topicName);
  if (!topic) return;

  // Render section header
  dom.topicTitle.textContent = topic.name;
  dom.topicCount.textContent = `${topic.count} דפים`;
  dom.topicSubtitle.textContent = `${topicIcon(topicName)} נושא ${state.topics.indexOf(topic) + 1} מתוך ${state.topics.length}`;

  // Render pages grid
  renderPagesGrid(topic.pages.map(p => ({ ...p, topicName: topic.name })), dom.topicPagesGrid);

  // Close viewer if open
  closeViewer(false);

  showState('topic');
  if (updateURL) pushURL(topicName, null);

  // Scroll to top
  document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════
   RENDER: PAGES GRID
   ═══════════════════════════════════════════ */
function renderPagesGrid(pages, container, query = '') {
  container.innerHTML = '';

  if (!pages.length) {
    container.innerHTML = `<div class="empty-state"><p>לא נמצאו דפים.</p></div>`;
    return;
  }

  const frag = document.createDocumentFragment();

  for (const page of pages) {
    const isActive = state.activePage && state.activePage.file === page.file;
    const card = document.createElement('div');
    card.className = 'page-card' + (isActive ? ' is-active' : '');
    card.setAttribute('role', 'article');
    card.setAttribute('tabindex', '0');
    card.dataset.file = page.file;

    // title is "עמוד X — נושא"; h1 is topic name only — prefer title
    const displayTitle = page.title || page.h1 || page.file;
    const showTopic    = state.searchQuery || page.topicName !== state.activeTopic;
    const topicLabel   = showTopic ? `<span class="card-topic">${escHtml(page.topicName)}</span>` : '';

    card.innerHTML = `
      <span class="card-num">${page.topicIndex ?? page.number}</span>
      ${topicLabel}
      <span class="card-title">${highlight(displayTitle, query)}</span>
      <div class="card-actions">
        <button class="card-btn primary" type="button">צפה</button>
        <button class="card-btn" type="button">הדפס</button>
      </div>
    `;

    card.querySelector('.card-btn.primary').addEventListener('click', e => {
      e.stopPropagation();
      openViewer(page);
    });

    card.querySelector('.card-btn:not(.primary)').addEventListener('click', e => {
      e.stopPropagation();
      printPage(page);
    });

    card.addEventListener('click', () => openViewer(page));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(page); }
    });

    frag.appendChild(card);
  }

  container.appendChild(frag);
}

/* ═══════════════════════════════════════════
   VIEWER
   ═══════════════════════════════════════════ */
function getPageUrl(page) {
  const raw = page.siteUrl || page.file;
  return new URL(raw, window.location.href).href;
}

function openViewer(page) {
  state.activePage  = page;
  state.viewerOpen  = true;

  // Load iframe — use the local relative path
  const src = getPageUrl(page);
  dom.viewerFrame.src = src;
  dom.btnOpen.href    = src;

  dom.viewerTopicLabel.textContent = page.topicName || state.activeTopic || '';
  dom.viewerPageTitle.textContent  = page.title || page.h1 || page.file;

  updateViewerNav();

  dom.viewer.hidden = false;
  dom.mobileBottomNav.hidden = false;

  // Update active card
  updateActiveCard(page.file);

  // Push URL
  pushURL(state.activeTopic || page.topicName, page.number);

  // Scroll viewer into view
  setTimeout(() => dom.viewer.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

function closeViewer(updateURL = true) {
  if (!state.viewerOpen) return;
  state.viewerOpen  = false;
  state.activePage  = null;
  dom.viewer.hidden = true;
  dom.viewerFrame.src = 'about:blank';
  dom.mobileBottomNav.hidden = true;
  updateActiveCard(null);
  if (updateURL && state.activeTopic) pushURL(state.activeTopic, null);
}

function updateViewerNav() {
  if (!state.activePage) return;

  const topicPages = state.allPages.filter(p => p.topicName === state.activeTopic);
  const idx = topicPages.findIndex(p => p.file === state.activePage.file);

  dom.btnPrev.disabled = idx <= 0;
  dom.btnNext.disabled = idx >= topicPages.length - 1;
  dom.viewerProgress.textContent = `${idx + 1} / ${topicPages.length}`;
}

function navigatePage(delta) {
  if (!state.activePage) return;

  const topicPages = state.allPages.filter(p => p.topicName === state.activeTopic);
  const idx = topicPages.findIndex(p => p.file === state.activePage.file);
  const next = topicPages[idx + delta];
  if (next) openViewer(next);
}

/* ═══════════════════════════════════════════
   PRINT
   ═══════════════════════════════════════════ */
function handlePrint() {
  if (!state.activePage) return;
  printPage(state.activePage);
}

function printPage(page) {
  // Open the A4 worksheet directly in a new tab — the browser's print dialog
  // will print it exactly as it was designed (A4, no UI chrome).
  const url = getPageUrl(page);
  const w = window.open(url, '_blank', 'noopener');
  if (w) {
    w.addEventListener('load', () => {
      setTimeout(() => w.print(), 300);
    });
  }
}

/* ═══════════════════════════════════════════
   SEARCH
   ═══════════════════════════════════════════ */
function handleSearch(e) {
  const q = e.target.value.trim();
  state.searchQuery = q;
  dom.clearSearch.hidden = !q;

  if (!q) {
    // Return to topic or home
    if (state.activeTopic) {
      selectTopic(state.activeTopic, false);
    } else {
      showState('home');
    }
    return;
  }

  const lower = q.toLowerCase();
  const results = state.allPages.filter(p => {
    const title = (p.h1 || p.title || '').toLowerCase();
    const topic = (p.topicName || '').toLowerCase();
    return title.includes(lower) || topic.includes(lower);
  });

  dom.searchResultsTitle.textContent = `תוצאות עבור "${q}"`;
  dom.searchResultsCount.textContent = `${results.length} דפים`;
  renderPagesGrid(results, dom.searchResultsGrid, q);
  showState('search');
}

function clearSearch() {
  dom.globalSearch.value = '';
  state.searchQuery = '';
  dom.clearSearch.hidden = true;
  dom.globalSearch.dispatchEvent(new Event('input'));
  dom.globalSearch.focus();
}

/* ═══════════════════════════════════════════
   KEYBOARD
   ═══════════════════════════════════════════ */
function handleKeyboard(e) {
  if (e.target.matches('input, textarea')) return;

  if (e.key === 'ArrowRight' && state.viewerOpen) { e.preventDefault(); navigatePage(-1); }
  if (e.key === 'ArrowLeft'  && state.viewerOpen) { e.preventDefault(); navigatePage(1);  }
  if (e.key === 'Escape' && state.viewerOpen) closeViewer();
  if (e.key === '/' || e.key === 'f') { e.preventDefault(); dom.globalSearch.focus(); }
}

/* ═══════════════════════════════════════════
   MOBILE SIDEBAR
   ═══════════════════════════════════════════ */
function toggleSidebar() {
  const open = dom.sidebar.classList.toggle('is-open');
  dom.sidebarOverlay.classList.toggle('is-visible', open);
  dom.mobileMenuBtn.setAttribute('aria-expanded', String(open));
}

function closeSidebar() {
  dom.sidebar.classList.remove('is-open');
  dom.sidebarOverlay.classList.remove('is-visible');
  dom.mobileMenuBtn.setAttribute('aria-expanded', 'false');
}

/* ═══════════════════════════════════════════
   UI HELPERS
   ═══════════════════════════════════════════ */
function showState(name) {
  const states = ['loading', 'error', 'search', 'topic', 'home'];
  const stateMap = {
    loading: dom.stateLoading,
    error:   dom.stateError,
    search:  dom.stateSearch,
    topic:   dom.stateTopic,
    home:    dom.stateHome,
  };
  for (const s of states) {
    const el = stateMap[s];
    if (!el) continue;
    el.hidden = s !== name;
  }
}

function showError(msg) {
  dom.errorMsg.textContent = msg;
  showState('error');
}

function updateActiveCard(file) {
  document.querySelectorAll('.page-card').forEach(card => {
    card.classList.toggle('is-active', file != null && card.dataset.file === file);
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlight(text, query) {
  if (!query) return escHtml(text);
  const safe  = escHtml(text);
  const safeQ = escHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(safeQ, 'gi'), m => `<mark>${m}</mark>`);
}

/* ═══════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);

