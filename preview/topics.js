const BASE = new URL('../', window.location.href);
const DATA_URL = new URL('meta/topics.json', BASE);
const EQUATIONS_TOPIC = 'משוואות';
const EQUATIONS_APP_URL = './equations.html';
const EQUATIONS_PRINT_URL = './print.html?topic=%D7%9E%D7%A9%D7%95%D7%95%D7%90%D7%95%D7%AA&autoselect=topic';

const searchBox = document.getElementById('searchBox');
const clearBtn = document.getElementById('clearBtn');
const printSelectionBtn = document.getElementById('printSelectionBtn');
const openPrintPageBtn = document.getElementById('openPrintPageBtn');
const topicsGrid = document.getElementById('topicsGrid');
const topicCountBadge = document.getElementById('topicCountBadge');
const pageCountBadge = document.getElementById('pageCountBadge');
const currentTopicTitle = document.getElementById('currentTopicTitle');
const currentTopicMeta = document.getElementById('currentTopicMeta');
const selectTopicBtn = document.getElementById('selectTopicBtn');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const renderSelectionBtn = document.getElementById('renderSelectionBtn');
const pagesList = document.getElementById('pagesList');
const viewer = document.getElementById('viewer');

const readerPageTitle = document.getElementById('readerPageTitle');
const readerPageMeta = document.getElementById('readerPageMeta');
const firstPageBtn = document.getElementById('firstPageBtn');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const openCurrentBtn = document.getElementById('openCurrentBtn');
const printCurrentBtn = document.getElementById('printCurrentBtn');

const mFirstPageBtn = document.getElementById('mFirstPageBtn');
const mPrevPageBtn = document.getElementById('mPrevPageBtn');
const mNextPageBtn = document.getElementById('mNextPageBtn');
const mPrintCurrentBtn = document.getElementById('mPrintCurrentBtn');

let db = [];
let topics = [];
let activeTopic = null;
let currentFile = null;
const selected = new Set();
const STORE_KEY = 'parabula-selection-v1';
const LAST_TOPIC_KEY = 'parabula-last-topic-v2';
const LAST_FILE_KEY = 'parabula-last-file-v2';

function norm(v) {
  return String(v || '').trim().toLowerCase();
}

function saveSelection() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...selected].sort()));
}
function loadSelection() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr)) arr.forEach(x => selected.add(x));
  } catch {}
}
function savePosition() {
  if (activeTopic) localStorage.setItem(LAST_TOPIC_KEY, activeTopic);
  if (currentFile) localStorage.setItem(LAST_FILE_KEY, currentFile);
}
function loadLastTopic() {
  return localStorage.getItem(LAST_TOPIC_KEY);
}
function loadLastFile() {
  return localStorage.getItem(LAST_FILE_KEY);
}

function sortPages(arr) {
  return arr.slice().sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
}

