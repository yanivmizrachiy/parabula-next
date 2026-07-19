'use strict';

const VERSION = '__MOBILE_VERSION__';
const TOPICS_URL = new URL('./meta/topics.json', window.location.href).href;
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.4;
const SCROLL_WINDOW = 3;
const bootConfig = window.__PARABULA_BOOT || { fullMode: false, requestedFile: '' };

const els = {
  appShell: document.getElementById('appShell'),
  appMeta: document.getElementById('appMeta'),
  topicStrip: document.getElementById('topicStrip'),
  topicPages: document.getElementById('topicPages'),
  currentPageTitle: document.getElementById('currentPageTitle'),
  currentPageMeta: document.getElementById('currentPageMeta'),
  topicProgress: document.getElementById('topicProgress'),
  globalProgress: document.getElementById('globalProgress'),
  mobilePageFrame: document.getElementById('mobilePageFrame'),
  mobileLoadingState: document.getElementById('mobileLoadingState'),
  mobileErrorState: document.getElementById('mobileErrorState'),
  globalSearch: document.getElementById('globalSearch'),
  searchMeta: document.getElementById('searchMeta'),
  toggleTopicsBtn: document.getElementById('toggleTopicsBtn'),
  installAppBtn: document.getElementById('installAppBtn'),
  topicsPanel: document.getElementById('topicsPanel'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  openLiveBtn: document.getElementById('openLiveBtn'),
  actionsBtn: document.getElementById('actionsBtn'),
  zoomInBtn: document.getElementById('zoomInBtn'),
  zoomOutBtn: document.getElementById('zoomOutBtn'),
  zoomResetBtn: document.getElementById('zoomResetBtn'),
  selectModeBtn: document.getElementById('selectModeBtn'),
  selectionBar: document.getElementById('selectionBar'),
  selectionCount: document.getElementById('selectionCount'),
  selPrint: document.getElementById('selPrint'),
  selClear: document.getElementById('selClear'),
  actionsSheet: document.getElementById('actionsSheet'),
  sheetPanel: document.querySelector('#actionsSheet .sheet-panel'),
  sheetCloseBtn: document.getElementById('sheetCloseBtn'),
  sheetPageTitle: document.getElementById('sheetPageTitle'),
  modeSwitch: document.getElementById('modeSwitch'),
  aPrint: document.getElementById('aPrint'),
  aPdf: document.getElementById('aPdf'),
  aHtml: document.getElementById('aHtml'),
  aOpen: document.getElementById('aOpen'),
  aPrintTopic: document.getElementById('aPrintTopic'),
  aSelectTopic: document.getElementById('aSelectTopic'),
  frameWrap: document.querySelector('.frame-wrap'),
  networkStatus: document.getElementById('networkStatus'),
  updateBar: document.getElementById('updateBar'),
  applyUpdateBtn: document.getElementById('applyUpdateBtn'),
};

const UNASSIGNED_ID = 'unassigned';

const state = {
  db: null,
  flatPages: [],
  visiblePages: [],
  curriculum: [],          // עץ תכנית הלימודים מתוך topics.json
  nodeById: new Map(),     // מזהה צומת → הצומת עצמו
  pagesByNode: new Map(),  // מזהה צומת → דפיו הישירים
  activeTopic: '',         // מזהה צומת תכנית הלימודים הפעיל
  openNodes: new Set(),    // צמתים פתוחים בעץ הניווט
  currentIndex: -1,
  shownPage: null,
  zoomFactor: 1,
  readMode: bootConfig.fullMode ? 'single' : storageGet('parabula:readMode', 'single'),
  scrollStack: null,
  scrollPages: [],
  scrollIndex: -1,
  scrollRaf: 0,
  frameResizeObserver: null,
  frameMutationObserver: null,
  fitRaf: 0,
  fitTimers: [],
  deferredInstallPrompt: null,
  sheetCloseTimer: 0,
  sheetReturnFocus: null,
  sheetHistoryPushed: false,
  updateWorker: null,
  reloadingForUpdate: false,
};

function storageGet(key, fallback = '') {
  try { return localStorage.getItem(key) ?? fallback; }
  catch { return fallback; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, String(value)); }
  catch { /* אחסון חסום אינו מפיל את האפליקציה */ }
}

