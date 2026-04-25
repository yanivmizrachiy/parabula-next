import {
  filterPages,
  getTopic,
  loadCatalog,
  previewDataCandidates,
  rememberPage,
  rememberedPageFile,
  rememberedTopic,
  resolvePageLinks
} from './catalog-shared.js';

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

const STORE_KEY = 'parabula-selection-v1';

let catalog = null;
let activeTopic = '';
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

function filteredTopics() {
  const query = searchBox.value;
  if (!query) return catalog.topics;
  return catalog.topics.filter((topic) => filterPages(topic.pages, { query }).length > 0 || String(topic.name).includes(query));
}

function topicCard(topic) {
  const first = topic.pages[0];
  const active = activeTopic === topic.name;
  const firstLocalUrl = first ? resolvePageLinks(first).localUrl : '#';
  return `
    <div class="topic-card ${active ? 'active' : ''}" data-topic="${topic.name}">
      <div class="topic-title">${topic.name}</div>
      <div class="topic-meta">${topic.pages.length} דפים · מתחיל ב-${first?.title || first?.file || ''}</div>
      <div class="topic-actions">
        <button class="primary" data-action="open-topic" data-topic="${topic.name}">פתח נושא</button>
        <a href="${firstLocalUrl}" target="_blank" rel="noopener">פתח עמוד ראשון</a>
      </div>
    </div>
  `;
}

function renderTopics() {
  const visibleTopics = filteredTopics();
  topicsGrid.innerHTML = visibleTopics.map(topicCard).join('');
  topicCountBadge.textContent = `${visibleTopics.length} נושאים`;
  pageCountBadge.textContent = `${catalog.totalPages} דפים`;
}

function activePages() {
  return getTopic(catalog, activeTopic)?.pages || [];
}

function pageCard(page) {
  const isSelected = selected.has(page.file);
  const isCurrent = currentFile === page.file;
  const links = resolvePageLinks(page);
  return `
    <div class="page-card ${isSelected ? 'selected' : ''} ${isCurrent ? 'active' : ''}" data-file="${page.file}">
      <div class="page-top">
        <div>
          <div class="page-title">${page.title || page.file}</div>
          <div class="page-sub">${page.h1 || ''}</div>
        </div>
        <div class="page-number">עמוד ${page.number ?? ''}</div>
      </div>
      <div class="page-sub">${page.topic || ''}</div>
      <div class="page-actions">
        <button class="primary" data-action="open-page" data-file="${page.file}">צפה כאן</button>
        <a href="${links.localUrl}" target="_blank" rel="noopener">דף מלא</a>
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
}

function renderViewer(files = null) {
  const list = files || [...selected];
  if (!list.length) {
    viewer.className = 'viewer-empty';
    viewer.textContent = activeTopic ? 'אפשר לפתוח דף בודד או לבחור כמה דפים להדפסה' : 'בחר נושא כדי לראות את הדפים שלו';
    return;
  }
  const picked = catalog.flatPages.filter((page) => list.includes(page.file));
  viewer.className = 'viewer-stack';
  viewer.innerHTML = picked.map((page) => {
    const src = resolvePageLinks(page).localUrl;
    return `<iframe class="viewer-frame" title="${page.title || page.file}" src="${src}"></iframe>`;
  }).join('');
}

function setActiveTopic(topicName) {
  activeTopic = topicName;
  localStorage.setItem('parabula:lastTopic', activeTopic);
  renderTopics();
  renderPages();
  const remembered = rememberedPageFile();
  const topicPages = activePages();
  if (remembered && topicPages.some((page) => page.file === remembered)) {
    currentFile = remembered;
    renderPages();
    renderViewer([remembered]);
    return;
  }
  renderViewer();
}

topicsGrid.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-action="open-topic"]');
  const card = event.target.closest('.topic-card');
  const topicName = btn?.dataset.topic || card?.dataset.topic;
  if (!topicName) return;
  setActiveTopic(topicName);
});

pagesList.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;
  const file = btn.dataset.file;
  const action = btn.dataset.action;
  if (action === 'open-page') {
    currentFile = file;
    const page = catalog.byFile.get(file);
    if (page) rememberPage(page);
    renderPages();
    renderViewer([file]);
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
  renderViewer();
});

renderSelectionBtn.addEventListener('click', () => renderViewer());

printSelectionBtn.addEventListener('click', () => {
  renderViewer();
  setTimeout(() => window.print(), 250);
});

openPrintPageBtn.addEventListener('click', () => {
  location.href = './print.html';
});

async function boot() {
  catalog = await loadCatalog(previewDataCandidates());
  loadSelection();
  activeTopic = rememberedTopic() || catalog.topics[0]?.name || '';
  renderTopics();
  renderPages();
  renderViewer();
  if (activeTopic) setActiveTopic(activeTopic);
}

boot().catch((error) => {
  console.error(error);
  topicsGrid.innerHTML = '<div class="topic-card">שגיאה בטעינת הנושאים</div>';
});