function resolvePageUrl(page) {
  if (page?.siteUrl) return page.siteUrl;
  const rel = String(page?.previewPath || page?.file || '').replace(/^\//, '');
  return new URL(rel, BASE).href;
}

function filteredTopics() {
  const q = norm(searchBox.value);
  if (!q) return topics;
  return topics.filter(topic => {
    if (norm(topic.name).includes(q)) return true;
    return topic.pages.some(page =>
      norm([page.title, page.h1, page.file, page.topic].join(' ')).includes(q)
    );
  });
}

function topicCard(topic) {
  const first = topic.pages[0];
  const active = activeTopic === topic.name;
  const isEquations = topic.name === EQUATIONS_TOPIC;
  const equationsActions = isEquations ? `
        <a class="equations-special" href="${EQUATIONS_APP_URL}">אפליקציית משוואות</a>
        <a class="equations-special print" href="${EQUATIONS_PRINT_URL}">PDF / הדפסה משוואות</a>
  ` : '';
  return `
    <div class="topic-card ${active ? 'active' : ''} ${isEquations ? 'equations-feature' : ''}" data-topic="${topic.name}">
      <div class="topic-title">${topic.name}</div>
      <div class="topic-meta">${topic.pages.length} דפים · מתחיל ב-${first?.title || first?.file || ''}</div>
      ${isEquations ? '<div class="topic-meta equations-note">מסלול ייעודי מעוצב ומוגן בבדיקות ל־54 דפי משוואות בלבד</div>' : ''}
      <div class="topic-actions">
        <button class="primary" data-action="open-topic" data-topic="${topic.name}">פתח נושא</button>
        <a href="${resolvePageUrl(first)}" target="_blank" rel="noopener">פתח עמוד ראשון</a>
        ${equationsActions}
      </div>
    </div>
  `;
}

function renderTopics() {
  const visibleTopics = filteredTopics();
  topicsGrid.innerHTML = visibleTopics.map(topicCard).join('');
  topicCountBadge.textContent = `${visibleTopics.length} נושאים`;
  pageCountBadge.textContent = `${db.length} דפים`;
}

function activePages() {
  const topic = topics.find(t => t.name === activeTopic);
  return topic ? topic.pages : [];
}

function currentPage() {
  return activePages().find(p => p.file === currentFile) || null;
}

function updateReaderMeta() {
  const page = currentPage();
  const pages = activePages();
  if (!page) {
    readerPageTitle.textContent = 'עדיין לא נבחר דף';
    readerPageMeta.textContent = activeTopic ? 'בחר דף מתוך הנושא' : 'בחר נושא ואז דף';
  } else {
    const idx = pages.findIndex(p => p.file === page.file);
    readerPageTitle.textContent = page.title || page.file;
    readerPageMeta.textContent = `${page.topic} · עמוד ${page.number ?? ''} · ${idx + 1} / ${pages.length}`;
  }

  const idx = pages.findIndex(p => p.file === currentFile);
  const has = idx >= 0;
  prevPageBtn.disabled = !has || idx <= 0;
  nextPageBtn.disabled = !has || idx >= pages.length - 1;
  firstPageBtn.disabled = !has || idx === 0;
  openCurrentBtn.disabled = !has;
  printCurrentBtn.disabled = !has;
  mPrevPageBtn.disabled = prevPageBtn.disabled;
  mNextPageBtn.disabled = nextPageBtn.disabled;
  mFirstPageBtn.disabled = firstPageBtn.disabled;
  mPrintCurrentBtn.disabled = printCurrentBtn.disabled;
}

function pageCard(page) {
  const isSelected = selected.has(page.file);
  const isActive = currentFile === page.file;
  return `
    <div class="page-card ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}" data-file="${page.file}">
      <div class="page-top">
        <div>
          <div class="page-title">${page.title || page.file}</div>
          <div class="page-sub">${page.h1 || ''}</div>
        </div>
        <div class="page-number">עמוד ${page.number ?? ''}</div>
      </div>
      <div class="page-sub">${page.topic || ''}</div>
      <div class="page-actions">
        <button class="primary" data-action="open-page" data-file="${page.file}">פתח</button>
        <a href="${resolvePageUrl(page)}" target="_blank" rel="noopener">דף מלא</a>
        <button data-action="toggle-select" data-file="${page.file}">${isSelected ? 'הסר מהבחירה' : 'הוסף לבחירה'}</button>
      </div>
    </div>
  `;
}

function renderPages() {
  const pages = activePages();
  currentTopicTitle.textContent = activeTopic || 'בחר נושא';
  currentTopicMeta.textContent = activeTopic ? `${pages.length} דפים בנושא זה` : 'כאן יופיעו הדפים של הנושא שנבחר';
  pagesList.innerHTML = pages.map(pageCard).join('');
  updateReaderMeta();
}

function renderViewer(files = null) {
  const list = files || (currentFile ? [currentFile] : [...selected]);
  if (!list.length) {
    viewer.className = 'viewer-empty';
    viewer.textContent = activeTopic ? 'אפשר לפתוח דף בודד או לבחור כמה דפים להדפסה' : 'בחר נושא כדי לראות את הדפים שלו';
    return;
  }
  const picked = sortPages(db.filter(p => list.includes(p.file)));
  viewer.className = 'viewer-stack';
  viewer.innerHTML = picked.map(page => {
    const src = resolvePageUrl(page);
    return `<iframe class="viewer-frame" title="${page.title || page.file}" src="${src}"></iframe>`;
  }).join('');
}

function setActiveTopic(topicName, preferredFile = null) {
  activeTopic = topicName;
  const pages = activePages();
  currentFile = preferredFile && pages.some(p => p.file === preferredFile)
    ? preferredFile
    : (pages[0]?.file || null);
  savePosition();
  renderTopics();
  renderPages();
  renderViewer(currentFile ? [currentFile] : null);
}

function showPage(file) {
  const pages = activePages();
  if (!pages.some(p => p.file === file)) return;
  currentFile = file;
  savePosition();
  renderPages();
  renderViewer([file]);
}

function stepPage(delta) {
  const pages = activePages();
  const idx = pages.findIndex(p => p.file === currentFile);
  const next = idx + delta;
  if (idx < 0 || next < 0 || next >= pages.length) return;
  showPage(pages[next].file);
}

function goFirstPage() {
  const first = activePages()[0];
  if (first) showPage(first.file);
}

function openCurrent() {
  const page = currentPage();
  if (page) window.open(resolvePageUrl(page), '_blank', 'noopener');
}

function printCurrent() {
  const page = currentPage();
  if (!page) return;
  renderViewer([page.file]);
  setTimeout(() => window.print(), 250);
}

topicsGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="open-topic"]');
  const card = e.target.closest('.topic-card');
  const topicName = btn?.dataset.topic || card?.dataset.topic;
  if (!topicName) return;
  if (e.target.closest('a')) return;
  setActiveTopic(topicName);
});