function norm(value) {
  return String(value || '').trim().toLowerCase();
}

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cssEscape(value) {
  return window.CSS?.escape ? CSS.escape(String(value)) : String(value).replace(/["\\]/g, '\\$&');
}

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
}

function pageUrl(page) {
  if (!page) return 'about:blank';
  if (page.file) return new URL(`./${encodeURIComponent(page.file)}`, window.location.href).href;
  return page.siteUrl || 'about:blank';
}

/** דפי צומת תכנית הלימודים, בסדר הקריאה של הספר. */
function nodePagesOf(nodeId) {
  return (state.pagesByNode.get(nodeId) || []).slice();
}

function nodeNameOf(nodeId) {
  return state.nodeById.get(nodeId)?.name || nodeId || '';
}

/** הנושא הראשון בעץ שיש בו דפים — נקודת פתיחה כשאין מצב שמור. */
function firstPopulatedNodeId() {
  return state.flatPages.find((page) => page.curriculumId)?.curriculumId || '';
}

/** מסלול קריא מהכיתה ועד תת־הנושא. מזהי הצמתים נגזרים זה מזה בנקודות. */
function nodePathOf(nodeId) {
  if (!nodeId) return '';
  const parts = String(nodeId).split('.');
  const names = [];
  for (let i = 1; i <= parts.length; i += 1) {
    const node = state.nodeById.get(parts.slice(0, i).join('.'));
    if (node) names.push(node.name);
  }
  return names.join(' · ');
}

function pagePlacementIds(page) {
  return [...new Set([page?.curriculumId, ...(page?.relatedCurriculumIds || [])].filter(Boolean))];
}
function pageBelongsToNode(page, nodeId) {
  return Boolean(nodeId) && pagePlacementIds(page).includes(nodeId);
}
function activeNodeOf(page) {
  return pageBelongsToNode(page, state.activeTopic) ? state.activeTopic : (page?.curriculumId || '');
}

/** כל קובצי הדפים שמתחת לצומת, כולל צאצאיו. */
function nodeFilesOf(node) {
  const files = nodePagesOf(node.id).map((page) => page.file);
  for (const child of node.children || []) files.push(...nodeFilesOf(child));
  return files;
}

function currentPage() {
  return state.currentIndex >= 0 ? state.visiblePages[state.currentIndex] : null;
}

function activePage() {
  return state.shownPage || currentPage();
}

function findPage(file) {
  return state.flatPages.find((page) => page.file === file) || null;
}

function setError(message = '') {
  if (!els.mobileErrorState) return;
  els.mobileErrorState.hidden = !message;
  els.mobileErrorState.textContent = message;
}

function setLoading(loading) {
  els.mobileLoadingState.hidden = !loading;
}

function setTopicsPanelOpen(open) {
  els.topicsPanel.classList.toggle('is-collapsed', !open);
  document.body.classList.toggle('focus-reading', !open);
  els.toggleTopicsBtn.setAttribute('aria-expanded', String(open));
  els.toggleTopicsBtn.textContent = open ? 'הסתר נושאים' : 'נושאים ודפים';
}

function setProgress(page) {
  if (!page) {
    els.topicProgress.textContent = '—';
    els.globalProgress.textContent = '—';
    return;
  }
  const nodeId = activeNodeOf(page);
  const topicPages = nodePagesOf(nodeId);
  const topicIndex = topicPages.findIndex((item) => item.file === page.file);
  const globalIndex = state.flatPages.findIndex((item) => item.file === page.file);
  els.topicProgress.textContent = topicIndex >= 0 ? `עמוד ${topicIndex + 1} מתוך ${topicPages.length} בנושא` : '—';
  els.globalProgress.textContent = globalIndex >= 0 ? `עמוד ${globalIndex + 1} מתוך ${state.flatPages.length} בספר` : '—';
}

function updatePageHeading(page) {
  if (!page) return;
  els.currentPageTitle.textContent = page.title || page.h1 || page.file;
  els.currentPageMeta.textContent = `${nodePathOf(activeNodeOf(page))} · עמוד ${page.number}`;
  els.sheetPageTitle.textContent = page.title || page.h1 || page.file;
  setProgress(page);
}

function updateZoomUi() {
  const enabled = Boolean(activePage()) && state.readMode === 'single';
  els.zoomResetBtn.textContent = `${Math.round(state.zoomFactor * 100)}%`;
  els.zoomResetBtn.disabled = !enabled;
  els.zoomOutBtn.disabled = !enabled || state.zoomFactor <= MIN_ZOOM + 0.0001;
  els.zoomInBtn.disabled = !enabled || state.zoomFactor >= MAX_ZOOM - 0.0001;
}

function updateButtons() {
  const hasPage = Boolean(activePage());
  const inScroll = state.readMode === 'scroll';
  // גם בגלילה רציפה קודם/הבא פעילים — מנווטים דף-דף בתוך הערימה (§5.5).
  const index = inScroll ? state.scrollIndex : state.currentIndex;
  const total = inScroll ? state.scrollPages.length : state.visiblePages.length;
  els.prevPageBtn.disabled = !hasPage || index <= 0;
  els.nextPageBtn.disabled = !hasPage || index < 0 || index >= total - 1;
  els.openLiveBtn.disabled = !hasPage;
  els.actionsBtn.disabled = !hasPage;
  updateZoomUi();

  document.querySelectorAll('.topic-btn').forEach((button) => {
    const active = button.dataset.topic === state.activeTopic;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('.page-card').forEach((card) => {
    const active = hasPage && card.dataset.file === activePage()?.file;
    card.classList.toggle('active', active);
    const openButton = card.querySelector('.page-open');
    if (active) openButton?.setAttribute('aria-current', 'page');
    else openButton?.removeAttribute('aria-current');
  });
}

function viewportHeight() {
  return Math.max(0, Math.round(window.visualViewport?.height || window.innerHeight || 0));
}

function setReaderFrameHeight() {
  if (state.readMode !== 'single' || bootConfig.fullMode) return;
  const topbar = document.querySelector('.topbar')?.offsetHeight || 0;
  const readerHead = document.querySelector('.reader-head')?.offsetHeight || 0;
  const bottom = document.querySelector('.bottom-nav')?.offsetHeight || 0;
  const notices = [...document.querySelectorAll('.network-status:not([hidden]),.update-bar:not([hidden])')]
    .reduce((sum, node) => sum + node.offsetHeight + 4, 0);
  const available = viewportHeight() - topbar - readerHead - bottom - notices - 42;
  const landscape = window.matchMedia?.('(orientation: landscape) and (max-height: 600px)').matches;
  const minimum = landscape ? 220 : 320;
  els.mobilePageFrame.style.height = `${Math.max(minimum, available)}px`;
}

function injectMobileReaderStyles(doc) {
  if (doc.getElementById('mobile-reader-cleanup-style')) return;
  const style = doc.createElement('style');
  style.id = 'mobile-reader-cleanup-style';
  style.textContent = `
    .preview-nav{display:none !important;zoom:1 !important;}
    html,body{margin:0 !important;padding:0 !important;width:100% !important;min-width:0 !important;height:auto !important;min-height:100% !important;overflow:hidden !important;background:#eef3f8 !important;}
    body{position:relative !important;display:block !important;}
    html body .a4-page,html body .a4-page.equations-page{width:210mm !important;height:297mm !important;min-width:210mm !important;max-width:none !important;margin:0 !important;box-shadow:none !important;zoom:1 !important;position:absolute !important;top:0 !important;left:0 !important;transform:none;transform-origin:left top !important;page-break-after:auto !important;flex-shrink:0 !important;}
    html body .a4-page.equations-page{padding:10mm 18mm !important;}
    @media print{html,body{display:block !important;overflow:visible !important;height:auto !important;min-height:0 !important;background:#fff !important;}html body .a4-page,html body .a4-page.equations-page{width:210mm !important;height:297mm !important;min-width:210mm !important;zoom:1 !important;position:static !important;top:auto !important;left:auto !important;transform:none !important;transform-origin:center top !important;margin:0 !important;}}
  `;
  (doc.head || doc.documentElement)?.appendChild(style);
}

function enforceCanonicalPageGeometry(page) {
  const rules = {
    width: '210mm', height: '297mm', 'min-width': '210mm', 'max-width': 'none', margin: '0',
    zoom: '1', 'flex-shrink': '0', position: 'absolute', top: '0', left: '0', 'transform-origin': 'left top'
  };
  Object.entries(rules).forEach(([name, value]) => page.style.setProperty(name, value, 'important'));
  if (page.classList.contains('equations-page')) page.style.setProperty('padding', '10mm 18mm', 'important');
}

function fitCurrentA4Page() {
  if (state.readMode !== 'single') return;
  try {
    const frame = els.mobilePageFrame;
    const doc = frame.contentDocument || frame.contentWindow?.document;
    const win = frame.contentWindow;
    if (!doc || !win) return;
    injectMobileReaderStyles(doc);
    const page = doc.querySelector('.a4-page');
    if (!page) {
      setError('הדף נטען אך לא נמצא בו מבנה A4 תקין.');
      return;
    }
    setError('');
    enforceCanonicalPageGeometry(page);
    page.style.setProperty('transform', 'none', 'important');
    const hostWidth = Math.max(0, frame.clientWidth - 8);
    const hostHeight = Math.max(0, frame.clientHeight - 8);
    const rawRect = page.getBoundingClientRect();
    const rawWidth = page.offsetWidth || page.scrollWidth || rawRect.width;
    const rawHeight = page.offsetHeight || page.scrollHeight || rawRect.height;
    if (!rawWidth || !rawHeight || !hostWidth || !hostHeight) return;

    const fitScale = Math.min(hostWidth / rawWidth, hostHeight / rawHeight, 1);
    const zoomed = state.zoomFactor > 1.0001;
    const scale = fitScale * state.zoomFactor;
    const scaledWidth = Math.max(1, Math.round(rawWidth * scale));
    const scaledHeight = Math.max(1, Math.round(rawHeight * scale));
    const left = zoomed ? 0 : Math.max(0, Math.round((hostWidth - scaledWidth) / 2));
    page.style.setProperty('left', `${left}px`, 'important');
    page.style.setProperty('top', '0', 'important');
    page.style.setProperty('transform', `scale(${scale})`, 'important');

    const overflow = zoomed ? 'auto' : 'hidden';
    doc.documentElement.style.setProperty('width', '100%', 'important');
    doc.documentElement.style.setProperty('min-width', '0', 'important');
    doc.documentElement.style.setProperty('overflow', overflow, 'important');
    doc.documentElement.style.setProperty('background', '#eef3f8', 'important');
    doc.body.style.setProperty('width', zoomed ? `${Math.max(hostWidth, scaledWidth)}px` : '100%', 'important');
    doc.body.style.setProperty('min-width', zoomed ? `${scaledWidth}px` : '0', 'important');
    doc.body.style.setProperty('min-height', `${scaledHeight}px`, 'important');
    doc.body.style.setProperty('height', `${scaledHeight}px`, 'important');
    doc.body.style.setProperty('overflow', overflow, 'important');
    doc.body.style.setProperty('background', '#eef3f8', 'important');
    doc.body.style.setProperty('position', 'relative', 'important');
    doc.body.style.setProperty('display', 'block', 'important');
    if (!zoomed) win.scrollTo?.(0, 0);
  } catch (error) {
    console.error('fitCurrentA4Page failed', error);
    setError('לא ניתן להתאים את הדף למסך.');
  }
}

function clearFitSchedule() {
  if (state.fitRaf) cancelAnimationFrame(state.fitRaf);
  state.fitTimers.forEach(clearTimeout);
  state.fitTimers = [];
}

function scheduleFit() {
  if (state.readMode !== 'single') return;
  clearFitSchedule();
  setReaderFrameHeight();
  state.fitRaf = requestAnimationFrame(() => {
    state.fitRaf = 0;
    fitCurrentA4Page();
  });
  state.fitTimers = [120, 480].map((delay) => setTimeout(fitCurrentA4Page, delay));
}

function setZoom(factor) {
  const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(factor * 100) / 100));
  if (next === state.zoomFactor) return updateZoomUi();
  state.zoomFactor = next;
  updateZoomUi();
  scheduleFit();
}

function prepareFrameForPrint(doc) {
  const page = doc?.querySelector('.a4-page');
  if (!doc || !page) return false;
  enforceCanonicalPageGeometry(page);
  page.style.setProperty('position', 'static', 'important');
  page.style.setProperty('top', 'auto', 'important');
  page.style.setProperty('left', 'auto', 'important');
  page.style.setProperty('transform-origin', 'center top', 'important');
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

function watchFrameContent() {
  try {
    state.frameResizeObserver?.disconnect();
    state.frameMutationObserver?.disconnect();
    const doc = els.mobilePageFrame.contentDocument || els.mobilePageFrame.contentWindow?.document;
    const page = doc?.querySelector('.a4-page');
    if (!doc || !page) {
      setError('לא נמצא דף A4 תקין בקובץ שנפתח.');
      return;
    }
    if ('ResizeObserver' in window) {
      state.frameResizeObserver = new ResizeObserver(scheduleFit);
      state.frameResizeObserver.observe(page);
    }
    state.frameMutationObserver = new MutationObserver(scheduleFit);
    state.frameMutationObserver.observe(page, { childList: true, subtree: true });
    doc.fonts?.ready?.then(scheduleFit).catch(() => {});
    doc.defaultView?.MathJax?.startup?.promise?.then(scheduleFit).catch(() => {});
    doc.defaultView?.addEventListener('beforeprint', () => prepareFrameForPrint(doc));
    doc.defaultView?.addEventListener('afterprint', scheduleFit);
  } catch (error) {
    console.error('watchFrameContent failed', error);
    setError('לא ניתן לקרוא את תוכן הדף.');
  }
}

function syncCurrentPage(page, { persist = true } = {}) {
  if (!page) return;
  state.shownPage = page;
  const targetTopic = pageBelongsToNode(page, state.activeTopic) ? state.activeTopic : (page.curriculumId || state.activeTopic);
  const topicChanged = Boolean(targetTopic) && targetTopic !== state.activeTopic;
  state.activeTopic = targetTopic;
  if (topicChanged) revealActiveNode();
  state.currentIndex = state.visiblePages.findIndex((item) => item.file === page.file);
  if (state.currentIndex < 0) {
    state.visiblePages = nodePagesOf(state.activeTopic);
    state.currentIndex = state.visiblePages.findIndex((item) => item.file === page.file);
  }
  updatePageHeading(page);
  if (persist) {
    storageSet('parabula:lastFile', page.file);
    storageSet('parabula:lastTopic', state.activeTopic);
  }
  updateButtons();
}

function showSinglePage(page, options = {}) {
  if (!page) return;
  syncCurrentPage(page);
  state.zoomFactor = 1;
  updateZoomUi();
  setError('');
  setLoading(true);
  const url = pageUrl(page);
  const separator = url.includes('?') ? '&' : '?';
  els.mobilePageFrame.src = `${url}${separator}mobile=1&reader=1&v=${VERSION}`;
  if (options.collapse !== false) setTopicsPanelOpen(false);
  scheduleFit();
}

function showPage(file, options = {}) {
  const page = findPage(file);
  if (!page) return;
  if (state.visiblePages.findIndex((item) => item.file === file) < 0) {
    state.activeTopic = page.curriculumId;
    state.visiblePages = nodePagesOf(page.curriculumId);
    renderPages({ autoShow: false });
  }
  if (state.readMode === 'scroll') {
    syncCurrentPage(page);
    if (!state.scrollStack || !state.scrollPages.some((item) => item.file === file)) buildScrollStack(file);
    else scrollToSheet(file, options.behavior || 'smooth');
    if (options.collapse !== false) setTopicsPanelOpen(false);
    return;
  }
  showSinglePage(page, options);
}

function selectNode(nodeId) {
  state.activeTopic = nodeId;
  els.globalSearch.value = '';
  // renderPages({autoShow}) מגיע ל-showPage, ובמצב גלילה הוא כבר בונה את הערימה
  // ומעגן אותה בדף הנכון. בנייה נוספת כאן הרסה אותה ועיגנה מחדש בדף הראשון.
  renderPages({ autoShow: true, collapse: false });
  setTopicsPanelOpen(true);
}

function toggleNode(nodeId, open) {
  if (open) state.openNodes.add(nodeId); else state.openNodes.delete(nodeId);
  storageSet('parabula:openNodes', JSON.stringify([...state.openNodes]));
}

/**
 * עץ תכנית הלימודים. הצמתים מרונדרים עצלנית: ילדים נבנים רק כשהצומת נפתח,
 * כדי שלא ייווצרו מאות אלמנטים בבת אחת במכשיר נייד (§5.6).
 */
function buildTreeNode(node, depth) {
  const wrap = document.createElement('div');
  wrap.className = 'topic-node';
  wrap.dataset.nodeId = node.id;
  wrap.dataset.depth = String(depth);
  wrap.style.setProperty('--depth', String(depth));
  if (!node.pageCount) wrap.classList.add('is-empty');

  const pages = nodePagesOf(node.id);
  const children = node.children || [];
  const isLeaf = children.length === 0;

  const head = document.createElement('button');
  head.type = 'button';
  // צומת עלה הוא "נושא" לכל דבר: נושא את .topic-btn ואת data-topic כמזהה הצומת
  head.className = isLeaf ? 'topic-btn topic-node-head' : 'topic-node-head';
  if (isLeaf) head.dataset.topic = node.id;
  head.dataset.nodeId = node.id;
  head.setAttribute('aria-label', `${nodePathOf(node.id)}, ${node.pageCount} דפים`);
  head.innerHTML =
    `<span class="tn-name">${esc(node.name)}</span><span class="tn-count">${node.pageCount}</span>`;

  if (isLeaf) {
    head.setAttribute('aria-pressed', 'false');
    head.disabled = pages.length === 0;
    head.addEventListener('click', () => selectNode(node.id));
  } else {
    head.setAttribute('aria-expanded', 'false');
    head.addEventListener('click', () => {
      const open = !wrap.classList.contains('is-open');
      wrap.classList.toggle('is-open', open);
      head.setAttribute('aria-expanded', String(open));
      toggleNode(node.id, open);
      if (open && !wrap.dataset.hydrated) hydrateChildren(wrap, node, depth);
    });
  }
  wrap.appendChild(head);

  if (!isLeaf) {
    const box = document.createElement('div');
    box.className = 'topic-node-children';
    wrap.appendChild(box);
    if (state.openNodes.has(node.id)) {
      wrap.classList.add('is-open');
      head.setAttribute('aria-expanded', 'true');
      hydrateChildren(wrap, node, depth);
    }
  }
  return wrap;
}

function hydrateChildren(wrap, node, depth) {
  const box = wrap.querySelector(':scope > .topic-node-children');
  if (!box || wrap.dataset.hydrated) return;
  for (const child of node.children || []) box.appendChild(buildTreeNode(child, depth + 1));
  wrap.dataset.hydrated = '1';
}

function renderTopics() {
  els.topicStrip.innerHTML = '';
  if (!state.curriculum.length) {
    els.topicStrip.innerHTML = '<div class="empty-box">עץ תכנית הלימודים חסר ב-meta/topics.json</div>';
    return;
  }
  for (const node of state.curriculum) els.topicStrip.appendChild(buildTreeNode(node, 0));
  revealActiveNode();
  updateButtons();
}

/** פותח את שרשרת האבות של הנושא הפעיל, כך שהוא נראה בעץ. */
function revealActiveNode() {
  const activeId = state.activeTopic;
  if (!activeId) return;
  const parts = String(activeId).split('.');
  for (let i = 1; i < parts.length; i += 1) {
    const id = parts.slice(0, i).join('.');
    const wrap = els.topicStrip.querySelector(`.topic-node[data-node-id="${cssEscape(id)}"]`);
    if (!wrap) continue;
    wrap.classList.add('is-open');
    wrap.querySelector(':scope > .topic-node-head')?.setAttribute('aria-expanded', 'true');
    state.openNodes.add(id);
    const node = state.nodeById.get(id);
    if (node) hydrateChildren(wrap, node, id.split('.').length - 1);
  }
  // הצומת נחשף אך עלול לשבת מתחת לקו הקיפול של הרצועה הנגללת — בלי גלילה
  // אליו המשתמש עדיין אינו רואה היכן הוא נמצא.
  const leaf = els.topicStrip.querySelector(`.topic-btn[data-topic="${cssEscape(activeId)}"]`);
  leaf?.scrollIntoView({ block: 'nearest' });
}

function matchesQuery(page, query) {
  // החיפוש מכסה גם את מסלול תכנית הלימודים — כיתה, תחום ותת־נושא
  const paths = pagePlacementIds(page).map(nodePathOf).join(' ');
  return norm(
    `${page.topic} ${paths} ${page.title} ${page.h1} ${page.file} עמוד ${page.number}`,
  ).includes(query);
}

function renderPages(options = {}) {
  const query = norm(els.globalSearch.value);
  const previousFile = activePage()?.file || '';
  if (query) {
    state.visiblePages = state.flatPages.filter((page) => matchesQuery(page, query));
    const topicsFound = new Set(state.visiblePages.map((page) => page.curriculumId)).size;
    els.searchMeta.hidden = false;
    els.searchMeta.textContent = state.visiblePages.length
      ? `נמצאו ${state.visiblePages.length} דפים ב-${topicsFound} נושאים בכל הספר`
      : 'לא נמצאו דפים תואמים בכל הספר';
  } else {
    if (!state.pagesByNode.has(state.activeTopic)) state.activeTopic = firstPopulatedNodeId();
    state.visiblePages = nodePagesOf(state.activeTopic);
    els.searchMeta.hidden = true;
    els.searchMeta.textContent = '';
  }

  state.currentIndex = previousFile ? state.visiblePages.findIndex((page) => page.file === previousFile) : -1;
  els.topicPages.innerHTML = '';
  if (!state.visiblePages.length) {
    els.topicPages.innerHTML = '<div class="empty-box">לא נמצאו דפים תואמים. נסה חיפוש אחר.</div>';
    updateButtons();
    return;
  }

  state.visiblePages.forEach((page) => {
    const card = document.createElement('div');
    card.className = 'page-card';
    card.dataset.file = page.file;
    card.setAttribute('role', 'group');
    const cardNodeId = activeNodeOf(page);
    card.setAttribute('aria-label', `${page.title || page.h1 || page.file}, נושא ${nodeNameOf(cardNodeId)}, עמוד ${page.number}`);

    const selectButton = document.createElement('button');
    selectButton.type = 'button';
    selectButton.className = 'tp-check';
    const selected = window.ParabulaActions?.isSelected(page.file) || false;
    selectButton.classList.toggle('on', selected);
    selectButton.setAttribute('aria-pressed', String(selected));
    selectButton.setAttribute('aria-label', selected ? 'הסר את הדף מהבחירה' : 'בחר את הדף');
    selectButton.textContent = selected ? '✓' : '';
    selectButton.addEventListener('click', () => window.ParabulaActions?.toggleSelect(page.file));

    const openButton = document.createElement('button');
    openButton.type = 'button';
    openButton.className = 'page-open';
    openButton.innerHTML = `<span class="pc-copy"><strong>${esc(page.title || page.h1 || page.file)}</strong><span>${esc(nodePathOf(cardNodeId))}</span><span>עמוד ${page.number}</span></span>`;
    openButton.addEventListener('click', () => showPage(page.file));

    card.append(selectButton, openButton);
    els.topicPages.appendChild(card);
  });

  if (options.autoShow) {
    const remembered = storageGet('parabula:lastFile');
    const target = remembered && state.visiblePages.some((page) => page.file === remembered)
      ? remembered
      : state.visiblePages[0].file;
    showPage(target, { collapse: options.collapse !== false, behavior: 'auto' });
    return;
  }
  updateButtons();
}

function scrollScale() {
  const width = Math.max(0, (els.frameWrap?.clientWidth || window.innerWidth) - 8);
  return Math.max(0.1, Math.min(width / A4_WIDTH, 1));
}

function createScrollIframe(sheet, page, scale) {
  if (sheet.querySelector('iframe')) return;
  const iframe = document.createElement('iframe');
  iframe.title = page.title || page.file;
  iframe.loading = 'lazy';
  iframe.style.width = `${A4_WIDTH}px`;
  iframe.style.height = `${A4_HEIGHT}px`;
  iframe.style.transformOrigin = 'top left';
  iframe.style.transform = `scale(${scale})`;
  iframe.src = `${pageUrl(page)}?reader=1&v=${VERSION}`;
  iframe.addEventListener('load', () => injectScrollSheetStyles(iframe));
  sheet.appendChild(iframe);
}

function hydrateScrollWindow(centerIndex) {
  if (!state.scrollStack) return;
  const scale = scrollScale();
  [...state.scrollStack.querySelectorAll('.m-sheet')].forEach((sheet, index) => {
    const shouldLoad = Math.abs(index - centerIndex) <= SCROLL_WINDOW;
    if (shouldLoad) createScrollIframe(sheet, state.scrollPages[index], scale);
    else sheet.querySelector('iframe')?.remove();
  });
}

function injectScrollSheetStyles(iframe) {
  try {
    const doc = iframe.contentDocument;
    if (!doc || doc.getElementById('reader-inject')) return;
    const style = doc.createElement('style');
    style.id = 'reader-inject';
    style.textContent = `.preview-nav{display:none !important;}html,body{margin:0 !important;padding:0 !important;background:#fff !important;width:${A4_WIDTH}px !important;min-width:${A4_WIDTH}px !important;overflow:hidden !important;display:block !important;}body{position:relative !important;}.a4-page{width:210mm !important;height:297mm !important;min-width:210mm !important;max-width:none !important;margin:0 !important;box-shadow:none !important;zoom:1 !important;}`;
    (doc.head || doc.documentElement)?.appendChild(style);
  } catch (error) {
    console.error('scroll sheet style injection failed', error);
  }
}

function syncScrollCurrent() {
  state.scrollRaf = 0;
  if (!state.scrollStack) return;
  const stackRect = state.scrollStack.getBoundingClientRect();
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  const sheets = [...state.scrollStack.querySelectorAll('.m-sheet')];
  sheets.forEach((sheet, index) => {
    const rect = sheet.getBoundingClientRect();
    const distance = Math.abs(rect.top - stackRect.top - 6);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  if (bestIndex === state.scrollIndex) return;
  state.scrollIndex = bestIndex;
  const page = state.scrollPages[bestIndex];
  syncCurrentPage(page);
  sheets.forEach((sheet, index) => sheet.classList.toggle('is-current', index === bestIndex));
  hydrateScrollWindow(bestIndex);
}

function onScrollStack() {
  if (state.scrollRaf) return;
  state.scrollRaf = requestAnimationFrame(syncScrollCurrent);
}

function scrollToSheet(file, behavior = 'smooth') {
  if (!state.scrollStack) return;
  const target = state.scrollStack.querySelector(`.m-sheet[data-file="${cssEscape(file)}"]`);
  if (target) {
    target.scrollIntoView({ block: 'start', behavior });
    const index = state.scrollPages.findIndex((page) => page.file === file);
    if (index >= 0) {
      state.scrollIndex = index;
      hydrateScrollWindow(index);
    }
  }
}

function destroyScrollStack() {
  if (state.scrollRaf) cancelAnimationFrame(state.scrollRaf);
  state.scrollRaf = 0;
  state.scrollStack?.remove();
  state.scrollStack = null;
  state.scrollPages = [];
  state.scrollIndex = -1;
}

function buildScrollStack(targetFile = activePage()?.file) {
  destroyScrollStack();
  const page = findPage(targetFile) || activePage();
  const nodeId = pageBelongsToNode(page, state.activeTopic)
    ? state.activeTopic
    : (page?.curriculumId || state.activeTopic || firstPopulatedNodeId());
  const pages = nodePagesOf(nodeId);
  if (!pages.length) return;
  state.activeTopic = nodeId;
  state.visiblePages = pages.slice();
  state.scrollPages = pages;

  const stack = document.createElement('div');
  stack.className = 'm-scroll-stack';
  stack.setAttribute('role', 'region');
  stack.setAttribute('aria-label', `גלילה רציפה בנושא ${nodeNameOf(nodeId)}`);
  const scale = scrollScale();
  pages.forEach((item, index) => {
    const sheet = document.createElement('section');
    sheet.className = 'm-sheet';
    sheet.dataset.file = item.file;
    sheet.dataset.position = `${index + 1}/${pages.length}`;
    sheet.setAttribute('aria-label', `${item.title || item.file}, עמוד ${index + 1} מתוך ${pages.length}`);
    sheet.style.width = `${Math.round(A4_WIDTH * scale)}px`;
    sheet.style.height = `${Math.round(A4_HEIGHT * scale)}px`;
    stack.appendChild(sheet);
  });
  stack.addEventListener('scroll', onScrollStack, { passive: true });
  els.frameWrap.appendChild(stack);
  state.scrollStack = stack;
  const targetIndex = Math.max(0, pages.findIndex((item) => item.file === targetFile));
  state.scrollIndex = targetIndex;
  hydrateScrollWindow(targetIndex);
  requestAnimationFrame(() => {
    scrollToSheet(pages[targetIndex].file, 'auto');
    syncScrollCurrent();
  });
  syncCurrentPage(pages[targetIndex]);
}

function rebuildScrollScale() {
  if (!state.scrollStack) return;
  const scale = scrollScale();
  state.scrollStack.querySelectorAll('.m-sheet').forEach((sheet) => {
    sheet.style.width = `${Math.round(A4_WIDTH * scale)}px`;
    sheet.style.height = `${Math.round(A4_HEIGHT * scale)}px`;
    const iframe = sheet.querySelector('iframe');
    if (iframe) iframe.style.transform = `scale(${scale})`;
  });
}

function setReadMode(mode, { persist = true } = {}) {
  const next = mode === 'scroll' && !bootConfig.fullMode ? 'scroll' : 'single';
  state.readMode = next;
  if (persist) storageSet('parabula:readMode', next);
  els.modeSwitch.querySelectorAll('.sheet-mode').forEach((button) => {
    const active = button.dataset.mode === next;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.body.classList.toggle('reader-scroll', next === 'scroll');
  if (next === 'scroll') {
    clearFitSchedule();
    buildScrollStack(activePage()?.file);
  } else {
    destroyScrollStack();
    if (activePage()) showSinglePage(activePage(), { collapse: false });
    else scheduleFit();
  }
  updateButtons();
}

function onSelectionChange(selection) {
  const count = selection.size;
  els.selectionBar.hidden = count === 0;
  els.selectionCount.textContent = `נבחרו ${count} דפים`;
  document.body.classList.toggle('has-selection', count > 0);
  document.querySelectorAll('.page-card').forEach((card) => {
    const selected = selection.has(card.dataset.file);
    const button = card.querySelector('.tp-check');
    if (!button) return;
    button.classList.toggle('on', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', selected ? 'הסר את הדף מהבחירה' : 'בחר את הדף');
    button.textContent = selected ? '✓' : '';
  });
}

function toggleSelectMode(force) {
  const current = document.body.classList.contains('select-mode');
  const next = typeof force === 'boolean' ? force : !current;
  document.body.classList.toggle('select-mode', next);
  els.selectModeBtn.setAttribute('aria-pressed', String(next));
}

function focusableInSheet() {
  return [...els.actionsSheet.querySelectorAll('button:not(:disabled),[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')]
    .filter((node) => !node.hidden && node.offsetParent !== null);
}

function openActionsSheet() {
  if (!activePage()) return;
  clearTimeout(state.sheetCloseTimer);
  state.sheetReturnFocus = document.activeElement;
  updatePageHeading(activePage());
  els.actionsSheet.hidden = false;
  document.body.classList.add('sheet-open');
  els.appShell.inert = true;
  requestAnimationFrame(() => {
    els.actionsSheet.classList.add('is-open');
    els.sheetPanel.focus({ preventScroll: true });
  });
  if (!state.sheetHistoryPushed) {
    history.pushState({ parabulaSheet: true }, '', window.location.href);
    state.sheetHistoryPushed = true;
  }
}

function hideActionsSheet() {
  els.actionsSheet.classList.remove('is-open');
  document.body.classList.remove('sheet-open');
  els.appShell.inert = false;
  clearTimeout(state.sheetCloseTimer);
  state.sheetCloseTimer = setTimeout(() => {
    els.actionsSheet.hidden = true;
    state.sheetReturnFocus?.focus?.({ preventScroll: true });
  }, 250);
}

function closeActionsSheet({ fromHistory = false } = {}) {
  if (els.actionsSheet.hidden) return;
  if (!fromHistory && state.sheetHistoryPushed) {
    history.back();
    return;
  }
  state.sheetHistoryPushed = false;
  hideActionsSheet();
}

function handleSheetKeydown(event) {
  if (els.actionsSheet.hidden) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeActionsSheet();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = focusableInSheet();
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openCurrentFull() {
  const page = activePage();
  if (!page) return;
  if (bootConfig.fullMode) {
    if (history.length > 1) history.back();
    else window.location.assign('./mobile-app.html');
    return;
  }
  const target = new URL('./mobile-app.html', window.location.href);
  target.searchParams.set('mode', 'full');
  target.searchParams.set('file', page.file);
  window.open(target.href, '_blank', 'noopener,noreferrer');
}

function syncInstallButton() {
  els.installAppBtn.hidden = isStandalone() || !state.deferredInstallPrompt;
}

async function installCanonicalApp() {
  if (!state.deferredInstallPrompt || isStandalone()) return syncInstallButton();
  const prompt = state.deferredInstallPrompt;
  state.deferredInstallPrompt = null;
  syncInstallButton();
  await prompt.prompt();
  await prompt.userChoice;
}

function syncNetworkStatus() {
  const offline = navigator.onLine === false;
  els.networkStatus.hidden = !offline;
  document.body.classList.toggle('is-offline', offline);
  scheduleFit();
}

function showUpdate(worker) {
  state.updateWorker = worker;
  els.updateBar.hidden = false;
  scheduleFit();
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || window.__parabulaSwRegistered) return;
  window.__parabulaSwRegistered = true;
  try {
    const registration = await navigator.serviceWorker.register(`./sw.js?v=${VERSION}`, { updateViaCache: 'none' });
    if (registration.waiting && navigator.serviceWorker.controller) showUpdate(registration.waiting);
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(worker);
      });
    });
    registration.update?.();
  } catch (error) {
    console.error('service worker registration failed', error);
  }
}

async function boot() {
  const response = await fetch(`${TOPICS_URL}?v=${VERSION}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`topics fetch failed: ${response.status}`);
  state.db = await response.json();
  state.flatPages = (state.db.topics || []).flatMap((topic) => topic.pages || []);

  // עץ תכנית הלימודים — מקור החלוקה, כולל צמתים שאין להם עדיין דפי עבודה
  state.curriculum = Array.isArray(state.db.curriculum?.nodes) ? state.db.curriculum.nodes : [];
  state.nodeById = new Map();
  (function indexNodes(nodes) {
    for (const node of nodes) {
      state.nodeById.set(node.id, node);
      if (node.children?.length) indexNodes(node.children);
    }
  })(state.curriculum);
  state.pagesByNode = new Map();
  for (const page of state.flatPages) {
    for (const nodeId of pagePlacementIds(page)) {
      if (!state.pagesByNode.has(nodeId)) state.pagesByNode.set(nodeId, []);
      state.pagesByNode.get(nodeId).push(page);
    }
  }
  // סדר הדפים בתוך צומת: לפי הנושא השטוח שממנו הגיעו, ובתוכו לפי המספור המודפס.
  // סדר המערך ב-topics.json אינו סדר ההדפסה (למשל "פונקציה ריבועית": 1,3,4,2).
  {
    const topicOrder = new Map((state.db.topics || []).map((t, i) => [t.name, i]));
    const localOf = (page) => Number((String(page.title).match(/עמוד\s+(\d+)/) || [])[1] || page.number);
    for (const [nodeId, list] of state.pagesByNode) {
      list.sort((a, b) =>
        Number(a.curriculumId !== nodeId) - Number(b.curriculumId !== nodeId) ||
        (topicOrder.get(a.topic) ?? 0) - (topicOrder.get(b.topic) ?? 0) || localOf(a) - localOf(b));
    }
  }
  // רשת ביטחון: דף שאין לו שיוך מוכר לא נעלם — הוא מקובץ לצומת גלוי בסוף העץ
  const orphans = state.flatPages.filter((page) => !state.nodeById.has(page.curriculumId));
  if (orphans.length) {
    console.warn(`[mobile] ${orphans.length} דפים ללא שיוך בתכנית הלימודים`);
    const node = {
      id: UNASSIGNED_ID,
      name: 'ממתינים לשיוך בתכנית הלימודים',
      directCount: orphans.length,
      pageCount: orphans.length,
    };
    state.curriculum = [...state.curriculum, node];
    state.nodeById.set(node.id, node);
    // המפתחות הישנים חייבים להימחק, אחרת מזהה שאינו קיים בעץ עדיין עובר
    // את בדיקות pagesByNode.has(...) ומייצר נושא פעיל שאין לו צומת
    for (const page of orphans) state.pagesByNode.delete(page.curriculumId);
    orphans.forEach((page) => { page.curriculumId = UNASSIGNED_ID; });
    state.pagesByNode.set(UNASSIGNED_ID, orphans);
  }

  try { state.openNodes = new Set(JSON.parse(storageGet('parabula:openNodes', '[]'))); }
  catch { state.openNodes = new Set(); }

  const curriculumMeta = state.db.curriculum;
  els.appMeta.textContent = curriculumMeta
    ? `${curriculumMeta.leafNodes} נושאים · ${curriculumMeta.emptyLeafNodes} ריקים · ${state.db.totalPages || state.flatPages.length} דפים`
    : `${state.db.topics?.length || 0} נושאים · ${state.db.totalPages || state.flatPages.length} דפים`;

  if (window.ParabulaActions) {
    ParabulaActions.onSelectionChange(onSelectionChange);
    ParabulaActions.configure({ pages: state.flatPages.map((page) => ({ ...page })), pageUrl: (file) => pageUrl({ file }) });
  }

  const requested = /^עמוד-\d+\.html$/.test(bootConfig.requestedFile) ? findPage(bootConfig.requestedFile) : null;
  const rememberedTopic = storageGet('parabula:lastTopic');
  state.activeTopic = requested?.curriculumId
    || (state.pagesByNode.has(rememberedTopic) ? rememberedTopic : '')
    || firstPopulatedNodeId();
  renderTopics();
  state.visiblePages = nodePagesOf(state.activeTopic);
  renderPages({ autoShow: false });

  const remembered = storageGet('parabula:lastFile');
  const first = requested || findPage(remembered) || state.visiblePages[0] || state.flatPages[0];
  if (!first) throw new Error('No worksheet pages found');
  if (!pageBelongsToNode(first, state.activeTopic)) {
    state.activeTopic = first.curriculumId;
    renderTopics();
    renderPages({ autoShow: false });
  }
  syncCurrentPage(first, { persist: !requested });
  if (bootConfig.fullMode) {
    els.openLiveBtn.textContent = 'חזרה';
    els.openLiveBtn.setAttribute('aria-label', 'חזרה לאפליקציית הספר');
    setReadMode('single', { persist: false });
  } else {
    setReadMode(state.readMode, { persist: false });
  }
  if (state.readMode === 'single') showSinglePage(first, { collapse: false });
  setTopicsPanelOpen(!bootConfig.fullMode);
  syncNetworkStatus();
}

els.installAppBtn.addEventListener('click', installCanonicalApp);
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  if (isStandalone()) return;
  state.deferredInstallPrompt = event;
  syncInstallButton();
});
window.addEventListener('appinstalled', () => {
  state.deferredInstallPrompt = null;
  syncInstallButton();
});
window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', syncInstallButton);

els.globalSearch.addEventListener('input', () => renderPages());
function navigateBy(delta) {
  if (state.readMode === 'scroll' && state.scrollStack) {
    const target = state.scrollIndex + delta;
    if (target >= 0 && target < state.scrollPages.length) scrollToSheet(state.scrollPages[target].file);
    return;
  }
  const target = state.currentIndex + delta;
  if (target >= 0 && target < state.visiblePages.length) showPage(state.visiblePages[target].file);
}
els.prevPageBtn.addEventListener('click', () => navigateBy(-1));
els.nextPageBtn.addEventListener('click', () => navigateBy(1));
els.openLiveBtn.addEventListener('click', openCurrentFull);
els.zoomInBtn.addEventListener('click', () => setZoom(state.zoomFactor + ZOOM_STEP));
els.zoomOutBtn.addEventListener('click', () => setZoom(state.zoomFactor - ZOOM_STEP));
els.zoomResetBtn.addEventListener('click', () => setZoom(1));
els.toggleTopicsBtn.addEventListener('click', () => {
  setTopicsPanelOpen(els.topicsPanel.classList.contains('is-collapsed'));
  setTimeout(scheduleFit, 40);
});
els.mobilePageFrame.addEventListener('load', () => {
  setLoading(false);
  watchFrameContent();
  scheduleFit();
});
els.mobilePageFrame.addEventListener('error', () => {
  setLoading(false);
  setError('טעינת הדף נכשלה. בדוק את החיבור ונסה שוב.');
});

els.selectModeBtn.addEventListener('click', () => toggleSelectMode());
els.selClear.addEventListener('click', () => ParabulaActions?.clearSelection());
els.selPrint.addEventListener('click', () => ParabulaActions?.printSelection());
els.actionsBtn.addEventListener('click', openActionsSheet);
els.sheetCloseBtn.addEventListener('click', () => closeActionsSheet());
els.actionsSheet.querySelector('[data-close]')?.addEventListener('click', () => closeActionsSheet());
els.actionsSheet.addEventListener('keydown', handleSheetKeydown);
els.modeSwitch.querySelectorAll('.sheet-mode').forEach((button) => {
  button.addEventListener('click', () => {
    setReadMode(button.dataset.mode);
    closeActionsSheet();
  });
});
els.aPrint.addEventListener('click', () => {
  const page = activePage();
  closeActionsSheet();
  if (page) ParabulaActions?.printPage(page.file, { busyText: 'מכין את הדף להדפסה…' });
});
els.aPdf.addEventListener('click', () => {
  const page = activePage();
  closeActionsSheet();
  if (page) ParabulaActions?.printPage(page.file, { busyText: 'מכין את הדף ל-PDF…' });
});
els.aHtml.addEventListener('click', () => {
  const page = activePage();
  closeActionsSheet();
  if (page) ParabulaActions?.downloadHtml(page.file);
});
els.aOpen.addEventListener('click', () => {
  const page = activePage();
  closeActionsSheet();
  if (page) ParabulaActions?.openTab(page.file);
});
els.aPrintTopic.addEventListener('click', () => {
  const page = activePage();
  closeActionsSheet();
  if (!page) return;
  const nodeId = activeNodeOf(page);
  const files = nodePagesOf(nodeId).map((item) => item.file);
  ParabulaActions?.printFiles(files, {
    busyText: `מכין ${files.length} דפים בנושא "${nodeNameOf(nodeId)}"…`,
  });
});
els.aSelectTopic.addEventListener('click', () => {
  const page = activePage();
  toggleSelectMode(true);
  if (page) ParabulaActions?.selectFiles(nodePagesOf(activeNodeOf(page)).map((item) => item.file));
  closeActionsSheet();
});

window.addEventListener('popstate', () => {
  if (!els.actionsSheet.hidden) closeActionsSheet({ fromHistory: true });
});
window.addEventListener('resize', () => {
  scheduleFit();
  if (state.readMode === 'scroll') rebuildScrollScale();
});
window.addEventListener('orientationchange', () => setTimeout(() => {
  scheduleFit();
  rebuildScrollScale();
}, 140));
window.addEventListener('pageshow', scheduleFit);
window.visualViewport?.addEventListener('resize', scheduleFit);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') scheduleFit();
});
window.addEventListener('online', syncNetworkStatus);
window.addEventListener('offline', syncNetworkStatus);

els.applyUpdateBtn.addEventListener('click', () => {
  state.updateWorker?.postMessage({ type: 'SKIP_WAITING' });
});
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (state.reloadingForUpdate) return;
  state.reloadingForUpdate = true;
  window.location.reload();
});

syncInstallButton();
boot().then(() => registerServiceWorker()).catch((error) => {
  console.error(error);
  els.appMeta.textContent = 'שגיאה בטעינה';
  els.topicPages.innerHTML = '<div class="empty-box">אירעה שגיאה בטעינת הספר. נסה לרענן.</div>';
  setError('האפליקציה לא הצליחה לטעון את נתוני הספר.');
});
