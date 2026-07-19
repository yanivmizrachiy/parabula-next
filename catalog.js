/**
 * catalog.js — Parabula Next · קורא ספר דיגיטלי (נייח)
 *
 * מקור נתונים: meta/topics.json (קריאה בלבד). ללא תוכן דמה.
 * חוויית קריאה כמו ספר אמיתי: דף A4 גדול במרכז, תוכן עניינים בצד,
 * שלושה מצבי דפדוף (עמוד בודד / כפולה / גלילה), וכפתורי פעולה בעברית
 * להדפסה / שמירה כ-PDF / הורדה של עמוד בודד, פרק שלם או אוסף נבחר.
 * פעולות ההדפסה/PDF/בחירה מרוכזות ב-reader-actions.js (משותף עם הנייד).
 */
'use strict';

const A4_W = 794;   // 210mm @96dpi
const A4_H = 1123;  // 297mm @96dpi
const LS_POS = 'parabula-catalog:last-file';
const LS_MODE = 'parabula-catalog:mode';
const LS_OPEN = 'parabula-catalog:open-nodes';
const UNASSIGNED_ID = 'unassigned';

const state = {
  topics: [],
  pages: [],        // מערך שטוח בסדר הקריאה של topics.json
  curriculum: [],   // עץ תכנית הלימודים מתוך topics.json
  nodeById: new Map(),    // מזהה צומת → הצומת עצמו
  pagesByNode: new Map(), // מזהה צומת → דפים המשויכים לו ישירות
  index: -1,        // אינדקס הדף הנוכחי במערך השטוח
  mode: 'single',   // single | spread | scroll
  query: '',
};

const $ = (id) => document.getElementById(id);
const dom = {};
['tocToggle','tocOverlay','globalSearch','clearSearch','searchResults','statChip','modeSwitch',
 'toc','tocList','selectModeBtn','stateLoading','stateError','errorMsg','retryBtn','readerStage',
 'readerTitle','readerMeta','btnPrint','btnPdf','btnHtml','btnOpen','btnPrintTopic',
 'viewport','sheets','navPrev','navNext','footPrev','footProgress','footNext',
 'selectionBar','selectionCount','selPrint','selPdf','selClear',
 'board','boardBtn','boardClose','boardBody','boardSummary','boardToggleEmpty']
  .forEach((k) => dom[k] = $(k));