pagesList.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const file = btn.dataset.file;
  const action = btn.dataset.action;
  if (action === 'open-page') {
    showPage(file);
  } else if (action === 'toggle-select') {
    if (selected.has(file)) selected.delete(file);
    else selected.add(file);
    saveSelection();
    renderPages();
  }
});

searchBox.addEventListener('input', renderTopics);
clearBtn.addEventListener('click', () => {
  searchBox.value = '';
  renderTopics();
});

selectTopicBtn.addEventListener('click', () => {
  for (const page of activePages()) selected.add(page.file);
  saveSelection();
  renderPages();
});
clearSelectionBtn.addEventListener('click', () => {
  selected.clear();
  saveSelection();
  renderPages();
  renderViewer(currentFile ? [currentFile] : null);
});
renderSelectionBtn.addEventListener('click', () => {
  if (selected.size) renderViewer([...selected]);
  else if (currentFile) renderViewer([currentFile]);
});
printSelectionBtn.addEventListener('click', () => {
  if (selected.size) renderViewer([...selected]);
  else if (currentFile) renderViewer([currentFile]);
  setTimeout(() => window.print(), 250);
});
openPrintPageBtn.addEventListener('click', () => {
  location.href = './print.html';
});

firstPageBtn.addEventListener('click', goFirstPage);
prevPageBtn.addEventListener('click', () => stepPage(-1));
nextPageBtn.addEventListener('click', () => stepPage(1));
openCurrentBtn.addEventListener('click', openCurrent);
printCurrentBtn.addEventListener('click', printCurrent);

mFirstPageBtn.addEventListener('click', goFirstPage);
mPrevPageBtn.addEventListener('click', () => stepPage(-1));
mNextPageBtn.addEventListener('click', () => stepPage(1));
mPrintCurrentBtn.addEventListener('click', printCurrent);

async function boot() {
  const response = await fetch(DATA_URL);
  const payload = await response.json();
  topics = Array.isArray(payload?.topics)
    ? payload.topics.map(t => ({ ...t, pages: sortPages(t.pages || []) }))
    : [];
  topics = topics.sort((a, b) => String(a.name).localeCompare(String(b.name), 'he'));
  db = topics.flatMap(t => t.pages);
  loadSelection();
  renderTopics();

  const rememberedTopic = loadLastTopic();
  const rememberedFile = loadLastFile();
  if (rememberedTopic && topics.some(t => t.name === rememberedTopic)) {
    setActiveTopic(rememberedTopic, rememberedFile);
  } else if (topics.length) {
    setActiveTopic(topics[0].name);
  } else {
    renderPages();
    renderViewer();
  }
}

boot().catch((error) => {
  console.error(error);
  topicsGrid.innerHTML = '<div class="topic-card">שגיאה בטעינת הנושאים</div>';
});
