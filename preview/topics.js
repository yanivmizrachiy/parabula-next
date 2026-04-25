const BASE = new URL('../', window.location.href);
const DATA_URL = new URL('meta/topics.json', BASE);

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

let db = [];
let topics = [];
let activeTopic = null;
const selected = new Set();
const STORE_KEY = 'parabula-selection-v1';

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
  return `
    <div class="topic-card ${active ? 'active' : ''}" data-topic="${topic.name}">
      <div class="topic-title">${topic.name}</div>
      <div class="topic-meta">${topic.pages.length} דפים · מתחיל ב-${first?.title || first?.file || ''}</div>
      <div class="topic-actions">
        <button class="primary" data-action="open-topic" data-topic="${topic.name}">פתח נושא</button>
        <a href="${resolvePageUrl(first)}" target="_blank" rel="noopener">פתח עמוד ראשון</a>
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

function pageCard(page) {
  const isSelected = selected.has(page.file);
  return `
    <div class="page-card ${isSelected ? 'selected' : ''}" data-file="${page.file}">
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
}

function renderViewer(files = null) {
  const list = files || [...selected];
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

function setActiveTopic(topicName) {
  activeTopic = topicName;
  renderTopics();
  renderPages();
  renderViewer();
}

topicsGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="open-topic"]');
  const card = e.target.closest('.topic-card');
  const topicName = btn?.dataset.topic || card?.dataset.topic;
  if (!topicName) return;
  setActiveTopic(topicName);
});

pagesList.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const file = btn.dataset.file;
  const action = btn.dataset.action;
  if (action === 'open-page') {
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
  const response = await fetch(DATA_URL);
  const payload = await response.json();
  topics = Array.isArray(payload?.topics)
    ? payload.topics.map(t => ({ ...t, pages: sortPages(t.pages || []) }))
    : [];
  topics = topics.sort((a, b) => String(a.name).localeCompare(String(b.name), 'he'));
  db = topics.flatMap(t => t.pages);
  loadSelection();
  renderTopics();
  renderPages();
  renderViewer();
  if (topics.length && !activeTopic) setActiveTopic(topics[0].name);
}

boot().catch((error) => {
  console.error(error);
  topicsGrid.innerHTML = '<div class="topic-card">שגיאה בטעינת הנושאים</div>';
});