/* ═══ נתונים ═══ */
async function boot() {
  showState('loading');
  try {
    const url = new URL('meta/topics.json', window.location.href).href + '?v=' + Date.now();
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.topics)) throw new Error('topics.json לא תקין');

    state.topics = data.topics;
    state.pages = [];
    for (const topic of data.topics) {
      (topic.pages || []).forEach((p, i) => {
        state.pages.push({ ...p, topic: topic.name, topicIndex: i + 1, topicTotal: topic.pages.length });
      });
    }

    state.curriculum = Array.isArray(data.curriculum?.nodes) ? data.curriculum.nodes : [];
    state.nodeById = new Map();
    (function indexNodes(nodes) {
      for (const node of nodes) {
        state.nodeById.set(node.id, node);
        if (node.children?.length) indexNodes(node.children);
      }
    })(state.curriculum);
    state.pagesByNode = new Map();
    for (const page of state.pages) {
      if (!page.curriculumId) continue;
      if (!state.pagesByNode.has(page.curriculumId)) state.pagesByNode.set(page.curriculumId, []);
      state.pagesByNode.get(page.curriculumId).push(page);
    }
    // רשת ביטחון: דף שאין לו שיוך מוכר לא נעלם — הוא מקובץ לצומת גלוי בסוף העץ
    const orphans = state.pages.filter((page) => !state.nodeById.has(page.curriculumId));
    if (orphans.length) {
      console.warn(`[catalog] ${orphans.length} דפים ללא שיוך בתכנית הלימודים`);
      const node = {
        id: UNASSIGNED_ID,
        name: 'ממתינים לשיוך בתכנית הלימודים',
        directCount: orphans.length,
        pageCount: orphans.length,
        pages: orphans.map((page) => page.number),
      };
      state.curriculum = [...state.curriculum, node];
      state.nodeById.set(node.id, node);
      orphans.forEach((page) => { page.curriculumId = UNASSIGNED_ID; });
      state.pagesByNode.set(UNASSIGNED_ID, orphans);
    }

    // מיקום הדף בתוך הנושא שלו בתכנית הלימודים (ולא בתוך הקבוצה השטוחה)
    for (const list of state.pagesByNode.values()) {
      list.forEach((page, i) => { page.nodeIndex = i + 1; page.nodeTotal = list.length; });
    }

    const totalPages = data.totalPages || state.pages.length;
    dom.statChip.textContent = state.curriculum.length
      ? `${totalPages} דפים · ${data.curriculum.leafNodes} נושאים · ${data.curriculum.emptyLeafNodes} ריקים`
      : `${totalPages} דפים · ${state.topics.length} נושאים`;

    ParabulaActions.configure({
      pages: state.pages,
      pageUrl: (file) => new URL(file, window.location.href).href,
    });
    ParabulaActions.onSelectionChange(onSelectionChange);

    state.mode = localStorage.getItem(LS_MODE) || 'single';
    applyModeClass();
    dom.modeSwitch.querySelectorAll('.mode-btn').forEach((b) =>
      b.classList.toggle('is-active', b.dataset.mode === state.mode));

    renderTOC();
    showState('reader');

    const savedFile = localStorage.getItem(LS_POS);
    const startIdx = savedFile ? state.pages.findIndex((p) => p.file === savedFile) : -1;
    goTo(startIdx >= 0 ? startIdx : 0, { scrollToc: true });
    // רינדור חוזר אחרי שהפריסה התייצבה (מדידת viewport מדויקת)
    requestAnimationFrame(render);
    setTimeout(render, 120);
  } catch (err) {
    console.error('[catalog] boot error:', err);
    dom.errorMsg.textContent = `שגיאת טעינה: ${err.message || err}`;
    showState('error');
  }
}

/* ═══ תוכן עניינים — עץ תכנית הלימודים ═══ */
const CARET = '<svg class="tt-caret" viewBox="0 0 16 16" fill="none" aria-hidden="true"><polyline points="6,4 10,8 6,12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function loadOpenNodes() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_OPEN) || '[]')); }
  catch { return new Set(); }
}

function saveOpenNodes() {
  const ids = [...dom.tocList.querySelectorAll('.toc-node.is-open')].map((el) => el.dataset.nodeId);
  try { localStorage.setItem(LS_OPEN, JSON.stringify(ids)); } catch { /* אחסון חסום — לא מפיל את הקורא */ }
}

function setNodeOpen(wrap, open, { persist = true } = {}) {
  wrap.classList.toggle('is-open', open);
  wrap.querySelector(':scope > .toc-node-head')?.setAttribute('aria-expanded', String(open));
  if (persist) saveOpenNodes();
}

/** שם הצומת לפי מזהה, עם נפילה חיננית כשהמזהה אינו מוכר. */
function nodeNameOf(id) {
  return state.nodeById?.get(id)?.name || id || '';
}

/** מסלול קריא מהכיתה ועד לתת־הנושא, נגזר ממבנה המזהה. */
function nodePathOf(id) {
  if (!id) return '';
  const parts = id.split('.');
  const names = [];
  for (let i = 1; i <= parts.length; i += 1) {
    const node = state.nodeById?.get(parts.slice(0, i).join('.'));
    if (node) names.push(node.name);
  }
  return names.join(' · ');
}

/** כל קובצי הדפים שמתחת לצומת, כולל צאצאיו, בסדר הקריאה. */
function nodeFiles(node) {
  const files = (state.pagesByNode.get(node.id) || []).map((page) => page.file);
  for (const child of node.children || []) files.push(...nodeFiles(child));
  return files;
}

