const BASE = (() => {
  const url = new URL('.', window.location.href);
  return url.href.endsWith('/') ? url.href : `${url.href}/`;
})();

const PAGE_BASE = new URL('../', BASE).href;
const STORE_KEY = 'parabula-selection-v1';
// Allow the preview iframe to render before opening the browser print dialog.
const PRINT_DIALOG_DELAY = 250;
const urlState = new URL(window.location.href);

const searchBox = document.getElementById('searchBox');
const topicFilter = document.getElementById('topicFilter');
const selectionList = document.getElementById('selectionList');
const printView = document.getElementById('printView');
const selectionSummary = document.getElementById('selectionSummary');
const handoffNote = document.getElementById('handoffNote');
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
function deduplicateFiles(list) {
  return [...new Set(list.filter(Boolean))];
}
function requestedFilesFromUrl() {
  const direct = urlState.searchParams.getAll('file');
  const csv = (urlState.searchParams.get('files') || '')
    .split(',')
    .map((file) => file.trim())
    .filter(Boolean);
  return deduplicateFiles([...direct, ...csv]);
}

function allPages() {
  return db.topics.flatMap((entry) => entry.pages);
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
function updateHandoffNote() {
  const source = urlState.searchParams.get('source');
  const autopreview = urlState.searchParams.get('autopreview') === '1';
  const fromMobile = source === 'mobile-app';
  const topic = urlState.searchParams.get('topic');
  if (!handoffNote) return;
  if (!fromMobile && !autopreview) {
    handoffNote.hidden = true;
    handoffNote.textContent = '';
    return;
  }
  const bits = [];
  if (fromMobile) bits.push('נפתח מהמובייל');
  if (topic) bits.push(`נושא: ${topic}`);
  if (autopreview) bits.push('זהו שלב preview-before-print לפני PDF/הדפסה');
  handoffNote.hidden = false;
  handoffNote.textContent = bits.join(' · ');
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
    .sort((a, b) => a.number - b.number);

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
  updateHandoffNote();
}

function renderPreview() {
  printView.innerHTML = '';
  allPages()
    .filter((page) => selected.has(page.file))
    .sort((a, b) => a.number - b.number)
    .forEach((page) => {
      const wrap = document.createElement('section');
      wrap.className = 'sheet-frame';
      wrap.innerHTML = `<iframe title="${page.title}" src="${pageUrl(page.file)}"></iframe>`;
      printView.appendChild(wrap);
    });

  updateSummary();
  updateHandoffNote();
}
function applyUrlSelection() {
  const requestedTopic = urlState.searchParams.get('topic');
  if (requestedTopic && db.topics.some((topic) => topic.name === requestedTopic)) {
    topicFilter.value = requestedTopic;
  }

  const validFiles = new Set(allPages().map((page) => page.file));
  const requestedFiles = requestedFilesFromUrl().filter((file) => validFiles.has(file));
  if (!requestedFiles.length) return false;

  selected.clear();
  requestedFiles.forEach((file) => selected.add(file));
  saveSelection();
  return true;
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

  restoreSelection();
  const selectedFromUrl = applyUrlSelection();
  renderList();
  if (selectedFromUrl || urlState.searchParams.get('autopreview') === '1') {
    renderPreview();
  }
  if (selectedFromUrl && urlState.searchParams.get('autoprint') === '1') {
    setTimeout(() => window.print(), PRINT_DIALOG_DELAY);
  }
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
  setTimeout(() => window.print(), PRINT_DIALOG_DELAY);
});

boot().catch((error) => {
  console.error(error);
  selectionList.innerHTML = '<div class="selection-item">שגיאה בטעינת רשימת הדפים</div>';
});
