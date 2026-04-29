const BASE = (() => {
  const url = new URL('.', window.location.href);
  return url.href.endsWith('/') ? url.href : `${url.href}/`;
})();

const PAGE_BASE = new URL('../', BASE).href;
const STORE_KEY = 'parabula-selection-v1';
const urlParams = new URLSearchParams(window.location.search);
const requestedTopic = urlParams.get('topic');
const autoSelectMode = urlParams.get('autoselect');

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
  selectionSummary.textContent = count
    ? `נבחרו ${count} דפים`
    : 'עדיין לא נבחרו דפים';
}

function renderList() {
  const q = normalize(searchBox.value);
  const topic = topicFilter.value;

  visiblePages = allPages()
    .filter((page) => topic === '__all__' || page.topic === topic)
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
    .sort(pageSort)
    .forEach((page) => {
      const wrap = document.createElement('section');
      wrap.className = 'sheet-frame';
      wrap.innerHTML = `<iframe title="${page.title}" src="${pageUrl(page.file)}"></iframe>`;
      printView.appendChild(wrap);
    });

  updateSummary();
}

function selectTopicPages(topicName) {
  selected.clear();
  allPages()
    .filter((page) => page.topic === topicName)
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