function buildPageItem(page, ordinal) {
  const globalIdx = state.pages.findIndex((x) => x.file === page.file);
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'toc-page';
  item.dataset.file = page.file;
  const check = document.createElement('input');
  check.type = 'checkbox'; check.className = 'tp-check';
  check.checked = ParabulaActions.isSelected(page.file);
  check.setAttribute('aria-label', `בחירת ${page.h1 || page.title || page.file}`);
  check.addEventListener('click', (e) => e.stopPropagation());
  check.addEventListener('change', () => ParabulaActions.setSelected(page.file, check.checked));
  const num = document.createElement('span');
  num.className = 'tp-num'; num.textContent = ordinal;
  const title = document.createElement('span');
  title.className = 'tp-title';
  title.textContent = (page.h1 || page.title || page.file);
  item.append(check, num, title);
  item.addEventListener('click', () => goTo(globalIdx));
  return item;
}

function buildNode(node, depth, openIds) {
  const wrap = document.createElement('div');
  wrap.className = 'toc-node';
  wrap.dataset.nodeId = node.id;
  wrap.dataset.depth = String(depth);
  wrap.style.setProperty('--depth', String(depth));

  const pages = state.pagesByNode.get(node.id) || [];
  const children = node.children || [];
  const expandable = children.length > 0 || pages.length > 0;
  if (!node.pageCount) wrap.classList.add('is-empty');
  if (node.extension) wrap.classList.add('is-extension');

  const head = document.createElement('button');
  head.type = 'button';
  head.className = 'toc-node-head';
  head.setAttribute('aria-expanded', 'false');
  head.setAttribute('aria-label', `${node.name} — ${node.pageCount} דפי עבודה`);
  head.innerHTML =
    (expandable ? CARET : '<span class="tt-caret-gap" aria-hidden="true"></span>') +
    `<span class="tt-name">${esc(node.name)}</span>` +
    `<span class="tt-count">${node.pageCount}</span>`;
  head.addEventListener('click', () => {
    if (!expandable) return;
    const open = !wrap.classList.contains('is-open');
    setNodeOpen(wrap, open);
    // צומת עלה עם דפים → מעבר לדף הראשון שבו
    if (open && pages.length) {
      const first = state.pages.findIndex((p) => p.file === pages[0].file);
      if (first >= 0) goTo(first);
    }
  });
  wrap.appendChild(head);

  if (node.pageCount > 0) {
    const actions = document.createElement('div');
    actions.className = 'toc-node-actions';
    const files = nodeFiles(node);
    const printBtn = document.createElement('button');
    printBtn.type = 'button'; printBtn.className = 'toc-mini-btn';
    printBtn.textContent = `🖨 הדפס ${node.pageCount} דפים`;
    printBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ParabulaActions.printFiles(files, { busyText: `מכין ${files.length} דפים בנושא "${node.name}"…` });
    });
    const selBtn = document.createElement('button');
    selBtn.type = 'button'; selBtn.className = 'toc-mini-btn';
    selBtn.textContent = '☑ בחר הכול';
    selBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      enterSelectMode();
      ParabulaActions.selectFiles(files);
    });
    actions.append(printBtn, selBtn);
    wrap.appendChild(actions);
  }

  if (pages.length) {
    const pagesBox = document.createElement('div');
    pagesBox.className = 'toc-pages';
    pages.forEach((page, i) => pagesBox.appendChild(buildPageItem(page, i + 1)));
    wrap.appendChild(pagesBox);
  }

  if (children.length) {
    const childBox = document.createElement('div');
    childBox.className = 'toc-node-children';
    children.forEach((child) => childBox.appendChild(buildNode(child, depth + 1, openIds)));
    wrap.appendChild(childBox);
  }

  if (openIds.has(node.id)) setNodeOpen(wrap, true, { persist: false });
  return wrap;
}

function renderTOC() {
  dom.tocList.innerHTML = '';
  if (!state.curriculum.length) {
    dom.tocList.textContent = 'עץ תכנית הלימודים חסר ב-meta/topics.json';
    return;
  }
  const openIds = loadOpenNodes();
  state.curriculum.forEach((node) => dom.tocList.appendChild(buildNode(node, 0, openIds)));
}

function syncTOCActive() {
  const page = state.pages[state.index];
  if (!page) return;
  dom.tocList.querySelectorAll('.toc-page').forEach((el) =>
    el.classList.toggle('is-active', el.dataset.file === page.file));

  // מזהי הצמתים נגזרים זה מזה בנקודות, ולכן שרשרת האבות נקבעת מהמחרוזת עצמה
  const activeId = page.curriculumId || '';
  dom.tocList.querySelectorAll('.toc-node').forEach((el) => {
    const id = el.dataset.nodeId;
    const isActive = activeId === id;
    const onPath = isActive || activeId.startsWith(`${id}.`);
    el.classList.toggle('is-active', isActive);
    if (onPath && !el.classList.contains('is-open')) setNodeOpen(el, true, { persist: false });
  });
}

