const BASE = (() => {
  const url = new URL('.', window.location.href);
  return url.href.endsWith('/') ? url.href : `${url.href}/`;
})();

const PAGE_BASE = new URL('../', BASE).href;
const STORE_KEY = 'parabula-selection-v1';
const A4_SCREEN_WIDTH = 794;
const A4_SCREEN_HEIGHT = 1123;
const EQUATIONS_TOPIC = 'משוואות';
const urlParams = new URLSearchParams(window.location.search);
const requestedTopic = urlParams.get('topic');
const autoSelectMode = urlParams.get('autoselect');
const maxLocalPageParam = Number(urlParams.get('maxLocalPage') || 0);
const maxLocalPage = Number.isFinite(maxLocalPageParam) && maxLocalPageParam > 0 ? maxLocalPageParam : null;
const isEquationsPrintMode = requestedTopic === EQUATIONS_TOPIC;

const searchBox = document.getElementById('searchBox');
const topicFilter = document.getElementById('topicFilter');
const selectionList = document.getElementById('selectionList');
const printView = document.getElementById('printView');
const selectionSummary = document.getElementById('selectionSummary');
const restoreSelectionBtn = document.getElementById('restoreSelectionBtn');
const selectVisibleBtn = document.getElementById('selectVisibleBtn');
const clearBtn = document.getElementById('clearBtn');
const openSelectedBtn = document.getElementById('openSelectedBtn');
const printNowBtn = document.getElementById('printNowBtn');

let db = null;
let visiblePages = [];
const selected = new Set();

if (isEquationsPrintMode) {
  document.body.classList.add('equations-print-mode');
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function pageUrl(file) {
  return new URL(file, PAGE_BASE).href;
}

function allPages() {
  return db.topics.flatMap((entry) => entry.pages);
}

function topicIndex(page) {
  return db.topics.findIndex((topic) => topic.name === page.topic);
}

function localPageIndex(page) {
  const fromTitle = String(page.title || '').match(/עמוד\s+(\d+)/);
  if (fromTitle) return Number(fromTitle[1]);
  const topic = db.topics.find((entry) => entry.name === page.topic);
  const indexInTopic = topic?.pages?.findIndex((entry) => entry.file === page.file) ?? -1;
  return indexInTopic >= 0 ? indexInTopic + 1 : Number(page.number || 0);
}

function pageSort(a, b) {
  const topicDiff = topicIndex(a) - topicIndex(b);
  if (topicDiff !== 0) return topicDiff;
  return localPageIndex(a) - localPageIndex(b);
}

function isWithinRequestedScope(page) {
  if (requestedTopic && page.topic !== requestedTopic) return false;
  if (maxLocalPage && localPageIndex(page) > maxLocalPage) return false;
  return true;
}

function fitA4FramesToViewport() {
  if (!isEquationsPrintMode) return;
  const available = Math.max(260, printView.clientWidth - 4);
  const scale = Math.min(1, available / A4_SCREEN_WIDTH);
  const width = Math.floor(A4_SCREEN_WIDTH * scale);
  const height = Math.floor(A4_SCREEN_HEIGHT * scale);
  document.documentElement.style.setProperty('--print-a4-scale', String(scale));
  document.documentElement.style.setProperty('--print-a4-width', `${width}px`);
  document.documentElement.style.setProperty('--print-a4-height', `${height}px`);
}

function saveSelection() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...selected].sort()));
}

function restoreSelection() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    selected.clear();
    if (Array.isArray(arr)) {
      arr.forEach((file) => selected.add(file));
    }
  } catch {}
  renderList();
  renderPreview();
}

function updateSummary() {
  const count = selected.size;
  const scopeText = requestedTopic && maxLocalPage
    ? ` — ${requestedTopic}, עמודים 1–${maxLocalPage}`
    : requestedTopic
      ? ` — ${requestedTopic}`
      : '';
  selectionSummary.textContent = count
    ? `נבחרו ${count} דפים${scopeText}`
    : `עדיין לא נבחרו דפים${scopeText}`;
}

function renderList() {
  const q = normalize(searchBox.value);
  const topic = topicFilter.value;

  visiblePages = allPages()
    .filter((page) => topic === '__all__' || page.topic === topic)
    .filter((page) => !requestedTopic || isWithinRequestedScope(page))
    .filter((page) => {
      if (!q) return true;
      return normalize(`${page.title} ${page.topic} ${page.file} ${page.number}`).includes(q);
    })
    .sort(pageSort);

  selectionList.innerHTML = '';

  visiblePages.forEach((page) => {
    const item = document.createElement('label');
    item.className = 'selection-item';
    item.innerHTML = `
      <input type="checkbox" ${selected.has(page.file) ? 'checked' : ''} />
      <span class="selection-copy">
        <strong>${page.title}</strong>
        <span>${page.topic} · ${page.file}</span>
      </span>
    `;
    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selected.add(page.file);
      else selected.delete(page.file);
      saveSelection();
      updateSummary();
    });
    selectionList.appendChild(item);
  });

  updateSummary();
}

function renderPreview() {
  printView.innerHTML = '';
  allPages()
    .filter((page) => selected.has(page.file))
    .filter((page) => !requestedTopic || isWithinRequestedScope(page))
    .sort(pageSort)
    .forEach((page) => {
      const wrap = document.createElement('section');
      wrap.className = 'sheet-frame';
      wrap.innerHTML = `<iframe title="${page.title}" src="${pageUrl(page.file)}"></iframe>`;
      printView.appendChild(wrap);
    });

  fitA4FramesToViewport();
  updateSummary();
}

function selectTopicPages(topicName) {
  selected.clear();
  allPages()
    .filter((page) => page.topic === topicName)
    .filter((page) => !maxLocalPage || localPageIndex(page) <= maxLocalPage)
    .sort(pageSort)
    .forEach((page) => selected.add(page.file));
  saveSelection();
}

async function boot() {
  const response = await fetch(new URL('../meta/topics.json', BASE));
  db = await response.json();

  db.topics.forEach((topic) => {
    const option = document.createElement('option');
    option.value = topic.name;
    option.textContent = `${topic.name} (${topic.count})`;
    topicFilter.appendChild(option);
  });

  if (requestedTopic && db.topics.some((topic) => topic.name === requestedTopic)) {
    topicFilter.value = requestedTopic;
    if (autoSelectMode === 'topic') {
      selectTopicPages(requestedTopic);
    } else {
      restoreSelection();
    }
  } else {
    restoreSelection();
  }

  renderList();
  renderPreview();
}

searchBox.addEventListener('input', renderList);
topicFilter.addEventListener('change', renderList);
window.addEventListener('resize', fitA4FramesToViewport);
window.addEventListener('orientationchange', () => setTimeout(fitA4FramesToViewport, 250));

restoreSelectionBtn.addEventListener('click', restoreSelection);

selectVisibleBtn.addEventListener('click', () => {
  visiblePages.forEach((page) => selected.add(page.file));
  saveSelection();
  renderList();
});

clearBtn.addEventListener('click', () => {
  selected.clear();
  saveSelection();
  renderList();
  renderPreview();
});

openSelectedBtn.addEventListener('click', () => {
  renderPreview();
});

printNowBtn.addEventListener('click', () => {
  renderPreview();
  setTimeout(() => window.print(), 250);
});

boot().catch((error) => {
  console.error(error);
  selectionList.innerHTML = '<div class="selection-item">שגיאה בטעינת רשימת הדפים</div>';
});