function scrollTOCToActive() {
  const el = dom.tocList.querySelector('.toc-page.is-active');
  if (el) el.scrollIntoView({ block: 'nearest' });
}

/* ═══ לוח מונים ═══ */
const boardState = { showEmpty: true, returnFocus: null };

function renderBoard() {
  dom.boardBody.innerHTML = '';
  if (!state.curriculum.length) {
    dom.boardBody.textContent = 'עץ תכנית הלימודים חסר ב-meta/topics.json';
    return;
  }

  const rows = [];
  const collect = (nodes, depth) => {
    for (const node of nodes) {
      if (!boardState.showEmpty && node.pageCount === 0) continue;
      rows.push({ node, depth });
      if (node.children?.length) collect(node.children, depth + 1);
    }
  };
  collect(state.curriculum, 0);

  const table = document.createElement('table');
  table.className = 'board-table';
  table.innerHTML =
    '<thead><tr><th scope="col">נושא</th><th scope="col">דפים ישירים</th><th scope="col">סה״כ בענף</th></tr></thead>';
  const body = document.createElement('tbody');

  for (const { node, depth } of rows) {
    const tr = document.createElement('tr');
    tr.dataset.depth = String(depth);
    tr.style.setProperty('--depth', String(depth));
    if (node.pageCount === 0) tr.classList.add('is-empty');
    if (node.extension) tr.classList.add('is-extension');

    const name = document.createElement('th');
    name.scope = 'row';
    name.className = 'board-name';
    name.textContent = node.name;
    if (node.extension) name.title = 'נושא מחוץ לרשימת תכנית הלימודים — נשמר כדי שלא ייפול דף עבודה קיים';

    const direct = document.createElement('td');
    direct.className = 'board-num';
    direct.textContent = node.directCount || '—';

    const total = document.createElement('td');
    total.className = 'board-num board-total';
    total.textContent = node.pageCount;
    if (node.pageCount === 0) total.classList.add('is-zero');

    tr.append(name, direct, total);
    body.appendChild(tr);
  }

  table.appendChild(body);
  dom.boardBody.appendChild(table);

  const totalPages = state.pages.length;
  const leaves = [];
  const countLeaves = (nodes) => {
    for (const node of nodes) {
      if (node.children?.length) countLeaves(node.children);
      else leaves.push(node);
    }
  };
  countLeaves(state.curriculum);
  const empty = leaves.filter((node) => node.pageCount === 0).length;
  dom.boardSummary.textContent =
    `${totalPages} דפי עבודה · ${leaves.length} תת־נושאים · ${leaves.length - empty} עם דפים · ${empty} ממתינים לדפים`;
}

function openBoard() {
  boardState.returnFocus = document.activeElement;
  renderBoard();
  dom.board.hidden = false;
  document.body.classList.add('board-open');
  requestAnimationFrame(() => dom.board.querySelector('.board-panel')?.focus({ preventScroll: true }));
}

function closeBoard() {
  if (dom.board.hidden) return;
  dom.board.hidden = true;
  document.body.classList.remove('board-open');
  boardState.returnFocus?.focus?.({ preventScroll: true });
}

/* ═══ מנוע הקריאה ═══ */
function applyModeClass() {
  document.body.classList.remove('mode-single', 'mode-spread', 'mode-scroll');
  document.body.classList.add(`mode-${state.mode}`);
}

function setMode(mode) {
  if (mode === state.mode) return;
  state.mode = mode;
  localStorage.setItem(LS_MODE, mode);
  applyModeClass();
  dom.modeSwitch.querySelectorAll('.mode-btn').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.mode === mode));
  render();
}

function goTo(index, opts = {}) {
  if (index < 0 || index >= state.pages.length) return;
  state.index = index;
  const page = state.pages[index];
  localStorage.setItem(LS_POS, page.file);
  render();
  syncTOCActive();
  if (opts.scrollToc) scrollTOCToActive();
}

function makeSheet(page, lazy) {
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.dataset.file = page.file;
  const iframe = document.createElement('iframe');
  iframe.title = page.title || page.file;
  iframe.setAttribute('loading', 'eager');
  const src = new URL(page.file, window.location.href).href + '?reader=1';
  if (lazy) iframe.dataset.src = src; else iframe.src = src;
  iframe.addEventListener('load', () => injectReaderStyles(iframe));
  sheet.appendChild(iframe);
  return sheet;
}

function injectReaderStyles(iframe) {
  try {
    const doc = iframe.contentDocument;
    if (!doc || doc.getElementById('reader-inject')) return;
    const s = doc.createElement('style');
    s.id = 'reader-inject';
    s.textContent = `
      .preview-nav{display:none !important;}
      html,body{margin:0 !important;padding:0 !important;background:#fff !important;
        width:${A4_W}px !important;min-width:0 !important;overflow:hidden !important;display:block !important;}
      .a4-page{margin:0 auto !important;box-shadow:none !important;}
    `;
    (doc.head || doc.documentElement).appendChild(s);
  } catch (e) { /* same-origin expected; ignore */ }
}

function computeScale(perRow) {
  const vpW = dom.viewport.clientWidth;
  const vpH = dom.viewport.clientHeight;
  const padding = 40;
  if (state.mode === 'scroll') {
    const availW = vpW - padding;
    return Math.min(availW / A4_W, 1.1);
  }
  const navSpace = 120;
  const gap = perRow > 1 ? 22 : 0;
  const availW = vpW - padding - navSpace - gap;
  const availH = vpH - padding;
  return Math.max(0.1, Math.min((availW / perRow) / A4_W, availH / A4_H));
}

function sizeSheet(sheet, scale) {
  sheet.style.width = Math.round(A4_W * scale) + 'px';
  sheet.style.height = Math.round(A4_H * scale) + 'px';
  const iframe = sheet.querySelector('iframe');
  iframe.style.width = A4_W + 'px';
  iframe.style.height = A4_H + 'px';
  iframe.style.transformOrigin = 'top left';
  iframe.style.transform = `scale(${scale})`;
}

function render() {
  const page = state.pages[state.index];
  if (!page) return;

  dom.sheets.innerHTML = '';

  if (state.mode === 'single') {
    const scale = computeScale(1);
    const sheet = makeSheet(page, false);
    dom.sheets.appendChild(sheet);
    sizeSheet(sheet, scale);
    dom.readerTitle.textContent = page.title || page.h1 || page.file;
    dom.readerMeta.textContent = `${nodePathOf(page.curriculumId)} · עמוד ${page.nodeIndex} מתוך ${page.nodeTotal}`;
    dom.footProgress.textContent = `עמוד ${state.index + 1} מתוך ${state.pages.length} בספר`;

  } else if (state.mode === 'spread') {
    // התאמה לזוגות בתוך הנושא: מיישרים לתחילת זוג
    const scale = computeScale(2);
    const second = state.pages[state.index + 1];
    const pair = [page];
    if (second && second.curriculumId === page.curriculumId) pair.push(second);
    pair.forEach((p) => { const sh = makeSheet(p, false); dom.sheets.appendChild(sh); sizeSheet(sh, scale); });
    dom.readerTitle.textContent = page.title || page.h1 || page.file;
    dom.readerMeta.textContent = pair.length === 2
      ? `${nodePathOf(page.curriculumId)} · עמודים ${page.nodeIndex}–${pair[1].nodeIndex} מתוך ${page.nodeTotal}`
      : `${nodePathOf(page.curriculumId)} · עמוד ${page.nodeIndex} מתוך ${page.nodeTotal}`;
    dom.footProgress.textContent = `עמוד ${state.index + 1} מתוך ${state.pages.length} בספר`;

  } else { // scroll — כל דפי הנושא הנוכחי, בטעינה עצלה
    const scale = computeScale(1);
    const topicPages = state.pagesByNode.get(page.curriculumId) || [page];
    topicPages.forEach((p) => {
      const sheet = makeSheet(p, true);
      dom.sheets.appendChild(sheet);
      sizeSheet(sheet, scale);
      lazyObserver.observe(sheet);
    });
    updateScrollBarInfo(page);
    // גלילה לדף הנוכחי
    requestAnimationFrame(() => {
      const target = dom.sheets.querySelector(`.sheet[data-file="${cssEsc(page.file)}"]`);
      if (target) target.scrollIntoView({ block: 'start' });
    });
  }

  updateNav();
  // חישוב-מחדש של ה-scale אחרי שהפריסה התייצבה — מונע דף זעיר כשה-viewport
  // עוד לא קיבל את מידותיו הסופיות בזמן ה-render (בלי טעינת iframe מחדש).
  requestAnimationFrame(applyScale);
  setTimeout(applyScale, 160);
  setTimeout(applyScale, 450);
}

/** מחשב מחדש את קנה-המידה ומיישם על הגיליונות הקיימים — בלי לבנות מחדש iframes. */
function applyScale() {
  const sheets = [...dom.sheets.querySelectorAll('.sheet')];
  if (!sheets.length) return;
  const perRow = state.mode === 'spread' ? 2 : 1;
  const scale = computeScale(perRow);
  sheets.forEach((sheet) => sizeSheet(sheet, scale));
}

/* ═══ ניווט חכם במצב גלילה ═══ */

/** עדכון שורת המידע וההתקדמות לדף נתון במצב גלילה (בלי רינדור מחדש). */
function updateScrollBarInfo(page) {
  dom.readerTitle.textContent = page.title || page.h1 || page.file;
  dom.readerMeta.textContent = `${nodePathOf(page.curriculumId)} · עמוד ${page.nodeIndex} מתוך ${page.nodeTotal} · גלילה רציפה`;
  dom.footProgress.textContent = `עמוד ${state.index + 1} מתוך ${state.pages.length} בספר`;
}

/**
 * הדף שקרוב ביותר לראש אזור הגלילה הופך לדף הנוכחי (חוזה §5.5):
 * הכותרת, ההתקדמות, תוכן העניינים והמיקום השמור עוקבים אחרי הגלילה.
 */
function trackScrollCurrent() {
  if (state.mode !== 'scroll') return;
  const vpTop = dom.viewport.getBoundingClientRect().top;
  let best = null;
  let bestDist = Infinity;
  dom.sheets.querySelectorAll('.sheet').forEach((sheet) => {
    const r = sheet.getBoundingClientRect();
    if (r.bottom <= vpTop + 4) return; // כבר נגלל מעבר לו
    const dist = Math.abs(r.top - vpTop);
    if (dist < bestDist) { bestDist = dist; best = sheet; }
  });
  if (!best) return;
  const idx = state.pages.findIndex((p) => p.file === best.dataset.file);
  if (idx < 0 || idx === state.index) return;
  state.index = idx;
  localStorage.setItem(LS_POS, state.pages[idx].file);
  updateScrollBarInfo(state.pages[idx]);
  updateNav();
  syncTOCActive();
}

let scrollTrackPending = false;
function onViewportScroll() {
  if (state.mode !== 'scroll' || scrollTrackPending) return;
  scrollTrackPending = true;
  requestAnimationFrame(() => { scrollTrackPending = false; trackScrollCurrent(); });
}

/**
 * מעבר דף במצב גלילה: גלילה חלקה לדף היעד אם הוא בערימה הנוכחית,
 * וקפיצה חכמה לפרק הסמוך (בנייה מחדש של הערימה) כשחוצים גבול פרק.
 */
function scrollNavigate(delta) {
  const target = state.index + delta;
  if (target < 0 || target >= state.pages.length) return;
  const page = state.pages[target];
  const sheet = dom.sheets.querySelector(`.sheet[data-file="${cssEsc(page.file)}"]`);
  if (sheet) {
    state.index = target;
    localStorage.setItem(LS_POS, page.file);
    sheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateScrollBarInfo(page);
    updateNav();
    syncTOCActive();
    scrollTOCToActive();
  } else {
    goTo(target, { scrollToc: true }); // פרק אחר — בונה ערימה חדשה
  }
}

const lazyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const iframe = entry.target.querySelector('iframe');
    if (iframe && iframe.dataset.src && !iframe.src) {
      iframe.src = iframe.dataset.src;
    }
    lazyObserver.unobserve(entry.target);
  });
}, { rootMargin: '600px 0px' });

function updateNav() {
  const atStart = state.index <= 0;
  const atEnd = state.index >= state.pages.length - 1;
  // גם במצב גלילה החצים פעילים — מנווטים דף-דף וחוצים פרקים (חכם).
  dom.navPrev.disabled = atStart;
  dom.navNext.disabled = atEnd;
  dom.footPrev.disabled = atStart;
  dom.footNext.disabled = atEnd;
}

function next() {
  if (state.mode === 'scroll') return scrollNavigate(1);
  const step = state.mode === 'spread' ? 2 : 1;
  goTo(Math.min(state.pages.length - 1, state.index + step), { scrollToc: true });
}
function prev() {
  if (state.mode === 'scroll') return scrollNavigate(-1);
  const step = state.mode === 'spread' ? 2 : 1;
  goTo(Math.max(0, state.index - step), { scrollToc: true });
}

/* ═══ בחירה מרובה ═══ */
function enterSelectMode() {
  document.body.classList.add('select-mode');
  dom.selectModeBtn.setAttribute('aria-pressed', 'true');
}
function toggleSelectMode() {
  const on = !document.body.classList.contains('select-mode');
  document.body.classList.toggle('select-mode', on);
  dom.selectModeBtn.setAttribute('aria-pressed', String(on));
  if (!on) return;
}
function onSelectionChange(sel) {
  const count = sel.size;
  dom.selectionBar.hidden = count === 0;
  dom.selectionCount.textContent = `נבחרו ${count} דפים`;
  dom.tocList.querySelectorAll('.toc-page').forEach((el) => {
    const check = el.querySelector('.tp-check');
    if (check) check.checked = sel.has(el.dataset.file);
  });
}

/* ═══ חיפוש גלובלי ═══ */
function runSearch(q) {
  state.query = q;
  dom.clearSearch.hidden = !q;
  if (!q) { dom.searchResults.hidden = true; dom.searchResults.innerHTML = ''; return; }
  const lower = q.toLowerCase();
  // החיפוש מכסה גם את מסלול תכנית הלימודים, כדי שאפשר יהיה לחפש לפי כיתה, תחום או תת־נושא
  const results = state.pages.filter((p) =>
    `${p.topic} ${nodePathOf(p.curriculumId)} ${p.title} ${p.h1} ${p.file} עמוד ${p.number}`
      .toLowerCase().includes(lower));

  dom.searchResults.innerHTML = '';
  if (!results.length) {
    dom.searchResults.innerHTML = '<div class="search-empty">לא נמצאו דפים תואמים בכל הספר</div>';
  } else {
    const head = document.createElement('div');
    head.className = 'search-empty';
    const topicsFound = new Set(results.map((r) => r.curriculumId)).size;
    head.textContent = `נמצאו ${results.length} דפים ב-${topicsFound} נושאים`;
    dom.searchResults.appendChild(head);
    results.slice(0, 60).forEach((p) => {
      const idx = state.pages.findIndex((x) => x.file === p.file);
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'search-item';
      btn.innerHTML = `<strong>${highlight(p.h1 || p.title || p.file, q)}</strong><span>${esc(nodePathOf(p.curriculumId))} · עמוד ${p.nodeIndex}</span>`;
      btn.addEventListener('click', () => {
        dom.searchResults.hidden = true;
        dom.globalSearch.value = '';
        dom.clearSearch.hidden = true;
        goTo(idx, { scrollToc: true });
      });
      dom.searchResults.appendChild(btn);
    });
  }
  dom.searchResults.hidden = false;
}

/* ═══ עזרי UI ═══ */
function showState(name) {
  dom.stateLoading.hidden = name !== 'loading';
  dom.stateError.hidden = name !== 'error';
  dom.readerStage.hidden = name !== 'reader';
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function cssEsc(s) { return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/["\\]/g,'\\$&'); }
function highlight(text, q) {
  const safe = esc(text);
  if (!q) return safe;
  const sq = esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(sq, 'gi'), (m) => `<mark>${m}</mark>`);
}

function openTOC(open) {
  document.body.classList.toggle('toc-open', open);
  dom.tocToggle.setAttribute('aria-expanded', String(open));
}

/* ═══ אירועים ═══ */
function bind() {
  dom.retryBtn.addEventListener('click', boot);
  dom.modeSwitch.querySelectorAll('.mode-btn').forEach((b) =>
    b.addEventListener('click', () => setMode(b.dataset.mode)));

  dom.navPrev.addEventListener('click', prev);
  dom.navNext.addEventListener('click', next);
  dom.footPrev.addEventListener('click', prev);
  dom.footNext.addEventListener('click', next);
  // מעקב דף-נוכחי חי בזמן גלילה רציפה
  dom.viewport.addEventListener('scroll', onViewportScroll, { passive: true });

  dom.btnPrint.addEventListener('click', () => cur() && ParabulaActions.printPage(cur().file, { busyText: 'מכין את הדף להדפסה…' }));
  dom.btnPdf.addEventListener('click', () => cur() && ParabulaActions.printPage(cur().file, { busyText: 'מכין את הדף ל-PDF…' }));
  dom.btnHtml.addEventListener('click', () => cur() && ParabulaActions.downloadHtml(cur().file));
  dom.btnOpen.addEventListener('click', () => cur() && ParabulaActions.openTab(cur().file));
  dom.btnPrintTopic.addEventListener('click', () => {
    const page = cur();
    if (!page) return;
    // "פרק" הוא כעת צומת תכנית הלימודים שאליו הדף משויך
    const siblings = state.pagesByNode.get(page.curriculumId) || [];
    if (!siblings.length) return ParabulaActions.printTopic(page.topic);
    ParabulaActions.printFiles(siblings.map((p) => p.file), {
      busyText: `מכין ${siblings.length} דפים בנושא "${nodeNameOf(page.curriculumId)}"…`,
    });
  });

  dom.selectModeBtn.addEventListener('click', toggleSelectMode);
  dom.boardBtn.addEventListener('click', openBoard);
  dom.boardClose.addEventListener('click', closeBoard);
  dom.board.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.hasAttribute('data-close')) closeBoard();
  });
  dom.boardToggleEmpty.addEventListener('click', () => {
    boardState.showEmpty = !boardState.showEmpty;
    dom.boardToggleEmpty.setAttribute('aria-pressed', String(boardState.showEmpty));
    dom.boardToggleEmpty.textContent = boardState.showEmpty ? 'הצג נושאים ריקים' : 'הסתר נושאים ריקים';
    renderBoard();
  });
  dom.selPrint.addEventListener('click', () => ParabulaActions.printSelection());
  dom.selPdf.addEventListener('click', () => ParabulaActions.printSelection());
  dom.selClear.addEventListener('click', () => ParabulaActions.clearSelection());

  dom.globalSearch.addEventListener('input', (e) => runSearch(e.target.value.trim()));
  dom.globalSearch.addEventListener('focus', (e) => { if (e.target.value.trim()) dom.searchResults.hidden = false; });
  dom.clearSearch.addEventListener('click', () => { dom.globalSearch.value = ''; runSearch(''); dom.globalSearch.focus(); });
  document.addEventListener('click', (e) => {
    if (!dom.headerSearchContains(e.target)) dom.searchResults.hidden = true;
  });

  dom.tocToggle.addEventListener('click', () => openTOC(!document.body.classList.contains('toc-open')));
  dom.tocOverlay.addEventListener('click', () => openTOC(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !dom.board.hidden) { e.preventDefault(); closeBoard(); return; }
    const t = e.target;
    if (t instanceof Element && (t.matches('input,textarea,select') || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'ArrowRight' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === '/' ) { e.preventDefault(); dom.globalSearch.focus(); }
  });

  let rT;
  window.addEventListener('resize', () => { applyScale(); clearTimeout(rT); rT = setTimeout(applyScale, 150); });
}

// helper: is target inside the header search area
dom.headerSearchContains = (target) => {
  const hs = document.querySelector('.header-search');
  return hs && target instanceof Node && hs.contains(target);
};

function cur() { return state.pages[state.index]; }

bind();
boot();
